// Paper-cut illustration kit for the sections.
//
// The look: layers of cut paper stacked on top of each other, each one
// casting a soft shadow on the layer behind it (see `paper`). Shapes are
// Nepali: the Himalaya, Patan's temples, a Newari palace with carved
// windows, brass kalash, cusped arches, diyos and sky lanterns.

import { seeded, foil, shade, sprite } from '../themes/draw';
import { pagoda, stupa } from '../themes/silhouettes';

// Draw something as a sheet of cut paper: it casts a soft shadow downwards.
export function paper(ctx, draw, { color = 'rgba(30, 8, 10, 0.38)', blur = 14, y = 6 } = {}) {
  const s = ctx.__s || 1; // canvas shadows ignore the transform, so scale them ourselves
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur * s;
  ctx.shadowOffsetY = y * s;
  draw();
  ctx.restore();
}

// ── Landscape ────────────────────────────────────────────────────────────────

// A mountain range with snow caps. Filled down to `bottom`.
export function mountains(ctx, w, baseY, height, bottom, { color, snow = 'rgba(255, 248, 240, 0.92)', seed = 3, peaks = 5 }) {
  const r = seeded(seed);
  const points = [];
  const step = (w + 80) / (peaks * 2);
  for (let i = 0; i <= peaks * 2; i++) {
    const peak = i % 2 === 1;
    const y = peak ? baseY - height * (0.6 + r() * 0.4) : baseY - height * (0.12 + r() * 0.28);
    points.push([-40 + i * step, y]);
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-40, bottom);
  points.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.lineTo(w + 40, bottom);
  ctx.closePath();
  ctx.fill();

  // snow caps: the top quarter of every peak, with a jagged lower edge
  ctx.fillStyle = snow;
  for (let i = 1; i < points.length - 1; i += 2) {
    const [px, py] = points[i];
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i + 1];
    const t = 0.28;
    const left = [px + (ax - px) * t, py + (ay - py) * t];
    const right = [px + (bx - px) * t, py + (by - py) * t];
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(...left);
    ctx.lineTo(left[0] + (right[0] - left[0]) * 0.3, left[1] - 6);
    ctx.lineTo(left[0] + (right[0] - left[0]) * 0.5, left[1] + 4);
    ctx.lineTo(left[0] + (right[0] - left[0]) * 0.75, right[1] - 5);
    ctx.lineTo(...right);
    ctx.closePath();
    ctx.fill();
  }
}

// A shikhara temple (like Patan's Krishna Mandir): stepped plinth, a curved
// tower, little pavilions either side, a pinnacle.
export function shikhara(ctx, x, baseY, height) {
  const w = height * 0.42;
  ctx.beginPath();
  ctx.rect(x - w * 0.62, baseY - height * 0.07, w * 1.24, height * 0.07);
  ctx.rect(x - w * 0.5, baseY - height * 0.15, w, height * 0.08);
  ctx.moveTo(x - w * 0.36, baseY - height * 0.15);
  ctx.bezierCurveTo(x - w * 0.34, baseY - height * 0.6, x - w * 0.12, baseY - height * 0.84, x, baseY - height * 0.9);
  ctx.bezierCurveTo(x + w * 0.12, baseY - height * 0.84, x + w * 0.34, baseY - height * 0.6, x + w * 0.36, baseY - height * 0.15);
  ctx.closePath();
  ctx.rect(x - 1.5, baseY - height, 3, height * 0.11);
  for (const side of [-1, 1]) {
    const cx = x + side * w * 0.48;
    ctx.rect(cx - w * 0.11, baseY - height * 0.33, w * 0.22, height * 0.18);
    ctx.moveTo(cx - w * 0.15, baseY - height * 0.33);
    ctx.lineTo(cx, baseY - height * 0.43);
    ctx.lineTo(cx + w * 0.15, baseY - height * 0.33);
    ctx.closePath();
  }
  ctx.fill();
}

// A skyline of Kathmandu-valley temples standing on `baseY`.
export function templeSkyline(ctx, w, baseY, bottom, color) {
  ctx.fillStyle = color;
  ctx.fillRect(-10, baseY - 4, w + 20, bottom - baseY + 4);
  stupa(ctx, w * 0.12, baseY, 70);
  pagoda(ctx, w * 0.3, baseY, 150);
  shikhara(ctx, w * 0.52, baseY, 175);
  pagoda(ctx, w * 0.72, baseY, 120);
  pagoda(ctx, w * 0.9, baseY, 165);
}

