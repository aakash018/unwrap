// Shared bits for the round ceremony pictures (chapter 2): warm lamplight,
// scattered petals and rice, a clay diyo and its flame, petals falling.
// Used by pictures-hindu.js and pictures-garden.js.

import { petal, stamp, seeded } from '../../themes/draw';
import { paper, flame } from '../art';


// Warm lamplight in the middle, darker towards the rim (a lens, a lamp).
export function lamplight(ctx, size, rgb = '255, 170, 90', strength = 0.2) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(size / 2, size * 0.45, 0, size / 2, size * 0.45, size * 0.6);
  g.addColorStop(0, `rgba(${rgb}, ${strength})`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
  const v = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.72);
  v.addColorStop(0, 'rgba(8, 2, 4, 0)');
  v.addColorStop(1, 'rgba(8, 2, 4, 0.55)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, size, size);
}

// Petals and grains of rice scattered over the cloth.
export function scatter(ctx, size, seed, count = 26) {
  const r = seeded(seed);
  const colors = ['#E8862A', '#F2B33D', '#D9604A', '#B4231E'];
  for (let i = 0; i < count; i++) {
    const x = r() * size;
    const y = r() * size;
    if (r() < 0.55) stamp(ctx, petal(colors[Math.floor(r() * 4)], Math.round(8 + r() * 5)), x, y, { angle: r() * 6 });
    else {
      ctx.fillStyle = r() < 0.5 ? '#F4EAD2' : '#E6D6B4';
      ctx.beginPath();
      ctx.ellipse(x, y, 1.7, 0.85, r() * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// A clay diyo seen from above (its flame is drawn live).
export function diyo(ctx, x, y, s) {
  paper(ctx, () => {
    ctx.fillStyle = '#8A4422';
    ctx.beginPath();
    ctx.ellipse(x, y, s, s * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
  }, { color: 'rgba(0, 0, 0, 0.45)', blur: 5, y: 3 });
  ctx.fillStyle = '#C47A3A';
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.7, s * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();
}

// A diyo's flame, a little bigger than the standard one.
export function bigFlame(ctx, x, y, t, scale = 1.25, seed = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  flame(ctx, 0, 0, t, seed);
  ctx.restore();
}

// Petals falling slowly through the picture, turning as they go.
export function fallingPetals(size, colors, count = 7, seed = 1) {
  const r = seeded(seed);
  const make = (y) => ({ x: r() * size, y, s: Math.round(9 + r() * 5), color: colors[Math.floor(r() * colors.length)], fall: 9 + r() * 9, spin: (r() - 0.5) * 1.6, phase: r() * 6 });
  const petals = Array.from({ length: count }, () => make(r() * size));
  return (ctx, t, dt) => {
    for (const p of petals) {
      p.y += p.fall * dt;
      if (p.y > size + 12) Object.assign(p, make(-12));
      stamp(ctx, petal(p.color, p.s), p.x + Math.sin(t * 0.7 + p.phase) * 10, p.y, { angle: p.phase + t * p.spin, alpha: 0.9 });
    }
  };
}

// A brass bowl seen from above, with a shadow; returns nothing (fill it after).
