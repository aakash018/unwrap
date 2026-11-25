// Patan, painted in code: a three-roof Newari pagoda, the old town around
// it, and the brick courtyard with its sunken stone water spout (hiti).
//
// Everything is lit by lantern- and lamp-light: warm windows, gold edges
// catching the light, deep shadows under the roofs.
//
//   pagoda(ctx, cx, top)      – the temple; `top` = the tip of its gold finial
//   pagodaLamps(cx, top)      – where its oil lamps (diyos) sit, for the flames
//   town(ctx, w, y)           – rooftops of the old town behind it
//   courtyard(ctx, w, top, bottom, pool) – brick paving and the hiti pool
//
// Sizes are in page px; the temple is about 1030 px tall.

import { foil, stamp, bell, seeded } from '../themes/draw';
import { water, WATER } from './texture';

const WOOD = '#2E140C';
const WOOD_LIT = '#7A4426';
const BRICK = '#7E3324';
const STONE = '#6B5646';
const STONE_TOP = '#A08465';

// ── The temple ───────────────────────────────────────────────────────────────

// Its parts, top to bottom (y measured from the finial's tip).
const ROOFS = [
  { top: 92, topW: 64, eave: 205, eaveW: 236, wallW: 128, wallTo: 268 },
  { top: 262, topW: 150, eave: 400, eaveW: 344, wallW: 220, wallTo: 470 },
  { top: 462, topW: 236, eave: 628, eaveW: 456, wallW: 310, wallTo: 818 },
];
const STEPS = [
  { y: 818, w: 352 },
  { y: 862, w: 400 },
  { y: 906, w: 448 },
  { y: 950, w: 496 },
  { y: 994, w: 544 },
];
export const PAGODA_HEIGHT = 1040;

export function pagoda(ctx, cx, top) {
  ctx.save();
  ctx.translate(cx, top);

  plinth(ctx);
  // ground floor, then each roof from the bottom up (upper roofs overlap lower walls)
  for (let i = ROOFS.length - 1; i >= 0; i--) {
    const roofPart = ROOFS[i];
    wall(ctx, roofPart.eave - 6, roofPart.wallTo, roofPart.wallW, i);
  }
  for (let i = ROOFS.length - 1; i >= 0; i--) {
    struts(ctx, ROOFS[i]);
    roof(ctx, ROOFS[i]);
  }
  banner(ctx);
  finial(ctx);

  ctx.restore();
}

// Where the oil lamps sit along the steps (page px), for flickering flames.
export function pagodaLamps(cx, top) {
  const lamps = [];
  STEPS.forEach((step, i) => {
    const n = 5 + i * 2;
    for (let k = 0; k < n; k++) {
      const x = cx - step.w / 2 + 22 + ((step.w - 44) / (n - 1)) * k;
      if (i === 0 && Math.abs(x - cx) < 50) continue; // leave the doorway clear
      lamps.push([x, top + step.y + 2]);
    }
  });
  return lamps;
}

