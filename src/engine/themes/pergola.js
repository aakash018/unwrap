// A pergola of white flowers hung with candles, for the top of the Anniversary
// theme (anniversary.js).
//
//   pergola(ctx, w, reach)  – its beam across the top, sheer drapes at the sides,
//                             vines of jasmine and roses hanging from it, long at
//                             the sides and short in the middle
//   glassLantern()          – a candle in a glass globe, hanging (a sprite: its
//                             ring is at the top)
//   jasmine(size)           – one little white flower

import { sprite, stamp, leaf, foil, seeded } from './draw';
import { rose } from '../sections/events/flowers';

const GREENS = ['#4A6B55', '#63846A', '#34523F', '#7B9678'];
export const BEAM = 30; // the beam's lower edge

export function jasmine(size) {
  return sprite(`jasmine-${size}`, size + 4, size + 4, (ctx) => {
    const s = size / 2;
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i / 5) * Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 0.5, -s * 0.35, s * 0.42, -s * 0.9, 0, -s);
      ctx.bezierCurveTo(-s * 0.42, -s * 0.9, -s * 0.5, -s * 0.35, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, -s);
      g.addColorStop(0, '#EAD9C0');
      g.addColorStop(0.5, '#FFFBF2');
      g.addColorStop(1, '#F1E7DA');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#E6BE6A';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Sheer ivory cloth falling from the beam at the side, tied back, fading out.
function drape(ctx, edge, dir, wide, long) {
  const r = seeded(dir > 0 ? 3 : 8);
  const folds = 9;
  for (let i = 0; i < folds; i++) {
    const t0 = i / folds;
    const x0 = edge + dir * (wide * t0 - 14);
    const fold = (wide / folds) * 1.5;
    const g = ctx.createLinearGradient(0, 0, 0, long * (0.75 + r() * 0.25));
    const bright = i % 2 ? 0.5 : 0.28;
    g.addColorStop(0, `rgba(255, 244, 222, ${bright})`);
    g.addColorStop(0.5, `rgba(240, 224, 200, ${bright * 0.75})`);
    g.addColorStop(1, 'rgba(230, 214, 196, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0 + dir * fold, 0);
    // gathered towards the edge where it's tied, then falling free
    const tie = long * 0.52;
    const tx = edge + dir * (wide * t0 * 0.34 - 8);
    ctx.bezierCurveTo(x0 + dir * fold, tie * 0.5, tx + dir * fold * 0.5, tie * 0.75, tx + dir * fold * 0.45, tie);
    ctx.bezierCurveTo(tx + dir * fold * 0.7, tie + 60, tx + dir * fold * 1.1, long * 0.8, tx + dir * fold * 1.2, long);
    ctx.lineTo(tx - dir * 4, long);
    ctx.bezierCurveTo(tx, long * 0.8, tx, tie + 60, tx, tie);
    ctx.bezierCurveTo(tx, tie * 0.75, x0, tie * 0.5, x0, 0);
    ctx.fill();
  }
  // where it's tied: a little spray
  const [cx, cy] = [edge + dir * (wide * 0.16), long * 0.52];
  for (let i = 0; i < 9; i++) stamp(ctx, leaf(Math.round(20 + r() * 12), GREENS[i % 4]), cx + (r() - 0.5) * 30, cy + (r() - 0.5) * 24, { angle: r() * 6 });
  for (let i = 0; i < 6; i++) stamp(ctx, rose(Math.round(16 + r() * 10), i % 3 ? 'white' : 'blush'), cx + (r() - 0.5) * 26, cy + (r() - 0.5) * 20, { angle: r() * 6 });
}

// One hanging vine.
function vine(ctx, x, y, long, r) {
  const sway = (r() - 0.5) * 26;
  const at = (t) => [x + Math.sin(t * 2.4 + x) * 5 + sway * t * t, y + long * t];
  ctx.strokeStyle = '#3C5745';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  for (let t = 0; t <= 1.001; t += 0.1) ctx.lineTo(...at(t));
  ctx.stroke();
  const n = Math.round(long / 7);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const [px, py] = at(t);
    const size = Math.round((17 - t * 7) / 2) * 2;
    stamp(ctx, leaf(size, GREENS[Math.floor(r() * 4)]), px + (i % 2 ? 5 : -5), py + 3, { angle: Math.PI + (i % 2 ? -0.8 : 0.8) + (r() - 0.5) * 0.5 });
    if (r() < 0.42) stamp(ctx, jasmine(r() < 0.5 ? 10 : 13), px + (r() - 0.5) * 14, py + (r() - 0.5) * 6, { angle: r() * 6 });
  }
}

export function pergola(ctx, w, reach) {
  const r = seeded(27);
  const wide = Math.min(150, 34 + w * 0.08);
  drape(ctx, 0, 1, wide, reach * 1.75);
  drape(ctx, w, -1, wide, reach * 1.6);

  // the rafters' ends, then the beam: old teak, lit from below by the candles
  ctx.fillStyle = '#2F211C';
  for (let x = 20; x < w + 20; x += 74) ctx.fillRect(x, -14, 16, 26);
  const wood = ctx.createLinearGradient(0, 0, 0, BEAM);
  wood.addColorStop(0, '#3B2A23');
  wood.addColorStop(0.7, '#5E4230');
  wood.addColorStop(1, '#8A6038');
  ctx.fillStyle = wood;
  ctx.fillRect(-20, 4, w + 40, BEAM - 4);
  ctx.lineCap = 'round';
  for (let i = 0; i < w / 5; i++) { // its grain
    ctx.strokeStyle = r() < 0.5 ? 'rgba(25, 14, 10, 0.3)' : 'rgba(220, 170, 110, 0.14)';
    ctx.lineWidth = 0.8;
    const [x, y] = [r() * w, 7 + r() * (BEAM - 9)];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 12 + r() * 40, y + (r() - 0.5) * 2);
    ctx.stroke();
  }

  // vines, longest at the sides
  const edge = (x) => Math.abs(x / w - 0.5) * 2;
  for (let x = -6; x < w + 10; x += 9 + r() * 6) {
    const e = edge(x);
    const span = Math.min(1, Math.max(0, (Math.abs(x - w / 2) - (w / 2 - reach * 0.75)) / (reach * 0.75))); // 0 in the middle … 1 at the edge
    if (span === 0 && r() < 0.45) continue;
    vine(ctx, x, BEAM - 6, 16 + r() * 26 + span ** 1.7 * reach * (0.45 + r() * 0.5) + e * 10, r);
  }
  // roses and leaves heaped along the beam, more at the sides
  for (let x = -8; x < w + 10; x += 6) {
    const e = edge(x);
    if (r() > 0.45 + e * 0.6) continue;
    const y = 12 + (r() - 0.5) * (18 + e * 34);
    stamp(ctx, leaf(Math.round((24 + r() * 14) / 4) * 4, GREENS[Math.floor(r() * 4)]), x, y + 8, { angle: Math.PI + (r() - 0.5) * 2.2 });
    if (r() < 0.6) stamp(ctx, leaf(24, GREENS[Math.floor(r() * 4)]), x + 4, y - 8, { angle: (r() - 0.5) * 2 });
  }
  for (let x = -8; x < w + 10; x += 9) {
    const e = edge(x);
    if (r() > 0.4 + e * 0.6) continue;
    stamp(ctx, rose(Math.round((16 + r() * 16 * (0.6 + e * 0.5)) / 3) * 3, r() < 0.72 ? 'white' : 'blush'), x, 15 + (r() - 0.5) * (14 + e * 30), { angle: r() * 6 });
  }
}

