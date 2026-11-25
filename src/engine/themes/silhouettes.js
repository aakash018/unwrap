// Faint background motifs for the parallax layers: line-art and silhouettes
// that sit far behind everything at low opacity (hearts, roses, temples,
// the Himalaya, champagne flutes, rings, the moon…).
//
// Each function draws at (x, y) with a given size. They don't set colours —
// the caller sets fillStyle / strokeStyle / globalAlpha first.

import { heartPath, starPath, seeded } from './draw';

// Scatter motifs over an area: roughly one per `spacing`×`spacing` cell,
// jittered, always in the same places (seeded). `edges` keeps most of them
// to the left and right thirds, so the middle stays calm for the message.
export function scatter(area, width, { seed = 1, spacing = 300, edges = false }, place) {
  const r = seeded(seed);
  for (let y = area.y0; y < area.y1; y += spacing) {
    for (let x = area.x0; x < area.x1; x += spacing) {
      const px = x + r() * spacing;
      const py = y + r() * spacing;
      const roll = r();
      if (edges && px > width * 0.26 && px < width * 0.74 && roll < 0.8) continue;
      place(px, py, r);
    }
  }
}

// ── Love ─────────────────────────────────────────────────────────────────────

export function heart(ctx, x, y, size, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  heartPath(ctx, size);
  ctx.restore();
}

// A rose in fine line-art: a swirl of petals, a stem and two leaves.
export function rose(ctx, x, y, size, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(size / 100, size / 100);
  ctx.lineWidth = 100 / size; // keep lines ~1px thick whatever the size
  ctx.beginPath();
  // inner swirl
  ctx.moveTo(0, -8);
  ctx.bezierCurveTo(10, -14, 16, -2, 6, 4);
  ctx.bezierCurveTo(-4, 10, -14, 0, -8, -10);
  ctx.bezierCurveTo(-2, -22, 22, -20, 24, -4);
  ctx.bezierCurveTo(26, 12, 4, 22, -12, 16);
  ctx.bezierCurveTo(-28, 10, -28, -16, -12, -26);
  // outer petals
  ctx.moveTo(-30, -6);
  ctx.bezierCurveTo(-40, 20, -10, 36, 10, 32);
  ctx.bezierCurveTo(34, 26, 40, 0, 30, -14);
  ctx.moveTo(-30, -6);
  ctx.quadraticCurveTo(-36, -30, -12, -34);
  ctx.moveTo(30, -14);
  ctx.quadraticCurveTo(34, -36, 8, -36);
  // stem and leaves
  ctx.moveTo(0, 32);
  ctx.bezierCurveTo(-4, 70, 6, 110, 0, 150);
  ctx.moveTo(1, 80);
  ctx.bezierCurveTo(20, 64, 40, 70, 46, 58);
  ctx.bezierCurveTo(36, 80, 16, 84, 1, 80);
  ctx.moveTo(0, 112);
  ctx.bezierCurveTo(-20, 98, -38, 102, -46, 92);
  ctx.bezierCurveTo(-32, 114, -14, 116, 0, 112);
  ctx.stroke();
  ctx.restore();
}

// ── Nepal (shapes from the Unwrap landing page) ──────────────────────────────

const PAGODA = new Path2D(
  'M87 0h6v16h-6z M84 30 L90 10 L96 30 Z M40 70 Q90 34 140 70 L128 76 L52 76 Z M60 76h60v22H60z ' +
    'M24 112 Q90 72 156 112 L142 118 L38 118 Z M52 118h76v24H52z M8 158 Q90 112 172 158 L156 164 L24 164 Z ' +
    'M40 164h100v38H40z M20 202h140v18H20z',
); // 180 × 220
const STUPA = new Path2D(
  'M99 0h2v60h-2z M90 60 L100 16 L110 60 Z M84 60h32v20H84z M36 150 A64 64 0 0 1 164 150 Z ' +
    'M20 150h160v12H20z M8 162h184v14H8z',
); // 200 × 176
const HIMALAYA = new Path2D(
  'M0 300 L120 210 L200 250 L330 120 L420 200 L520 150 L600 220 L720 90 L820 190 L930 140 ' +
    'L1030 230 L1150 110 L1260 200 L1360 160 L1440 210 L1440 420 L0 420 Z',
); // 1440 × 420
const DIYO = new Path2D(
  'M22 4 C27 11 27 17 22 20 C17 17 17 11 22 4Z M4 24 H40 C38 32 31 37 22 37 C13 37 6 32 4 24Z',
); // 44 × 40

// Draw one of the paths above with its bottom-centre at (x, y), `height` tall.
function placePath(ctx, path, naturalWidth, naturalHeight, x, y, height) {
  const s = height / naturalHeight;
  ctx.save();
  ctx.translate(x - (naturalWidth * s) / 2, y - height);
  ctx.scale(s, s);
  ctx.fill(path);
  ctx.restore();
}

export const pagoda = (ctx, x, baseY, height) => placePath(ctx, PAGODA, 180, 220, x, baseY, height);
export const stupa = (ctx, x, baseY, height) => placePath(ctx, STUPA, 200, 176, x, baseY, height);
export const diyo = (ctx, x, y, size) => placePath(ctx, DIYO, 44, 40, x, y + size / 2, size);

