// Drawing kit for the theme decorations.
//
// Each decoration (a balloon, a marigold, a pearl…) is painted ONCE into a
// small off-screen picture ("sprite") at 3× size, then stamped onto the page
// every frame. That keeps animation smooth even on cheap phones.
//
// Also here: blurred copies (for things far away) and soft shadows (for
// things hanging close to the paper).

const SCALE = 3; // sprites are painted at 3× so they stay crisp when zoomed in
const cache = new Map();

function canvasOf(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width * SCALE);
  canvas.height = Math.ceil(height * SCALE);
  return canvas;
}

// Get (or paint, the first time) a sprite. `paint(ctx)` draws centred on 0,0.
export function sprite(key, width, height, paint) {
  if (cache.has(key)) return cache.get(key);
  const canvas = canvasOf(width, height);
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);
  ctx.translate(width / 2, height / 2);
  paint(ctx);
  const result = { key, canvas, width, height };
  cache.set(key, result);
  return result;
}

// A soft-focus copy of a sprite, for things far away.
export function blurred(s, amount) {
  const key = `${s.key}|blur${amount}`;
  if (cache.has(key)) return cache.get(key);
  const pad = amount * 2.5;
  const canvas = canvasOf(s.width + pad * 2, s.height + pad * 2);
  const ctx = canvas.getContext('2d');
  ctx.filter = `blur(${amount * SCALE}px)`;
  ctx.drawImage(s.canvas, pad * SCALE, pad * SCALE);
  const result = { key, canvas, width: s.width + pad * 2, height: s.height + pad * 2 };
  cache.set(key, result);
  return result;
}

// A soft dark silhouette of a sprite — its shadow on the paper.
export function shadowOf(s, amount = 4) {
  const key = `${s.key}|shadow${amount}`;
  if (cache.has(key)) return cache.get(key);
  const pad = amount * 2.5;
  const canvas = canvasOf(s.width + pad * 2, s.height + pad * 2);
  const ctx = canvas.getContext('2d');
  ctx.filter = `blur(${amount * SCALE}px)`;
  ctx.drawImage(s.canvas, pad * SCALE, pad * SCALE);
  ctx.filter = 'none';
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = '#1a0d06';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const result = { key, canvas, width: s.width + pad * 2, height: s.height + pad * 2 };
  cache.set(key, result);
  return result;
}

// Speed-ups for drawing hundreds of sprites a frame. The theme layer sets:
//   ctx.__base  – its page→canvas scale, so stamp() can set the whole
//                 transform in one go instead of save/translate/rotate/restore
//   ctx.__view  – { y0, y1 }, the part of the page on screen; anything outside
//                 it isn't drawn at all
export function prepareFast(ctx, base, view, top = 0) {
  ctx.__base = base;
  ctx.__top = top;
  ctx.__view = view;
}

// Stamp a sprite at (x, y), rotated by `angle` (radians).
// `flip` squashes it sideways (-1..1) — used to make petals and confetti tumble.
export function stamp(ctx, s, x, y, { angle = 0, scale = 1, alpha = 1, flip = 1 } = {}) {
  const view = ctx.__view;
  if (view) {
    const reach = (Math.max(s.width, s.height) * scale) / 2;
    if (y + reach < view.y0 || y - reach > view.y1) return; // off screen: skip
  }

  const base = ctx.__base;
  if (base) {
    // fast path: one setTransform, then put the base transform back
    const top = ctx.__top;
    const cos = Math.cos(angle) * scale * base;
    const sin = Math.sin(angle) * scale * base;
    ctx.setTransform(cos * flip, sin * flip, -sin, cos, x * base, (y - top) * base);
    const before = ctx.globalAlpha;
    if (alpha !== 1) ctx.globalAlpha = before * alpha;
    ctx.drawImage(s.canvas, -s.width / 2, -s.height / 2, s.width, s.height);
    ctx.globalAlpha = before;
    ctx.setTransform(base, 0, 0, base, 0, -top * base);
    return;
  }

  ctx.save();
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);
  ctx.scale(scale * flip, scale);
  if (alpha < 1) ctx.globalAlpha = alpha;
  ctx.drawImage(s.canvas, -s.width / 2, -s.height / 2, s.width, s.height);
  ctx.restore();
}

