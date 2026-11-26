// The birthday table in the garden, for the Birthday theme (birthday.js).
// All measured from the middle of the table's foot: (cx, foot).
//
//   partyTable(ctx, cx, foot, half)  – the table in its linen cloth, a garden
//                                      garland along it, and what's laid on it;
//                                      `half` = half its width
//   candles(cx, foot)                – where the cake's candle flames go
//   candleFlame(ctx, x, y, time, i)  – one of them
//   wrappedGift(ctx, x, foot, w, h, paper, silk)
//   lawnLantern(ctx, x, foot, size)  – a brass lantern standing in the grass
//   balloon(color, radius)           – a soft, pearly balloon (a sprite)
//   flag(ctx, a, b, tip, color)      – one silk flag of the bunting

import { sprite, stamp, shade, foil, leaf, bow, glow, pearl, goldBead, seeded } from './draw';
import { jasmine } from './pergola';
import { rose } from '../sections/events/flowers';
import { blossom } from './jacaranda';

const TABLE = 138; // how high its top is above its foot
const DEPTH = 22; // how much of the top you see
const STAND = 34; // the cake stand's height
const TIERS = [ // the cake, from the bottom: half-width, height, icing
  { w: 58, h: 46, color: '#CDB9EA' },
  { w: 42, h: 40, color: '#E2D4F2' },
  { w: 27, h: 34, color: '#FBF4F4' },
];
const CAKE_TOP = TABLE + 5 + STAND + TIERS.reduce((sum, t) => sum + t.h, 0);
const CANDLE = 25;
const CANDLES = [-18, -9, 0, 9, 18];

// The flames sit on an arc, as candles round a cake do.
export const candles = (cx, foot) =>
  CANDLES.map((dx) => ({ x: cx + dx, y: foot - CAKE_TOP - CANDLE - Math.abs(dx) * 0.12 }));