export function glassLantern() {
  return sprite('glass-lantern', 60, 84, (ctx) => {
    ctx.translate(0, -2);
    // brass ring and cap
    ctx.strokeStyle = '#C99A4B';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -35, 4, 0, Math.PI * 2);
    ctx.stroke();
    // the globe
    const globe = new Path2D('M -11 -22 C -28 -12, -28 18, -10 28 L 10 28 C 28 18, 28 -12, 11 -22 Z');
    const g = ctx.createRadialGradient(0, 12, 2, 0, 6, 32);
    g.addColorStop(0, 'rgba(255, 214, 140, 0.62)');
    g.addColorStop(0.6, 'rgba(255, 196, 120, 0.22)');
    g.addColorStop(1, 'rgba(220, 235, 235, 0.22)');
    ctx.fillStyle = g;
    ctx.fill(globe);
    ctx.strokeStyle = 'rgba(255, 248, 230, 0.55)';
    ctx.lineWidth = 1;
    ctx.stroke(globe);
    // the candle
    const wax = ctx.createLinearGradient(-6, 0, 6, 0);
    wax.addColorStop(0, '#E8CFA4');
    wax.addColorStop(0.4, '#FFF6E2');
    wax.addColorStop(1, '#D9B987');
    ctx.fillStyle = wax;
    ctx.fillRect(-6, 8, 12, 19);
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.bezierCurveTo(4.2, -1, 3.6, 6, 0, 7.5);
    ctx.bezierCurveTo(-3.6, 6, -4.2, -1, 0, -9);
    const f = ctx.createLinearGradient(0, -9, 0, 8);
    f.addColorStop(0, '#FFF8D8');
    f.addColorStop(0.55, '#FFC85E');
    f.addColorStop(1, '#EC8430');
    ctx.fillStyle = f;
    ctx.fill();
    // light on the glass
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-18, -6);
    ctx.quadraticCurveTo(-21, 5, -16, 16);
    ctx.stroke();
    ctx.fillStyle = foil(ctx, -13, 0, 13, 0);
    ctx.fillRect(-12, -26, 24, 5);
    ctx.beginPath();
    ctx.moveTo(-9, -26);
    ctx.lineTo(-4, -32);
    ctx.lineTo(4, -32);
    ctx.lineTo(9, -26);
    ctx.fill();
    ctx.fillRect(-13, 27, 26, 5);
  });
}
