// The wedding mandap (मण्डप), empty and ready, painted in code.
//
// Top to bottom, as the camera tilts down past it:
//   a brass kalash finial → a red silk canopy with gold zari stripes and a
//   scalloped valance → strands of marigolds and brass bells hanging from
//   it → four pillars wrapped in red and gold cloth, with banana stems
//   tied to the front two → a maroon back drape with a gold mandala →
//   on the raised platform: the sacred fire (havan kund) in the middle,
//   two seats facing it, a kalash each side, a row of lit diyos → steps
//   down to the courtyard.
//
//   mandap(ctx, cx, top)      – the still picture; `top` = the finial's tip
//   mandapLights(cx, top)     – where the fire and the diyos are (page px),
//                               for drawing their flames live
//   sacredFire(ctx, x, y, t)  – the havan fire, drawn every frame
//
// About 980 px tall.

import { foil, stamp, stampLifted, marigold, bell, leaf, seeded } from '../themes/draw';
import { mandala } from '../themes/ornaments';
import { kalash } from './art';

const SILK = '#8E1B22';
const SILK_DARK = '#4E0B12';
const WOOD = '#3A1A0E';

// Where things are, from the finial's tip (y) and the middle (x).
const CANOPY = { apex: 70, eave: 250, topW: 34, eaveW: 480 };
const VALANCE = 290; // bottom of the scallops
const PILLAR_FRONT = 188; // ± x of the front pillars' centre
const PILLAR_BACK = 148; // ± x of the back pillars
const FLOOR = 780; // the platform's top surface
const FIRE = 716; // where the flames start (top of the fire pit)
const SEAT_X = 98;
export const MANDAP_HEIGHT = 980;

export function mandapLights(cx, top) {
  const diyos = [];
  for (let x = -170; x <= 170; x += 34) {
    if (Math.abs(x) < 20) continue;
    diyos.push([cx + x, top + FLOOR + 22]);
  }
  return { fire: [cx, top + FIRE], diyos };
}

export function mandap(ctx, cx, top) {
  ctx.save();
  ctx.translate(cx, top);

  backDrape(ctx);
  pillar(ctx, -PILLAR_BACK, CANOPY.eave + 20, FLOOR, 16, 0.55);
  pillar(ctx, PILLAR_BACK, CANOPY.eave + 20, FLOOR, 16, 0.55);
  fireLight(ctx);
  platform(ctx);
  firePit(ctx);
  seat(ctx, -SEAT_X);
  seat(ctx, SEAT_X);
  kalash(ctx, -PILLAR_BACK + 4, FLOOR + 2, 58);
  kalash(ctx, PILLAR_BACK - 4, FLOOR + 2, 58);
  pillar(ctx, -PILLAR_FRONT, CANOPY.eave, FLOOR + 70, 30, 1);
  pillar(ctx, PILLAR_FRONT, CANOPY.eave, FLOOR + 70, 30, 1);
  banana(ctx, -PILLAR_FRONT, FLOOR + 70, 1);
  banana(ctx, PILLAR_FRONT, FLOOR + 70, -1);
  canopy(ctx);
  strands(ctx);
  finial(ctx);

  ctx.restore();
}

// ── The canopy ───────────────────────────────────────────────────────────────

