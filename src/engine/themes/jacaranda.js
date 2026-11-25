// Jacarandas (the violet trees that flower in Kathmandu in spring), for the
// Birthday theme. Everything's drawn in code and kept as sprites.
//
//   blossom(size, tone)             – one fallen flower, a little trumpet
//   canopy(ctx, w, reach)           – flowering boughs across the top of the page,
//                                     heavy in the corners, thin in the middle
//   softCanopy(ctx, w, reach)       – the same, farther off and out of focus
//   jacaranda(ctx, x, baseY, height, opts)
//                                   – a whole tree; `far` 0 (near) … 1 (lost in haze)

import { sprite, stamp, blurred, seeded } from './draw';

// [deep shade, shade, body, lit, brightest]: darkest first
const VIOLETS = {
  near: ['#57408F', '#7052AE', '#8D6CC8', '#B093DE', '#DCC6F2'],
  shade: ['#4B387F', '#5E4699', '#7259B0', '#8A70C6', '#A58CD8'],
  lit: ['#7A5CB4', '#9678CC', '#B396E0', '#D2B8EE', '#F3DFF4'],
  far: ['#A294CC', '#B2A4D8', '#C2B4E4', '#D3C6EC', '#E8DCF2'],
};

// ── Flowers ──────────────────────────────────────────────────────────────────

// One flower, seen from the side: a narrow tube opening into a ruffled mouth.
// It points up from (0, 0); `s` = its length.
function trumpet(ctx, s, body, lit, deep) {
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-s * 0.08, 0);
  ctx.bezierCurveTo(-s * 0.2, -s * 0.35, -s * 0.22, -s * 0.5, -s * 0.36, -s * 0.8);
  ctx.lineTo(s * 0.36, -s * 0.8);
  ctx.bezierCurveTo(s * 0.22, -s * 0.5, s * 0.2, -s * 0.35, s * 0.08, 0);
  ctx.fill();
  ctx.fillStyle = lit;
  for (const [dx, dy, r] of [[-0.3, -0.82, 0.19], [0, -0.9, 0.22], [0.3, -0.82, 0.19], [-0.16, -0.74, 0.17], [0.16, -0.74, 0.17]]) {
    ctx.beginPath();
    ctx.arc(dx * s, dy * s, r * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = deep;
  ctx.globalAlpha *= 0.55;
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.8, s * 0.17, s * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha /= 0.55;
}

// A single flower, as it falls. tone: 'near' | 'far'
export function blossom(size, tone = 'near') {
  const [, , body, lit, bright] = VIOLETS[tone];
  return sprite(`jacaranda-${tone}-${size}`, size * 1.4, size * 1.4, (ctx) => {
    ctx.translate(0, size * 0.5);
    trumpet(ctx, size, body, tone === 'far' ? bright : lit, VIOLETS[tone][1]);
  });
}

// A spray of them: a loose pointed bunch standing along a thin stalk, as
// jacarandas flower, with gaps between the flowers. Deep violet in the shade
// at the bottom, lit at the top. `variant` picks one of a few arrangements.
function cluster(size, variant, tone) {
  const V = VIOLETS[tone];
  return sprite(`cluster4-${tone}-${size}-${variant}`, size * 1.3, size * 1.7, (ctx) => {
    const r = seeded(variant * 17 + 3);
    const flowers = [];
    for (let i = 0; i < 26; i++) {
      const t = r() ** 0.8; // 0 at the foot … 1 at the tip
      const half = size * 0.44 * Math.sin(Math.PI * (0.3 + t * 0.62));
      const side = (r() - 0.5) * 2;
      const light = 0.2 + t * 0.55 - side * 0.16 + (r() - 0.5) * 0.4;
      flowers.push({ x: side * half, y: size * (0.55 - t * 1.15), light, a: side * 1.25 + (r() - 0.5) * 0.9, s: size * (0.2 + r() * 0.09) * (1.1 - t * 0.35) });
    }
    flowers.sort((m, n) => m.light - n.light);
    for (const f of flowers) {
      const k = Math.max(0, Math.min(3, Math.floor(f.light * 4)));
      ctx.save();
      ctx.translate(f.x * 0.6, f.y);
      ctx.rotate(f.a);
      trumpet(ctx, f.s, V[k], V[k + 1], V[Math.max(0, k - 1)]);
      ctx.restore();
    }
  });
}

// A jacaranda's leaf: a feather of feathers, `length` long, hanging down.
function frond(length, variant, colors = ['#5E7F4E', '#7E9C5E']) {
  return sprite(`frond-${length}-${variant}-${colors[0]}`, length, length * 1.15, (ctx) => {
    const r = seeded(variant + 11);
    ctx.translate(0, -length * 0.5);
    ctx.lineCap = 'round';
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * 0.06, length * 0.5, 0, length);
    ctx.stroke();
    for (let t = 0.12; t < 1; t += 0.075) {
      for (const side of [-1, 1]) {
        const reach = length * 0.34 * Math.sin(Math.PI * (0.12 + t * 0.82)) * (0.85 + r() * 0.3);
        const [x0, y0] = [length * 0.06 * 4 * t * (1 - t) * 0.5, t * length];
        for (let k = 0.15; k <= 1; k += 0.11) {
          ctx.strokeStyle = r() < 0.5 ? colors[0] : colors[1];
          ctx.lineWidth = 1.3;
          const x = x0 + side * reach * k;
          const y = y0 + reach * 0.42 * k;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + side * 1.2, y + 3.4 * (1 - k * 0.5));
          ctx.stroke();
        }
      }
    }
  });
}