// A sprite with its soft shadow baked in (falling down-right, light from the
// top-left) — one picture, so stamping it costs one draw instead of two.
export function lifted(s, { dx = 6, dy = 10, blur = 4, alpha = 0.3 } = {}) {
  const key = `${s.key}|lift${dx},${dy},${blur},${alpha}`;
  if (cache.has(key)) return cache.get(key);
  const shadow = shadowOf(s, blur);
  const width = Math.max(s.width, shadow.width) + Math.abs(dx) * 2;
  const height = Math.max(s.height, shadow.height) + Math.abs(dy) * 2;
  const canvas = canvasOf(width, height);
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);
  ctx.translate(width / 2, height / 2);
  ctx.globalAlpha = alpha;
  ctx.drawImage(shadow.canvas, dx - shadow.width / 2, dy - shadow.height / 2, shadow.width, shadow.height);
  ctx.globalAlpha = 1;
  ctx.drawImage(s.canvas, -s.width / 2, -s.height / 2, s.width, s.height);
  const result = { key, canvas, width, height };
  cache.set(key, result);
  return result;
}

// Stamp with a soft shadow (see `lifted`).
export function stampLifted(ctx, s, x, y, options = {}, shadow = {}) {
  stamp(ctx, lifted(s, shadow), x, y, options);
}

// ── Colour helpers ───────────────────────────────────────────────────────────

// Lighten (amount > 0) or darken (amount < 0) a #rrggbb colour. amount: -1..1
export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const target = amount > 0 ? 255 : 0;
  const mix = (c) => Math.round(c + (target - c) * Math.abs(amount));
  return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
}

// Metallic foil as a gradient: gold, rose gold or silver.
const FOILS = {
  gold: ['#7E5F28', '#E6CB85', '#A9843D', '#F6E7B0', '#94702F', '#D8B96E'],
  rose: ['#8A4E3E', '#EDC0AE', '#B77762', '#F8DCCD', '#9A5A47', '#D9A08A'],
  silver: ['#6E727A', '#E9ECF0', '#9AA0A8', '#FAFBFC', '#7D828A', '#CDD1D7'],
};
export function foil(ctx, x0, y0, x1, y1, tone = 'gold') {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  const stops = FOILS[tone];
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}

export const rand = (min, max) => min + Math.random() * (max - min);
export const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Random numbers that come out the same every time (for fixed patterns).
export function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Lines ────────────────────────────────────────────────────────────────────

// A smooth curve through a list of points (for strings, threads, ropes).
export function smoothLine(ctx, points, { color, width = 1, alpha = 1 } = {}) {
  if (points.length < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
  ctx.restore();
}

// A satin ribbon: a darker line with a thin bright sheen on top.
export function ribbon(ctx, points, { color = '#C9A56A', width = 1.4 } = {}) {
  smoothLine(ctx, points, { color: shade(color, -0.35), width });
  smoothLine(ctx, points, { color: shade(color, 0.45), width: width * 0.4, alpha: 0.8 });
}

// Curly ribbon ends hanging below a knot (like curled gift ribbon).
export function ribbonCurls(ctx, x, y, time, { color = '#C9A56A', count = 3, length = 56 } = {}) {
  for (let c = 0; c < count; c++) {
    const lean = (c - (count - 1) / 2) * 9;
    const points = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const sway = Math.sin(time * 1.2 + c) * 3 * t;
      points.push({
        x: x + lean * t + Math.sin(t * 13 + c * 2) * 5 * (0.4 + t) + sway,
        y: y + t * (length - c * 8),
      });
    }
    ribbon(ctx, points, { color, width: 1.2 });
  }
}

// How much to rotate something HANGING at `thing` from `above` (a bell, a star),
// so it lines up with its thread.
export const hangAngle = (above, thing) => Math.atan2(above.x - thing.x, thing.y - above.y);

// How much to rotate something FLOATING at `thing` above `below` (a balloon),
// so its knot points down along the string.
export const floatAngle = (thing, below) => Math.atan2(thing.x - below.x, below.y - thing.y);