function canopy(ctx) {
  const { apex, eave, topW, eaveW } = CANOPY;
  const H = eave - apex;
  const outline = () => {
    ctx.beginPath();
    ctx.moveTo(-topW / 2, apex);
    ctx.lineTo(topW / 2, apex);
    ctx.quadraticCurveTo(topW / 2 + (eaveW - topW) * 0.18, apex + H * 0.75, eaveW / 2, eave);
    ctx.lineTo(-eaveW / 2, eave);
    ctx.quadraticCurveTo(-topW / 2 - (eaveW - topW) * 0.18, apex + H * 0.75, -topW / 2, apex);
    ctx.closePath();
  };

  // the silk, with a soft shadow on what's below
  ctx.save();
  ctx.shadowColor = 'rgba(10, 0, 4, 0.55)';
  ctx.shadowBlur = 24 * (ctx.__s || 1);
  ctx.shadowOffsetY = 12 * (ctx.__s || 1);
  outline();
  const silk = ctx.createLinearGradient(0, apex, 0, eave);
  silk.addColorStop(0, '#B4302C');
  silk.addColorStop(0.5, SILK);
  silk.addColorStop(1, SILK_DARK);
  ctx.fillStyle = silk;
  ctx.fill();
  ctx.restore();

  ctx.save();
  outline();
  ctx.clip();
  // gold zari stripes fanning out from the top
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const t = i / n - 0.5;
    ctx.strokeStyle = foil(ctx, -eaveW / 2, 0, eaveW / 2, 0, 'gold');
    ctx.globalAlpha = i % 2 ? 0.25 : 0.6;
    ctx.lineWidth = i % 2 ? 1 : 2.2;
    ctx.beginPath();
    ctx.moveTo(t * topW, apex);
    ctx.quadraticCurveTo(t * (topW + (eaveW - topW) * 0.36), apex + H * 0.75, t * eaveW, eave);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // silk sheen and shadowed sides
  const sides = ctx.createLinearGradient(-eaveW / 2, 0, eaveW / 2, 0);
  sides.addColorStop(0, 'rgba(10, 0, 6, 0.5)');
  sides.addColorStop(0.35, 'rgba(255, 180, 140, 0.08)');
  sides.addColorStop(0.5, 'rgba(255, 200, 160, 0.14)');
  sides.addColorStop(0.65, 'rgba(255, 180, 140, 0.08)');
  sides.addColorStop(1, 'rgba(10, 0, 6, 0.5)');
  ctx.fillStyle = sides;
  ctx.fillRect(-eaveW / 2, apex, eaveW, H);
  ctx.restore();

  // the gold border along the eave, with a row of small diamonds
  ctx.fillStyle = foil(ctx, -eaveW / 2, 0, eaveW / 2, 0, 'gold');
  ctx.fillRect(-eaveW / 2, eave - 10, eaveW, 10);
  ctx.fillStyle = '#6E1218';
  for (let x = -eaveW / 2 + 8; x < eaveW / 2; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, eave - 8);
    ctx.lineTo(x + 3.5, eave - 5);
    ctx.lineTo(x, eave - 2);
    ctx.lineTo(x - 3.5, eave - 5);
    ctx.fill();
  }

  // the scalloped valance under the border, with a tassel at each point
  const W = 36;
  for (let x = -eaveW / 2; x < eaveW / 2; x += W) {
    ctx.beginPath();
    ctx.moveTo(x, eave);
    ctx.lineTo(x + W, eave);
    ctx.arc(x + W / 2, eave, W / 2, 0, Math.PI);
    const g = ctx.createLinearGradient(0, eave, 0, VALANCE);
    g.addColorStop(0, SILK);
    g.addColorStop(1, SILK_DARK);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = foil(ctx, x, 0, x + W, 0, 'gold');
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(x + W / 2, eave, W / 2 - 2, 0.1, Math.PI - 0.1);
    ctx.stroke();
    // tassel where two scallops meet
    ctx.fillStyle = foil(ctx, x - 3, 0, x + 3, 0, 'gold');
    ctx.fillRect(x - 1.5, eave + 2, 3, 10);
    ctx.beginPath();
    ctx.moveTo(x - 4, eave + 12);
    ctx.lineTo(x + 4, eave + 12);
    ctx.lineTo(x + 2.5, eave + 24);
    ctx.lineTo(x - 2.5, eave + 24);
    ctx.fill();
  }
}