const sized = (n, step = 6) => Math.max(step, Math.round(n / step) * step); // few sizes, so few sprites

// ── Boughs hanging in from the top ───────────────────────────────────────────

// A limb and its smaller limbs, as lists of strokes and of places for flowers
// (which way each place points, and how far it is down the page).
function grow(out, r, x, y, angle, length, width, depth, sag) {
  const steps = 8;
  const points = [[x, y]];
  let a = angle;
  for (let i = 1; i <= steps; i++) {
    a += (Math.PI / 2 - a) * sag * (i / steps) + (r() - 0.5) * 0.24; // bending down at its end
    x += (Math.cos(a) * length) / steps;
    y += (Math.sin(a) * length) / steps;
    points.push([x, y]);
    if (depth > 0 && i >= 2 && i < steps && i % 2 === 0) {
      const side = (i / 2) % 2 ? 1 : -1;
      grow(out, r, x, y, a + side * (0.45 + r() * 0.5), length * (0.4 + r() * 0.24), width * 0.5, depth - 1, sag);
    }
    if (depth === 0 && i >= 5 && r() < 0.35) out.flowers.push([x, y]);
  }
  out.wood.push({ points, width });
  for (let k = 0; k < 2 - depth * 0.5; k++) out.flowers.push([x + (r() - 0.5) * 18, y + (r() - 0.6) * 16]);
}

export function canopy(ctx, w, reach) {
  const r = seeded(46);
  const out = { wood: [], flowers: [] };
  const wide = Math.min(1, w / 900); // a wider page has room for lower boughs
  for (const [x, y, angle, k] of [[-26, 34, 0.32, 1], [-20, -24, 0.42, 1.05], [-20, 120, 0.55, 0.42 + wide * 0.3]]) grow(out, r, x, y, angle, reach * k, 8 * k, 2, 0.3);
  for (const [x, y, angle, k] of [[w + 24, 10, Math.PI - 0.36, 0.92], [w + 16, -24, Math.PI - 0.5, 0.8], [w + 22, 92, Math.PI - 0.6, 0.36 + wide * 0.3]]) grow(out, r, x, y, angle, reach * k, 8 * k, 2, 0.3);

  // leaves: new and few, as they come while it flowers
  for (const [x, y] of out.flowers) if (r() < 0.22) stamp(ctx, frond(sized(46 + r() * 34, 14), Math.floor(r() * 3)), x, y + 18, { angle: (r() - 0.5) * 1.1, alpha: 0.9 });
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const { points, width } of out.wood) {
    ctx.strokeStyle = '#54424F';
    ctx.lineWidth = Math.max(1.1, width);
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.strokeStyle = 'rgba(214, 186, 176, 0.4)'; // lit along the top
    ctx.lineWidth = Math.max(0.4, width * 0.28);
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y - width * 0.25) : ctx.moveTo(x, y - width * 0.25)));
    ctx.stroke();
  }
  out.flowers.sort((m, n) => m[1] - n[1]);
  for (const [x, y] of out.flowers) {
    const tone = r() < 0.3 ? 'shade' : r() < 0.65 ? 'near' : 'lit';
    stamp(ctx, cluster(sized(24 + r() * 18), Math.floor(r() * 6), tone), x, y, { angle: (r() - 0.5) * 1.7 });
  }
}

