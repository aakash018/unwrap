// Surfaces for the wedding story: what the "paper" of each chapter is made of.
//
//   paintedSky – a gouache night sky: a deep gradient with thousands of soft
//                brush strokes, so it reads as painted, not as a flat colour
//   GRAIN      – film grain laid over a whole chapter (a CSS background)
//   VIGNETTE   – darker corners, like a lens
//   velvet     – maroon velvet: soft folds and a sheen
//   silk       – coloured silk paper with a woven damask motif
//   water      – the courtyard pool's water: dark teal with painted ripples
//
// Everything here is drawn once (in a layer's `paint`) and then only moved.

import { seeded } from '../themes/draw';

// ── Sky ──────────────────────────────────────────────────────────────────────

// The sky from `top` to `bottom`. `stops` = [[0, '#..'], [0.5, '#..'], …]
// `strokes` = [colour, colour, …]: the brush colours (rgb, without alpha).
export function paintedSky(ctx, w, top, bottom, { stops, strokes, count = 1800, seed = 3, stars = 0 }) {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  stops.forEach(([at, color]) => g.addColorStop(at, color));
  ctx.fillStyle = g;
  ctx.fillRect(-20, top, w + 40, bottom - top);

  // brush strokes: mostly sideways, soft, overlapping, like gouache
  const r = seeded(seed);
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = r() * (w + 60) - 30;
    const y = top + r() * (bottom - top);
    const length = 12 + r() * 40;
    const angle = (r() - 0.5) * 2.2; // every direction, like a loose brush
    const bend = (r() - 0.5) * 18;
    // brush colour depends on height: the list runs top → bottom
    const band = Math.min(strokes.length - 1, Math.floor(((y - top) / (bottom - top)) * strokes.length + (r() - 0.5) * 1.4));
    const rgb = strokes[Math.max(0, band)];
    ctx.strokeStyle = `rgba(${rgb}, ${0.025 + r() * 0.06})`;
    ctx.lineWidth = 4 + r() * 12;
    const dx = Math.cos(angle) * length;
    const dy = Math.sin(angle) * length;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + dx / 2, y + dy / 2 + bend, x + dx, y + dy);
    ctx.stroke();
  }
  ctx.restore();

  // a few faint stars near the top
  ctx.fillStyle = '#FFF4DC';
  for (let i = 0; i < stars; i++) {
    const y = top + r() ** 1.6 * (bottom - top) * 0.6;
    ctx.globalAlpha = 0.15 + r() * 0.55;
    const s = 0.6 + r() * 1.3;
    ctx.fillRect(r() * w, y, s, s);
  }
  ctx.globalAlpha = 1;
}

// ── Over everything ──────────────────────────────────────────────────────────

// Film grain: grey noise, laid over a chapter with mix-blend-mode 'overlay'.
export const GRAIN =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E` +
  `%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E` +
  `%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .55 0'/%3E%3C/filter%3E` +
  `%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E") 0 0 / 220px 220px`;

// Darker sides only (top and bottom untouched, so two chapters can meet
// without a line between them).
export const sidesOf = (rgb = '4, 8, 26', strength = 0.5) =>
  `linear-gradient(90deg, rgba(${rgb}, ${strength}) 0%, rgba(${rgb}, 0) 30%, rgba(${rgb}, 0) 70%, rgba(${rgb}, ${strength}) 100%)`;

// Darker corners, like an old lens (rgb = the colour of the dark).
export const vignetteOf = (rgb = '4, 8, 26', strength = 0.6) =>
  `radial-gradient(120% 85% at 50% 42%, rgba(${rgb}, 0) 52%, rgba(${rgb}, ${strength}) 100%)`;

// ── Fabrics and papers ───────────────────────────────────────────────────────

// Maroon velvet hanging in soft folds, from `top` to `bottom`.
export function velvet(ctx, w, top, bottom, { from = '#5A1520', to = '#3A0C14', fold = 46, seed = 8 } = {}) {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  ctx.fillStyle = g;
  ctx.fillRect(-20, top, w + 40, bottom - top);

  // folds: each one dark at its edges and catching light at its crest
  const r = seeded(seed);
  for (let x = -fold; x < w + fold; x += fold * (0.75 + r() * 0.5)) {
    const width = fold * (0.8 + r() * 0.6);
    const f = ctx.createLinearGradient(x, 0, x + width, 0);
    f.addColorStop(0, 'rgba(10, 0, 4, 0.26)');
    f.addColorStop(0.42, 'rgba(255, 170, 170, 0.06)');
    f.addColorStop(0.55, 'rgba(255, 200, 190, 0.09)');
    f.addColorStop(1, 'rgba(10, 0, 4, 0.26)');
    ctx.fillStyle = f;
    ctx.fillRect(x, top, width, bottom - top);
  }
  // the pile of the velvet: very fine vertical streaks
  ctx.save();
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 900; i++) {
    const x = r() * w;
    const y = top + r() * (bottom - top);
    ctx.strokeStyle = r() < 0.5 ? 'rgba(255, 190, 190, 0.035)' : 'rgba(0, 0, 0, 0.06)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 2, y + 20 + r() * 60);
    ctx.stroke();
  }
  ctx.restore();
}