export function candleFlame(ctx, x, y, time, i) {
  const flicker = 1 + Math.sin(time * 11 + i * 3.1) * 0.09 + Math.sin(time * 17 + i) * 0.06;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  stamp(ctx, glow(20, '255, 180, 90'), x, y - 4, { alpha: ctx.globalAlpha * 0.4 });
  ctx.restore();
  ctx.save();
  ctx.translate(x + Math.sin(time * 5 + i * 2) * 0.4, y);
  ctx.scale(1, flicker);
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.bezierCurveTo(3.8, -4.5, 3.2, 0, 0, 1);
  ctx.bezierCurveTo(-3.2, 0, -3.8, -4.5, 0, -11);
  const g = ctx.createLinearGradient(0, -11, 0, 1);
  g.addColorStop(0, '#FFF6CE');
  g.addColorStop(0.5, '#FFC457');
  g.addColorStop(1, '#E87B2A');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

// ── The table ────────────────────────────────────────────────────────────────

function cloth(ctx, cx, foot, half) {
  const top = foot - TABLE;
  // its shadow on the grass
  const shade0 = ctx.createRadialGradient(0, 0, 0, 0, 0, half * 1.15);
  shade0.addColorStop(0, 'rgba(40, 45, 50, 0.45)');
  shade0.addColorStop(1, 'rgba(40, 45, 50, 0)');
  ctx.save();
  ctx.translate(cx, foot - 2);
  ctx.scale(1, 0.12);
  ctx.fillStyle = shade0;
  ctx.fillRect(-half * 1.2, -half * 1.2, half * 2.4, half * 2.4);
  ctx.restore();

  // the cloth falling down the front: its hem in soft waves
  const wave = (x) => Math.sin((x - cx) / 13) * 3 + Math.sin((x - cx) / 31 + 1) * 2.4;
  ctx.beginPath();
  ctx.moveTo(cx - half, top);
  ctx.lineTo(cx - half - 7, foot - 6 + wave(cx - half));
  for (let x = cx - half - 6; x <= cx + half + 7; x += 4) ctx.lineTo(x, foot - 6 + wave(x));
  ctx.lineTo(cx + half, top);
  ctx.closePath();
  const drop = ctx.createLinearGradient(0, top, 0, foot);
  drop.addColorStop(0, '#FFFBF4');
  drop.addColorStop(0.55, '#F3EAEC');
  drop.addColorStop(1, '#D9CDDD');
  ctx.fillStyle = drop;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // folds: soft violet-grey shadows, each beside a lit edge
  const r = seeded(12);
  for (let x = cx - half - 8; x < cx + half + 10; x += 20 + r() * 16) {
    const width = 12 + r() * 12;
    const g = ctx.createLinearGradient(x - width, 0, x + width, 0);
    g.addColorStop(0, 'rgba(255, 255, 255, 0)');
    g.addColorStop(0.35, 'rgba(255, 253, 248, 0.5)');
    g.addColorStop(0.62, `rgba(140, 116, 160, ${0.2 + r() * 0.1})`);
    g.addColorStop(1, 'rgba(140, 116, 160, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 2, top);
    ctx.lineTo(x + 3, top);
    ctx.lineTo(x + width, foot + 8);
    ctx.lineTo(x - width, foot + 8);
    ctx.fill();
  }
  // the hem: a lace edge
  ctx.strokeStyle = 'rgba(150, 120, 170, 0.35)';
  ctx.lineWidth = 0.8;
  for (const up of [7, 10]) {
    ctx.beginPath();
    for (let x = cx - half - 8; x <= cx + half + 8; x += 4) ctx.lineTo(x, foot - 6 - up + wave(x));
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(150, 120, 170, 0.28)';
  for (let x = cx - half - 6; x <= cx + half + 8; x += 7) {
    ctx.beginPath();
    ctx.arc(x, foot - 10 + wave(x), 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // the top, seen a little from above
  ctx.beginPath();
  ctx.moveTo(cx - half, top);
  ctx.lineTo(cx - half + 16, top - DEPTH);
  ctx.lineTo(cx + half - 16, top - DEPTH);
  ctx.lineTo(cx + half, top);
  ctx.closePath();
  const flat = ctx.createLinearGradient(0, top - DEPTH, 0, top);
  flat.addColorStop(0, '#EFE4EC');
  flat.addColorStop(1, '#FFFCF6');
  ctx.fillStyle = flat;
  ctx.fill();
}

// A garden garland in swags along the table's edge: greenery, little white
// jasmine and jacaranda flowers, and roses where the swags meet. (It was
// marigolds once: they looked out of place at a garden party.)
function garland(ctx, cx, y, half) {
  const swags = Math.max(4, 2 * Math.round(half / 70));
  const width = (half * 2) / swags;
  const r = seeded(31);
  const greens = ['#5E7A44', '#6F8B52', '#86A06A', '#4F6B3A'];
  for (let i = 0; i < swags; i++) {
    const x0 = cx - half + i * width;
    const steps = Math.round(width / 5);
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      const x = x0 + u * width;
      const yy = y + Math.sin(u * Math.PI) * 24;
      // the greenery: soft leaves either way along the swag
      stamp(ctx, leaf(Math.round(12 + r() * 6), greens[k % greens.length]), x, yy + (r() - 0.5) * 6, { angle: Math.PI / 2 + (r() - 0.5) * 2.2 });
      // flowers tucked into it
      if (k % 3 === 1) stamp(ctx, jasmine(9), x + (r() - 0.5) * 4, yy + (r() - 0.5) * 5, { angle: r() * 6 });
      else if (k % 5 === 3) stamp(ctx, blossom(10), x, yy + 2, { angle: r() * 6 });
    }
  }
  for (let i = 0; i <= swags; i++) {
    const x = cx - half + i * width;
    for (const a of [-0.6, 0, 0.6]) stamp(ctx, leaf(20, '#4F6B3A'), x + Math.sin(a) * 8, y + 9, { angle: Math.PI - a });
    stamp(ctx, rose(19, i % 2 ? 'blush' : 'white'), x, y);
  }
}

// ── What's on it ─────────────────────────────────────────────────────────────

function cake(ctx, cx, y) {
  // a brass stand
  ctx.fillStyle = foil(ctx, cx - 20, 0, cx + 20, 0);
  ctx.beginPath();
  ctx.moveTo(cx - 24, y);
  ctx.quadraticCurveTo(cx - 4, y - 5, cx - 5, y - STAND + 5);
  ctx.lineTo(cx + 5, y - STAND + 5);
  ctx.quadraticCurveTo(cx + 4, y - 5, cx + 24, y);
  ctx.fill();
  ctx.fillStyle = foil(ctx, cx - 72, 0, cx + 72, 0);
  ctx.beginPath();
  ctx.ellipse(cx, y - STAND + 3, 70, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  let base = y - STAND + 1;
  TIERS.forEach(({ w, h, color }, n) => {
    const g = ctx.createLinearGradient(cx - w, 0, cx + w, 0);
    g.addColorStop(0, shade(color, -0.2));
    g.addColorStop(0.3, shade(color, 0.35));
    g.addColorStop(0.6, color);
    g.addColorStop(1, shade(color, -0.3));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(cx - w, base - h);
    ctx.lineTo(cx - w, base);
    ctx.ellipse(cx, base, w, 4.5, 0, Math.PI, 0, true);
    ctx.lineTo(cx + w, base - h);
    ctx.fill();
    // fine ridges, as a comb leaves in buttercream
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 0.7;
    for (let yy = base - h + 7; yy < base - 5; yy += 4.5) {
      ctx.beginPath();
      ctx.ellipse(cx, yy - 2, w - 0.5, 4.5, 0, Math.PI * 0.97, Math.PI * 0.03, true);
      ctx.stroke();
    }
    ctx.fillStyle = shade(color, 0.5); // its top
    ctx.beginPath();
    ctx.ellipse(cx, base - h, w, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // pearls round its foot, gold beads under its rim
    for (let a = 0; a <= Math.PI + 0.01; a += Math.PI / Math.round(w / 2.7)) {
      stamp(ctx, pearl(2.3), cx - Math.cos(a) * w, base + Math.sin(a) * 4.5 - 1);
    }
    if (n === 1) for (let a = 0.1; a < Math.PI; a += 0.22) stamp(ctx, goldBead(1.5), cx - Math.cos(a) * w, base - h * 0.5 + Math.sin(a) * 4.5);
    base -= h;
  });

  // sugar flowers tumbling down one side
  const r = seeded(5);
  const spots = [[-12, -148, 13], [-26, -141, 15], [-36, -126, 17], [-28, -120, 14], [-40, -112, 14], [-46, -98, 18], [-36, -93, 14], [-54, -84, 15], [-58, -70, 18], [-46, -68, 15], [-64, -56, 16], [-54, -50, 15], [-68, -42, 15], [34, -40, 15], [47, -42, 17], [57, -39, 13]];
  for (const [dx, dy] of spots) stamp(ctx, leaf(15, '#7C9460'), cx + dx + (r() - 0.5) * 12, y + dy + 4, { angle: r() * 6 });
  spots.forEach(([dx, dy, s], i) => {
    if (i % 3 === 1) {
      for (let k = 0; k < 3; k++) stamp(ctx, blossom(11), cx + dx + (r() - 0.5) * 10, y + dy + (r() - 0.5) * 8, { angle: r() * 6 });
    } else stamp(ctx, rose(s, ['blush', 'white', 'lilac'][i % 3]), cx + dx, y + dy, { angle: r() * 6 });
  });

  // the candles
  for (const dx of CANDLES) {
    const bottom = base - 1 + Math.abs(dx) * 0.06;
    const top = base - CANDLE - Math.abs(dx) * 0.12 + 4;
    ctx.fillStyle = foil(ctx, cx + dx - 2, 0, cx + dx + 2, 0);
    ctx.fillRect(cx + dx - 1.5, top, 3, bottom - top);
    ctx.fillStyle = '#5A4632';
    ctx.fillRect(cx + dx - 0.4, top - 3, 0.8, 3.5);
  }
}

// Laddoos piled on a brass plate.
function laddoos(ctx, x, y) {
  ctx.fillStyle = foil(ctx, x - 26, 0, x + 26, 0);
  ctx.beginPath();
  ctx.ellipse(x, y - 2, 27, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  const r = seeded(8);
  [[4, 0], [3, 10], [2, 20], [1, 30]].forEach(([n, up]) => {
    for (let i = 0; i < n; i++) {
      const [bx, by] = [x + (i - (n - 1) / 2) * 12, y - 9 - up];
      const g = ctx.createRadialGradient(bx - 2, by - 2.5, 0.5, bx, by, 7);
      g.addColorStop(0, '#FFD98A');
      g.addColorStop(0.55, '#EBA23A');
      g.addColorStop(1, '#B96F1C');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, 6.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(150, 85, 20, 0.4)';
      for (let k = 0; k < 7; k++) ctx.fillRect(bx + (r() - 0.5) * 9, by + (r() - 0.5) * 9, 1, 1);
    }
  });
}

// Little cakes on a two-tier brass stand.
function cupcakes(ctx, x, y) {
  ctx.fillStyle = foil(ctx, x - 3, 0, x + 3, 0);
  ctx.fillRect(x - 1.5, y - 66, 3, 66);
  for (const [up, half, n] of [[4, 30, 4], [36, 21, 3]]) {
    ctx.fillStyle = foil(ctx, x - half, 0, x + half, 0);
    ctx.beginPath();
    ctx.ellipse(x, y - up, half, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < n; i++) {
      const cx = x + (i - (n - 1) / 2) * 14.5;
      const cy = y - up - 1;
      ctx.fillStyle = '#E9D7B8';
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy);
      ctx.lineTo(cx - 6, cy - 9);
      ctx.lineTo(cx + 6, cy - 9);
      ctx.lineTo(cx + 4, cy);
      ctx.fill();
      const color = ['#D7C2F0', '#F6D9D3', '#FFF6E6'][(i + n) % 3];
      for (const [dy, rr] of [[-10, 7], [-14, 5.4], [-18, 3.4]]) {
        const g = ctx.createRadialGradient(cx - 2, cy + dy - 2, 0, cx, cy + dy, rr);
        g.addColorStop(0, shade(color, 0.5));
        g.addColorStop(1, shade(color, -0.12));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(cx, cy + dy, rr, rr * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      stamp(ctx, goldBead(1.8), cx, cy - 21);
    }
  }
}

export function partyTable(ctx, cx, foot, half) {
  cloth(ctx, cx, foot, half);
  const top = foot - TABLE - 8; // where things stand
  cupcakes(ctx, cx - half * 0.5 - 6, top + 2);
  laddoos(ctx, cx + half * 0.5 + 4, top + 3);
  cake(ctx, cx, top + 2);
  garland(ctx, cx, foot - TABLE + 4, half - 4);
}

// ── Round the table ──────────────────────────────────────────────────────────

export function wrappedGift(ctx, x, foot, w, h, paperColor, silk) {
  const left = x - w / 2;
  const g = ctx.createLinearGradient(left, 0, left + w, 0);
  g.addColorStop(0, shade(paperColor, 0.22));
  g.addColorStop(0.6, paperColor);
  g.addColorStop(1, shade(paperColor, -0.28));
  ctx.fillStyle = 'rgba(30, 40, 35, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x + 4, foot, w * 0.6, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = g;
  ctx.fillRect(left, foot - h, w, h);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // a fine printed dot
  for (let yy = foot - h + 8; yy < foot - 3; yy += 9) for (let xx = left + 5; xx < left + w - 3; xx += 9) ctx.fillRect(xx + ((yy / 9) % 2) * 3, yy, 1.5, 1.5);
  ctx.fillStyle = shade(paperColor, 0.12); // the lid
  ctx.fillRect(left - 3, foot - h - 7, w + 6, 15);
  ctx.fillStyle = 'rgba(40, 20, 60, 0.18)';
  ctx.fillRect(left, foot - h + 8, w, 3);
  const band = Math.max(8, w * 0.13);
  const s = ctx.createLinearGradient(x - band / 2, 0, x + band / 2, 0);
  s.addColorStop(0, shade(silk, -0.1));
  s.addColorStop(0.4, shade(silk, 0.4));
  s.addColorStop(1, shade(silk, -0.2));
  ctx.fillStyle = s;
  ctx.fillRect(x - band / 2, foot - h - 7, band, h + 7);
  stamp(ctx, bow(silk, Math.round(w * 0.55)), x, foot - h - 10);
}

export function lawnLantern(ctx, x, foot, size) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  stamp(ctx, glow(Math.round(size * 1.5)), x, foot - size * 0.6, { alpha: 0.7 });
  ctx.restore();
  ctx.save();
  ctx.translate(x, foot);
  ctx.scale(size / 60, size / 60);
  const pane = ctx.createLinearGradient(0, -48, 0, -6);
  pane.addColorStop(0, 'rgba(255, 226, 160, 0.55)');
  pane.addColorStop(1, 'rgba(255, 186, 96, 0.85)');
  ctx.fillStyle = pane;
  ctx.fillRect(-15, -48, 30, 42);
  ctx.fillStyle = '#FFF6E0';
  ctx.fillRect(-5, -20, 10, 14); // a candle
  ctx.fillStyle = '#FFE08A';
  ctx.beginPath();
  ctx.ellipse(0, -25, 2.6, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = foil(ctx, -18, 0, 18, 0);
  ctx.fillRect(-18, -6, 36, 6);
  for (const px of [-17, -1.2, 14.6]) ctx.fillRect(px, -50, 2.4, 46);
  ctx.beginPath();
  ctx.moveTo(-20, -48);
  ctx.lineTo(-8, -62);
  ctx.lineTo(8, -62);
  ctx.lineTo(20, -48);
  ctx.fill();
  ctx.strokeStyle = '#A9843D';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -68, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function balloon(color, radius) {
  return sprite(`pearl-balloon-${color}-${radius}`, radius * 2.3, radius * 2.8, (ctx) => {
    ctx.translate(0, -radius * 0.1);
    ctx.beginPath();
    ctx.moveTo(0, radius * 1.18);
    ctx.bezierCurveTo(-radius * 0.5, radius * 0.95, -radius, radius * 0.45, -radius, -radius * 0.1);
    ctx.bezierCurveTo(-radius, -radius * 0.78, -radius * 0.55, -radius * 1.12, 0, -radius * 1.12);
    ctx.bezierCurveTo(radius * 0.55, -radius * 1.12, radius, -radius * 0.78, radius, -radius * 0.1);
    ctx.bezierCurveTo(radius, radius * 0.45, radius * 0.5, radius * 0.95, 0, radius * 1.18);
    const g = ctx.createRadialGradient(-radius * 0.35, -radius * 0.5, radius * 0.1, 0, 0, radius * 1.3);
    g.addColorStop(0, shade(color, 0.6));
    g.addColorStop(0.4, shade(color, 0.12));
    g.addColorStop(0.8, shade(color, -0.1));
    g.addColorStop(1, shade(color, -0.26));
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.94;
    ctx.fill();
    // light coming round its far edge, and a soft glint
    ctx.save();
    ctx.clip();
    const rim = ctx.createRadialGradient(-radius * 0.15, -radius * 0.2, radius * 0.75, 0, 0, radius * 1.2);
    rim.addColorStop(0, 'rgba(255, 255, 255, 0)');
    rim.addColorStop(0.8, 'rgba(255, 250, 240, 0.28)');
    rim.addColorStop(1, 'rgba(255, 250, 240, 0)');
    ctx.fillStyle = rim;
    ctx.fillRect(-radius * 1.2, -radius * 1.2, radius * 2.4, radius * 2.5);
    ctx.restore();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(-radius * 0.42, -radius * 0.55, radius * 0.13, radius * 0.27, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = shade(color, -0.2); // the knot
    ctx.beginPath();
    ctx.moveTo(0, radius * 1.14);
    ctx.lineTo(-radius * 0.12, radius * 1.3);
    ctx.lineTo(radius * 0.12, radius * 1.3);
    ctx.fill();
  });
}

// A flag of silk between two points of its cord, blown a little by `tip`.
export function flag(ctx, a, b, tip, color) {
  const [mx, my] = [(a.x + b.x) / 2, (a.y + b.y) / 2];
  const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
  g.addColorStop(0, shade(color, 0.3));
  g.addColorStop(0.45, color);
  g.addColorStop(1, shade(color, -0.14));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.quadraticCurveTo((b.x + tip.x) / 2 + (tip.x - mx) * 0.2, (b.y + tip.y) / 2, tip.x, tip.y);
  ctx.quadraticCurveTo((a.x + tip.x) / 2 + (tip.x - mx) * 0.2, (a.y + tip.y) / 2, a.x, a.y);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'; // a fold down the middle
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(mx, my + 1);
  ctx.lineTo(tip.x, tip.y - 2);
  ctx.stroke();
}