// The golden finial (gajur): bulbs and umbrellas stacked to a point.
function finial(ctx) {
  const gold = foil(ctx, -24, 0, 24, 0, 'gold');
  ctx.fillStyle = gold;
  const bulb = (y, r) => {
    ctx.beginPath();
    ctx.arc(0, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  const umbrella = (y, w, h) => {
    ctx.beginPath();
    ctx.moveTo(-w / 2, y + h);
    ctx.quadraticCurveTo(0, y - h, w / 2, y + h);
    ctx.closePath();
    ctx.fill();
  };
  ctx.beginPath(); // the spike
  ctx.moveTo(0, 0);
  ctx.lineTo(3, 16);
  ctx.lineTo(-3, 16);
  ctx.closePath();
  ctx.fill();
  bulb(20, 5);
  umbrella(26, 22, 5);
  bulb(38, 7);
  umbrella(44, 30, 6);
  bulb(58, 9);
  ctx.fillRect(-16, 66, 32, 5);
  // the bell-shaped base sitting on the top roof
  ctx.beginPath();
  ctx.moveTo(-12, 71);
  ctx.quadraticCurveTo(-14, 86, -30, 94);
  ctx.lineTo(30, 94);
  ctx.quadraticCurveTo(14, 86, 12, 71);
  ctx.closePath();
  ctx.fill();
  // light catching the gold
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const shine = ctx.createRadialGradient(0, 50, 0, 0, 50, 70);
  shine.addColorStop(0, 'rgba(255, 210, 130, 0.35)');
  shine.addColorStop(1, 'rgba(255, 180, 90, 0)');
  ctx.fillStyle = shine;
  ctx.fillRect(-70, -20, 140, 140);
  ctx.restore();
}

// The long gold banner (pataka) hanging from the top roof down the front.
function banner(ctx) {
  const x0 = -4.5;
  const top = 150;
  const bottom = 660;
  ctx.fillStyle = foil(ctx, x0, 0, x0 + 9, 0, 'gold');
  ctx.fillRect(x0, top, 9, bottom - top);
  ctx.fillStyle = 'rgba(80, 40, 10, 0.4)';
  for (let y = top + 8; y < bottom; y += 14) ctx.fillRect(x0 + 1.5, y, 6, 1); // embossed bands
  // pointed tip
  ctx.fillStyle = foil(ctx, x0, 0, x0 + 9, 0, 'gold');
  ctx.beginPath();
  ctx.moveTo(x0, bottom);
  ctx.lineTo(x0 + 4.5, bottom + 14);
  ctx.lineTo(x0 + 9, bottom);
  ctx.fill();
}

// One tiled roof with a concave sweep, gold trim and a fringe of bells.
function roof(ctx, { top, topW, eave, eaveW }) {
  const tl = -topW / 2;
  const tr = topW / 2;
  const el = -eaveW / 2;
  const er = eaveW / 2;
  const H = eave - top;

  const outline = () => {
    ctx.beginPath();
    ctx.moveTo(tl, top);
    ctx.lineTo(tr, top);
    ctx.quadraticCurveTo(tr + (er - tr) * 0.42, top + H * 0.66, er, eave - 9);
    ctx.lineTo(er + 7, eave - 15); // the corners turn up a little
    ctx.lineTo(er + 3, eave);
    ctx.lineTo(el - 3, eave);
    ctx.lineTo(el - 7, eave - 15);
    ctx.lineTo(el, eave - 9);
    ctx.quadraticCurveTo(tl + (el - tl) * 0.42, top + H * 0.66, tl, top);
    ctx.closePath();
  };

  // soft shadow the roof throws onto the wall below
  ctx.save();
  ctx.shadowColor = 'rgba(8, 2, 0, 0.6)';
  ctx.shadowBlur = 26 * (ctx.__s || 1);
  ctx.shadowOffsetY = 14 * (ctx.__s || 1);
  outline();
  const tiles = ctx.createLinearGradient(0, top, 0, eave);
  tiles.addColorStop(0, '#4E211A');
  tiles.addColorStop(0.55, '#6E3122');
  tiles.addColorStop(1, '#3A1610');
  ctx.fillStyle = tiles;
  ctx.fill();
  ctx.restore();

  ctx.save();
  outline();
  ctx.clip();
  // tile ribs, fanning out from the ridge to the eave
  const n = Math.round(eaveW / 9);
  for (let i = 0; i <= n; i++) {
    const t = i / n - 0.5;
    ctx.strokeStyle = 'rgba(20, 6, 3, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(t * topW, top);
    ctx.quadraticCurveTo(t * (topW + (eaveW - topW) * 0.42), top + H * 0.66, t * eaveW, eave);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 170, 110, 0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(t * topW + 2, top);
    ctx.quadraticCurveTo(t * (topW + (eaveW - topW) * 0.42) + 2.5, top + H * 0.66, t * eaveW + 3, eave);
    ctx.stroke();
  }
  // the lanterns above light the roof's upper slope
  const light = ctx.createLinearGradient(0, top, 0, eave);
  light.addColorStop(0, 'rgba(255, 170, 100, 0.22)');
  light.addColorStop(0.5, 'rgba(255, 150, 90, 0.04)');
  light.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
  ctx.fillStyle = light;
  ctx.fillRect(el - 10, top, eaveW + 20, H);
  // and it falls off towards the sides
  const sides = ctx.createLinearGradient(el, 0, er, 0);
  sides.addColorStop(0, 'rgba(6, 2, 10, 0.45)');
  sides.addColorStop(0.3, 'rgba(6, 2, 10, 0)');
  sides.addColorStop(0.7, 'rgba(6, 2, 10, 0)');
  sides.addColorStop(1, 'rgba(6, 2, 10, 0.5)');
  ctx.fillStyle = sides;
  ctx.fillRect(el - 10, top, eaveW + 20, H);
  ctx.restore();

  // gilded ridge and eave trim
  ctx.fillStyle = foil(ctx, el, 0, er, 0, 'gold');
  ctx.fillRect(tl - 2, top - 3, topW + 4, 4);
  ctx.fillRect(el - 3, eave - 5, eaveW + 6, 5);
  ctx.fillStyle = 'rgba(40, 15, 0, 0.5)';
  ctx.fillRect(el - 3, eave - 1, eaveW + 6, 1);

  // bells hanging all along the eave, each on a short wire
  ctx.strokeStyle = 'rgba(200, 160, 90, 0.6)';
  ctx.lineWidth = 0.6;
  for (let x = el + 8; x <= er - 8; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, eave);
    ctx.lineTo(x, eave + 5);
    ctx.stroke();
    stamp(ctx, bell(6), x, eave + 9);
  }
  // a bigger bell at each corner
  stamp(ctx, bell(12), el - 4, eave + 6);
  stamp(ctx, bell(12), er + 4, eave + 6);
}

// The carved wooden struts (tunala) holding up each roof, seen in the dark
// recess between the wall and the eave.
function struts(ctx, { eave, eaveW, wallW }) {
  const depth = Math.min(70, (eaveW - wallW) * 0.42);
  const recess = ctx.createLinearGradient(0, eave - 4, 0, eave + depth);
  recess.addColorStop(0, 'rgba(10, 3, 2, 0.95)');
  recess.addColorStop(1, 'rgba(10, 3, 2, 0)');
  ctx.fillStyle = recess;
  ctx.fillRect(-wallW / 2 - 6, eave - 4, wallW + 12, depth);

  const count = Math.round(wallW / 22);
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count - 0.5; // -0.5 … 0.5
    const xTop = t * (eaveW - 30);
    const xBottom = t * wallW;
    const g = ctx.createLinearGradient(xTop - 4, 0, xTop + 4, 0);
    g.addColorStop(0, WOOD);
    g.addColorStop(0.5, WOOD_LIT);
    g.addColorStop(1, WOOD);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(xTop - 4, eave);
    ctx.lineTo(xTop + 4, eave);
    ctx.lineTo(xBottom + 3.5, eave + depth);
    ctx.lineTo(xBottom - 3.5, eave + depth);
    ctx.closePath();
    ctx.fill();
    // a carved figure: a small gold-lit knot half way down
    ctx.fillStyle = 'rgba(232, 181, 74, 0.55)';
    ctx.beginPath();
    ctx.arc((xTop + xBottom) / 2, eave + depth * 0.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

// A brick wall with carved windows (upper floors) or three doorways (ground).
function wall(ctx, top, bottom, width, level) {
  const x0 = -width / 2;
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, '#4A1B12');
  g.addColorStop(0.4, BRICK);
  g.addColorStop(1, '#5E2418');
  ctx.fillStyle = g;
  ctx.fillRect(x0, top, width, bottom - top);

  // brick courses
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, top, width, bottom - top);
  ctx.clip();
  ctx.strokeStyle = 'rgba(30, 8, 4, 0.28)';
  ctx.lineWidth = 0.7;
  for (let y = top + 4, row = 0; y < bottom; y += 5, row++) {
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x0 + width, y);
    ctx.stroke();
    for (let x = x0 + (row % 2) * 7; x < x0 + width; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
  // corners in shadow
  const sides = ctx.createLinearGradient(x0, 0, x0 + width, 0);
  sides.addColorStop(0, 'rgba(10, 3, 2, 0.55)');
  sides.addColorStop(0.25, 'rgba(10, 3, 2, 0)');
  sides.addColorStop(0.75, 'rgba(10, 3, 2, 0)');
  sides.addColorStop(1, 'rgba(10, 3, 2, 0.55)');
  ctx.fillStyle = sides;
  ctx.fillRect(x0, top, width, bottom - top);
  ctx.restore();

  const mid = (top + bottom) / 2 + 8;
  if (level === 0) window_(ctx, 0, mid, 34, 30);
  if (level === 1) {
    window_(ctx, -62, mid, 34, 32);
    window_(ctx, 0, mid, 40, 36);
    window_(ctx, 62, mid, 34, 32);
  }
  if (level === 2) {
    doorway(ctx, -92, bottom, 40, 92);
    doorway(ctx, 0, bottom, 54, 116, true);
    doorway(ctx, 92, bottom, 40, 92);
  }
}

// A carved Newari window: a wooden frame with long lintels and a lattice,
// lit warm from inside. (Named window_ because `window` is the browser's.)
function window_(ctx, x, y, w, h) {
  // light spilling onto the bricks
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const spill = ctx.createRadialGradient(x, y, 0, x, y, w * 1.6);
  spill.addColorStop(0, 'rgba(255, 150, 70, 0.28)');
  spill.addColorStop(1, 'rgba(255, 120, 50, 0)');
  ctx.fillStyle = spill;
  ctx.fillRect(x - w * 1.6, y - w * 1.6, w * 3.2, w * 3.2);
  ctx.restore();

  ctx.fillStyle = WOOD;
  ctx.fillRect(x - w / 2 - 12, y - h / 2 - 7, w + 24, 5); // lintel
  ctx.fillRect(x - w / 2 - 12, y + h / 2 + 2, w + 24, 5); // sill
  ctx.fillRect(x - w / 2 - 5, y - h / 2 - 4, w + 10, h + 8); // frame

  const inside = ctx.createRadialGradient(x, y + h * 0.15, 0, x, y, w * 0.8);
  inside.addColorStop(0, '#FFE1A0');
  inside.addColorStop(0.6, '#F49A44');
  inside.addColorStop(1, '#B4501E');
  ctx.fillStyle = inside;
  ctx.fillRect(x - w / 2, y - h / 2, w, h);

  // the lattice (a diagonal jali)
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - w / 2, y - h / 2, w, h);
  ctx.clip();
  ctx.strokeStyle = WOOD;
  ctx.lineWidth = 1.3;
  for (let d = -h; d < w + h; d += 6) {
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + d, y - h / 2);
    ctx.lineTo(x - w / 2 + d - h, y + h / 2);
    ctx.moveTo(x - w / 2 + d - h, y - h / 2);
    ctx.lineTo(x - w / 2 + d, y + h / 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(232, 181, 74, 0.35)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x - w / 2 - 2.5, y - h / 2 - 2.5, w + 5, h + 5);
}

// A doorway with a round top, glowing, with a gilded torana above the main one.
function doorway(ctx, x, bottom, w, h, main = false) {
  const top = bottom - h;
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(x - w / 2, bottom);
    ctx.lineTo(x - w / 2, top + w / 2);
    ctx.arc(x, top + w / 2, w / 2, Math.PI, 0);
    ctx.lineTo(x + w / 2, bottom);
    ctx.closePath();
  };
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const spill = ctx.createRadialGradient(x, bottom - h * 0.4, 0, x, bottom - h * 0.4, h * 1.2);
  spill.addColorStop(0, 'rgba(255, 160, 80, 0.32)');
  spill.addColorStop(1, 'rgba(255, 120, 50, 0)');
  ctx.fillStyle = spill;
  ctx.fillRect(x - h * 1.2, bottom - h * 1.6, h * 2.4, h * 2.4);
  ctx.restore();

  ctx.fillStyle = WOOD;
  ctx.save();
  ctx.translate(x, bottom);
  ctx.scale(1.28, 1.08);
  ctx.translate(-x, -bottom);
  shape();
  ctx.fill();
  ctx.restore();

  const inside = ctx.createLinearGradient(0, top, 0, bottom);
  inside.addColorStop(0, '#F7A24C');
  inside.addColorStop(0.7, '#FFD98F');
  inside.addColorStop(1, '#FFF0C8');
  ctx.fillStyle = inside;
  shape();
  ctx.fill();

  ctx.strokeStyle = foil(ctx, x - w, 0, x + w, 0, 'gold');
  ctx.lineWidth = 1.4;
  shape();
  ctx.stroke();

  if (main) {
    // the torana: a gilded half-wheel of carving above the door
    const cy = top - 4;
    const R = w * 0.95;
    ctx.save();
    ctx.fillStyle = foil(ctx, x - R, cy - R, x + R, cy, 'gold');
    ctx.beginPath();
    ctx.arc(x, cy, R, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(70, 35, 8, 0.55)';
    ctx.lineWidth = 0.8;
    for (let k = 0; k <= 12; k++) {
      const a = Math.PI + (k / 12) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * R * 0.3, cy + Math.sin(a) * R * 0.3);
      ctx.lineTo(x + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92);
      ctx.stroke();
    }
    for (const rr of [0.3, 0.62, 0.95]) {
      ctx.beginPath();
      ctx.arc(x, cy, R * rr, Math.PI, 0);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// The stepped stone base, with clay lamps along the edges.
function plinth(ctx) {
  STEPS.forEach((step, i) => {
    const next = STEPS[i + 1]?.y ?? PAGODA_HEIGHT;
    const x0 = -step.w / 2;
    // the step's tread (top surface) catches the light
    ctx.fillStyle = STONE_TOP;
    ctx.fillRect(x0, step.y, step.w, 7);
    // its riser (front face)
    const face = ctx.createLinearGradient(0, step.y + 7, 0, next);
    face.addColorStop(0, STONE);
    face.addColorStop(1, '#3E3029');
    ctx.fillStyle = face;
    ctx.fillRect(x0, step.y + 7, step.w, next - step.y - 7);
    ctx.fillStyle = 'rgba(255, 220, 170, 0.18)';
    ctx.fillRect(x0, step.y, step.w, 1);
  });
  // the steps up the middle, lit by the doorway
  const glow = ctx.createRadialGradient(0, STEPS[0].y, 0, 0, STEPS[0].y, 260);
  glow.addColorStop(0, 'rgba(255, 190, 110, 0.4)');
  glow.addColorStop(1, 'rgba(255, 160, 80, 0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = glow;
  ctx.fillRect(-300, STEPS[0].y - 60, 600, 320);
  ctx.restore();
  // clay lamp bowls (their flames are drawn live)
  for (const [x, y] of pagodaLamps(0, 0)) {
    ctx.fillStyle = '#7A3E1E';
    ctx.beginPath();
    ctx.ellipse(x, y - 1, 6, 3, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#C47A3A';
    ctx.fillRect(x - 6, y - 2, 12, 1.2);
  }
}

// ── The old town behind the temple ───────────────────────────────────────────

// A row of tiered Newari rooftops and houses, mostly in shadow, with a few
// warm windows. `y` = where their bases are; they're drawn down to `bottom`.
export function town(ctx, w, y, bottom, { seed = 4, color = '#1E1430', lit = 0.5 } = {}) {
  const r = seeded(seed);
  let x = -30;
  while (x < w + 30) {
    const width = 54 + r() * 70;
    const height = 70 + r() * 90;
    const top = y - height;
    // the house
    ctx.fillStyle = color;
    ctx.fillRect(x, top, width, bottom - top);
    // its roof, overhanging
    ctx.beginPath();
    ctx.moveTo(x - 10, top + 8);
    ctx.lineTo(x + width * 0.2, top - 16 - r() * 10);
    ctx.lineTo(x + width * 0.8, top - 16 - r() * 10);
    ctx.lineTo(x + width + 10, top + 8);
    ctx.closePath();
    ctx.fill();
    // a small pagoda roof now and then
    if (r() < 0.3) {
      const cx = x + width / 2;
      for (let k = 0; k < 2; k++) {
        const ty = top - 26 - k * 22;
        const tw = 46 - k * 16;
        ctx.beginPath();
        ctx.moveTo(cx - tw, ty + 14);
        ctx.lineTo(cx - tw * 0.4, ty);
        ctx.lineTo(cx + tw * 0.4, ty);
        ctx.lineTo(cx + tw, ty + 14);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(cx - tw * 0.35, ty + 14, tw * 0.7, 10);
      }
      ctx.fillStyle = 'rgba(232, 181, 74, 0.7)';
      ctx.fillRect(cx - 1, top - 84, 2, 14);
      ctx.fillStyle = color;
    }
    // lit windows
    for (let wy = top + 18; wy < y - 10; wy += 24) {
      for (let wx = x + 10; wx < x + width - 14; wx += 18) {
        if (r() > lit) continue;
        ctx.fillStyle = `rgba(255, ${150 + Math.round(r() * 60)}, 80, ${0.45 + r() * 0.45})`;
        ctx.fillRect(wx, wy, 6, 9);
      }
    }
    x += width - 6;
  }
}

// ── The courtyard ────────────────────────────────────────────────────────────

// The hiti seen from above at an angle: a stone basin whose sides spread
// out as they come nearer (that's what makes it look deep).
//   pool = { top, topW, spread }  – spread: how fast the sides widen
export function poolEdge(pool, y) {
  return pool.topW / 2 + Math.max(0, y - pool.top) * pool.spread;
}

// Where the lamps sit along the hiti's rim (page px), for their flames.
export function poolLamps(pool, w, bottom) {
  const lamps = [];
  const cx = w / 2;
  for (let x = cx - pool.topW / 2 + 14; x <= cx + pool.topW / 2 - 14; x += 26) lamps.push([x, pool.top + 6]);
  for (let y = pool.top + 40; y < bottom; y += 44 + (y - pool.top) * 0.05) {
    const half = poolEdge(pool, y) + 6;
    if (half > cx + 30) break; // off the screen
    lamps.push([cx - half, y], [cx + half, y]);
  }
  return lamps;
}

export function courtyard(ctx, w, top, bottom, pool) {
  const cx = w / 2;
  // brick paving: rows get taller as they come nearer the camera
  ctx.fillStyle = '#2E130D';
  ctx.fillRect(-20, top, w + 40, bottom - top);
  const r = seeded(17);
  let row = 0;
  for (let y = top; y < bottom; row++) {
    const h = 5 + ((y - top) / (bottom - top)) * 13;
    const len = h * 2.5;
    for (let x = -20 - (row % 2) * len * 0.5; x < w + 20; x += len) {
      const k = 0.75 + r() * 0.4;
      ctx.fillStyle = `rgb(${Math.round(112 * k)}, ${Math.round(46 * k)}, ${Math.round(32 * k)})`;
      ctx.fillRect(x + 0.7, y + 0.7, len - 1.4, h - 1.4);
    }
    y += h;
  }
  // lamp-light pooling in front of the temple; darker towards the edges
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const warm = ctx.createRadialGradient(cx, top + 60, 0, cx, top + 60, 380);
  warm.addColorStop(0, 'rgba(255, 160, 80, 0.32)');
  warm.addColorStop(1, 'rgba(255, 140, 60, 0)');
  ctx.fillStyle = warm;
  ctx.fillRect(-20, top, w + 40, 480);
  ctx.restore();
  const edges = ctx.createLinearGradient(0, 0, w, 0);
  edges.addColorStop(0, 'rgba(8, 3, 10, 0.65)');
  edges.addColorStop(0.28, 'rgba(8, 3, 10, 0)');
  edges.addColorStop(0.72, 'rgba(8, 3, 10, 0)');
  edges.addColorStop(1, 'rgba(8, 3, 10, 0.65)');
  ctx.fillStyle = edges;
  ctx.fillRect(-20, top, w + 40, bottom - top);

  // ── the hiti: stone terraces stepping down to the water ──
  const basin = (inset, drop = 0) => {
    const t = pool.top + inset * 0.9 + drop;
    ctx.beginPath();
    ctx.moveTo(cx - poolEdge(pool, t) + inset, t);
    ctx.lineTo(cx + poolEdge(pool, t) - inset, t);
    ctx.lineTo(cx + poolEdge(pool, bottom + 60) - inset, bottom + 60);
    ctx.lineTo(cx - poolEdge(pool, bottom + 60) + inset, bottom + 60);
    ctx.closePath();
  };
  const terraces = [
    [0, '#9C8064', '#6E5845'],
    [18, '#7C6450', '#54433A'],
    [34, '#5E4B3E', '#3E312B'],
  ];
  for (const [inset, light, dark] of terraces) {
    basin(inset);
    const g = ctx.createLinearGradient(0, pool.top, 0, pool.top + 600);
    g.addColorStop(0, light);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 220, 170, 0.28)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // the water, with the temple's warm light reflected in it
  ctx.save();
  basin(50);
  ctx.clip();
  water(ctx, -20, pool.top, w + 20, bottom + 60, { even: true });
  // the doorways' glow, stretched long and broken up by the ripples
  ctx.lineCap = 'round';
  for (let i = 0; i < 90; i++) {
    const t = i / 90;
    const y = pool.top + 60 + t * 520 + r() * 6;
    const half = (1 - t) * 40 * (0.4 + r() * 0.8);
    ctx.strokeStyle = `rgba(255, ${150 + Math.round(r() * 60)}, 80, ${((1 - t) * 0.45 * (0.5 + r() * 0.5)).toFixed(3)})`;
    ctx.lineWidth = 1 + r() * 2.2;
    const x = cx + (r() - 0.5) * 16;
    ctx.beginPath();
    ctx.moveTo(x - half, y);
    ctx.lineTo(x + half, y);
    ctx.stroke();
  }
  // soft orange reflections of lanterns, stretched long by the water
  for (let i = 0; i < 12; i++) {
    const x = cx + (r() - 0.5) * poolEdge(pool, pool.top + 400) * 1.5;
    const y = pool.top + 160 + r() * 900;
    const size = 8 + r() * 10;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, 2.6);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    g.addColorStop(0, 'rgba(255, 150, 60, 0.35)');
    g.addColorStop(1, 'rgba(255, 140, 60, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(-size, -size, size * 2, size * 2);
    ctx.restore();
  }
  // the stone wall's shadow on the water, at the top
  const shadow = ctx.createLinearGradient(0, pool.top + 44, 0, pool.top + 150);
  shadow.addColorStop(0, 'rgba(0, 10, 14, 0.75)');
  shadow.addColorStop(1, 'rgba(0, 10, 14, 0)');
  ctx.fillStyle = shadow;
  ctx.fillRect(-20, pool.top, w + 40, 170);
  ctx.restore();

  // clay lamp bowls along the rim (their flames are drawn live)
  for (const [x, y] of poolLamps(pool, w, bottom)) {
    ctx.fillStyle = '#6E3618';
    ctx.beginPath();
    ctx.ellipse(x, y, 6, 3, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#C47A3A';
    ctx.fillRect(x - 6, y - 1, 12, 1.2);
  }

  // the carved stone spout (dhunge dhara) in the top wall, with its stream
  spout(ctx, cx, pool.top + 30);
}

function spout(ctx, x, y) {
  // the stream of water falling from it
  const stream = ctx.createLinearGradient(0, y, 0, y + 70);
  stream.addColorStop(0, 'rgba(210, 240, 235, 0.85)');
  stream.addColorStop(1, 'rgba(160, 220, 215, 0)');
  ctx.fillStyle = stream;
  ctx.beginPath();
  ctx.moveTo(x - 3, y + 12);
  ctx.quadraticCurveTo(x - 3, y + 50, x - 6, y + 70);
  ctx.lineTo(x + 6, y + 70);
  ctx.quadraticCurveTo(x + 3, y + 50, x + 3, y + 12);
  ctx.fill();
  // ripples where it lands
  ctx.strokeStyle = 'rgba(200, 240, 230, 0.35)';
  ctx.lineWidth = 1;
  for (const rr of [8, 15, 23]) {
    ctx.beginPath();
    ctx.ellipse(x, y + 72, rr, rr * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // the makara head: gilded, with a curled snout
  ctx.fillStyle = foil(ctx, x - 16, y - 10, x + 16, y + 16, 'gold');
  ctx.beginPath();
  ctx.moveTo(x - 15, y - 8);
  ctx.quadraticCurveTo(x - 18, y + 8, x - 5, y + 12);
  ctx.quadraticCurveTo(x, y + 20, x + 5, y + 12);
  ctx.quadraticCurveTo(x + 18, y + 8, x + 15, y - 8);
  ctx.quadraticCurveTo(x, y - 16, x - 15, y - 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(60, 30, 8, 0.6)';
  ctx.beginPath();
  ctx.arc(x - 6, y - 1, 1.6, 0, Math.PI * 2);
  ctx.arc(x + 6, y - 1, 1.6, 0, Math.PI * 2);
  ctx.fill();
}

export { WATER };
