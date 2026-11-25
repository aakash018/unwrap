// The garden at golden hour (the Christian wedding invite), drawn in code,
// after a photo the founder chose: top to bottom, as the camera tilts down:
//   rolling wooded hills under a warm sunset → one big old tree standing
//   behind the altar (stage.js) → a lawn with a low fence far off, tall
//   grass by the altar (grass.js), and a stone path between rows of white
//   benches, flowers and pampas grass at
//   the aisle's edges → the path widening towards us until its pale stone
//   fills the screen (the chapter's words are written on it, path.js).
//
//   treeLine(ctx, w, baseY, bottom, color, seed, { rim, lights })
//                                     – a row of trees (also used by the finale)
//   hills(ctx, w, baseY, bottom, { color, height, seed, woods, sun, mist })
//                                     – big rolling wooded hills
//   bigTree(ctx, x, baseY, height, opts) – the big old tree behind the altar
//                                       (also at night in the ending, night.js)
//   grounds(ctx, w, lawnTop, pathTop, full, end)
//                                     – the lawn, fence, wild flowers and the path
//   benches(ctx, w, pathTop, full)    – the white benches (their own layer, in
//                                       front of the tall grass of grass.js)
//   firstBenchY, gardenSize, pathHalfAt – where the benches start, how big
//                                       things are at a height, the path's half-width
//   gardenBorder(ctx, w)              – where the path ends: a band of its stone,
//                                       then a border of flowers (chapter 2's top)
//   STONE                             – the path's pale stone colour

import { leaf, stamp, seeded } from '../../themes/draw';
import { rose } from '../events/flowers';
import { bloom, hydrangea, pampas } from './stage';

export const STONE = '#E4D6C0';

// ── Trees and hills ──────────────────────────────────────────────────────────

export function treeLine(ctx, w, baseY, bottom, color, seed = 1, { rim = null, lights = 0 } = {}) {
  const r = seeded(seed);
  ctx.fillStyle = color;
  ctx.fillRect(-20, baseY, w + 40, bottom - baseY);
  const tops = [];
  // each tree: a few overlapping round masses; now and then a tall cypress
  for (let x = -40; x < w + 40; x += 26 + r() * 34) {
    const tall = r() < 0.16 && Math.abs(x - w / 2) > 90; // (none in the middle, where the sun sets)
    const rw = tall ? 16 + r() * 10 : 34 + r() * 40;
    const rh = tall ? 90 + r() * 60 : 46 + r() * 56;
    const parts = tall ? [[0, 0, 1]] : [[0, 0, 1], [-rw * 0.45, rh * 0.25, 0.7], [rw * 0.5, rh * 0.2, 0.75]];
    for (const [dx, dy, k] of parts) {
      const y = baseY - rh * 0.55 * k + dy;
      ctx.beginPath();
      ctx.ellipse(x + dx, y, rw * k, rh * k, 0, 0, Math.PI * 2);
      ctx.fill();
      tops.push([x + dx, y - rh * k, rw * k]);
    }
  }
  // the low sun catching the tree tops
  if (rim) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    for (const [x, y, rw] of tops) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, rw * 0.9);
      g.addColorStop(0, rim);
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - rw, y - rw, rw * 2, rw * 2);
    }
    ctx.restore();
  }
  // a few warm lights strung in the trees
  for (let i = 0; i < lights; i++) {
    const [x, y, rw] = tops[Math.floor(r() * tops.length)];
    const lx = x + (r() - 0.5) * rw;
    const ly = y + rw * (0.5 + r() * 0.8);
    const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 7);
    g.addColorStop(0, 'rgba(255, 236, 190, 0.95)');
    g.addColorStop(0.3, 'rgba(255, 200, 130, 0.5)');
    g.addColorStop(1, 'rgba(255, 190, 120, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(lx - 7, ly - 7, 14, 14);
  }
}