// The mountain range, stretched across `width`, its foot at `baseY`.
export function himalaya(ctx, width, baseY, height) {
  ctx.save();
  ctx.translate(0, baseY - height);
  ctx.scale(width / 1440, height / 420);
  ctx.fill(HIMALAYA);
  ctx.restore();
}

// A lotus in line-art.
export function lotus(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  ctx.lineWidth = 100 / size;
  const petal = (angle, length, width) => {
    ctx.save();
    ctx.rotate(angle);
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(width, -length * 0.5, 0, -length);
    ctx.quadraticCurveTo(-width, -length * 0.5, 0, 0);
    ctx.restore();
  };
  ctx.beginPath();
  petal(0, 60, 18);
  petal(0.45, 52, 16);
  petal(-0.45, 52, 16);
  petal(0.95, 40, 14);
  petal(-0.95, 40, 14);
  ctx.moveTo(-52, 4);
  ctx.quadraticCurveTo(0, 22, 52, 4);
  ctx.stroke();
  ctx.restore();
}

// ── Celebration ──────────────────────────────────────────────────────────────

// Two champagne flutes clinking, with a little burst where they touch.
export function flutes(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  ctx.lineWidth = 100 / size;
  const flute = (dir) => {
    ctx.save();
    ctx.translate(dir * 16, 0);
    ctx.rotate(dir * -0.22);
    ctx.beginPath();
    ctx.moveTo(-9, -46);
    ctx.lineTo(9, -46);
    ctx.bezierCurveTo(10, -14, 5, -2, 1.5, 4);
    ctx.lineTo(1.5, 34);
    ctx.lineTo(11, 38);
    ctx.lineTo(-11, 38);
    ctx.lineTo(-1.5, 34);
    ctx.lineTo(-1.5, 4);
    ctx.bezierCurveTo(-5, -2, -10, -14, -9, -46);
    ctx.moveTo(-8.6, -32);
    ctx.lineTo(8.6, -32); // the wine line
    ctx.stroke();
    for (const [bx, by] of [[-2, -22], [2, -14], [-1, -8]]) {
      ctx.beginPath();
      ctx.arc(bx, by, 1.2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  };
  flute(-1);
  flute(1);
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.32;
    ctx.moveTo(Math.cos(a) * 8, -52 + Math.sin(a) * 8);
    ctx.lineTo(Math.cos(a) * 18, -52 + Math.sin(a) * 18);
  }
  ctx.stroke();
  ctx.restore();
}

// A gift box in line-art, with a bow.
export function giftOutline(ctx, x, y, size, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(size / 100, size / 100);
  ctx.lineWidth = 100 / size;
  ctx.beginPath();
  ctx.rect(-40, -20, 80, 60);
  ctx.rect(-46, -34, 92, 14);
  ctx.moveTo(0, -34);
  ctx.lineTo(0, 40);
  ctx.moveTo(0, -34);
  ctx.bezierCurveTo(-10, -60, -40, -54, -26, -40);
  ctx.bezierCurveTo(-18, -34, -6, -34, 0, -34);
  ctx.moveTo(0, -34);
  ctx.bezierCurveTo(10, -60, 40, -54, 26, -40);
  ctx.bezierCurveTo(18, -34, 6, -34, 0, -34);
  ctx.stroke();
  ctx.restore();
}

// ── Night sky ────────────────────────────────────────────────────────────────

export function crescent(ctx, x, y, radius) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.arc(radius * 0.42, -radius * 0.18, radius * 0.86, 0, Math.PI * 2);
  ctx.fill('evenodd');
  ctx.restore();
}

export function starOutline(ctx, x, y, size, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  starPath(ctx, size / 2, size / 4.6);
  ctx.stroke();
  ctx.restore();
}

// A little constellation: a few stars joined by fine lines.
export function constellation(ctx, x, y, size, seed) {
  const r = seeded(seed);
  const stars = Array.from({ length: 5 + Math.floor(r() * 3) }, () => [
    x + (r() - 0.5) * size,
    y + (r() - 0.5) * size * 0.6,
  ]);
  ctx.beginPath();
  stars.forEach(([sx, sy], i) => ctx[i ? 'lineTo' : 'moveTo'](sx, sy));
  ctx.stroke();
  for (const [sx, sy] of stars) {
    ctx.beginPath();
    ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Two interlocked wedding rings, one with a small diamond.
export function rings(ctx, x, y, size, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const r = size * 0.3;
  ctx.lineWidth = Math.max(1.2, size * 0.035);
  ctx.beginPath();
  ctx.arc(-r * 0.55, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(r * 0.55, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  // diamond on top of the left ring
  const d = size * 0.09;
  ctx.beginPath();
  ctx.moveTo(-r * 0.55, -r - d * 1.8);
  ctx.lineTo(-r * 0.55 + d, -r - d * 0.9);
  ctx.lineTo(-r * 0.55, -r);
  ctx.lineTo(-r * 0.55 - d, -r - d * 0.9);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