// A Newari palace: tiled roof on carved struts, brick wall, carved lattice
// windows, and a glowing doorway in the middle.
export function palace(ctx, w, top, bottom) {
  const roofH = 40;
  // roof
  ctx.fillStyle = '#3F2420';
  ctx.beginPath();
  ctx.moveTo(-20, top + roofH);
  ctx.lineTo(10, top);
  ctx.lineTo(w - 10, top);
  ctx.lineTo(w + 20, top + roofH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 210, 170, 0.12)';
  ctx.lineWidth = 1;
  for (let y = top + 7; y < top + roofH; y += 7) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // wall
  const wallTop = top + roofH;
  const wall = ctx.createLinearGradient(0, wallTop, 0, bottom);
  wall.addColorStop(0, '#8E3B2A');
  wall.addColorStop(1, '#6A2A1F');
  ctx.fillStyle = wall;
  ctx.fillRect(0, wallTop, w, bottom - wallTop);
  // brick courses
  ctx.strokeStyle = 'rgba(40, 10, 5, 0.18)';
  ctx.lineWidth = 0.6;
  for (let y = wallTop + 6, row = 0; y < bottom; y += 6, row++) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    for (let x = (row % 2) * 9; x < w; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  // carved struts under the roof
  ctx.strokeStyle = '#2A1410';
  ctx.lineWidth = 3;
  for (let x = 18; x < w; x += 34) {
    ctx.beginPath();
    ctx.moveTo(x, wallTop + 22);
    ctx.lineTo(x + 12, wallTop);
    ctx.stroke();
  }

  // carved lattice windows
  const windowRow = (y, size, count, skipMiddle) => {
    const gap = w / count;
    for (let i = 0; i < count; i++) {
      if (skipMiddle && i === Math.floor(count / 2)) continue;
      const cx = gap * (i + 0.5);
      const ww = size;
      const wh = size * 1.25;
      ctx.fillStyle = '#2A1410';
      ctx.fillRect(cx - ww / 2 - 6, y - 4, ww + 12, 6); // lintel with wings
      ctx.fillRect(cx - ww / 2, y, ww, wh);
      ctx.strokeStyle = 'rgba(214, 170, 96, 0.55)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(cx - ww / 2 + 3, y + 3, ww - 6, wh - 6);
      ctx.beginPath();
      for (let k = 1; k < 4; k++) {
        ctx.moveTo(cx - ww / 2 + 3 + ((ww - 6) * k) / 4, y + 3);
        ctx.lineTo(cx - ww / 2 + 3 + ((ww - 6) * k) / 4, y + wh - 3);
        ctx.moveTo(cx - ww / 2 + 3, y + 3 + ((wh - 6) * k) / 4);
        ctx.lineTo(cx + ww / 2 - 3, y + 3 + ((wh - 6) * k) / 4);
      }
      ctx.stroke();
    }
  };
  windowRow(wallTop + 36, 30, 7, true);

  // the doorway: warm lamplight inside
  const dw = 70;
  const dTop = wallTop + 70;
  const doorway = () => {
    ctx.beginPath();
    ctx.moveTo(w / 2 - dw / 2, bottom);
    ctx.lineTo(w / 2 - dw / 2, dTop + 30);
    ctx.quadraticCurveTo(w / 2 - dw / 2, dTop, w / 2, dTop - 8);
    ctx.quadraticCurveTo(w / 2 + dw / 2, dTop, w / 2 + dw / 2, dTop + 30);
    ctx.lineTo(w / 2 + dw / 2, bottom);
    ctx.closePath();
  };
  doorway();
  ctx.lineWidth = 12; // carved wooden frame
  ctx.strokeStyle = '#2A1410';
  ctx.stroke();
  const light = ctx.createRadialGradient(w / 2, bottom - 30, 4, w / 2, bottom - 30, 90);
  light.addColorStop(0, '#FFE2A6');
  light.addColorStop(0.4, '#F2A24A');
  light.addColorStop(1, '#5E2414');
  ctx.fillStyle = light;
  ctx.fill();
}

// A stone ledge with a row of clay diyos on it (flames are drawn by `flames`).
// Returns where the flames go.
export function diyoLedge(ctx, w, y, bottom, count = 9) {
  ctx.fillStyle = '#3A1C16';
  ctx.fillRect(-10, y, w + 20, bottom - y);
  ctx.fillStyle = '#4B261E';
  ctx.fillRect(-10, y, w + 20, 6);
  const flames = [];
  for (let i = 0; i < count; i++) {
    const x = (w / count) * (i + 0.5);
    const g = ctx.createLinearGradient(x - 12, 0, x + 12, 0);
    g.addColorStop(0, '#8A4A2C');
    g.addColorStop(0.5, '#C7774A');
    g.addColorStop(1, '#7A3E24');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 13, y - 9);
    ctx.lineTo(x + 13, y - 9);
    ctx.quadraticCurveTo(x + 11, y + 2, x, y + 2);
    ctx.quadraticCurveTo(x - 11, y + 2, x - 13, y - 9);
    ctx.fill();
    flames.push([x, y - 11]);
  }
  return flames;
}