// The brass kalash on top of the canopy, with mango leaves and a coconut.
function finial(ctx) {
  const gold = foil(ctx, -18, 0, 18, 0, 'gold');
  // mango leaves fanning out of its mouth
  for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) {
    stamp(ctx, leaf(22, '#5E7A2E'), Math.sin(a) * 9, 26 - Math.cos(a) * 9, { angle: a });
  }
  // the coconut
  ctx.fillStyle = '#7A4A22';
  ctx.beginPath();
  ctx.ellipse(0, 14, 7, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // the pot
  ctx.fillStyle = gold;
  ctx.fillRect(-9, 26, 18, 6); // rim
  ctx.beginPath();
  ctx.moveTo(-7, 32);
  ctx.quadraticCurveTo(-22, 44, -16, 58);
  ctx.quadraticCurveTo(0, 66, 16, 58);
  ctx.quadraticCurveTo(22, 44, 7, 32);
  ctx.fill();
  ctx.fillRect(-12, 60, 24, 6); // foot
  ctx.fillStyle = '#B4231E'; // the red thread round its neck
  ctx.fillRect(-9, 34, 18, 2);
  // the lamps below catch the brass
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const shine = ctx.createRadialGradient(0, 45, 0, 0, 45, 60);
  shine.addColorStop(0, 'rgba(255, 200, 120, 0.35)');
  shine.addColorStop(1, 'rgba(255, 180, 90, 0)');
  ctx.fillStyle = shine;
  ctx.fillRect(-60, -15, 120, 120);
  ctx.restore();
}

// Marigold strands and bells hanging from the valance: long at the sides,
// short in the middle, so they frame the fire instead of hiding it.
function strands(ctx) {
  const shadow = { dx: 3, dy: 7, blur: 3, alpha: 0.45 };
  for (let x = -CANOPY.eaveW / 2 + 36; x < CANOPY.eaveW / 2; x += 36) {
    const side = Math.abs(x) / (CANOPY.eaveW / 2); // 0 middle … 1 edge
    const count = Math.round(2 + side * side * 9);
    for (let k = 0; k < count; k++) {
      stampLifted(ctx, marigold(8.5, k % 2 ? 'gold' : 'saffron'), x, CANOPY.eave + 30 + k * 13, {}, shadow);
    }
    stampLifted(ctx, bell(12), x, CANOPY.eave + 36 + count * 13, {}, shadow);
  }
  // a swag of marigolds between the front pillars
  const r = seeded(4);
  for (let i = 0; i <= 34; i++) {
    const t = i / 34;
    const x = -PILLAR_FRONT + PILLAR_FRONT * 2 * t;
    const y = VALANCE + 6 + Math.sin(t * Math.PI) * 46;
    stampLifted(ctx, marigold(10, r() < 0.5 ? 'gold' : 'saffron'), x, y, {}, shadow);
  }
}

// ── Pillars, drape, platform ─────────────────────────────────────────────────

// A pillar wrapped in a spiral of red and gold cloth. `light` dims the back ones.
function pillar(ctx, x, top, bottom, width, light) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - width / 2, top, width, bottom - top);
  ctx.clip();
  ctx.fillStyle = SILK_DARK;
  ctx.fillRect(x - width / 2, top, width, bottom - top);
  // the spiral wrap: gold bands, slanted
  ctx.strokeStyle = foil(ctx, x - width, 0, x + width, 0, 'gold');
  ctx.lineWidth = width * 0.28;
  for (let y = top - width; y < bottom + width; y += width * 0.9) {
    ctx.beginPath();
    ctx.moveTo(x - width, y + width * 0.6);
    ctx.lineTo(x + width, y - width * 0.6);
    ctx.stroke();
  }
  // round: dark at both edges
  const round = ctx.createLinearGradient(x - width / 2, 0, x + width / 2, 0);
  round.addColorStop(0, 'rgba(10, 0, 4, 0.7)');
  round.addColorStop(0.4, 'rgba(255, 190, 140, 0.1)');
  round.addColorStop(1, 'rgba(10, 0, 4, 0.75)');
  ctx.fillStyle = round;
  ctx.fillRect(x - width / 2, top, width, bottom - top);
  if (light < 1) {
    ctx.fillStyle = `rgba(14, 2, 8, ${1 - light})`;
    ctx.fillRect(x - width / 2, top, width, bottom - top);
  }
  ctx.restore();
}

