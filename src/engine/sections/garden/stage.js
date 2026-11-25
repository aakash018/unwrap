// The altar of the garden (Christian) invite, drawn in code — the garden's
// answer to the Hindu invite's mandap (sections/mandap.js).
//
// A wide, low white pergola on a platform of pale marble tiles, glowing in the low sun
// (warm gold on its right-hand sides, soft shade on the left): two
// classical columns holding a beam, sheer drapes tied back inside them, a
// tall wooden cross in the middle wrapped in greenery and white flowers,
// pale linen gathered at its foot. A garland of greenery and white roses
// along the beam, heavy at the corners; a big arrangement on each column
// (roses, hydrangeas, pampas, trailing greenery) and more at their feet.
//
//   weddingStage(ctx, cx, top, { column })
//                               – the altar; `top` = the top of its beam,
//                                 `column` = how far each column stands from
//                                 the middle (wider on a wide screen)
//   STAGE_HEIGHT                – from the beam's top to the foot of the step
//   bloom(ctx, x, y, spread, count, seed, tones)
//                               – a heap of roses and greenery (used elsewhere too)
//   hydrangea(ctx, x, y, r)     – a ball of small white flowers
//   pampas(ctx, x, y, length, angle) – a feathery pampas plume

import { leaf, stamp, seeded } from '../../themes/draw';
import { rose } from '../events/flowers';

export const STAGE_HEIGHT = 460;

const BEAM = 34; // the beam's depth
const COLUMN = 168; // ± x of each column's centre, unless told otherwise
const FLOOR = 410; // the platform's top (a low, wide altar, like the photo)
const SLAB = 436; // the platform's front edge
const GREENS = ['#7E9A86', '#5F7D69', '#8FAA94', '#4F6B58'];

// A heap of roses, greenery and baby's breath around (x, y).
export function bloom(ctx, x, y, spread, count, seed, tones = ['white', 'white', 'blush']) {
  const r = seeded(seed);
  for (let i = 0; i < count * 1.3; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * spread * 1.25;
    stamp(ctx, leaf(Math.round(20 + r() * 18), GREENS[Math.floor(r() * 4)]), x + Math.cos(a) * d, y + Math.sin(a) * d, { angle: a + Math.PI / 2 });
  }
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * spread;
    stamp(ctx, rose(Math.round(16 + r() * 12), tones[Math.floor(r() * tones.length)]), x + Math.cos(a) * d, y + Math.sin(a) * d * 0.9, { angle: r() * 6 });
  }
}