export function softCanopy(ctx, w, reach) {
  const r = seeded(57);
  for (let i = 0; i < 46 * Math.max(1, w / 700); i++) {
    const x = r() * w;
    const edge = Math.min(1, Math.abs(x / w - 0.5) * 2) ** 1.6;
    const y = -20 + r() ** 1.3 * (8 + edge * reach * 0.7);
    stamp(ctx, blurred(cluster(60, Math.floor(r() * 4), 'far'), 5), x, y, { scale: 0.7 + r() * 0.5, angle: r() * 6, alpha: 0.42 });
  }
}

// ── A whole tree ─────────────────────────────────────────────────────────────

// `sun` = which side the light comes from (-1 left, 1 right).
export function jacaranda(ctx, x, baseY, height, { far = 0, seed = 1, sun = 1 } = {}) {
  const r = seeded(seed);
  const hazy = far > 0.35;
  const [cw, ch] = [height * 0.5, height * 0.34]; // the crown's half-width and half-height
  const cy = baseY - height * 0.64;
  ctx.save();
  ctx.globalAlpha = 1 - far * 0.45;

  // trunk and limbs, reaching into the crown
  const wood = hazy ? '#A393AC' : '#5A4752';
  ctx.strokeStyle = wood;
  ctx.fillStyle = wood;
  ctx.lineCap = 'round';
  const fork = baseY - height * 0.28;
  const t = height * 0.028;
  ctx.beginPath();
  ctx.moveTo(x - t * 1.9, baseY);
  ctx.quadraticCurveTo(x - t * 0.8, baseY - height * 0.08, x - t * 0.7, fork);
  ctx.lineTo(x + t * 0.7, fork);
  ctx.quadraticCurveTo(x + t * 0.8, baseY - height * 0.08, x + t * 2.1, baseY);
  ctx.fill();
  for (const [dx, dy, k] of [[-0.6, 0.05, 0.9], [-0.3, -0.35, 1], [0.02, -0.5, 0.8], [0.32, -0.3, 1], [0.62, 0.08, 0.85]]) {
    ctx.lineWidth = t * k;
    ctx.beginPath();
    ctx.moveTo(x, fork + 4);
    ctx.quadraticCurveTo(x + dx * cw * 0.35, cy + ch * 0.6, x + dx * cw, cy + dy * ch);
    ctx.stroke();
  }
  if (!hazy) {
    ctx.strokeStyle = 'rgba(255, 214, 170, 0.35)'; // sunlight down the trunk
    ctx.lineWidth = t * 0.3;
    ctx.beginPath();
    ctx.moveTo(x + sun * t * 1.2, baseY - 8);
    ctx.quadraticCurveTo(x + sun * t * 0.5, baseY - height * 0.1, x + sun * t * 0.4, fork);
    ctx.stroke();
  }

  // the crown: rounded heads of flowers, back ones first, each dark
  // underneath and lit on top and towards the sun
  const heads = [[-0.55, 0.3, 0.42], [0.55, 0.3, 0.42], [0, 0.22, 0.4], [-0.82, 0.48, 0.26], [0.84, 0.46, 0.26], [0.04, -0.48, 0.46], [-0.4, -0.16, 0.48], [0.42, -0.18, 0.48], [0, 0, 0.4], [-0.68, 0.16, 0.34], [0.7, 0.14, 0.34]];
  const size = sized(Math.max(12, height * 0.062));
  for (const [dx, dy, s] of heads) {
    const [hx, hy] = [x + dx * cw + (r() - 0.5) * cw * 0.08, cy + dy * ch + (r() - 0.5) * ch * 0.1];
    const [hw, hh] = [cw * s * 0.8, ch * s * 0.92];
    const flowers = [];
    for (let i = 0; i < 92; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r());
      flowers.push([Math.cos(a) * d, Math.sin(a) * d]);
    }
    // from its shaded foot up to its lit top
    flowers.sort((m, n) => n[1] - sun * n[0] * 0.5 - (m[1] - sun * m[0] * 0.5));
    for (const [fx, fy] of flowers) {
      const light = -fy * 0.6 + fx * sun * 0.4 + (r() - 0.5) * 0.5 - dy * 0.2;
      const tone = hazy ? 'far' : light < -0.1 ? 'shade' : light < 0.42 ? 'near' : 'lit';
      stamp(ctx, cluster(size, Math.floor(r() * 6), tone), hx + fx * hw, hy + fy * hh, { angle: (r() - 0.5) * 1.2, scale: 0.75 + r() * 0.5 });
    }
  }
  ctx.restore();
}