// A banana stem tied to a front pillar, its big leaves arching out
// (`side` = 1 grows to the right, -1 to the left).
function banana(ctx, x, bottom, side) {
  const stem = ctx.createLinearGradient(x - 10, 0, x + 10, 0);
  stem.addColorStop(0, '#2E4A1C');
  stem.addColorStop(0.5, '#6E8E3A');
  stem.addColorStop(1, '#2E4A1C');
  ctx.fillStyle = stem;
  ctx.fillRect(x - 9, bottom - 300, 18, 300);
  const leafAt = (y, angle, length) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, 0, length, 0);
    g.addColorStop(0, '#4E7228');
    g.addColorStop(1, '#2C4A16');
    ctx.fillStyle = g;
    // a wide paddle of a blade with a blunt, rounded tip (banana, not bamboo)
    const blade = () => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(length * 0.12, -length * 0.3, length * 0.78, -length * 0.34, length * 0.97, -length * 0.13);
      ctx.quadraticCurveTo(length * 1.07, 0, length * 0.94, length * 0.13);
      ctx.bezierCurveTo(length * 0.75, length * 0.3, length * 0.15, length * 0.24, 0, 0);
      ctx.closePath();
    };
    blade();
    ctx.fill();
    ctx.save();
    blade();
    ctx.clip();
    // fine parallel veins running out from the midrib to both edges
    ctx.strokeStyle = 'rgba(18, 38, 8, 0.32)';
    ctx.lineWidth = 0.7;
    for (let u = 0.06; u < 1; u += 0.045) {
      const mx = length * u;
      ctx.beginPath();
      ctx.moveTo(mx, 0);
      ctx.lineTo(mx + length * 0.06, -length * 0.4);
      ctx.moveTo(mx, 0);
      ctx.lineTo(mx + length * 0.06, length * 0.4);
      ctx.stroke();
    }
    // light along the upper half, shade along the lower
    const shade = ctx.createLinearGradient(0, -length * 0.3, 0, length * 0.3);
    shade.addColorStop(0, 'rgba(210, 240, 150, 0.18)');
    shade.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    shade.addColorStop(1, 'rgba(0, 20, 0, 0.3)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, -length * 0.4, length * 1.1, length * 0.8);
    ctx.restore();
    // the pale midrib down the middle
    ctx.strokeStyle = 'rgba(215, 235, 160, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();
    ctx.restore();
  };
  // leaves on both sides of the pillar, leaning away from the middle
  // (canvas y points down; a leaf is drawn mirrored for the left side)
  const leafSide = (y, angle, length, outward) => {
    ctx.save();
    if (outward * side < 0) {
      ctx.translate(x, 0);
      ctx.scale(-1, 1);
      ctx.translate(-x, 0);
    }
    leafAt(y, angle, length);
    ctx.restore();
  };
  leafSide(bottom - 300, -0.95, 120, 1);
  leafSide(bottom - 290, -1.15, 96, -1);
  leafSide(bottom - 225, -0.35, 130, 1);
  leafSide(bottom - 165, -0.2, 92, -1);
  // a red thread tying it on
  ctx.fillStyle = '#C0241E';
  ctx.fillRect(x - 16, bottom - 120, 32, 3);
  ctx.fillRect(x - 16, bottom - 240, 32, 3);
}

// The maroon drape at the back, with a gold mandala on it.
function backDrape(ctx) {
  const top = CANOPY.eave + 10;
  const w = PILLAR_BACK * 2;
  const g = ctx.createLinearGradient(0, top, 0, FLOOR);
  g.addColorStop(0, '#3A0810');
  g.addColorStop(1, '#5A1420');
  ctx.fillStyle = g;
  ctx.fillRect(-w / 2, top, w, FLOOR - top);
  // soft folds
  for (let x = -w / 2; x < w / 2; x += 24) {
    const f = ctx.createLinearGradient(x, 0, x + 24, 0);
    f.addColorStop(0, 'rgba(0, 0, 0, 0.22)');
    f.addColorStop(0.5, 'rgba(255, 170, 150, 0.06)');
    f.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
    ctx.fillStyle = f;
    ctx.fillRect(x, top, 24, FLOOR - top);
  }
  mandala(ctx, 0, 470, 110, { alpha: 0.5 });
}