// Big rolling hills, covered in woods, like the valley in the photo: a soft
// wavy ridge, its face textured with hundreds of little tree-tops in
// `woods` colours (autumn greens and golds), warmed on the side facing the
// sun (x = `sun`) and fading into a haze at its foot, where the valley is.
export function hills(ctx, w, baseY, bottom, { color, height = 120, seed = 1, woods = [], sun = null, mist = '250, 220, 185' }) {
  const r = seeded(seed);
  const waves = [r() * 6, r() * 6, r() * 6];
  const ridge = (x) => baseY - height * (0.55 + 0.25 * Math.sin(x / 210 + waves[0]) + 0.15 * Math.sin(x / 77 + waves[1]) + 0.05 * Math.sin(x / 23 + waves[2]));
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-20, bottom);
  for (let x = -20; x <= w + 20; x += 6) ctx.lineTo(x, ridge(x));
  ctx.lineTo(w + 20, bottom);
  ctx.closePath();
  ctx.fill();
  for (let x = -20; x <= w + 20; x += 9 + r() * 8) {
    ctx.beginPath(); // the wood: tree-tops along the ridge
    ctx.arc(x, ridge(x) + 4, 6 + r() * 7, Math.PI, 0);
    ctx.fill();
  }
  ctx.clip();
  // the woods on its face: little round tree-tops, bigger lower down (nearer)
  if (woods.length) {
    const n = Math.round(((w + 40) * height) / 90);
    for (let i = 0; i < n; i++) {
      const x = -20 + r() * (w + 40);
      const top = ridge(x);
      const t = r();
      const y = top + 6 + t * (baseY + 20 - top);
      const size = 3 + t * 6 + r() * 3;
      ctx.fillStyle = woods[Math.floor(r() * woods.length)];
      ctx.globalAlpha = 0.55 + r() * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  // the low sun warming the side of the hills that faces it
  if (sun !== null) {
    const g = ctx.createRadialGradient(sun, baseY - height, 0, sun, baseY - height, w * 0.6);
    g.addColorStop(0, 'rgba(255, 196, 120, 0.4)');
    g.addColorStop(1, 'rgba(255, 196, 120, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(-20, baseY - height - 20, w + 40, bottom - baseY + height + 20);
  }
  // haze in the valley, at its foot
  const haze = ctx.createLinearGradient(0, baseY - height * 0.5, 0, baseY + 10);
  haze.addColorStop(0, `rgba(${mist}, 0)`);
  haze.addColorStop(1, `rgba(${mist}, 0.4)`);
  ctx.fillStyle = haze;
  ctx.fillRect(-20, baseY - height * 0.5, w + 40, bottom - baseY + height * 0.5);
  ctx.restore();
}

// One branch of the big tree, splitting as it goes up and out.
function limb(ctx, x, y, angle, length, width, depth, r, look) {
  const x1 = x + Math.cos(angle) * length;
  const y1 = y + Math.sin(angle) * length;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + Math.cos(angle + 0.3) * length * 0.5, y + Math.sin(angle + 0.3) * length * 0.5, x1, y1);
  ctx.stroke();
  // (where lights could hang: along the outer branches)
  if (look.lights && depth <= 3) look.lights.push([(x + x1) / 2, (y + y1) / 2], [x1, y1]);
  if (depth === 0) {
    // a few leaves at the tips, catching the light
    ctx.save();
    ctx.fillStyle = r() < 0.5 ? look.leaves[0] : look.leaves[1];
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(x1 + (r() - 0.5) * 18, y1 + (r() - 0.5) * 14, 2 + r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }
  const n = 2 + (r() < 0.4 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const turn = (i - (n - 1) / 2) * (0.45 + r() * 0.3) + (r() - 0.5) * 0.2;
    limb(ctx, x1, y1, angle + turn, length * (0.68 + r() * 0.12), width * 0.62, depth - 1, r, look);
  }
}

// The big old tree behind the altar: a broad trunk and wide spreading
// limbs, mostly bare, softened by the haze. `baseY` = its foot.
// Options (the night-time ending uses them): `wood` = the colour of trunk
// and limbs (r, g, b), `solid` = how opaque it is (0.62: hazy far off), `leaves` = two colours for the leaves at the tips,
// `lights` = an array to fill with points along the outer branches (where
// fairy lights can be hung).
export function bigTree(ctx, x, baseY, height, { wood = '96, 80, 72', solid = 0.62, leaves = ['rgba(170, 160, 90, 0.5)', 'rgba(120, 120, 70, 0.45)'], lights = null } = {}) {
  const r = seeded(29);
  const look = { leaves, lights };
  ctx.save();
  ctx.strokeStyle = `rgba(${wood}, ${solid})`; // (see-through: hazy with distance)
  ctx.lineCap = 'round';
  ctx.fillStyle = `rgba(${wood}, ${Math.min(1, solid + 0.04)})`;
  // the trunk, flaring at the foot
  const top = baseY - height * 0.36;
  ctx.beginPath();
  ctx.moveTo(x - 34, baseY);
  ctx.quadraticCurveTo(x - 16, baseY - 40, x - 14, top);
  ctx.lineTo(x + 14, top);
  ctx.quadraticCurveTo(x + 16, baseY - 40, x + 36, baseY);
  ctx.closePath();
  ctx.fill();
  // the limbs
  for (const [angle, length, width] of [[-2.5, height * 0.3, 11], [-2.05, height * 0.3, 13], [-1.57, height * 0.26, 13], [-1.1, height * 0.3, 12], [-0.65, height * 0.3, 11]]) {
    limb(ctx, x, top + 6, angle, length, width, 5, r, look);
  }
  ctx.restore();
}

// ── The lawn, the path and the benches ───────────────────────────────────────

// How big things are at `y` (perspective): small far away, big near us.
const sizeAt = (y, top, full) => 0.5 + 1.5 * Math.min(1, Math.max(0, (y - top) / (full - top)));
// Half the path's width at `y`: from the altar's step, widening in straight
// lines towards us until it's wider than the screen at `full`.
const pathHalf = (w, y, top, full) => 78 + (w / 2 + 80 - 78) * Math.min(1, Math.max(0, (y - top) / (full - top))) ** 1.25;

// A tall white wooden bench seen from behind, at eye level, like the guests
// would see it walking up the aisle: a thin sliver of its seat's top, its
// thick seat edge, the end facing the path (its seat narrowing towards the
// vanishing point `vx`), and tall trestle legs — a pair at the path's end
// and more along it — with a rail between each pair, and its shadow.
// (x0, x1) = its length, `y` = where its near legs stand, `s` = its size.
function bench(ctx, x0, x1, y, s, vx) {
  const H = 62 * s; // seat height: tall, seen from close behind
  const D = 6 * s; // the sliver of the seat's top we see
  const T = 15 * s; // the seat's thick edge
  const yf = y - H; // the seat's near top edge
  const yb = yf - D; // its far top edge
  const back = (x) => x + (vx - x) * 0.07; // the far side, a little nearer the middle
  const leftOfPath = x1 <= vx;
  const pathEnd = leftOfPath ? x1 : x0;
  const along = leftOfPath ? -1 : 1; // from the path's end outwards

  // its shadow on the grass, falling towards us (the low sun is behind it)
  ctx.fillStyle = 'rgba(35, 45, 20, 0.26)';
  ctx.beginPath();
  ctx.moveTo(back(x0), y - 6 * s);
  ctx.lineTo(back(x1), y - 6 * s);
  ctx.lineTo(x1 - 8 * s, y + 10 * s);
  ctx.lineTo(x0 - 8 * s, y + 10 * s);
  ctx.closePath();
  ctx.fill();

  // where its legs stand: a pair near the path's end, then every so often
  const legs = [];
  for (let d = 12 * s; d < x1 - x0 - 6 * s; d += 190 * s) legs.push(pathEnd + along * d);

  // the far legs (in shade), standing a little higher on the grass
  ctx.lineCap = 'butt';
  for (const x of legs) {
    ctx.strokeStyle = '#BDB2A0';
    ctx.lineWidth = 7 * s;
    ctx.beginPath();
    ctx.moveTo(back(x), yb + T);
    ctx.lineTo(back(x) - along * 2 * s, y - 6 * s);
    ctx.stroke();
  }

  // the seat: the sliver of its top, lit warm, and its thick near edge
  ctx.fillStyle = '#FFF2D8';
  ctx.beginPath();
  ctx.moveTo(x0, yf);
  ctx.lineTo(x1, yf);
  ctx.lineTo(back(x1), yb);
  ctx.lineTo(back(x0), yb);
  ctx.closePath();
  ctx.fill();
  const edge = ctx.createLinearGradient(0, yf, 0, yf + T);
  edge.addColorStop(0, '#F4EEE4');
  edge.addColorStop(1, '#DED5C6');
  ctx.fillStyle = edge;
  ctx.fillRect(x0, yf, x1 - x0, T);
  // the end that faces the path: sunlit on the left side, shaded on the right
  ctx.fillStyle = leftOfPath ? '#F6DDB0' : '#CFC4B1';
  ctx.beginPath();
  ctx.moveTo(pathEnd, yf);
  ctx.lineTo(back(pathEnd), yb);
  ctx.lineTo(back(pathEnd), yb + T);
  ctx.lineTo(pathEnd, yf + T);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 230, 185, 0.9)'; // the sun along its top edge
  ctx.fillRect(x0, yf - 0.5, x1 - x0, Math.max(1, 1.4 * s));
  ctx.fillStyle = 'rgba(120, 105, 85, 0.25)'; // the shadow under the seat
  ctx.fillRect(x0, yf + T, x1 - x0, 2.5 * s);

  // the near legs, splayed a little, and a rail across to the far ones
  for (const x of legs) {
    ctx.strokeStyle = '#D3C9B8';
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.moveTo(x - along * 1 * s, yf + T + H * 0.45);
    ctx.lineTo(back(x), yb + T + H * 0.5);
    ctx.stroke();
    const leg = ctx.createLinearGradient(x - 3 * s, 0, x + 3 * s, 0);
    leg.addColorStop(0, leftOfPath ? '#E2D9CA' : '#F7F1E6');
    leg.addColorStop(1, leftOfPath ? '#FAF1DF' : '#DCD2C2');
    ctx.strokeStyle = leg;
    ctx.lineWidth = 9 * s;
    ctx.beginPath();
    ctx.moveTo(x, yf + T);
    ctx.lineTo(x + along * 2.5 * s, y);
    ctx.stroke();
  }
}

// The lawn's grass and wild flowers between `y0` and `y1`, kept off the
// path (`half(y)` = half its width): tufts of blades, little white, yellow
// and blush flowers, bigger towards us — so no patch of lawn looks bare.
function meadow(ctx, w, y0, y1, half, size, seed) {
  const r = seeded(seed);
  const n = Math.round(((y1 - y0) * w) / 120);
  const FLOWERS = ['#FFFBF0', '#FFF4D6', '#F6E27A', '#F2C9C0', '#E8D9F0'];
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const y = y0 + (y1 - y0) * r();
    const x = r() * w;
    if (Math.abs(x - w / 2) < half(y) + 4) continue;
    const s = size(y);
    if (r() < 0.62) {
      // a tuft of grass, its tips lit gold
      const blades = 4 + Math.floor(r() * 4);
      for (let b = 0; b < blades; b++) {
        const lean = (b - blades / 2) * 0.9 + (r() - 0.5);
        const tall = (5 + r() * 6) * s;
        ctx.strokeStyle = r() < 0.4 ? 'rgba(200, 190, 110, 0.8)' : r() < 0.5 ? 'rgba(90, 110, 55, 0.85)' : 'rgba(120, 135, 70, 0.85)';
        ctx.lineWidth = 0.7 * s;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + lean * s, y - tall * 0.6, x + lean * 2 * s, y - tall);
        ctx.stroke();
      }
    } else {
      // a little wild flower on a stem
      const fy = y - (3 + r() * 4) * s;
      ctx.strokeStyle = 'rgba(80, 100, 50, 0.8)';
      ctx.lineWidth = 0.6 * s;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, fy);
      ctx.stroke();
      ctx.fillStyle = FLOWERS[Math.floor(r() * FLOWERS.length)];
      ctx.beginPath();
      ctx.arc(x, fy, (1 + r() * 1.3) * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Flowers at the path's edge: greenery, white roses, hydrangeas, pampas.
function aisleFlowers(ctx, x, y, s, side, seed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  for (const [dx, a] of [[-8, -0.5], [6, 0.35], [0, 0]]) pampas(ctx, dx * side, -6, 60, a * side);
  bloom(ctx, 0, 0, 22, 6, seed);
  hydrangea(ctx, 8 * side, 6, 11);
  ctx.restore();
}

// A lush arrangement standing on the ground at the aisle's edge, like the
// big ones at the front of the aisle in the photo: a heap of greenery and
// white roses, hydrangeas, a fan of tall pampas plumes behind, greenery
// spilling onto the path. `side` = -1 on the left of the path, 1 on the
// right (it leans away from the path). Drawn at size `s`.
function aisleArrangement(ctx, x, y, s, side, seed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // the pampas fan behind, tallest in the middle
  for (const [dx, a, l] of [[-30, -0.75, 70], [-18, -0.45, 92], [-6, -0.18, 108], [6, 0.08, 116], [18, 0.32, 104], [30, 0.6, 86], [40, 0.9, 64]]) {
    pampas(ctx, dx * side, -10, l, a * side);
  }
  // the greenery heap and roses, in two layers for fullness
  bloom(ctx, 6 * side, -16, 38, 12, seed);
  bloom(ctx, -8 * side, 0, 34, 10, seed + 1);
  hydrangea(ctx, -24 * side, -4, 15);
  hydrangea(ctx, 18 * side, -22, 14);
  hydrangea(ctx, 2 * side, 10, 16);
  hydrangea(ctx, 34 * side, 2, 12);
  // greenery spilling onto the path
  for (let k = 0; k < 5; k++) stamp(ctx, leaf(26, ['#5F7D69', '#7E9A86', '#4F6B58'][k % 3]), -side * (24 + k * 8), 12 + k * 3, { angle: Math.PI / 2 + side * (0.9 + k * 0.1) });
  ctx.restore();
}

export function grounds(ctx, w, lawnTop, top, full, end) {
  // the lawn, golden where the low sun catches it
  const g = ctx.createLinearGradient(0, lawnTop, 0, end);
  g.addColorStop(0, '#A8A060');
  g.addColorStop(0.3, '#7E8A48');
  g.addColorStop(1, '#4E6238');
  ctx.fillStyle = g;
  ctx.fillRect(-20, lawnTop, w + 40, end - lawnTop);
  const r = seeded(17);
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < Math.round(2200 * (w / 430)); i++) {
    const t = r();
    const y = lawnTop + (end - lawnTop) * t;
    const x = r() * w;
    ctx.strokeStyle = r() < 0.5 ? `rgba(240, 220, 140, ${0.08 + r() * 0.1})` : `rgba(30, 45, 25, ${0.08 + r() * 0.1})`;
    ctx.lineWidth = 0.6 + t;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 3, y - (2 + t * 9));
    ctx.stroke();
  }
  ctx.restore();
  // a low wooden fence along the far edge of the lawn
  ctx.strokeStyle = 'rgba(70, 55, 40, 0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (const dy of [4, 10]) {
    ctx.moveTo(-20, lawnTop + dy);
    ctx.lineTo(w + 20, lawnTop + dy);
  }
  for (let x = -10; x < w + 20; x += 26) {
    ctx.moveTo(x, lawnTop);
    ctx.lineTo(x, lawnTop + 16);
  }
  ctx.stroke();

  // the stone path, widening towards us, its slabs laid in rows
  const half = (y) => pathHalf(w, y, top, full);
  // grass tufts and wild flowers on the lawn from the fence down to the
  // first benches (under the tall grass); among the benches the lawn is
  // left plain, so the benches stand out (founder, 24 Nov 2026)
  meadow(ctx, w, lawnTop + 14, firstBenchY(top, full), (y) => (y < top ? -999 : half(y)), (y) => sizeAt(Math.max(y, top), top, full) * (y < top ? 0.8 : 1), 23);
  ctx.fillStyle = STONE;
  ctx.beginPath();
  for (let y = top; y <= end; y += 10) ctx.lineTo(w / 2 + half(y), y);
  for (let y = end; y >= top; y -= 10) ctx.lineTo(w / 2 - half(y), y);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.clip();
  const shade = ctx.createLinearGradient(0, top, 0, full);
  shade.addColorStop(0, 'rgba(255, 214, 160, 0.35)'); // the sunset's warmth far off
  shade.addColorStop(1, 'rgba(255, 214, 160, 0)');
  ctx.fillStyle = shade;
  ctx.fillRect(-20, top, w + 40, full - top);
  ctx.strokeStyle = 'rgba(150, 130, 105, 0.45)';
  ctx.lineWidth = 1;
  let y = top;
  let row = 0;
  while (y < end) {
    const s = sizeAt(y, top, full);
    const rowH = 16 * s * s;
    ctx.beginPath(); // the joint along the row
    ctx.moveTo(w / 2 - half(y), y);
    ctx.lineTo(w / 2 + half(y), y);
    // the joints between slabs, staggered row by row, converging far off
    for (let k = -4; k <= 4; k++) {
      const u = (k + (row % 2 ? 0.5 : 0)) / 4.5;
      ctx.moveTo(w / 2 + u * half(y), y);
      ctx.lineTo(w / 2 + u * half(y + rowH), y + rowH);
    }
    ctx.stroke();
    y += rowH;
    row++;
  }
  // soft stripes of shadow from the trees, falling across the path
  ctx.fillStyle = 'rgba(80, 60, 40, 0.08)';
  for (const [f, wd] of [[0.25, 40], [0.45, 70], [0.7, 110]]) {
    const yy = top + (full - top) * f;
    ctx.fillRect(-20, yy, w + 40, wd);
  }
  ctx.restore();
}