// ── Shapes ───────────────────────────────────────────────────────────────────

// A heart `size` wide, centred on 0,0 with its point at the bottom.
export function heartPath(ctx, size) {
  const w = size / 2;
  ctx.beginPath();
  ctx.moveTo(0, w * 0.95);
  ctx.bezierCurveTo(-w * 0.2, w * 0.72, -w, w * 0.28, -w, -w * 0.22);
  ctx.bezierCurveTo(-w, -w * 0.72, -w * 0.42, -w * 0.95, 0, -w * 0.52);
  ctx.bezierCurveTo(w * 0.42, -w * 0.95, w, -w * 0.72, w, -w * 0.22);
  ctx.bezierCurveTo(w, w * 0.28, w * 0.2, w * 0.72, 0, w * 0.95);
  ctx.closePath();
}

// A star with `n` points, centred on 0,0.
export function starPath(ctx, outer, inner, n = 5) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
}

// ── Balloons ─────────────────────────────────────────────────────────────────

// Mylar (foil) heart balloon: bands of reflection, a welded seam near the
// edge and a bright glint, like the real thing.
export function mylarHeart(color, size) {
  return sprite(`mylar-${color}-${size}`, size + 8, size + 18, (ctx) => {
    const w = size / 2;
    ctx.translate(0, -5);

    heartPath(ctx, size);
    const body = ctx.createLinearGradient(-w, -w, w * 0.9, w);
    body.addColorStop(0, shade(color, 0.6));
    body.addColorStop(0.16, shade(color, 0.15));
    body.addColorStop(0.36, shade(color, -0.4));
    body.addColorStop(0.52, shade(color, 0.3));
    body.addColorStop(0.72, color);
    body.addColorStop(1, shade(color, -0.55));
    ctx.fillStyle = body;
    ctx.fill();

    ctx.save();
    heartPath(ctx, size);
    ctx.clip();
    // soft bloom of light on the left lobe
    const bloom = ctx.createRadialGradient(-w * 0.45, -w * 0.42, 0, -w * 0.45, -w * 0.42, w * 0.7);
    bloom.addColorStop(0, 'rgba(255,255,255,0.6)');
    bloom.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(-w, -w, size, size);
    // faint reflected light low on the right
    const bounce = ctx.createRadialGradient(w * 0.45, w * 0.25, 0, w * 0.45, w * 0.25, w * 0.5);
    bounce.addColorStop(0, 'rgba(255,255,255,0.22)');
    bounce.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bounce;
    ctx.fillRect(-w, -w, size, size);
    // crisp glint
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(-w * 0.52, -w * 0.4, w * 0.13, w * 0.05, -0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // welded seam just inside the edge
    ctx.save();
    ctx.scale(0.9, 0.9);
    heartPath(ctx, size);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // dark rim
    heartPath(ctx, size);
    ctx.strokeStyle = shade(color, -0.6);
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // crimped neck
    ctx.fillStyle = shade(color, -0.35);
    ctx.beginPath();
    ctx.roundRect(-2.5, w * 0.92, 5, 7, 1.5);
    ctx.fill();
  });
}

// Chrome (metallic latex) balloon: mirror-like highlight, dark core band and
// a bright rim where it reflects the room.
export function chromeBalloon(color, radius) {
  const ry = radius * 1.14;
  return sprite(`chrome-${color}-${radius}`, radius * 2 + 6, ry * 2 + 18, (ctx) => {
    ctx.translate(0, -6);
    const body = ctx.createRadialGradient(-radius * 0.38, -ry * 0.42, radius * 0.04, 0, 0, ry * 1.04);
    body.addColorStop(0, shade(color, 0.85));
    body.addColorStop(0.14, shade(color, 0.4));
    body.addColorStop(0.42, color);
    body.addColorStop(0.78, shade(color, -0.5));
    body.addColorStop(0.92, shade(color, -0.2));
    body.addColorStop(1, shade(color, 0.3));
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // window reflection
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.save();
    ctx.translate(-radius * 0.42, -ry * 0.48);
    ctx.rotate(-0.5);
    ctx.beginPath();
    ctx.roundRect(-radius * 0.1, -radius * 0.17, radius * 0.2, radius * 0.34, radius * 0.08);
    ctx.fill();
    ctx.restore();
    // bounce light
    const bounce = ctx.createRadialGradient(radius * 0.42, ry * 0.5, 0, radius * 0.42, ry * 0.5, radius * 0.45);
    bounce.addColorStop(0, 'rgba(255,255,255,0.25)');
    bounce.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bounce;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // tied knot
    ctx.fillStyle = shade(color, -0.3);
    ctx.beginPath();
    ctx.moveTo(-4, ry + 7);
    ctx.quadraticCurveTo(0, ry + 3, 4, ry + 7);
    ctx.lineTo(1.5, ry - 1);
    ctx.lineTo(-1.5, ry - 1);
    ctx.closePath();
    ctx.fill();
  });
}

// ── Flowers & leaves ─────────────────────────────────────────────────────────

const MARIGOLD_TONES = {
  saffron: { edge: '#C9530F', mid: '#E2741A', inner: '#EF9427', core: '#F6B843' },
  gold: { edge: '#CF8611', mid: '#E6A21E', inner: '#F1BE38', core: '#F8D869' },
};

// Marigold (सयपत्री): four layers of ruffled petals, lit from the top-left.
export function marigold(radius, tone = 'saffron') {
  const t = MARIGOLD_TONES[tone];
  return sprite(`marigold2-${radius}-${tone}`, radius * 2 + 4, radius * 2 + 4, (ctx) => {
    const layers = [
      [0.7, 18, 0.34, t.edge],
      [0.53, 15, 0.33, t.mid],
      [0.35, 12, 0.3, t.inner],
      [0.16, 8, 0.24, t.core],
    ];
    layers.forEach(([distance, count, size, color], li) => {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + li * 0.37 + (i % 2) * 0.09;
        const x = Math.cos(a) * distance * radius;
        const y = Math.sin(a) * distance * radius;
        const r = size * radius * (0.88 + 0.24 * (((i * 7) % 5) / 5));
        const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
        g.addColorStop(0, shade(color, 0.28));
        g.addColorStop(0.6, color);
        g.addColorStop(1, shade(color, -0.22));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // frilled outer edge
        ctx.strokeStyle = shade(color, -0.4);
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.9, a - 1.1, a + 1.1);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
    // whole-flower light and shade
    ctx.globalCompositeOperation = 'source-atop';
    const light = ctx.createRadialGradient(-radius * 0.4, -radius * 0.45, 0, 0, 0, radius * 1.15);
    light.addColorStop(0, 'rgba(255,240,200,0.28)');
    light.addColorStop(0.5, 'rgba(0,0,0,0)');
    light.addColorStop(1, 'rgba(70,20,0,0.35)');
    ctx.fillStyle = light;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    ctx.globalCompositeOperation = 'source-over';
  });
}

// Rose petal with a soft fold down the middle.
export function petal(color, size) {
  return sprite(`petal2-${color}-${size}`, size + 2, size + 2, (ctx) => {
    const s = size / 2;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.95, -s * 0.65, s * 0.85, s * 0.7, 0, s);
    ctx.bezierCurveTo(-s * 0.85, s * 0.7, -s * 0.95, -s * 0.65, 0, -s);
    const g = ctx.createRadialGradient(-s * 0.2, -s * 0.1, 0, 0, 0, s * 1.05);
    g.addColorStop(0, shade(color, 0.3));
    g.addColorStop(0.65, color);
    g.addColorStop(1, shade(color, -0.35));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = shade(color, 0.4);
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.quadraticCurveTo(s * 0.12, 0, 0, s * 0.85);
    ctx.stroke();
  });
}

// Mango leaf (आँपको पात), pointing up, with a midrib and side veins.
export function leaf(length, color = '#4F6B2E') {
  return sprite(`leaf2-${length}-${color}`, length * 0.45, length + 2, (ctx) => {
    const h = length / 2;
    const w = length * 0.2;
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.quadraticCurveTo(w * 1.3, -h * 0.1, 0, h);
    ctx.quadraticCurveTo(-w * 1.3, -h * 0.1, 0, -h);
    const g = ctx.createLinearGradient(-w, 0, w, 0);
    g.addColorStop(0, shade(color, -0.25));
    g.addColorStop(0.5, color);
    g.addColorStop(1, shade(color, 0.25));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = shade(color, 0.4);
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.85);
    ctx.lineTo(0, h);
    for (let i = 1; i < 6; i++) {
      const y = -h * 0.7 + (i / 6) * h * 1.5;
      ctx.moveTo(0, y);
      ctx.lineTo(w * 0.7, y - h * 0.12);
      ctx.moveTo(0, y);
      ctx.lineTo(-w * 0.7, y - h * 0.12);
    }
    ctx.stroke();
  });
}