// The fire's warm light on the drape, pillars and floor (the flicker is live).
function fireLight(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, FIRE + 10, 0, 0, FIRE + 10, 260);
  g.addColorStop(0, 'rgba(255, 150, 60, 0.45)');
  g.addColorStop(0.5, 'rgba(255, 110, 40, 0.14)');
  g.addColorStop(1, 'rgba(255, 90, 30, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(-280, FIRE - 260, 560, 520);
  ctx.restore();
}

// The raised platform and the steps down from it.
function platform(ctx) {
  // top surface, lit by the fire
  const surface = ctx.createLinearGradient(0, FLOOR, 0, FLOOR + 14);
  surface.addColorStop(0, '#9A6A3A');
  surface.addColorStop(1, '#6E4424');
  ctx.fillStyle = surface;
  ctx.fillRect(-240, FLOOR, 480, 14);
  // marigold petals scattered on it
  const r = seeded(9);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = r() < 0.5 ? '#E8862A' : '#F2B33D';
    ctx.beginPath();
    ctx.ellipse((r() - 0.5) * 440, FLOOR + 3 + r() * 9, 2.2, 1.2, r() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // front face with a gold border and a row of diyo bowls (flames are live)
  const face = ctx.createLinearGradient(0, FLOOR + 14, 0, FLOOR + 70);
  face.addColorStop(0, '#5A1218');
  face.addColorStop(1, '#3A0A10');
  ctx.fillStyle = face;
  ctx.fillRect(-240, FLOOR + 14, 480, 56);
  ctx.fillStyle = foil(ctx, -240, 0, 240, 0, 'gold');
  ctx.fillRect(-240, FLOOR + 14, 480, 3);
  ctx.fillRect(-240, FLOOR + 66, 480, 3);
  for (const [x] of mandapLights(0, 0).diyos) {
    ctx.fillStyle = '#7A3E1E';
    ctx.beginPath();
    ctx.ellipse(x, FLOOR + 22, 6, 3, 0, 0, Math.PI);
    ctx.fill();
  }
  // stone steps
  [[FLOOR + 70, 520], [FLOOR + 120, 580], [FLOOR + 170, 640]].forEach(([y, w], i, all) => {
    const next = all[i + 1]?.[0] ?? MANDAP_HEIGHT;
    ctx.fillStyle = '#A08465';
    ctx.fillRect(-w / 2, y, w, 7);
    const g = ctx.createLinearGradient(0, y + 7, 0, next);
    g.addColorStop(0, '#6B5646');
    g.addColorStop(1, '#3E3029');
    ctx.fillStyle = g;
    ctx.fillRect(-w / 2, y + 7, w, next - y - 7);
  });
}

// The havan kund: a stepped brick-and-brass fire pit.
function firePit(ctx) {
  const tiers = [
    [100, FLOOR - 26, FLOOR],
    [80, FLOOR - 46, FLOOR - 26],
    [62, FIRE, FLOOR - 46],
  ];
  for (const [w, top, bottom] of tiers) {
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, '#B45A2E');
    g.addColorStop(1, '#6E2E18');
    ctx.fillStyle = g;
    ctx.fillRect(-w / 2, top, w, bottom - top);
    ctx.fillStyle = foil(ctx, -w / 2, 0, w / 2, 0, 'gold');
    ctx.fillRect(-w / 2, top, w, 2.5);
  }
  // glowing embers at its mouth
  const embers = ctx.createLinearGradient(0, FIRE - 4, 0, FIRE + 4);
  embers.addColorStop(0, '#FFD27A');
  embers.addColorStop(1, '#E2621B');
  ctx.fillStyle = embers;
  ctx.fillRect(-28, FIRE - 3, 56, 6);
}

