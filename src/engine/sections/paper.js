// Lokta paper — the handmade Nepali paper the whole wedding story is
// "printed" on.
//
// Real lokta has long visible fibres, a toothy surface and an uneven,
// cloudy thickness. We paint a square tile of that once (in code, so there
// is no image to download), and StoryScene PRINTS it into the painted
// scenery — sky, temple, town, courtyard, water, velvet, silk — with
// 'soft-light': light fibres lighten, dark ones darken.
//
// Only the scenery: text, lanterns, flames, petals and the garland are not
// printed on it, so they sit on top of the paper, crisp. (A layer opts out
// with `paper: false`; live layers are never printed.)
//
// The tile wraps around at its edges, so it repeats without visible seams.

const TILE = 512; // px of the picture
const SHOWN = 256; // px it covers on the page (2× sharp)

let tile = null;

// The paper tile (made the first time it's asked for).
function loktaTile() {
  if (tile) return tile;
  tile = document.createElement('canvas');
  tile.width = TILE;
  tile.height = TILE;
  paint(tile.getContext('2d'));
  return tile;
}

// The same paper as a CSS background over a plain colour — for the few
// flat-colour sheets (the fades where two chapters meet), so they're
// printed on the paper too. Use with background-blend-mode: 'soft-light'.
//   at – where the tile starts ('left top' or 'left bottom'): two sheets
//        that meet at an edge both start their tile at that edge, so the
//        fibres carry on across it.
const urls = new Map();
export function printedColor(color, strength, at = 'left top') {
  if (!urls.has(strength)) {
    const c = document.createElement('canvas');
    c.width = TILE;
    c.height = TILE;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(0, 0, TILE, TILE);
    ctx.globalAlpha = strength;
    ctx.drawImage(loktaTile(), 0, 0);
    urls.set(strength, c.toDataURL('image/png'));
  }
  return `url(${urls.get(strength)}) ${at} / ${SHOWN}px ${SHOWN}px repeat, ${color}`;
}

// Print the paper into a layer's finished picture, only where the picture
// is (a transparent part stays transparent).
//   canvas   – the layer's canvas, already painted
//   scale    – canvas px per page px (so the fibres are the same size everywhere)
//   strength – 0 … 1
export function printOnPaper(canvas, scale, strength) {
  if (!canvas.width || !canvas.height) return;
  // 1. a sheet of paper the size of the picture…
  const sheet = document.createElement('canvas');
  sheet.width = canvas.width;
  sheet.height = canvas.height;
  const s = sheet.getContext('2d');
  const pattern = s.createPattern(loktaTile(), 'repeat');
  pattern.setTransform(new DOMMatrix().scale((SHOWN / TILE) * scale));
  s.fillStyle = pattern;
  s.fillRect(0, 0, sheet.width, sheet.height);
  // 2. …cut to the shape of the picture…
  s.globalCompositeOperation = 'destination-in';
  s.drawImage(canvas, 0, 0);
  // 3. …and blended into it
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = strength;
  ctx.drawImage(sheet, 0, 0);
  ctx.restore();
}

// The same random numbers every time, so the paper never changes.
function seeded(seed) {
  let a = seed;
  return () => {
    a = (a * 16807) % 2147483647;
    return (a - 1) / 2147483646;
  };
}

// Draw something 9 times (shifted by one tile each way), so whatever
// crosses an edge comes back in on the other side.
function wrapped(draw) {
  for (const dx of [-TILE, 0, TILE]) {
    for (const dy of [-TILE, 0, TILE]) draw(dx, dy);
  }
}

function paint(ctx) {
  const r = seeded(7);

  // neutral grey: in 'soft-light' this changes nothing…
  ctx.fillStyle = 'rgb(128, 128, 128)';
  ctx.fillRect(0, 0, TILE, TILE);

  // …and everything lighter or darker than it shows as paper.
  // 1. cloudy thickness: big soft patches, thicker and thinner
  for (let i = 0; i < 70; i++) {
    const x = r() * TILE;
    const y = r() * TILE;
    const radius = 40 + r() * 120;
    const light = r() < 0.5;
    const alpha = 0.07 + r() * 0.1;
    wrapped((dx, dy) => {
      const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, radius);
      g.addColorStop(0, light ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`);
      g.addColorStop(1, 'rgba(128, 128, 128, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x + dx - radius, y + dy - radius, radius * 2, radius * 2);
    });
  }

  // 2. fibres: many short curly ones, a few long ones; mostly pale
  ctx.lineCap = 'round';
  const fibre = (length, width, alpha) => {
    const x = r() * TILE;
    const y = r() * TILE;
    const angle = r() * Math.PI * 2;
    const bend = (r() - 0.5) * length * 0.8;
    const light = r() < 0.7;
    const ex = x + Math.cos(angle) * length;
    const ey = y + Math.sin(angle) * length;
    const cx = (x + ex) / 2 + Math.cos(angle + Math.PI / 2) * bend;
    const cy = (y + ey) / 2 + Math.sin(angle + Math.PI / 2) * bend;
    ctx.strokeStyle = light ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha * 0.7})`;
    ctx.lineWidth = width;
    wrapped((dx, dy) => {
      ctx.beginPath();
      ctx.moveTo(x + dx, y + dy);
      ctx.quadraticCurveTo(cx + dx, cy + dy, ex + dx, ey + dy);
      ctx.stroke();
    });
  };
  for (let i = 0; i < 1100; i++) fibre(8 + r() * 40, 0.5 + r() * 1.1, 0.22 + r() * 0.35);
  for (let i = 0; i < 70; i++) fibre(80 + r() * 140, 0.7 + r() * 0.9, 0.18 + r() * 0.25);

  // 3. the tooth: fine grain over everything
  const image = ctx.getImageData(0, 0, TILE, TILE);
  const px = image.data;
  for (let i = 0; i < px.length; i += 4) {
    const n = (r() - 0.5) * 56;
    px[i] += n;
    px[i + 1] += n;
    px[i + 2] += n;
  }
  ctx.putImageData(image, 0, 0);
}