// ── Ornaments ────────────────────────────────────────────────────────────────

// A cusped arch (as in Newari and Mughal doorways), as a frame band of
// maroon paper with gold edges. The opening is left clear.
export function cuspedArch(ctx, cx, top, width, bottom, { band = 22, fill = '#6E1E26' } = {}) {
  const shape = (inset) => {
    const L = cx - width / 2 + inset;
    const R = cx + width / 2 - inset;
    const shoulder = top + width * 0.42;
    const apex = top + inset;
    const lobes = 3;
    ctx.moveTo(L, bottom);
    ctx.lineTo(L, shoulder);
    // left side of the arch: a few small lobes up to the apex
    for (let i = 0; i < lobes; i++) {
      const t0 = i / lobes;
      const t1 = (i + 1) / lobes;
      const p = (t) => [L + (cx - L) * Math.sin((t * Math.PI) / 2), shoulder - (shoulder - apex) * (1 - Math.cos((t * Math.PI) / 2))];
      const [x0, y0] = p(t0);
      const [x1, y1] = p(t1);
      ctx.quadraticCurveTo((x0 + x1) / 2 - 8, (y0 + y1) / 2 - 8, x1, y1);
    }
    for (let i = lobes - 1; i >= 0; i--) {
      const t0 = (i + 1) / lobes;
      const t1 = i / lobes;
      const p = (t) => [R - (R - cx) * Math.sin((t * Math.PI) / 2), shoulder - (shoulder - apex) * (1 - Math.cos((t * Math.PI) / 2))];
      const [x0, y0] = p(t0);
      const [x1, y1] = p(t1);
      ctx.quadraticCurveTo((x0 + x1) / 2 + 8, (y0 + y1) / 2 - 8, x1, y1);
    }
    ctx.lineTo(R, bottom);
  };

  // a band of paper between the outer outline (`band` px further out) and
  // the opening — 'evenodd' leaves the opening empty
  paper(ctx, () => {
    ctx.beginPath();
    shape(-band);
    ctx.closePath();
    shape(0);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill('evenodd');
  });
  // gold edges
  for (const [inset, widthPx] of [[0, 1.4], [-band, 1.2], [-band / 2, 0.6]]) {
    ctx.beginPath();
    shape(inset);
    ctx.strokeStyle = foil(ctx, cx - width / 2, top, cx + width / 2, bottom, 'gold');
    ctx.lineWidth = widthPx;
    ctx.stroke();
  }
}