// A hydrangea head: a ball of tiny cream florets.
export function hydrangea(ctx, x, y, radius) {
  const r = seeded(Math.round(x * 7 + y));
  const g = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
  g.addColorStop(0, '#FFFDF6');
  g.addColorStop(1, '#E4DCC8');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(170, 160, 130, 0.45)';
  for (let i = 0; i < radius * 2.2; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * radius * 0.9;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
}

// A feathery pampas plume from (x, y), leaning by `angle`.
export function pampas(ctx, x, y, length, angle) {
  const r = seeded(Math.round(x * 3 + y * 5));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = 'rgba(150, 120, 80, 0.8)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -length);
  ctx.stroke();
  for (let i = 0; i < length * 1.6; i++) {
    const t = 0.35 + r() * 0.65;
    const side = r() < 0.5 ? -1 : 1;
    ctx.strokeStyle = `rgba(${220 + Math.round(r() * 25)}, ${196 + Math.round(r() * 25)}, ${150 + Math.round(r() * 30)}, ${0.5 + r() * 0.4})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -length * t);
    ctx.lineTo(side * (3 + r() * 7), -length * t - 6 - r() * 8);
    ctx.stroke();
  }
  ctx.restore();
}

// An arrangement on a column: a generous heap of greenery, roses and
// hydrangeas with pampas plumes rising out of it and greenery trailing down.
function columnFlowers(ctx, x, y, side, seed) {
  for (const [dx, dy, a, l] of [[-14, -10, -0.55, 70], [14, -14, 0.45, 76], [0, -24, 0.05, 84], [-24, 0, -0.9, 56]]) pampas(ctx, x + dx * side, y + dy, l, a * side);
  bloom(ctx, x, y + 14, 42, 15, seed);
  hydrangea(ctx, x - 18 * side, y + 22, 17);
  hydrangea(ctx, x + 14 * side, y + 44, 14);
  hydrangea(ctx, x - 4 * side, y - 4, 12);
  for (let k = 0; k < 4; k++) stamp(ctx, leaf(28, GREENS[k % 4]), x + side * (8 + k * 4), y + 56 + k * 18, { angle: Math.PI + side * 0.2 });
}

// Flowers on the ground at a column's foot, spilling onto the platform.
function footFlowers(ctx, x, y, side, seed) {
  for (const [dx, a, l] of [[-18, -0.6, 66], [6, 0.2, 80], [24, 0.6, 62]]) pampas(ctx, x + dx * side, y - 6, l, a * side);
  bloom(ctx, x + 10 * side, y - 8, 40, 14, seed);
  hydrangea(ctx, x - 14 * side, y - 4, 16);
  hydrangea(ctx, x + 30 * side, y - 2, 13);
}

// A garland of greenery and white flowers draped along the beam: heavy at
// the corners, swagging lightly in between.
function beamGarland(ctx, seed, COLUMN) {
  const r = seeded(seed);
  for (let k = 0; k <= 26; k++) {
    const t = k / 26;
    const x = -COLUMN - 20 + t * (COLUMN + 20) * 2;
    const y = BEAM + 2 + Math.sin(t * Math.PI * 2) ** 2 * 14;
    stamp(ctx, leaf(Math.round(20 + r() * 10), GREENS[k % 4]), x, y + 6, { angle: Math.PI + (r() - 0.5) });
    if (k % 2 === 0) stamp(ctx, rose(Math.round(13 + r() * 6), r() < 0.25 ? 'blush' : 'white'), x, y, { angle: r() * 6 });
  }
  for (const side of [-1, 1]) {
    bloom(ctx, side * (COLUMN - 6), BEAM - 2, 40, 14, seed + (side > 0 ? 3 : 0));
    hydrangea(ctx, side * (COLUMN + 16), BEAM + 6, 15);
    hydrangea(ctx, side * (COLUMN - 30), BEAM + 12, 12);
    // greenery trailing down from the corner
    for (let k = 0; k < 5; k++) stamp(ctx, leaf(24, GREENS[k % 4]), side * (COLUMN - 24 + Math.sin(k) * 4), BEAM + 30 + k * 18, { angle: Math.PI + side * 0.15 });
  }
}

// A classical column: base, fluted round shaft, capital — lit by the low
// sun from the right, so its right side glows warm gold and its left side
// falls into soft shade.
function classicColumn(ctx, x, top, bottom) {
  const half = 22;
  const shaft = ctx.createLinearGradient(x - half, 0, x + half, 0);
  shaft.addColorStop(0, '#BFB1A0');
  shaft.addColorStop(0.3, '#E8DCCB');
  shaft.addColorStop(0.65, '#FFF6E6');
  shaft.addColorStop(0.88, '#FFE7BE');
  shaft.addColorStop(1, '#F2CF94');
  ctx.fillStyle = shaft;
  ctx.fillRect(x - half, top + 24, half * 2, bottom - top - 54);
  ctx.strokeStyle = 'rgba(150, 130, 105, 0.32)'; // the flutes
  ctx.lineWidth = 1;
  for (const dx of [-14, -7, 0, 7, 14]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, top + 28);
    ctx.lineTo(x + dx, bottom - 34);
    ctx.stroke();
  }
  const stone = ctx.createLinearGradient(x - half - 10, 0, x + half + 10, 0);
  stone.addColorStop(0, '#D8CBB8');
  stone.addColorStop(0.6, '#FFF4E2');
  stone.addColorStop(1, '#F6D9A4');
  ctx.fillStyle = stone;
  ctx.fillRect(x - half - 8, top, half * 2 + 16, 12); // the capital
  ctx.fillRect(x - half - 4, top + 12, half * 2 + 8, 12);
  ctx.fillRect(x - half - 5, bottom - 30, half * 2 + 10, 13); // the base
  ctx.fillRect(x - half - 10, bottom - 17, half * 2 + 20, 17);
  // a bright edge of sunlight down its right side
  ctx.fillStyle = 'rgba(255, 214, 140, 0.75)';
  ctx.fillRect(x + half - 2, top + 24, 2, bottom - top - 54);
}

// A sheer drape: from the beam, tied back at (tieX, tieY), falling to the
// floor; the sun glows through it.
function drape(ctx, x0, x1, tieX, tieY, footX0, footX1) {
  ctx.save();
  const g = ctx.createLinearGradient(0, BEAM, 0, FLOOR);
  g.addColorStop(0, 'rgba(255, 248, 232, 0.88)');
  g.addColorStop(1, 'rgba(255, 238, 210, 0.72)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x0, BEAM);
  ctx.lineTo(x1, BEAM);
  ctx.quadraticCurveTo(x1, tieY - 60, tieX + 8, tieY);
  ctx.quadraticCurveTo(footX1 + 4, tieY + 90, footX1, FLOOR);
  ctx.lineTo(footX0, FLOOR);
  ctx.quadraticCurveTo(tieX - 14, tieY + 90, tieX - 8, tieY);
  ctx.quadraticCurveTo(x0 + 2, tieY - 80, x0, BEAM);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(205, 175, 135, 0.4)'; // soft folds
  ctx.lineWidth = 1;
  for (const k of [0.2, 0.4, 0.6, 0.8]) {
    ctx.beginPath();
    ctx.moveTo(x0 + (x1 - x0) * k, BEAM + 4);
    ctx.quadraticCurveTo(tieX + (k - 0.5) * 10, tieY - 40, tieX + (k - 0.5) * 6, tieY);
    ctx.quadraticCurveTo(tieX + (k - 0.5) * 30, tieY + 90, footX0 + (footX1 - footX0) * k, FLOOR - 2);
    ctx.stroke();
  }
  ctx.restore();
}

// A strip of pale marble tiles over (x, y, w, h): soft cloudy patches,
// fine grey veins wandering across (and a few white ones), and faint
// joints between tiles `tile` px wide (`offset` staggers them).
function marbleTiles(ctx, x, y, w, h, tile, offset, seed) {
  const r = seeded(seed);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  // cloudy patches in the stone
  for (let i = 0; i < w / 30; i++) {
    const cx = x + r() * w;
    const cy = y + r() * h;
    const rad = 14 + r() * 26;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    const tone = r() < 0.5 ? '255, 252, 245' : '200, 188, 172';
    g.addColorStop(0, `rgba(${tone}, 0.28)`);
    g.addColorStop(1, `rgba(${tone}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  }
  // the veins: thin wandering lines, mostly running along the stone
  ctx.lineCap = 'round';
  for (let i = 0; i < w / 32; i++) {
    let vx = x + r() * w;
    let vy = y + r() * h;
    let angle = (r() - 0.5) * 0.9 + (r() < 0.5 ? 0 : Math.PI);
    const white = r() < 0.25;
    ctx.strokeStyle = white ? 'rgba(255, 255, 255, 0.7)' : `rgba(125, 110, 95, ${0.35 + r() * 0.25})`;
    ctx.lineWidth = 0.6 + r() * 0.8;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    for (let k = 0; k < 8; k++) {
      angle += (r() - 0.5) * 0.8;
      vx += Math.cos(angle) * (6 + r() * 8);
      vy += Math.sin(angle) * (2 + r() * 3);
      ctx.lineTo(vx, vy);
    }
    ctx.stroke();
  }
  // the joints between tiles
  ctx.strokeStyle = 'rgba(150, 135, 115, 0.35)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let tx = x + offset; tx < x + w; tx += tile) {
    if (tx <= x) continue;
    ctx.moveTo(tx, y);
    ctx.lineTo(tx, y + h);
  }
  ctx.stroke();
  ctx.restore();
}

export function weddingStage(ctx, cx, top, { column: COLUMN = 168 } = {}) {
  ctx.save();
  ctx.translate(cx, top);
  const shadow = (blur, dy, alpha = 0.3) => {
    ctx.shadowColor = `rgba(90, 55, 30, ${alpha})`;
    ctx.shadowBlur = blur * (ctx.__s || 1);
    ctx.shadowOffsetY = dy * (ctx.__s || 1);
  };
  const W = COLUMN + 70; // half the platform's width

  // the warm glow of the low sun behind and around the altar
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(COLUMN * 0.6, 190, 0, COLUMN * 0.6, 190, 380);
  glow.addColorStop(0, 'rgba(255, 210, 140, 0.22)');
  glow.addColorStop(1, 'rgba(255, 190, 120, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(-W - 60, -100, (W + 60) * 2, 600);
  ctx.restore();

  // the platform: a pale stone slab and a step, their edges catching the sun
  ctx.save();
  shadow(14, 8);
  const slab = ctx.createLinearGradient(-W, 0, W, 0);
  slab.addColorStop(0, '#E2D7C8'); // pale marble: in shade on the left…
  slab.addColorStop(1, '#FBF0DE'); // …warm in the sun on the right
  ctx.fillStyle = slab;
  ctx.fillRect(-W, FLOOR, W * 2, SLAB - FLOOR);
  ctx.fillStyle = '#E2D6C4';
  ctx.fillRect(-W + 40, SLAB, (W - 40) * 2, STAGE_HEIGHT - SLAB);
  ctx.restore();
  // both are laid in tiles of pale marble
  marbleTiles(ctx, -W, FLOOR, W * 2, SLAB - FLOOR, 96, 0, 41);
  marbleTiles(ctx, -W + 40, SLAB, (W - 40) * 2, STAGE_HEIGHT - SLAB, 96, 48, 43);
  ctx.fillStyle = 'rgba(255, 232, 190, 0.8)';
  ctx.fillRect(-W, FLOOR, W * 2, 3);
  ctx.fillRect(-W + 40, SLAB, (W - 40) * 2, 3);

  // the wooden cross, pale linen gathered at its foot
  ctx.save();
  shadow(10, 4);
  const wood = ctx.createLinearGradient(-13, 0, 13, 0);
  wood.addColorStop(0, '#4A3020');
  wood.addColorStop(0.55, '#7E5638');
  wood.addColorStop(1, '#A87A4C'); // the sun on its right side
  ctx.fillStyle = wood;
  ctx.fillRect(-13, BEAM + 6, 26, FLOOR - BEAM - 6);
  ctx.fillRect(-92, 112, 184, 24);
  ctx.restore();
  ctx.fillStyle = '#D8C6A8';
  ctx.beginPath();
  ctx.moveTo(-14, FLOOR - 96);
  ctx.quadraticCurveTo(-32, FLOOR - 26, -84, FLOOR);
  ctx.lineTo(84, FLOOR);
  ctx.quadraticCurveTo(32, FLOOR - 26, 14, FLOOR - 96);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(140, 115, 85, 0.45)';
  for (const k of [-46, -20, 8, 34]) {
    ctx.beginPath();
    ctx.moveTo(k * 0.25, FLOOR - 90);
    ctx.quadraticCurveTo(k * 0.7, FLOOR - 36, k, FLOOR - 2);
    ctx.stroke();
  }
  // greenery and white flowers dressing the cross, more falling down it
  bloom(ctx, 0, 124, 48, 17, 5);
  hydrangea(ctx, -36, 134, 17);
  hydrangea(ctx, 30, 110, 15);
  hydrangea(ctx, 6, 154, 14);
  for (let k = 0; k < 5; k++) stamp(ctx, leaf(30, GREENS[k % 4]), (k % 2 ? 1 : -1) * 7, 168 + k * 22, { angle: Math.PI + (k % 2 ? 0.25 : -0.25) });
  bloom(ctx, 0, FLOOR - 88, 32, 9, 7); // a little at its foot too

  // sheer drapes tied back inside each column
  drape(ctx, -COLUMN + 16, -COLUMN + 96, -COLUMN + 30, 232, -COLUMN + 8, -COLUMN + 60);
  drape(ctx, COLUMN - 96, COLUMN - 16, COLUMN - 30, 232, COLUMN - 60, COLUMN - 8);

  // the columns and the beam, the beam's top and right end lit gold
  ctx.save();
  shadow(12, 6);
  classicColumn(ctx, -COLUMN, BEAM, FLOOR);
  classicColumn(ctx, COLUMN, BEAM, FLOOR);
  const beam = ctx.createLinearGradient(0, 0, 0, BEAM);
  beam.addColorStop(0, '#FFF6E4');
  beam.addColorStop(1, '#DCCDB8');
  ctx.fillStyle = beam;
  ctx.fillRect(-COLUMN - 44, 0, (COLUMN + 44) * 2, BEAM - 8);
  ctx.fillRect(-COLUMN - 34, BEAM - 8, (COLUMN + 34) * 2, 8);
  ctx.fillRect(-COLUMN - 54, -12, 20, 28); // the end caps
  ctx.fillRect(COLUMN + 34, -12, 20, 28);
  ctx.restore();
  ctx.fillStyle = 'rgba(255, 220, 150, 0.8)';
  ctx.fillRect(-COLUMN - 44, 0, (COLUMN + 44) * 2, 2);
  ctx.fillRect(COLUMN + 52, -12, 2, 28);

  // the flowers: a garland along the beam, an arrangement on each column,
  // and more at their feet
  beamGarland(ctx, 21, COLUMN);
  columnFlowers(ctx, -COLUMN, 186, -1, 11);
  columnFlowers(ctx, COLUMN, 196, 1, 13);
  footFlowers(ctx, -COLUMN, FLOOR + 4, -1, 31);
  footFlowers(ctx, COLUMN, FLOOR + 4, 1, 33);
  ctx.restore();
}
