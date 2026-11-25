// Phewa Lake after sunset, for the Anniversary theme (anniversary.js).
//
//   lakeside(ctx, w, h)        – the ending: Machhapuchhre and its neighbours in
//                                the afterglow, the hills, the island temple, all
//                                mirrored in the water; lotuses in the corners
//   afterglow(ctx, w, h)       – the light behind it (painted under it)
//   SHORE                      – how far the far shore is above the page's end
//   boat()                     – the boat for two (a sprite; its waterline is at
//                                BOAT_LINE below its middle)
//   lamp(ctx, x, y, k, time, phase)
//                              – a little lamp floating on its leaf, `k` = its size
//                                (1 right in front of us), with its light on the water
//   waterSize(y, h)            – how big things are on the water at height y

import { sprite, stamp, leaf, glow, petal, marigold, foil, seeded, shade } from './draw';
import { rose } from '../sections/events/flowers';
import { pagoda } from '../sections/temple';

export const SHORE = 430;
const SQUASH = 0.72; // how much shorter things look mirrored

export const waterSize = (y, h) => 0.2 + 0.8 * Math.max(0, Math.min(1, (y - (h - SHORE)) / (SHORE - 50))) ** 1.25;

// ── Mountains ────────────────────────────────────────────────────────────────

// The snow range. `peaks` = [x, height, steepness] (0..1 of w, px); brushed
// along its slopes: the side facing the last light (right) warm, the other cool.
function snowRange(ctx, w, base, { peaks, seed, cool, warm, rock, haze }) {
  const r = seeded(seed);
  const bumps = Array.from({ length: 6 }, (_, i) => [r() * 6, 0.024 * 1.9 ** i, 15 / 1.62 ** i]);
  const ridge = (x) => {
    let top = 62;
    for (const [px, height, half] of peaks) {
      const d = Math.abs(x - px) / half;
      if (d < 1) top = Math.max(top, height * (1 - d) ** 1.22);
    }
    return base - top - bumps.reduce((sum, [p, f, a]) => sum + Math.sin(x * f + p) * a, 0) * Math.min(1, top / 120);
  };
  const highest = Math.max(...peaks.map((p) => p[1]));
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-20, base + 4);
  for (let x = -20; x <= w + 20; x += 2) ctx.lineTo(x, ridge(x));
  ctx.lineTo(w + 20, base + 4);
  ctx.closePath();
  const body = ctx.createLinearGradient(0, base - highest, 0, base);
  body.addColorStop(0, cool[0]);
  body.addColorStop(0.45, cool[1]);
  body.addColorStop(1, rock);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.clip();
  // brush strokes down the slopes
  ctx.lineCap = 'round';
  const strokes = Math.round(w * highest * 0.055);
  for (let i = 0; i < strokes; i++) {
    const x = r() * (w + 40) - 20;
    const top = ridge(x);
    const t = r() ** 1.5;
    const y = top + t * (base - top);
    const slope = (ridge(x + 7) - ridge(x - 7)) / 14;
    // (the lie of the land changes a little from gully to gully)
    const faces = slope + Math.sin(x * 0.09 + y * 0.055) * 0.7 + Math.sin(x * 0.031 - y * 0.04) * 0.5;
    const high = Math.max(0, 1 - (y - (base - highest)) / (highest * 0.8)); // snow line
    if (high < 0.12 && r() < 0.6) continue;
    const lit = faces > 0.15;
    ctx.strokeStyle = lit ? warm[Math.floor(r() * warm.length)] : cool[Math.floor(r() * cool.length)];
    ctx.globalAlpha = (0.12 + r() * (lit ? 0.6 : 0.24)) * Math.min(1, high * 1.7 + 0.08);
    ctx.lineWidth = 0.8 + r() * 2.2;
    const dir = lit ? 1 : -1;
    const len = 4 + r() * 11;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + dir * len * 0.35, y + len * 0.5, x + dir * len * (0.35 + r() * 0.35), y + len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const mist = ctx.createLinearGradient(0, base - highest * 0.55, 0, base);
  mist.addColorStop(0, `rgba(${haze}, 0)`);
  mist.addColorStop(1, `rgba(${haze}, 0.75)`);
  ctx.fillStyle = mist;
  ctx.fillRect(-20, base - highest, w + 40, highest + 8);
  ctx.restore();
}