// A low wooden seat (pirka) with a red velvet cushion and gold tassels.
function seat(ctx, x) {
  const w = 64;
  ctx.fillStyle = WOOD;
  ctx.fillRect(x - w / 2, FLOOR - 18, w, 18);
  ctx.fillStyle = foil(ctx, x - w / 2, 0, x + w / 2, 0, 'gold');
  ctx.fillRect(x - w / 2, FLOOR - 18, w, 2);
  const cushion = ctx.createLinearGradient(0, FLOOR - 34, 0, FLOOR - 16);
  cushion.addColorStop(0, '#C2302A');
  cushion.addColorStop(1, '#7A141A');
  ctx.fillStyle = cushion;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 2, FLOOR - 18);
  ctx.quadraticCurveTo(x - w / 2, FLOOR - 36, x, FLOOR - 36);
  ctx.quadraticCurveTo(x + w / 2, FLOOR - 36, x + w / 2 + 2, FLOOR - 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = foil(ctx, x - 4, 0, x + 4, 0, 'gold');
  for (const tx of [x - w / 2, x + w / 2]) {
    ctx.beginPath();
    ctx.moveTo(tx - 3, FLOOR - 20);
    ctx.lineTo(tx + 3, FLOOR - 20);
    ctx.lineTo(tx + 2, FLOOR - 8);
    ctx.lineTo(tx - 2, FLOOR - 8);
    ctx.fill();
  }
}

// ── The sacred fire (drawn every frame) ──────────────────────────────────────

const sparks = [];

// The havan fire at (x, y): a cluster of flickering tongues of flame, a
// pulsing glow, and sparks rising. `t` = time in seconds.
export function sacredFire(ctx, x, y, t, dt = 0) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // the glow, breathing
  const pulse = 1 + Math.sin(t * 7) * 0.05 + Math.sin(t * 13) * 0.04;
  const glow = ctx.createRadialGradient(x, y - 30, 0, x, y - 30, 200 * pulse);
  glow.addColorStop(0, 'rgba(255, 170, 70, 0.55)');
  glow.addColorStop(0.4, 'rgba(255, 120, 40, 0.18)');
  glow.addColorStop(1, 'rgba(255, 90, 30, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 210, y - 240, 420, 420);

  // tongues of flame, back (tall, red) to front (short, bright)
  const tongues = [
    [-20, 96, '#E2501B'],
    [18, 104, '#E2501B'],
    [-6, 128, '#F07A26'],
    [-28, 72, '#FFA040'],
    [26, 78, '#FFA040'],
    [3, 90, '#FFD27A'],
    [0, 50, '#FFF4C8'],
  ];
  tongues.forEach(([dx, height, color], i) => {
    const h = height * (0.78 + 0.22 * Math.sin(t * (6 + i) + i * 1.7));
    const sway = Math.sin(t * (3 + i * 0.5) + i) * 6;
    const w = 14 + height * 0.12;
    const g = ctx.createLinearGradient(0, y, 0, y - h);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(255, 120, 40, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x + dx - w, y);
    ctx.bezierCurveTo(x + dx - w, y - h * 0.45, x + dx + sway - w * 0.3, y - h * 0.7, x + dx + sway, y - h);
    ctx.bezierCurveTo(x + dx + sway + w * 0.3, y - h * 0.7, x + dx + w, y - h * 0.45, x + dx + w, y);
    ctx.closePath();
    ctx.fill();
  });

  // sparks drifting up
  if (dt > 0 && Math.random() < dt * 9) sparks.push({ x: x + (Math.random() - 0.5) * 40, y: y - 50, vx: (Math.random() - 0.5) * 22, vy: -50 - Math.random() * 50, life: 1 });
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.life -= dt * 0.7;
    s.x += s.vx * dt + Math.sin(t * 5 + i) * 0.3;
    s.y += s.vy * dt;
    if (s.life <= 0) {
      sparks.splice(i, 1);
      continue;
    }
    ctx.fillStyle = `rgba(255, 210, 120, ${(s.life * 0.9).toFixed(3)})`;
    ctx.fillRect(s.x, s.y, 1.8, 1.8);
  }
  ctx.restore();
}