// A brass purna kalash with mango leaves, a coconut and a red thread.
export function kalash(ctx, x, baseY, size) {
  const s = size;
  const brass = foil(ctx, x - s * 0.4, 0, x + s * 0.4, 0, 'gold');
  // leaves fanning out of the neck
  const leafPath = (angle, length) => {
    ctx.save();
    ctx.translate(x, baseY - s * 0.82);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * 0.22, -length * 0.5, 0, -length);
    ctx.quadraticCurveTo(-length * 0.22, -length * 0.5, 0, 0);
    const g = ctx.createLinearGradient(-length * 0.2, 0, length * 0.2, 0);
    g.addColorStop(0, '#3E5A26');
    g.addColorStop(1, '#6E8C3E');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  };
  [-1.1, -0.7, -0.3, 0.3, 0.7, 1.1].forEach((a) => leafPath(a, s * 0.42));
  // coconut
  ctx.fillStyle = '#6B4425';
  ctx.beginPath();
  ctx.ellipse(x, baseY - s * 0.92, s * 0.15, s * 0.17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30, 15, 5, 0.45)';
  ctx.lineWidth = 0.7;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 3, baseY - s * 1.07);
    ctx.quadraticCurveTo(x + i * 5, baseY - s * 0.92, x + i * 3, baseY - s * 0.77);
    ctx.stroke();
  }
  // pot
  ctx.fillStyle = brass;
  ctx.beginPath();
  ctx.ellipse(x, baseY - s * 0.04, s * 0.2, s * 0.05, 0, 0, Math.PI * 2); // foot
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, baseY - s * 0.36, s * 0.34, s * 0.3, 0, 0, Math.PI * 2); // body
  ctx.fill();
  ctx.fillRect(x - s * 0.12, baseY - s * 0.78, s * 0.24, s * 0.16); // neck
  ctx.beginPath();
  ctx.ellipse(x, baseY - s * 0.78, s * 0.2, s * 0.045, 0, 0, Math.PI * 2); // rim
  ctx.fill();
  // red and white thread (mauli) round the shoulder, and a tika
  ctx.strokeStyle = '#B3202A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, baseY - s * 0.5, s * 0.3, s * 0.06, 0, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 245, 230, 0.8)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = '#B3202A';
  ctx.beginPath();
  ctx.arc(x, baseY - s * 0.34, s * 0.04, 0, Math.PI * 2);
  ctx.fill();
}

// ── Moving things (sprites for the motion canvas) ────────────────────────────

// A glowing paper sky lantern.
export function skyLantern(size) {
  return sprite(`skylantern-${size}`, size, size * 1.5, (ctx) => {
    const w = size * 0.36;
    const h = size * 0.52;
    ctx.beginPath();
    ctx.moveTo(-w * 0.8, -h);
    ctx.lineTo(w * 0.8, -h);
    ctx.quadraticCurveTo(w * 1.05, 0, w * 0.62, h);
    ctx.lineTo(-w * 0.62, h);
    ctx.quadraticCurveTo(-w * 1.05, 0, -w * 0.8, -h);
    ctx.closePath();
    const g = ctx.createRadialGradient(0, h * 0.6, 0, 0, 0, h * 1.5);
    g.addColorStop(0, '#FFF4CF');
    g.addColorStop(0.45, '#F9B055');
    g.addColorStop(1, '#B9481C');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 40, 10, 0.35)';
    ctx.lineWidth = 0.6;
    for (const t of [-0.45, 0, 0.45]) {
      ctx.beginPath();
      ctx.moveTo(t * w * 1.6, -h);
      ctx.lineTo(t * w * 1.25, h);
      ctx.stroke();
    }
    ctx.fillStyle = '#FFF8E0';
    ctx.beginPath();
    ctx.ellipse(0, h * 0.85, w * 0.22, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

// One flickering diyo flame (with its glow) at (x, y). `t` = time.
export function flame(ctx, x, y, t, seed = 0) {
  const flicker = 1 + Math.sin(t * 11 + seed * 3.1) * 0.08 + Math.sin(t * 17 + seed) * 0.05;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(x, y - 4, 0, x, y - 4, 30 * flicker);
  glow.addColorStop(0, 'rgba(255, 190, 90, 0.55)');
  glow.addColorStop(1, 'rgba(255, 150, 60, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 32, y - 36, 64, 64);
  ctx.restore();
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, flicker);
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.bezierCurveTo(5, -5, 4, 0, 0, 1);
  ctx.bezierCurveTo(-4, 0, -5, -5, 0, -12);
  const g = ctx.createLinearGradient(0, -12, 0, 1);
  g.addColorStop(0, '#FFF2B8');
  g.addColorStop(0.6, '#FFB347');
  g.addColorStop(1, '#E2621B');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

// Tint helper re-exported for sections.
export { shade };