// Soft suede in one colour (chapter 2's plain background): the colour
// itself, a faint damask pressed into it, cloudy patches where the nap
// lies differently, and the nap's fine short strokes.
export function suede(ctx, w, top, bottom, { base, light, dark, seed = 31 }) {
  silk(ctx, w, top, bottom, { base, light, dark, seed, motif: 96 });
  const r = seeded(seed);
  const area = (w / 430) * ((bottom - top) / 1000);
  for (let i = 0; i < 40 * area; i++) {
    const x = r() * w;
    const y = top + r() * (bottom - top);
    const radius = 90 + r() * 200;
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, r() < 0.5 ? 'rgba(120, 200, 200, 0.05)' : 'rgba(0, 10, 14, 0.1)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  ctx.save();
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 1600 * area; i++) {
    const x = r() * w;
    const y = top + r() * (bottom - top);
    const a = r() * Math.PI * 2;
    ctx.strokeStyle = r() < 0.5 ? 'rgba(170, 230, 225, 0.05)' : 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * 5, y + Math.sin(a) * 5);
    ctx.stroke();
  }
  ctx.restore();
}

// Coloured silk paper with a damask flower woven in a slightly lighter tone.
//   origin – the y the damask grid is measured from. Two pieces of silk
//            with origins at the same point of the page line up exactly.
//   sheen  – a soft highlight in the middle (leave off where silk has to
//            meet more silk)
export function silk(ctx, w, top, bottom, { base, light, dark, seed = 5, motif = 64, origin = top, sheen = false }) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(-20, top, w + 40, bottom - top);
  ctx.clip(); // never paint outside top…bottom
  ctx.fillStyle = base;
  ctx.fillRect(-20, top, w + 40, bottom - top);

  if (sheen) {
    const cy = top + (bottom - top) * 0.4;
    const g = ctx.createRadialGradient(w * 0.5, cy, 0, w * 0.5, cy, (bottom - top) * 0.45);
    g.addColorStop(0, light);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = g;
    ctx.fillRect(-20, top, w + 40, bottom - top);
    ctx.globalAlpha = 1;
  }

  // the woven damask (a four-petal flower with leaves, in a half-drop grid)
  ctx.save();
  ctx.strokeStyle = light;
  ctx.fillStyle = light;
  ctx.globalAlpha = 0.32;
  ctx.lineWidth = 1;
  const step = motif * 0.9;
  let row = Math.floor((top - origin) / step) - 1;
  for (let y = origin + row * step; y < bottom + motif; y += step, row++) {
    for (let x = Math.abs(row) % 2 ? motif / 2 : 0; x < w + motif; x += motif) {
      damaskFlower(ctx, x, y, motif * 0.32);
    }
  }
  ctx.restore();

  // fine fibres in a darker tone
  const r = seeded(seed);
  ctx.save();
  ctx.strokeStyle = dark;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 500; i++) {
    const x = r() * w;
    const y = top + r() * (bottom - top);
    const a = r() * Math.PI;
    const l = 4 + r() * 12;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore(); // the clip
}

function damaskFlower(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s * 0.35, -s * 0.2, s * 0.45, -s * 0.75, 0, -s);
    ctx.bezierCurveTo(-s * 0.45, -s * 0.75, -s * 0.35, -s * 0.2, 0, 0);
    ctx.stroke();
    // a small leaf between the petals
    ctx.save();
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.45);
    ctx.quadraticCurveTo(s * 0.12, -s * 0.62, 0, -s * 0.78);
    ctx.quadraticCurveTo(-s * 0.12, -s * 0.62, 0, -s * 0.45);
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ── Water ────────────────────────────────────────────────────────────────────

// Peacock-teal water seen from above: deep at the edges, lighter where the
// lantern light falls, with painted ripple strokes.
export const WATER = { deep: '#0A2F38', mid: '#11454E', light: '#1E6467', flat: '#11454E' };
// The garden pond's water (the Christian invite): deep sage. Chapter 2's
// sage suede starts in its `flat`.
export const GARDEN_WATER = { deep: '#26403B', mid: '#38574F', light: '#58776B', flat: '#38574F', glow: '150, 200, 180', ripple: '255, 215, 180' };

// `even: true` keeps one colour top to bottom (for water that has to meet
// more water without a seam).
// The water's surface filling one screen, with a pool of light in the
// middle. Chapter 1 ends on this picture and chapter 2 starts on it.
//   colors – another water (e.g. GARDEN_WATER), with its own `glow` rgb
export function waterSurface(ctx, w, top = -100, bottom = 1100, colors = WATER) {
  water(ctx, -20, top, w + 20, bottom, { count: 1100, seed: 21, even: true, colors });
  const glow = colors.glow ?? '70, 150, 145';
  const light = ctx.createRadialGradient(w / 2, 470, 0, w / 2, 470, 520);
  light.addColorStop(0, `rgba(${glow}, 0.5)`);
  light.addColorStop(1, `rgba(${glow}, 0)`);
  ctx.fillStyle = light;
  ctx.fillRect(-20, top, w + 40, bottom - top);
}

export function water(ctx, x0, top, x1, bottom, { seed = 13, count = 700, even = false, colors = WATER } = {}) {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, even ? colors.mid : colors.deep);
  g.addColorStop(0.35, colors.mid);
  g.addColorStop(1, colors.mid);
  ctx.fillStyle = g;
  ctx.fillRect(x0, top, x1 - x0, bottom - top);

  const r = seeded(seed);
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = x0 + r() * (x1 - x0);
    const y = top + r() * (bottom - top);
    const l = 10 + r() * 34;
    ctx.strokeStyle = r() < 0.6 ? `rgba(${colors.ripple ?? '120, 200, 190'}, ${0.03 + r() * 0.06})` : `rgba(0, 20, 26, ${0.06 + r() * 0.08})`;
    ctx.lineWidth = 1 + r() * 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + l / 2, y - 2 - r() * 3, x + l, y);
    ctx.stroke();
  }
  ctx.restore();
}
