// What flies out of the gift box as it opens: petals, thrown up in a fountain,
// turning over as they fall; and a little gold dust in its light.
// burst(anchor, kind) plays once, over the page, around `anchor` (the box's opening).

import { calm, pageLayer } from './pageLayer';
import { PETALS } from './petals';
import { pictureOf } from './pictures';

const PETAL_COUNT = 54;
const DUST_COUNT = 46;
const rand = (a, b) => a + Math.random() * (b - a);

// The rendered petals, each dyed one of the kind's colours.
async function dyed(kind) {
  const { colors, picture } = PETALS[kind] ?? PETALS.marigold;
  const shapes = await Promise.all(
    [0, 1, 2].map(async (i) => {
      const img = new Image();
      img.src = pictureOf(`petal-${i}`);
      await img.decode();
      return img;
    }),
  );
  if (picture) return shapes;
  return colors.flatMap((color) =>
    shapes.map((img) => {
      const c = document.createElement('canvas');
      [c.width, c.height] = [img.width, img.height];
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      // its light and shade, without its own colour
      const data = ctx.getImageData(0, 0, c.width, c.height);
      for (let i = 0; i < data.data.length; i += 4) {
        const [r, g, b] = data.data.subarray(i, i + 3);
        data.data.fill(Math.min(255, 96 + (r * 0.5 + g * 0.3 + b * 0.2) * 1.9), i, i + 3);
      }
      ctx.putImageData(data, 0, 0);
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(img, 0, 0);
      return c;
    }),
  );
}

// Far ones are small; a few, near the eye, are big and out of focus.
function soft(picture) {
  // (shrunk, then enlarged a little at a time: that blurs it, in every browser)
  let from = picture;
  for (const size of [14, 22, 36, 60, 100]) {
    const c = document.createElement('canvas');
    [c.width, c.height] = [size, size];
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    const edge = from === picture ? 3 : 0; // room for the blur
    ctx.drawImage(from, edge, edge, size - edge * 2, size - edge * 2);
    from = c;
  }
  return from;
}

export async function burst(anchor, kind) {
  if (calm()) return;
  const layer = pageLayer(anchor);
  if (!layer) return;
  const pictures = await dyed(kind).catch(() => null);
  if (!pictures) return layer.remove();
  const blurred = pictures.map(soft);

  const mouth = layer.rectOf(anchor);
  const k = mouth.w / 220; // the box may be bigger, or smaller
  const [W, H] = [Math.min(layer.width(), 900 * k), 1080 * k];
  const left = Math.max(0, Math.min(layer.width() - W, mouth.x + mouth.w / 2 - W / 2));
  const top = mouth.y - 560 * k;
  const dpr = Math.min(1.5, window.devicePixelRatio || 1);
  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = [W * dpr, H * dpr];
  Object.assign(canvas.style, { position: 'absolute', left: `${left}px`, top: `${top}px`, width: `${W}px`, height: `${H}px` });
  layer.el.append(canvas);
  const ctx = canvas.getContext('2d');
  const [cx, cy] = [mouth.x + mouth.w / 2 - left, mouth.y + mouth.h / 2 - top];

  const petals = Array.from({ length: PETAL_COUNT }, (_, i) => {
    const near = i % 9 === 0;
    const depth = near ? rand(1.7, 2.3) : rand(0.6, 1.2);
    const which = Math.floor(Math.random() * pictures.length);
    const out = rand(-1, 1);
    return {
      wait: Math.max(0, rand(-0.1, 0.62) + (near ? 0.12 : 0)),
      picture: near ? blurred[which] : pictures[which],
      near,
      size: 23 * depth * k,
      x: cx + rand(-0.36, 0.36) * mouth.w,
      y: cy,
      vx: (out * 250 + rand(-40, 40)) * k,
      vy: -rand(430, 860) * (1 - 0.25 * Math.abs(out)) * k,
      fall: rand(62, 120) * Math.sqrt(depth) * k, // how fast it comes down, once it's floating
      sway: rand(14, 46) * k,
      beat: rand(1.1, 2.4),
      phase: rand(0, 6.28),
      turn: rand(0, 6.28),
      spin: rand(-2.6, 2.6),
      tumble: rand(0, 6.28),
      rate: rand(2.2, 5.5),
      age: 0,
    };
  });
  const dust = Array.from({ length: DUST_COUNT }, () => ({
    wait: rand(0, 0.9),
    x: cx + rand(-0.42, 0.42) * mouth.w,
    y: cy + rand(-4, 12) * k,
    vx: rand(-34, 34) * k,
    vy: -rand(60, 250) * k,
    size: rand(0.7, 2) * k,
    life: rand(1.3, 2.9),
    phase: rand(0, 6.28),
    age: 0,
  }));

  const start = performance.now();
  let last = start;
  const tick = (now) => {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    const t = (now - start) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    let alive = false;

    for (const d of dust) {
      if (t < d.wait) {
        alive = true;
        continue;
      }
      d.age += dt;
      if (d.age > d.life) continue;
      alive = true;
      d.vy *= 1 - 1.1 * dt;
      d.x += (d.vx + Math.sin(t * 2 + d.phase) * 16 * k) * dt;
      d.y += d.vy * dt;
      const a = Math.min(1, d.age * 6) * (1 - d.age / d.life) * (0.65 + 0.35 * Math.sin(t * 9 + d.phase));
      const glow = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.size * 3.2);
      glow.addColorStop(0, `rgba(255, 238, 190, ${a})`);
      glow.addColorStop(0.28, `rgba(236, 186, 92, ${a * 0.8})`);
      glow.addColorStop(1, 'rgba(226, 170, 70, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(d.x - d.size * 3.2, d.y - d.size * 3.2, d.size * 6.4, d.size * 6.4);
    }

    for (const p of petals) {
      if (t < p.wait) {
        alive = true;
        continue;
      }
      p.age += dt;
      if (p.y > H + 40 || p.age > 8) continue;
      alive = true;
      // thrown; then the air holds it, and it floats down
      p.vy += 900 * k * dt;
      p.vx *= 1 - 1.5 * dt;
      if (p.vy > p.fall) p.vy += (p.fall - p.vy) * Math.min(1, 7 * dt);
      const floating = Math.min(1, Math.max(0, p.vy / p.fall));
      p.x += (p.vx + Math.sin(p.age * p.beat * 2 + p.phase) * p.sway * 1.6 * floating) * dt;
      p.y += p.vy * dt;
      p.turn += p.spin * dt * (1.3 - 0.5 * floating);
      p.tumble += p.rate * dt;
      const face = Math.cos(p.tumble);
      const size = p.size * Math.min(1, 0.25 + p.age * 5);
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.age * 9) * (p.near ? 0.72 : 1) * Math.max(0, Math.min(1, (H - p.y) / (150 * k)));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.turn);
      ctx.scale(1, 0.22 + 0.78 * Math.abs(face));
      ctx.drawImage(p.picture, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
    if (alive) requestAnimationFrame(tick);
    else layer.remove();
  };
  requestAnimationFrame(tick);
}