// The bench rows: ROWS rows from the altar's platform towards us; the
// first FIRST_ROW are left out (tall grass grows there instead, grass.js).
const ROWS = 9;
const FIRST_ROW = 3;
const rowY = (k, top, full) => {
  const benchEnd = top + (full - top) * 0.62;
  const t = (k + 0.25) / ROWS;
  return top - 10 + (benchEnd - top + 10) * t ** 1.3;
};
// where the last bench row's shadow ends (the benches layer stops there)
export const benchesEnd = (top, full) => {
  const y = rowY(ROWS - 1, top, full);
  return y + 30 * sizeAt(y, top, full);
};
// where the first bench row stands (the tall grass reaches down to it)
export const firstBenchY = (top, full) => rowY(FIRST_ROW, top, full);
// how big things are at `y`, and half the path's width there (for grass.js)
export const gardenSize = (y, top, full) => sizeAt(y, top, full);
export const pathHalfAt = (w, y, top, full) => pathHalf(w, y, top, full);

// The white benches, on their own layer above the tall grass: one long
// bench a row on each side of the path, reaching off the edge of the
// screen, tall and close together like in the photo (the nearer rows in
// front of the farther ones), with flowers at the path's edge on every
// other row.
export function benches(ctx, w, top, full) {
  const half = (y) => pathHalf(w, y, top, full);
  // two lush arrangements framing the walk to the altar: a pair at the
  // altar's step, and a pair by the first benches
  for (const side of [-1, 1]) {
    aisleArrangement(ctx, w / 2 + side * (half(top) + 20), top + 4, 0.85, side, 61 + (side > 0 ? 2 : 0));
  }
  for (let k = FIRST_ROW; k < ROWS; k++) {
    const y = rowY(k, top, full);
    const s = sizeAt(y, top, full);
    for (const side of [-1, 1]) {
      const inner = half(y) + 26 * s;
      const outer = w / 2 + 40; // off the edge of the screen
      bench(ctx, side < 0 ? w / 2 - outer : w / 2 + inner, side < 0 ? w / 2 - inner : w / 2 + outer, y, s, w / 2);
      if (k === FIRST_ROW) aisleArrangement(ctx, w / 2 + side * (half(y) + 16 * s), y + 6 * s, s * 1.15, side, 71 + (side > 0 ? 2 : 0));
      else if (k % 2 === 1) aisleFlowers(ctx, w / 2 + side * (half(y) + 10 * s), y + 4 * s, s, side, 40 + k * 2 + (side > 0 ? 1 : 0));
    }
  }
}

