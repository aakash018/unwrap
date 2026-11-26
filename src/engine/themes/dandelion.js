// A dandelion clock, for the Birthday theme's wish: a white seed head on a
// thin stem in the grass. Blow on it (tap, or brush past it) and its seeds
// lift off on their little parachutes and float away up the page.
//
//   seedHead(radius, full)  – the head, as a sprite: full, or blown (a bare
//                             middle with a few seeds left)
//   seedSprite(size)        – one seed in the air: a tuft over a fine stalk
//   dandelion(ctx, x, foot, height, sway, head)
//                           – the stem from the ground, swaying, with `head` on it

import { sprite, stamp, seeded } from './draw';

// the angle of each seed around the head, the same every time
const SEEDS = 64;
const around = (() => {
  const r = seeded(31);
  return Array.from({ length: SEEDS }, (_, i) => ({ a: (i / SEEDS) * Math.PI * 2 + (r() - 0.5) * 0.12, reach: 0.82 + r() * 0.18, keep: r() < 0.12 }));
})();

// A seed seen end on in the head: its stalk from the middle, a tuft at the end.
function stalk(ctx, a, from, to, tuft) {
  const [c, s] = [Math.cos(a), Math.sin(a)];
  ctx.beginPath();
  ctx.moveTo(c * from, s * from);
  ctx.lineTo(c * to, s * to);
  ctx.stroke();
  for (let k = -2; k <= 2; k++) {
    const b = a + k * 0.32;
    ctx.beginPath();
    ctx.moveTo(c * to, s * to);
    ctx.lineTo(c * to + Math.cos(b) * tuft, s * to + Math.sin(b) * tuft);
    ctx.stroke();
  }
}

export function seedHead(radius, full = true) {
  return sprite(`dandelion-${radius}-${full ? 'full' : 'blown'}`, radius * 2.6, radius * 2.6, (ctx) => {
    // a soft white glow, the light caught in it
    if (full) {
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.25);
      glow.addColorStop(0, 'rgba(255, 252, 242, 0.5)');
      glow.addColorStop(0.7, 'rgba(255, 250, 236, 0.22)');
      glow.addColorStop(1, 'rgba(255, 250, 236, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.lineCap = 'round';
    for (const seed of around) {
      if (!full && !seed.keep) continue;
      const to = radius * seed.reach;
      ctx.strokeStyle = 'rgba(255, 253, 246, 0.85)';
      ctx.lineWidth = 0.55;
      stalk(ctx, seed.a, radius * 0.18, to * 0.8, radius * 0.24);
    }
    // the middle, where the seeds were
    ctx.fillStyle = '#9A8A5A';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 248, 226, 0.6)';
    ctx.beginPath();
    ctx.arc(-radius * 0.05, -radius * 0.05, radius * 0.08, 0, Math.PI * 2);
    ctx.fill();
  });
}

// One seed flying: the tuft (a fan of fine hairs) on top, its stalk, and the
// tiny dark seed at the bottom. Drawn upright; stamp it with an angle to lean.
export function seedSprite(size) {
  return sprite(`dandelion-seed-${size}`, size * 1.4, size * 1.9, (ctx) => {
    const top = -size * 0.45;
    const glow = ctx.createRadialGradient(0, top, 0, 0, top, size * 0.7);
    glow.addColorStop(0, 'rgba(255, 250, 236, 0.45)');
    glow.addColorStop(1, 'rgba(255, 250, 236, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-size * 0.7, top - size * 0.7, size * 1.4, size * 1.4);
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255, 253, 246, 0.95)';
    ctx.lineWidth = 0.5;
    for (let k = 0; k < 9; k++) {
      const a = Math.PI * (1.08 + (k / 8) * 0.84);
      ctx.beginPath();
      ctx.moveTo(0, top);
      ctx.lineTo(Math.cos(a) * size * 0.5, top + Math.sin(a) * size * 0.42);
      ctx.stroke();
    }
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, top);
    ctx.lineTo(0, size * 0.42);
    ctx.stroke();
    ctx.fillStyle = '#7C6A48';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.5, size * 0.05, size * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

// The stem, curving up from the grass to where the head sits; returns the head's place.
export function dandelion(ctx, x, foot, height, sway, head) {
  const top = { x: x + sway, y: foot - height };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#6F8A4A';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x, foot);
  ctx.quadraticCurveTo(x - sway * 0.2, foot - height * 0.55, top.x, top.y);
  ctx.stroke();
  ctx.restore();
  if (head) stamp(ctx, head, top.x, top.y);
  return top;
}