// ── Hanging ornaments ────────────────────────────────────────────────────────

// Brass bell (घण्टी).
export function bell(size) {
  return sprite(`bell2-${size}`, size + 2, size * 1.3, (ctx) => {
    const w = size / 2;
    ctx.beginPath();
    ctx.moveTo(-w * 0.2, -w * 0.95);
    ctx.quadraticCurveTo(-w * 0.75, -w * 0.7, -w * 0.75, w * 0.1);
    ctx.quadraticCurveTo(-w * 0.8, w * 0.55, -w, w * 0.7);
    ctx.lineTo(w, w * 0.7);
    ctx.quadraticCurveTo(w * 0.8, w * 0.55, w * 0.75, w * 0.1);
    ctx.quadraticCurveTo(w * 0.75, -w * 0.7, w * 0.2, -w * 0.95);
    ctx.closePath();
    ctx.fillStyle = foil(ctx, -w, 0, w, 0, 'gold');
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,60,20,0.5)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-w * 0.85, w * 0.45);
    ctx.quadraticCurveTo(0, w * 0.6, w * 0.85, w * 0.45);
    ctx.stroke();
    ctx.fillStyle = '#5E3D10';
    ctx.beginPath();
    ctx.arc(0, w * 0.82, w * 0.18, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Silk or paper tassel: a hanging loop, a wrapped band and a fringe.
// Pass 'gold' for a foil tassel, otherwise a #colour.
export function tassel(color, length) {
  return sprite(`tassel-${color}-${length}`, length * 0.55, length + 4, (ctx) => {
    const top = -length / 2;
    const band = top + length * 0.22;
    const isFoil = color === 'gold';
    const base = isFoil ? '#C9A24E' : color;

    // loop
    ctx.strokeStyle = shade(base, -0.3);
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(0, top + 3, 2.2, 3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // fringe: many fine threads fanning out a little
    const threads = 26;
    for (let i = 0; i < threads; i++) {
      const t = i / (threads - 1) - 0.5;
      const len = length * (0.7 + 0.06 * Math.sin(i * 2.3));
      ctx.strokeStyle = shade(base, Math.sin(i * 1.7) * 0.25);
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(t * length * 0.12, band);
      ctx.quadraticCurveTo(t * length * 0.2, band + len * 0.5, t * length * 0.3, band + len);
      ctx.stroke();
    }
    // wrapped band
    ctx.fillStyle = isFoil ? foil(ctx, -4, 0, 4, 0, 'gold') : shade(base, -0.15);
    ctx.beginPath();
    ctx.roundRect(-length * 0.08, band - 3, length * 0.16, 6, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, band - 4, length * 0.06, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Bevelled gold star — each point split into a lit half and a shaded half.
export function goldStar(size) {
  return sprite(`star2-${size}`, size + 2, size + 2, (ctx) => {
    const outer = size / 2;
    const inner = size / 4.4;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const tip = [Math.cos(a) * outer, Math.sin(a) * outer];
      const lit = Math.cos(a + 2.3) > 0;
      for (const [side, light] of [[a - Math.PI / 5, lit], [a + Math.PI / 5, !lit]]) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tip[0], tip[1]);
        ctx.lineTo(Math.cos(side) * inner, Math.sin(side) * inner);
        ctx.closePath();
        ctx.fillStyle = light ? '#F3DD98' : '#A27A30';
        ctx.fill();
      }
    }
    starPath(ctx, outer, inner);
    ctx.strokeStyle = 'rgba(255,245,210,0.55)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });
}

// Faceted crystal drop.
export function crystal(size) {
  return sprite(`crystal-${size}`, size * 0.7, size + 2, (ctx) => {
    const h = size / 2;
    const w = size * 0.3;
    const outline = [[0, -h], [w, -h * 0.25], [w * 0.7, h * 0.35], [0, h], [-w * 0.7, h * 0.35], [-w, -h * 0.25]];
    ctx.beginPath();
    outline.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y));
    ctx.closePath();
    const g = ctx.createLinearGradient(-w, -h, w, h);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.4, 'rgba(206,228,236,0.75)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(160,190,205,0.8)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // facets
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.lineTo(0, h);
    ctx.moveTo(-w, -h * 0.25);
    ctx.lineTo(w * 0.7, h * 0.35);
    ctx.moveTo(w, -h * 0.25);
    ctx.lineTo(-w * 0.7, h * 0.35);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.stroke();
  });
}

// A pearl, with a soft pink-blue lustre.
export function pearl(radius) {
  return sprite(`pearl-${radius}`, radius * 2 + 2, radius * 2 + 2, (ctx) => {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(-radius * 0.35, -radius * 0.4, 0, 0, 0, radius);
    g.addColorStop(0, '#FFFFFF');
    g.addColorStop(0.35, '#F6F0E8');
    g.addColorStop(0.75, '#D9CFC4');
    g.addColorStop(1, '#A99D92');
    ctx.fillStyle = g;
    ctx.fill();
    const lustre = ctx.createLinearGradient(-radius, radius, radius, -radius);
    lustre.addColorStop(0, 'rgba(255,190,210,0.25)');
    lustre.addColorStop(1, 'rgba(170,210,255,0.2)');
    ctx.fillStyle = lustre;
    ctx.fill();
  });
}

// Gold bead, used between flowers.
export function goldBead(radius) {
  return sprite(`bead-${radius}`, radius * 2 + 2, radius * 2 + 2, (ctx) => {
    const g = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, 0, 0, 0, radius);
    g.addColorStop(0, '#FFF3C4');
    g.addColorStop(0.5, '#D3A94E');
    g.addColorStop(1, '#7A5620');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Vintage Edison bulb: clear glass, glowing filament, brass cap.
export function edisonBulb(size) {
  return sprite(`edison-${size}`, size * 0.8, size * 1.5, (ctx) => {
    const w = size * 0.26;
    const top = -size * 0.55;
    // brass cap
    ctx.fillStyle = foil(ctx, -w * 0.5, 0, w * 0.5, 0, 'gold');
    ctx.fillRect(-w * 0.45, top, w * 0.9, size * 0.2);
    // glass
    ctx.beginPath();
    ctx.moveTo(-w * 0.45, top + size * 0.2);
    ctx.bezierCurveTo(-w * 1.25, top + size * 0.45, -w * 1.1, top + size, 0, top + size);
    ctx.bezierCurveTo(w * 1.1, top + size, w * 1.25, top + size * 0.45, w * 0.45, top + size * 0.2);
    ctx.closePath();
    const glass = ctx.createRadialGradient(0, top + size * 0.65, 0, 0, top + size * 0.65, w * 1.3);
    glass.addColorStop(0, 'rgba(255,236,180,0.95)');
    glass.addColorStop(0.5, 'rgba(255,205,120,0.55)');
    glass.addColorStop(1, 'rgba(255,190,110,0.25)');
    ctx.fillStyle = glass;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,210,0.5)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // filament
    ctx.strokeStyle = '#FFF6D6';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-w * 0.25, top + size * 0.3);
    for (let i = 0; i <= 6; i++) {
      ctx.lineTo((i % 2 ? 1 : -1) * w * 0.35, top + size * (0.48 + i * 0.05));
    }
    ctx.stroke();
  });
}

// A soft warm halo (stamped with 'lighter' so it adds light).
export function glow(radius, rgb = '255, 190, 100') {
  return sprite(`glow-${radius}-${rgb}`, radius * 2, radius * 2, (ctx) => {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    g.addColorStop(0, `rgba(${rgb}, 0.6)`);
    g.addColorStop(0.35, `rgba(${rgb}, 0.2)`);
    g.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
  });
}

// An out-of-focus light (bokeh): a soft disc with a brighter rim.
export function bokeh(radius, rgb = '235, 200, 140') {
  const s = sprite(`bokeh-${radius}-${rgb}`, radius * 2 + 2, radius * 2 + 2, (ctx) => {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    g.addColorStop(0, `rgba(${rgb}, 0.22)`);
    g.addColorStop(0.82, `rgba(${rgb}, 0.3)`);
    g.addColorStop(0.95, `rgba(${rgb}, 0.45)`);
    g.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  return blurred(s, Math.max(1, Math.round(radius * 0.12)));
}

// Tiny four-point sparkle (glitter).
export function sparkle(size, color = '#E2BE6A') {
  return sprite(`sparkle-${size}-${color}`, size + 2, size + 2, (ctx) => {
    starPath(ctx, size / 2, size / 9, 4);
    ctx.fillStyle = color;
    ctx.fill();
  });
}

// An irregular flake of gold leaf. `variant` picks one of a few shapes.
export function goldFlake(size, variant = 0, tone = 'gold') {
  return sprite(`flake-${size}-${variant}-${tone}`, size + 2, size + 2, (ctx) => {
    const r = seeded(variant * 97 + 13);
    const points = 6;
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2;
      const d = (size / 2) * (0.55 + r() * 0.45);
      ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * d, Math.sin(a) * d * 0.8);
    }
    ctx.closePath();
    ctx.fillStyle = foil(ctx, -size / 2, -size / 2, size / 2, size / 2, tone);
    ctx.fill();
  });
}

// Satin ribbon bow (where balloon strings are tied).
export function bow(color, size) {
  return sprite(`bow2-${color}-${size}`, size * 1.4, size, (ctx) => {
    const w = size * 0.6;
    const loop = (dir) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(dir * w * 0.4, -w * 0.75, dir * w * 1.15, -w * 0.55, dir * w, 0);
      ctx.bezierCurveTo(dir * w * 1.1, w * 0.5, dir * w * 0.4, w * 0.4, 0, 0);
      const g = ctx.createLinearGradient(0, -w, dir * w, w);
      g.addColorStop(0, shade(color, 0.45));
      g.addColorStop(0.5, color);
      g.addColorStop(1, shade(color, -0.35));
      ctx.fillStyle = g;
      ctx.fill();
    };
    ctx.fillStyle = shade(color, -0.2);
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(-w * 0.55, w * 0.85);
    ctx.lineTo(-w * 0.3, w * 0.75);
    ctx.lineTo(-w * 0.2, w * 0.95);
    ctx.lineTo(2, 0);
    ctx.moveTo(2, 0);
    ctx.lineTo(w * 0.45, w * 0.9);
    ctx.lineTo(w * 0.25, w * 0.8);
    ctx.lineTo(w * 0.12, w * 0.98);
    ctx.lineTo(-2, 0);
    ctx.fill();
    loop(-1);
    loop(1);
    ctx.fillStyle = shade(color, -0.25);
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.18, w * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Small wrapped gift box (balloon weight).
export function giftWeight(color, size) {
  return sprite(`gift2-${color}-${size}`, size + 6, size + 10, (ctx) => {
    const s = size / 2;
    const g = ctx.createLinearGradient(-s, -s, s, s);
    g.addColorStop(0, shade(color, 0.25));
    g.addColorStop(1, shade(color, -0.3));
    ctx.fillStyle = g;
    ctx.fillRect(-s, -s * 0.55, size, size * 0.85);
    ctx.fillStyle = shade(color, 0.12);
    ctx.fillRect(-s - 2, -s * 0.78, size + 4, size * 0.26);
    ctx.fillStyle = foil(ctx, -3, 0, 3, 0, 'gold');
    ctx.fillRect(-2.5, -s * 0.78, 5, size * 1.1);
    ctx.beginPath();
    ctx.ellipse(-5, -s * 0.85, 5, 3, -0.5, 0, Math.PI * 2);
    ctx.ellipse(5, -s * 0.85, 5, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();
  });
}
