// Ornaments printed on the paper itself: foil frames, corner flourishes,
// mandalas, art-deco fans, tone-on-tone patterns, vignettes.
//
// These never move, so the theme layer paints them ONCE into a "backdrop"
// picture and reuses it every frame (see ThemeLayer.jsx).

import { foil, heartPath, seeded } from './draw';

// Darken the edges, like light falling off a card under a lamp.
export function vignette(ctx, w, h, strength = 0.35, rgb = '0,0,0') {
  const g = ctx.createRadialGradient(w / 2, h * 0.42, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, `rgba(${rgb},0)`);
  g.addColorStop(1, `rgba(${rgb},${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// A pool of soft light (e.g. a spotlight from above).
export function spotlight(ctx, x, y, radius, rgba) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, rgba);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

// Fine fibres, like handmade paper.
export function fibres(ctx, w, h, { count = 400, color = 'rgba(140,110,70,0.08)', seed = 7 } = {}) {
  const r = seeded(seed);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.6;
  for (let i = 0; i < count; i++) {
    const x = r() * w;
    const y = r() * h;
    const len = 6 + r() * 18;
    const a = r() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.cos(a + 0.6) * len * 0.5,
      y + Math.sin(a + 0.6) * len * 0.5,
      x + Math.cos(a) * len,
      y + Math.sin(a) * len,
    );
    ctx.stroke();
  }
  ctx.restore();
}

// Repeat a small motif across the page in a half-drop grid (like damask).
export function pattern(ctx, w, h, { spacing = 80, alpha = 0.07, draw }) {
  ctx.save();
  ctx.globalAlpha = alpha;
  let row = 0;
  for (let y = spacing / 2; y < h + spacing; y += spacing * 0.866, row++) {
    const offset = row % 2 ? spacing / 2 : 0;
    for (let x = offset; x < w + spacing; x += spacing) {
      ctx.save();
      ctx.translate(x, y);
      draw(ctx);
      ctx.restore();
    }
  }
  ctx.restore();
}

// ── Frames ───────────────────────────────────────────────────────────────────

// A foil frame: a fine outer line and a finer inner line (optionally dotted).
export function foilFrame(ctx, w, h, { inset = 28, gap = 6, tone = 'gold', alpha = 0.85, dotted = false } = {}) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = foil(ctx, 0, 0, w, h, tone);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(inset + 0.5, inset + 0.5, w - inset * 2 - 1, h - inset * 2 - 1);
  ctx.lineWidth = 0.6;
  if (dotted) {
    // a row of tiny foil dots instead of a line
    ctx.setLineDash([0.8, 4.5]);
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.4;
  }
  const i2 = inset + gap;
  ctx.strokeRect(i2 + 0.5, i2 + 0.5, w - i2 * 2 - 1, h - i2 * 2 - 1);
  ctx.restore();
}

// Scrolled corner flourishes (art nouveau), one in each corner of a frame.
export function cornerFlourishes(ctx, w, h, { inset = 28, size = 70, tone = 'gold', alpha = 0.9 } = {}) {
  const corners = [
    [inset, inset, 1, 1],
    [w - inset, inset, -1, 1],
    [inset, h - inset, 1, -1],
    [w - inset, h - inset, -1, -1],
  ];
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = foil(ctx, 0, 0, w, h, tone);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = 1.1;
  ctx.lineCap = 'round';
  for (const [x, y, sx, sy] of corners) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    const s = size;
    ctx.beginPath();
    // scroll along the top edge
    ctx.moveTo(s * 1.1, 0);
    ctx.bezierCurveTo(s * 0.5, 0, s * 0.18, s * 0.08, s * 0.2, s * 0.32);
    ctx.bezierCurveTo(s * 0.22, s * 0.52, s * 0.48, s * 0.5, s * 0.46, s * 0.33);
    ctx.bezierCurveTo(s * 0.44, s * 0.2, s * 0.3, s * 0.22, s * 0.31, s * 0.31);
    // scroll along the side edge
    ctx.moveTo(0, s * 1.1);
    ctx.bezierCurveTo(0, s * 0.5, s * 0.08, s * 0.18, s * 0.32, s * 0.2);
    ctx.bezierCurveTo(s * 0.52, s * 0.22, s * 0.5, s * 0.48, s * 0.33, s * 0.46);
    ctx.bezierCurveTo(s * 0.2, s * 0.44, s * 0.22, s * 0.3, s * 0.31, s * 0.31);
    // a leaf sprig out of the corner
    ctx.moveTo(s * 0.06, s * 0.06);
    ctx.quadraticCurveTo(s * 0.55, s * 0.3, s * 0.78, s * 0.78);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// Stepped art-deco corners.
export function decoCorners(ctx, w, h, { inset = 28, size = 46, tone = 'gold', alpha = 0.9 } = {}) {
  const corners = [
    [inset, inset, 1, 1],
    [w - inset, inset, -1, 1],
    [inset, h - inset, 1, -1],
    [w - inset, h - inset, -1, -1],
  ];
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = foil(ctx, 0, 0, w, h, tone);
  ctx.lineWidth = 1;
  for (const [x, y, sx, sy] of corners) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    for (let i = 1; i <= 3; i++) {
      const d = i * 8;
      ctx.beginPath();
      ctx.moveTo(size + d, d);
      ctx.lineTo(d, d);
      ctx.lineTo(d, size + d);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(28, 28);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ── Big ornaments ────────────────────────────────────────────────────────────

// A mandala in fine foil line-work, centred on (cx, cy). Placed at a corner,
// only the part on the page shows — a classic quarter-mandala corner.
export function mandala(ctx, cx, cy, radius, { tone = 'gold', alpha = 0.6 } = {}) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = foil(ctx, -radius, -radius, radius, radius, tone);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = 1;

  const ring = (r) => {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  };
  const petals = (r0, r1, count, width, offset = 0) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + offset;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(r0, 0);
      ctx.quadraticCurveTo((r0 + r1) / 2, -width, r1, 0);
      ctx.quadraticCurveTo((r0 + r1) / 2, width, r0, 0);
      ctx.stroke();
      ctx.restore();
    }
  };
  const dots = (r, count, size) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  const arches = (r, count, depth) => {
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const a0 = (i / count) * Math.PI * 2;
      const a1 = ((i + 1) / count) * Math.PI * 2;
      const am = (a0 + a1) / 2;
      ctx.moveTo(Math.cos(a0) * r, Math.sin(a0) * r);
      ctx.quadraticCurveTo(Math.cos(am) * (r + depth), Math.sin(am) * (r + depth), Math.cos(a1) * r, Math.sin(a1) * r);
    }
    ctx.stroke();
  };

  const R = radius;
  ring(R * 0.1);
  petals(R * 0.1, R * 0.26, 8, R * 0.06);
  ring(R * 0.28);
  dots(R * 0.32, 24, 1.3);
  petals(R * 0.36, R * 0.55, 16, R * 0.05);
  petals(R * 0.36, R * 0.5, 16, R * 0.025, Math.PI / 16);
  ring(R * 0.57);
  arches(R * 0.6, 32, R * 0.05);
  ring(R * 0.68);
  petals(R * 0.7, R * 0.88, 24, R * 0.035);
  dots(R * 0.92, 60, 1.1);
  ring(R * 0.96);
  arches(R * 0.98, 48, R * 0.035);
  // inner detail: a second, finer petal ring and dots between the rings
  petals(R * 0.72, R * 0.84, 24, R * 0.015, Math.PI / 24);
  dots(R * 0.64, 40, 0.9);
  dots(R * 0.2, 12, 1.1);
  ctx.restore();
}

// Art-deco fan (sunrise) at a corner: concentric arcs and rays.
export function decoFan(ctx, cx, cy, radius, { start = 0, end = Math.PI / 2, tone = 'gold', alpha = 0.6 } = {}) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = foil(ctx, -radius, -radius, radius, radius, tone);
  ctx.lineWidth = 0.9;
  for (let k = 1; k <= 6; k++) {
    ctx.beginPath();
    ctx.arc(0, 0, (radius * k) / 6, start, end);
    ctx.stroke();
  }
  const rays = 14;
  for (let i = 0; i <= rays; i++) {
    const a = start + ((end - start) * i) / rays;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * radius * 0.18, Math.sin(a) * radius * 0.18);
    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
    ctx.stroke();
  }
  ctx.restore();
}

// Rays from a point (a faint sunburst).
export function sunburst(ctx, cx, cy, length, { rays = 48, tone = 'gold', alpha = 0.06 } = {}) {
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2;
    const a1 = a0 + (Math.PI / rays) * 0.9;
    ctx.globalAlpha = i % 2 ? alpha : alpha * 0.45;
    ctx.fillStyle = foil(ctx, 0, 0, length, length, tone);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a0) * length, Math.sin(a0) * length);
    ctx.lineTo(Math.cos(a1) * length, Math.sin(a1) * length);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// Fine diagonal lattice.
export function lattice(ctx, w, h, { size = 46, color = 'rgba(214,180,110,0.06)' } = {}) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.7;
  for (let x = -h; x < w + h; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + h, h);
    ctx.moveTo(x, h);
    ctx.lineTo(x + h, 0);
    ctx.stroke();
  }
  ctx.restore();
}

// ── Pattern motifs (for `pattern`) ───────────────────────────────────────────

export const motifs = {
  // a tiny heart outline
  heart: (color) => (ctx) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    heartPath(ctx, 12);
    ctx.stroke();
  },
  // a paisley (buta), the classic Nepali / South Asian textile motif
  paisley: (color) => (ctx) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.bezierCurveTo(-14, 8, -12, -10, 0, -12);
    ctx.bezierCurveTo(10, -13, 12, -2, 5, 2);
    ctx.bezierCurveTo(1, 4, -2, 1, 0, -3);
    ctx.moveTo(0, 14);
    ctx.bezierCurveTo(8, 10, 12, 4, 10, -4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-3, 4, 1, 0, Math.PI * 2);
    ctx.stroke();
  },
  // a four-point star
  star: (color) => (ctx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(1, -1);
    ctx.lineTo(4, 0);
    ctx.lineTo(1, 1);
    ctx.lineTo(0, 4);
    ctx.lineTo(-1, 1);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-1, -1);
    ctx.closePath();
    ctx.fill();
  },
};