// A wooded hill range in front of them.
function hillRange(ctx, w, base, { height, seed, color, light, haze }) {
  const r = seeded(seed);
  const p = [r() * 6, r() * 6, r() * 6];
  const ridge = (x) => base - height * (0.6 + 0.26 * Math.sin(x / 170 + p[0]) + 0.1 * Math.sin(x / 61 + p[1]) + 0.04 * Math.sin(x / 17 + p[2]));
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-20, base + 2);
  for (let x = -20; x <= w + 20; x += 4) ctx.lineTo(x, ridge(x) + Math.sin(x * 1.7) * 1.2);
  ctx.lineTo(w + 20, base + 2);
  ctx.fill();
  ctx.clip();
  for (let i = 0; i < w * height * 0.02; i++) {
    const x = r() * (w + 40) - 20;
    const y = ridge(x) + r() * (base - ridge(x));
    ctx.fillStyle = r() < 0.5 ? light : shade(color, -0.12);
    ctx.globalAlpha = 0.12 + r() * 0.2;
    ctx.beginPath();
    ctx.arc(x, y, 2 + r() * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const mist = ctx.createLinearGradient(0, base - height * 0.5, 0, base);
  mist.addColorStop(0, `rgba(${haze}, 0)`);
  mist.addColorStop(1, `rgba(${haze}, 0.5)`);
  ctx.fillStyle = mist;
  ctx.fillRect(-20, base - height, w + 40, height);
  ctx.restore();
}

// All that stands on the far shore (its foot at `base`).
function farShore(ctx, w, base) {
  const wide = Math.max(1, w / 430);
  const s = Math.min(1.25, 0.92 + 0.1 * wide);
  const peak = w * (w < 700 ? 0.6 : 0.56);
  snowRange(ctx, w, base - 40, {
    seed: 4,
    peaks: [
      [peak, 296 * s, 215 * s], [peak + 27 * s, 280 * s, 190 * s], // the fishtail's two tips
      [peak + 84 * s, 182 * s, 190 * s], [peak - 74 * s, 160 * s, 170 * s], // its shoulders
      [peak - 205, 186 * s, 220], [peak - 262, 150 * s, 190], [peak + 238, 168 * s, 230], [peak + 300, 190 * s, 210], // its neighbours, all joined
      [peak - 400, 128, 260], [peak - 520, 208, 330], [peak - 590, 170, 240], [peak - 760, 130, 260], [peak + 450, 120, 260], [peak + 600, 158, 300], [peak + 690, 196, 260], [peak + 860, 140, 260],
    ],
    cool: ['#A7A9C2', '#7690AA', '#B4B6CC'],
    warm: ['#FFE0C2', '#FFC8A0', '#F5AC8C', '#FFEEDA'],
    rock: '#5E7F92',
    haze: '238, 190, 150',
  });
  hillRange(ctx, w, base - 16, { height: 104, seed: 12, color: '#4E7482', light: '#6F949A', haze: '226, 178, 140' });
  hillRange(ctx, w, base, { height: 66, seed: 21, color: '#2C5260', light: '#3F6C74', haze: '150, 130, 120' });
  // a village's windows along the water
  const r = seeded(33);
  for (let i = 0; i < w / 15; i++) {
    const x = r() * w;
    stamp(ctx, glow(5, '255, 205, 130'), x, base - 4 - r() * 22, { alpha: 0.9 });
    ctx.fillStyle = 'rgba(255, 226, 160, 0.9)';
    ctx.fillRect(x - 0.7, base - 4 - r() * 20, 1.5, 1.5);
  }
  // the temple on its island (Tal Barahi)
  const ix = w * (w < 700 ? 0.2 : 0.3);
  ctx.fillStyle = '#1B3A46';
  ctx.beginPath();
  ctx.ellipse(ix, base, 62, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  stamp(ctx, glow(70, '255, 190, 110'), ix, base - 32, { alpha: 0.55 });
  ctx.save();
  ctx.translate(ix, base - 76);
  ctx.scale(0.074, 0.074);
  pagoda(ctx, 0, 0);
  ctx.restore();
  for (let i = 0; i < 46; i++) {
    const side = i % 2 ? 1 : -1;
    const [x, y] = [ix + side * (20 + r() * 38), base - 2 - r() * 26];
    ctx.fillStyle = ['#1F4350', '#2A5358', '#173540'][i % 3];
    ctx.beginPath();
    ctx.arc(x, y, 4 + r() * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function afterglow(ctx, w, h) {
  const y = h - SHORE - 40;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-over';
  const g = ctx.createRadialGradient(w * 0.6, y, 0, w * 0.6, y, 440);
  g.addColorStop(0, 'rgba(255, 224, 168, 0.95)');
  g.addColorStop(0.3, 'rgba(250, 190, 130, 0.7)');
  g.addColorStop(0.65, 'rgba(214, 150, 120, 0.25)');
  g.addColorStop(1, 'rgba(180, 130, 120, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(-20, y - 450, w + 40, 560);
  ctx.restore();
}

// ── The water ────────────────────────────────────────────────────────────────

export function lakeside(ctx, w, h) {
  const base = h - SHORE;
  const r = seeded(61);
  // the far shore, kept as a picture too, to mirror it in the water
  const scale = ctx.getTransform().a;
  const tall = 420;
  const picture = document.createElement('canvas');
  picture.width = Math.ceil(w * scale);
  picture.height = Math.ceil(tall * scale);
  const pc = picture.getContext('2d');
  pc.scale(scale, scale);
  pc.translate(0, tall - 14 - base);
  farShore(pc, w, base);
  ctx.drawImage(picture, 0, base + 14 - tall, w, tall);

  // the water: the sky's colours upside down
  const water = ctx.createLinearGradient(0, base, 0, h);
  water.addColorStop(0, '#E2AE84');
  water.addColorStop(0.16, '#B98F80');
  water.addColorStop(0.36, '#5F8186');
  water.addColorStop(0.62, '#2C5966');
  water.addColorStop(1, '#12333F');
  ctx.fillStyle = water;
  ctx.fillRect(-20, base - 1, w + 40, SHORE + 20);

  // the mirrored shore, shaken sideways a little more the nearer it is
  ctx.save();
  const deep = (tall - 16) * SQUASH;
  for (let y = 0; y < deep; y += 1.5) {
    const t = y / deep;
    const shake = Math.sin(y * 0.55) * (0.4 + t * 3) + Math.sin(y * 0.21 + 2) * t * 4;
    ctx.globalAlpha = 0.8 * (1 - t * 0.55);
    const from = (tall - 16 - y / SQUASH) * scale;
    if (from < 0) break;
    ctx.drawImage(picture, 0, from, picture.width, Math.max(1, (1.5 / SQUASH) * scale), shake - 4, base - 1 + y, w + 8, 1.8);
  }
  ctx.restore();

  // ripples: long and thin far away, broader near us; warm where the light falls
  ctx.lineCap = 'round';
  for (let i = 0; i < w * 1.5; i++) {
    const t = r() ** 0.8;
    const y = base + 10 + t * (SHORE - 12);
    const x = r() * (w + 60) - 30;
    const glowing = Math.max(0, 1 - Math.abs(x - w * 0.6) / (70 + t * 130));
    const warm = r() < glowing * 0.8;
    ctx.strokeStyle = warm ? `rgba(255, 214, 158, ${0.12 + r() * 0.25})` : r() < 0.5 ? `rgba(12, 40, 54, ${0.1 + r() * 0.16})` : `rgba(176, 206, 206, ${0.04 + r() * 0.1})`;
    ctx.lineWidth = 0.6 + t * 1.6;
    const len = 8 + r() * (16 + t * 40);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len / 2, y + (r() - 0.5) * 3 * t, x + len, y);
    ctx.stroke();
  }
  // the light along the far shore
  const line = ctx.createLinearGradient(0, base - 2, 0, base + 10);
  line.addColorStop(0, 'rgba(255, 224, 176, 0)');
  line.addColorStop(0.3, 'rgba(255, 224, 176, 0.4)');
  line.addColorStop(1, 'rgba(255, 224, 176, 0)');
  ctx.fillStyle = line;
  ctx.fillRect(-20, base - 2, w + 40, 12);

  lotuses(ctx, w, h);
}

// ── Lotuses in the corners ───────────────────────────────────────────────────

function pad(ctx, x, y, rx, turn, tone) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, 0.36);
  ctx.rotate(turn);
  const g = ctx.createRadialGradient(-rx * 0.2, -rx * 0.3, 0, 0, 0, rx);
  g.addColorStop(0, shade(tone, 0.22));
  g.addColorStop(0.8, tone);
  g.addColorStop(1, shade(tone, -0.3));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, rx, 0.16, Math.PI * 2 - 0.16);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(190, 220, 190, 0.25)';
  ctx.lineWidth = 1;
  for (let a = 0.4; a < 6; a += 0.55) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * rx * 0.9, Math.sin(a) * rx * 0.9);
    ctx.stroke();
  }
  ctx.restore();
}