// ── Where the path meets chapter 2 ───────────────────────────────────────────

// The top of chapter 2 (the celebrations): the path's stone carrying on for
// a moment, then a border of greenery, white roses, hydrangeas and pampas
// along its edge, on chapter 2's sage. Painted in that chapter's
// coordinates, its top at y = 0.
export function gardenBorder(ctx, w) {
  ctx.fillStyle = STONE;
  ctx.fillRect(-20, -40, w + 40, 78);
  ctx.fillStyle = 'rgba(150, 130, 105, 0.4)'; // the last joint
  ctx.fillRect(-20, 30, w + 40, 1);
  const r = seeded(91);
  ctx.save();
  ctx.shadowColor = 'rgba(20, 30, 20, 0.4)';
  ctx.shadowBlur = 10 * (ctx.__s || 1);
  ctx.shadowOffsetY = 4 * (ctx.__s || 1);
  ctx.fillStyle = '#3F5A3C';
  for (let x = -20; x < w + 20; x += 18 + r() * 10) {
    ctx.beginPath();
    ctx.ellipse(x, 56, 24 + r() * 10, 18 + r() * 8, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.fillRect(-20, 52, w + 40, 20);
  ctx.restore();
  for (let x = -10; x < w + 10; x += 46 + r() * 30) pampas(ctx, x, 54, 50 + r() * 20, (r() - 0.5) * 0.8);
  for (let x = -10; x < w + 10; x += 16 + r() * 12) {
    stamp(ctx, leaf(Math.round(20 + r() * 12), r() < 0.5 ? '#5F7D69' : '#7E9A86'), x, 46 + r() * 14, { angle: (r() - 0.5) * 2.4 });
    if (r() < 0.5) stamp(ctx, rose(Math.round(14 + r() * 8), r() < 0.25 ? 'blush' : 'white'), x + (r() - 0.5) * 8, 44 + r() * 14, { angle: r() * 6 });
    else if (r() < 0.4) hydrangea(ctx, x, 48 + r() * 10, 9 + r() * 3);
  }
}