// A lotus, half open, `size` px wide.
function lotus(size) {
  return sprite(`lotus-${size}`, size * 1.3, size * 1.1, (ctx) => {
    ctx.translate(0, size * 0.36);
    const one = (a, len, wide, c0, c1) => {
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(wide, -len * 0.3, wide * 0.9, -len * 0.75, 0, -len);
      ctx.bezierCurveTo(-wide * 0.9, -len * 0.75, -wide, -len * 0.3, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, -len);
      g.addColorStop(0, c0);
      g.addColorStop(1, c1);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = 'rgba(190, 110, 120, 0.25)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();
    };
    for (const a of [-1.35, 1.35, -1, 1]) one(a, size * 0.6, size * 0.14, '#F7E2D6', '#EFB9B4');
    for (const a of [-0.62, 0.62, -0.3, 0.3, 0]) one(a, size * 0.68, size * 0.16, '#FFF3E6', '#F4CBC4');
    for (const a of [-0.46, 0.46, -0.14, 0.14]) one(a, size * 0.52, size * 0.14, '#FFF8EE', '#FADDD4');
    ctx.fillStyle = '#E8B754';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.06, size * 0.1, size * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function lotuses(ctx, w, h) {
  const r = seeded(17);
  const reach = Math.min(240, 120 + w * 0.08);
  for (const side of [-1, 1]) {
    const edge = side < 0 ? 0 : w;
    // reeds behind
    ctx.lineCap = 'round';
    for (let i = 0; i < 34; i++) {
      const x = edge - side * (r() * reach * 0.42 - 12);
      const tall = 70 + r() * 110;
      ctx.strokeStyle = ['#17383C', '#22494A', '#2F5A54'][i % 3];
      ctx.lineWidth = 1.4 + r() * 1.6;
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.quadraticCurveTo(x - side * 4, h - tall * 0.6, x - side * (8 + r() * 26), h - tall);
      ctx.stroke();
      if (i % 6 === 0) {
        ctx.strokeStyle = '#6E4A34'; // a bulrush
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x - side * 2, h - tall * 0.95);
        ctx.lineTo(x - side * 4, h - tall * 0.95 - 18);
        ctx.stroke();
      }
    }
    const spots = Array.from({ length: 13 }, () => {
      const t = r();
      return [edge - side * (t ** 1.2 * reach), h - 6 - r() * (1 - t) * 84, 20 + r() * 20];
    }).sort((m, n) => m[1] - n[1]);
    spots.forEach(([x, y, rx], i) => {
      pad(ctx, x, y, rx * (0.6 + 0.5 * waterSize(y, h)), r() * 6, ['#2E5B4E', '#3C6E58', '#244C46'][i % 3]);
      if (i % 3 === 1) stamp(ctx, lotus(Math.round(34 + r() * 14)), x, y - 12, { angle: (r() - 0.5) * 0.2 });
    });
  }
}

// ── The boat ─────────────────────────────────────────────────────────────────

const BOAT = { w: 390, h: 250, line: 78 };
export const BOAT_LINE = BOAT.line;

export function boat() {
  return sprite('anniversary-boat', BOAT.w, BOAT.h, (ctx) => {
    ctx.translate(0, BOAT.line);
    const r = seeded(9);
    const front = new Path2D('M -172 -40 C -150 -14, -126 4, -98 8 L 104 8 C 136 4, 160 -18, 182 -52 C 150 -30, 110 -22, 0 -20 C -100 -22, -146 -28, -172 -40 Z');
    const back = new Path2D('M -172 -40 C -120 -46, -60 -40, 0 -38 C 70 -38, 140 -46, 182 -52 C 150 -30, 110 -22, 0 -20 C -100 -22, -146 -28, -172 -40 Z');
    // inside
    const inner = ctx.createLinearGradient(0, -48, 0, -16);
    inner.addColorStop(0, '#6B4630');
    inner.addColorStop(1, '#33211C');
    ctx.fillStyle = inner;
    ctx.fill(back);

    // the canopy's far posts and its glow
    ctx.fillStyle = '#4C3226';
    for (const x of [-62, 66]) ctx.fillRect(x - 2, -128, 4, 96);
    const warm = ctx.createRadialGradient(2, -76, 0, 2, -76, 110);
    warm.addColorStop(0, 'rgba(255, 206, 130, 0.75)');
    warm.addColorStop(0.5, 'rgba(255, 180, 100, 0.25)');
    warm.addColorStop(1, 'rgba(255, 170, 90, 0)');
    ctx.fillStyle = warm;
    ctx.fillRect(-120, -180, 240, 170);

    // a low seat with cushions and a shawl, and a little table between
    ctx.fillStyle = '#7C5136';
    ctx.fillRect(-64, -42, 132, 9);
    for (const [x, color] of [[-50, '#A9383E'], [-26, '#D69A48'], [34, '#D69A48'], [57, '#A9383E']]) {
      const g = ctx.createRadialGradient(x - 4, -56, 1, x, -52, 19);
      g.addColorStop(0, shade(color, 0.35));
      g.addColorStop(1, shade(color, -0.25));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(x - 13, -63, 26, 22, 7);
      ctx.fill();
    }
    ctx.fillStyle = '#EFE2CB'; // the shawl, over the side
    ctx.beginPath();
    ctx.moveTo(-74, -44);
    ctx.quadraticCurveTo(-62, -48, -48, -43);
    ctx.lineTo(-52, -14);
    ctx.lineTo(-76, -12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(160, 60, 60, 0.7)';
    ctx.lineWidth = 2;
    for (const y of [-20, -24]) {
      ctx.beginPath();
      ctx.moveTo(-76, y + 3);
      ctx.lineTo(-52, y + 1);
      ctx.stroke();
    }
    ctx.fillStyle = foil(ctx, -10, 0, 16, 0);
    ctx.beginPath();
    ctx.ellipse(4, -46, 17, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(2.5, -46, 3, 14);
    for (const [x, tilt] of [[-5, -0.06], [13, 0.06]]) { // two glasses
      ctx.save();
      ctx.translate(x, -48);
      ctx.rotate(tilt);
      ctx.fillStyle = 'rgba(255, 246, 226, 0.75)';
      ctx.fillRect(-0.5, -9, 1, 9);
      ctx.fillRect(-3, -0.8, 6, 1.4);
      ctx.beginPath();
      ctx.moveTo(-3.4, -20);
      ctx.quadraticCurveTo(-3, -9, 0, -8.6);
      ctx.quadraticCurveTo(3, -9, 3.4, -20);
      ctx.fill();
      ctx.fillStyle = 'rgba(236, 180, 84, 0.9)';
      ctx.beginPath();
      ctx.moveTo(-3, -15);
      ctx.quadraticCurveTo(-2.6, -9.4, 0, -9.2);
      ctx.quadraticCurveTo(2.6, -9.4, 3, -15);
      ctx.fill();
      ctx.restore();
    }
    for (let i = 0; i < 6; i++) stamp(ctx, rose(9, ['white', 'blush'][i % 2]), 4 + (r() - 0.5) * 12, -51 + (r() - 0.5) * 5, { angle: r() * 6 });

    // the hull: planks, a painted band, gold along the top
    const hull = ctx.createLinearGradient(0, -50, 0, 10);
    hull.addColorStop(0, '#96603A');
    hull.addColorStop(0.5, '#74452B');
    hull.addColorStop(1, '#3C2620');
    ctx.fillStyle = hull;
    ctx.fill(front);
    ctx.save();
    ctx.clip(front);
    ctx.strokeStyle = 'rgba(30, 14, 10, 0.35)';
    ctx.lineWidth = 1;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      ctx.moveTo(-176, -34 + k * 9);
      ctx.bezierCurveTo(-110, -14 + k * 8, 100, -14 + k * 8, 186, -44 + k * 10);
      ctx.stroke();
    }
    ctx.strokeStyle = '#1F5560'; // the band
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-176, -33);
    ctx.bezierCurveTo(-110, -14, 100, -12, 186, -44);
    ctx.stroke();
    for (let t = 0.06; t < 0.96; t += 0.052) { // gold dots along it
      const x = (1 - t) ** 3 * -176 + 3 * (1 - t) ** 2 * t * -110 + 3 * (1 - t) * t * t * 100 + t ** 3 * 186;
      const y = (1 - t) ** 3 * -33 + 3 * (1 - t) ** 2 * t * -14 + 3 * (1 - t) * t * t * -12 + t ** 3 * -44;
      ctx.fillStyle = '#E7C273';
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    const wet = ctx.createLinearGradient(0, -4, 0, 10);
    wet.addColorStop(0, 'rgba(10, 30, 40, 0)');
    wet.addColorStop(1, 'rgba(10, 30, 40, 0.6)');
    ctx.fillStyle = wet;
    ctx.fillRect(-190, -6, 380, 18);
    ctx.restore();
    ctx.strokeStyle = '#E0B56A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-172, -40);
    ctx.bezierCurveTo(-146, -28, -100, -22, 0, -20);
    ctx.bezierCurveTo(110, -22, 150, -30, 182, -52);
    ctx.stroke();

    // near posts, drapes tied to them, and the roof of cloth
    for (const [x, dir] of [[-78, 1], [82, -1]]) {
      const g = ctx.createLinearGradient(x, 0, x + dir * 26, 0);
      g.addColorStop(0, 'rgba(255, 246, 226, 0.95)');
      g.addColorStop(0.5, 'rgba(236, 216, 186, 0.75)');
      g.addColorStop(1, 'rgba(255, 240, 214, 0.35)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x - dir * 4, -126);
      ctx.lineTo(x + dir * 44, -128);
      ctx.quadraticCurveTo(x + dir * 22, -92, x + dir * 4, -76);
      ctx.quadraticCurveTo(x + dir * 14, -50, x + dir * 10, -24);
      ctx.lineTo(x - dir * 6, -24);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#6B4530';
      ctx.fillRect(x - 2.5, -130, 5, 108);
      for (let i = 0; i < 5; i++) stamp(ctx, rose(11, ['white', 'blush'][i % 2]), x + dir * 2 + (r() - 0.5) * 8, -77 + (r() - 0.5) * 9, { angle: r() * 6 });
    }
    const roof = ctx.createLinearGradient(0, -174, 0, -118);
    roof.addColorStop(0, '#FBEFD8');
    roof.addColorStop(1, '#D8BC90');
    ctx.fillStyle = roof;
    ctx.beginPath();
    ctx.moveTo(-96, -122);
    ctx.quadraticCurveTo(-66, -166, 2, -170);
    ctx.quadraticCurveTo(70, -166, 100, -122);
    for (let x = 100; x > -96; x -= 14) ctx.quadraticCurveTo(x - 7, -108, x - 14, -122);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 110, 60, 0.35)';
    ctx.lineWidth = 1;
    for (const x of [-64, -32, 2, 36, 68]) {
      ctx.beginPath();
      ctx.moveTo(2 + (x - 2) * 0.2, -169);
      ctx.quadraticCurveTo(x * 0.8, -150, x, -118);
      ctx.stroke();
    }
    // a garland along its edge, and lamps under it
    for (let x = -94; x <= 98; x += 7) {
      const y = -120 + Math.sin(((x + 94) / 48) * Math.PI) ** 2 * 7;
      if (Math.round(x) % 3 === 0) stamp(ctx, leaf(13, '#4F6E55'), x, y + 5, { angle: Math.PI + (r() - 0.5) });
      stamp(ctx, (Math.round(x / 7) % 4 ? marigold(9, 'gold') : rose(12, 'white')), x, y, { scale: Math.round(x / 7) % 4 ? 0.5 : 1, angle: r() * 6 });
    }
    for (let i = 0; i < 14; i++) stamp(ctx, rose(Math.round(11 + r() * 7), ['white', 'blush', 'white'][i % 3]), 2 + (r() - 0.5) * 54, -168 + Math.abs(r() - 0.5) * 14, { angle: r() * 6 });
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const x of [-52, -25, 2, 29, 56]) stamp(ctx, glow(17, '255, 200, 120'), x, -98, { alpha: 0.9 });
    ctx.restore();
    for (const x of [-52, -25, 2, 29, 56]) {
      ctx.fillStyle = '#7A5A34';
      ctx.fillRect(x - 0.5, -116, 1, 12);
      ctx.fillStyle = '#FFEBB8';
      ctx.beginPath();
      ctx.ellipse(x, -98, 4.2, 5.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#C99A4B';
      ctx.fillRect(x - 2.4, -105, 4.8, 2.4);
    }
    // a lamp on the prow
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    stamp(ctx, glow(26, '255, 196, 110'), 166, -62, { alpha: 0.9 });
    ctx.restore();
    ctx.fillStyle = '#C99A4B';
    ctx.fillRect(162, -58, 9, 3);
    ctx.fillRect(163, -72, 7, 2.5);
    ctx.fillStyle = '#FFE6A8';
    ctx.fillRect(163, -69, 7, 11);
  });
}

// ── Lamps afloat ─────────────────────────────────────────────────────────────

// A leaf plate with marigold petals and a clay lamp on it, unlit.
function lampLeaf() {
  return sprite('lake-lamp', 64, 40, (ctx) => {
    ctx.translate(0, 8);
    for (let i = 0; i < 9; i++) stamp(ctx, leaf(24, i % 2 ? '#4E7A4A' : '#3A6440'), Math.cos((i / 9) * 6.28) * 14, Math.sin((i / 9) * 6.28) * 4.5, { angle: Math.PI / 2 + Math.atan2(Math.sin((i / 9) * 6.28) * 0.35, Math.cos((i / 9) * 6.28)), scale: 0.9 });
    const r = seeded(2);
    for (let i = 0; i < 10; i++) stamp(ctx, petal(i % 2 ? '#E2881E' : '#F2B33D', 9), (r() - 0.5) * 30, (r() - 0.5) * 8 - 1, { angle: r() * 6, scale: 0.8 });
    const g = ctx.createLinearGradient(-9, 0, 9, 0);
    g.addColorStop(0, '#8A4522');
    g.addColorStop(0.4, '#C6743C');
    g.addColorStop(1, '#7A3A1C');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -3, 9.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -3, 9.5, 8, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#5A2A14';
    ctx.beginPath();
    ctx.ellipse(0, -3, 7.4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

const lampFlame = () => sprite('lake-flame', 14, 26, (ctx) => {
  ctx.translate(0, 10);
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.bezierCurveTo(6, -9, 5, 0, 0, 1);
  ctx.bezierCurveTo(-5, 0, -6, -9, 0, -20);
  const g = ctx.createLinearGradient(0, -20, 0, 1);
  g.addColorStop(0, '#FFF6CE');
  g.addColorStop(0.5, '#FFC457');
  g.addColorStop(1, '#E87B2A');
  ctx.fillStyle = g;
  ctx.fill();
});

// Its light on the water: a tall soft streak, broken by ripples.
const streak = () => sprite('lake-streak', 44, 120, (ctx) => {
  const r = seeded(4);
  for (let y = -58; y < 58; y += 5) {
    const t = (y + 58) / 116;
    const half = (6 + r() * 12) * (1 - t * 0.4);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, half);
    g.addColorStop(0, `rgba(255, 204, 126, ${0.6 * (1 - t)})`);
    g.addColorStop(1, 'rgba(255, 190, 110, 0)');
    ctx.save();
    ctx.translate((r() - 0.5) * 5, y);
    ctx.scale(1, 0.2);
    ctx.fillStyle = g;
    ctx.fillRect(-half, -half, half * 2, half * 2);
    ctx.restore();
  }
});

export function lamp(ctx, x, y, k, time, phase, alpha = 1) {
  const flicker = 1 + Math.sin(time * 9 + phase * 3) * 0.08 + Math.sin(time * 14 + phase) * 0.05;
  const bob = Math.sin(time * 1.2 + phase) * 1.6 * k;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  stamp(ctx, streak(), x + Math.sin(time * 1.6 + phase) * 1.5 * k, y + 66 * k, { scale: k, alpha: alpha * 0.8 });
  ctx.restore();
  stamp(ctx, lampLeaf(), x, y + bob, { scale: k, alpha, angle: Math.sin(time * 0.9 + phase) * 0.04 });
  stamp(ctx, lampFlame(), x, y + bob - 8 * k, { scale: k * flicker, alpha });
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  stamp(ctx, glow(46, '255, 184, 96'), x, y + bob - 8 * k, { scale: k * flicker, alpha: alpha * 0.85 });
  ctx.restore();
}
