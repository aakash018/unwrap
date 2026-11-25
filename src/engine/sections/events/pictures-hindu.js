// The Hindu wedding invite's ceremony pictures (chapter 2), drawn in code.
// Each a little still life or scene, with one thing that moves:
//   thali    – a brass puja thali on maroon velvet, a lit diyo   (Tilak, Tika)
//   mehendi  – bangles, mehendi cones, marigolds on green silk   (Mehendi)
//   mandap   – the wedding mandap and its sacred fire             (Janti, Bibaha)
//   lanterns – sky lanterns rising over the old town at night     (Reception)
//   haldi    – a brass urli of turmeric paste, petals falling     (Haldi)
//   sangeet  – a dholak under twinkling string lights             (Sangeet)
//   jaimala  – two flower garlands, rose petals falling           (Jaimala, Swayambar)
//   puja     – a purna kalash between two diyos, incense rising   (Puja, Sagun)
//
// Each is `size` px square (shown cut into a circle): paint(ctx, size) draws
// the still part once; live(size) returns draw(ctx, t, dt) for the moving part.
// Which ceremony gets which: pictures.js.

import { velvet, silk } from '../texture';
import { foil, marigold, petal, leaf, edisonBulb, glow, stamp, seeded } from '../../themes/draw';
import { paper, flame, templeSkyline, kalash } from '../art';
import { mandap, mandapLights, sacredFire } from '../mandap';
import { litLantern } from '../lanterns';
import { blossom } from './flowers';
import { lamplight, scatter, diyo, bigFlame, fallingPetals } from './picture-kit';

// A brass puja thali: engraved rings, and on it sindoor, a tika bowl,
// a heap of rice, marigolds and a clay diyo in the middle.
function thali(ctx, x, y, R) {
  paper(ctx, () => {
    ctx.fillStyle = foil(ctx, x - R, y - R, x + R, y + R, 'gold');
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.fill();
  }, { color: 'rgba(0, 0, 0, 0.55)', blur: 18, y: 10 });
  ctx.fillStyle = 'rgba(90, 60, 20, 0.28)'; // the slightly sunk middle
  ctx.beginPath();
  ctx.arc(x, y, R * 0.82, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(70, 45, 10, 0.45)'; // engraved rings
  ctx.lineWidth = 0.8;
  for (const k of [0.92, 0.84, 0.3]) {
    ctx.beginPath();
    ctx.arc(x, y, R * k, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255, 240, 200, 0.5)'; // light catching the rim
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, R - 1, Math.PI * 1.1, Math.PI * 1.6);
  ctx.stroke();

  // sindoor: a soft mound of red powder
  const s = ctx.createRadialGradient(x - R * 0.38, y - R * 0.3, 0, x - R * 0.38, y - R * 0.3, R * 0.26);
  s.addColorStop(0, '#E8392A');
  s.addColorStop(0.7, '#B4231E');
  s.addColorStop(1, 'rgba(150, 20, 20, 0)');
  ctx.fillStyle = s;
  ctx.beginPath();
  ctx.arc(x - R * 0.38, y - R * 0.3, R * 0.26, 0, Math.PI * 2);
  ctx.fill();
  // a little brass bowl of tika paste
  paper(ctx, () => {
    ctx.fillStyle = foil(ctx, x + R * 0.2, y - R * 0.55, x + R * 0.6, y - R * 0.15, 'gold');
    ctx.beginPath();
    ctx.arc(x + R * 0.4, y - R * 0.36, R * 0.19, 0, Math.PI * 2);
    ctx.fill();
  }, { color: 'rgba(0, 0, 0, 0.4)', blur: 6, y: 3 });
  ctx.fillStyle = '#C42A22';
  ctx.beginPath();
  ctx.arc(x + R * 0.4, y - R * 0.36, R * 0.13, 0, Math.PI * 2);
  ctx.fill();
  // a heap of rice (akshata)
  const r = seeded(41);
  for (let i = 0; i < 80; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * R * 0.22;
    ctx.fillStyle = r() < 0.5 ? '#F4EAD2' : '#E6D6B4';
    ctx.beginPath();
    ctx.ellipse(x - R * 0.22 + Math.cos(a) * d, y + R * 0.4 + Math.sin(a) * d, 1.7, 0.85, a, 0, Math.PI * 2);
    ctx.fill();
  }
  stamp(ctx, marigold(Math.round(R * 0.14), 'saffron'), x + R * 0.5, y + R * 0.2);
  stamp(ctx, marigold(Math.round(R * 0.12), 'gold'), x + R * 0.3, y + R * 0.5);
  diyo(ctx, x + R * 0.02, y + R * 0.02, R * 0.17);
}
const thaliDiyo = (size) => [size / 2 + size * 0.36 * 0.02, size / 2 + 8 + size * 0.36 * 0.02 - 6];

// Bangles: a red glass one and two gold ones, overlapping.
function bangles(ctx, x, y, rr = 34) {
  const ring = (cx, cy, radius, stroke, width) => {
    paper(ctx, () => {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }, { color: 'rgba(0, 0, 0, 0.5)', blur: 8, y: 5 });
  };
  ring(x, y, rr, '#A8202A', 5);
  ring(x + 14, y + 10, rr - 1, foil(ctx, x - 20, y - 20, x + 50, y + 40, 'gold'), 4);
  ring(x + 26, y + 2, rr - 2, foil(ctx, x, y - 30, x + 60, y + 30, 'gold'), 3);
  ctx.strokeStyle = 'rgba(255, 220, 210, 0.45)'; // light on the glass
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, rr, Math.PI * 1.15, Math.PI * 1.45);
  ctx.stroke();
}

// A mehendi (henna) cone with a gold band round it.
function mehendiCone(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  paper(ctx, () => {
    const g = ctx.createLinearGradient(0, -10, 0, 10);
    g.addColorStop(0, '#5A4A22');
    g.addColorStop(0.5, '#7A6630');
    g.addColorStop(1, '#3E3216');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(78, -2);
    ctx.lineTo(80, 2);
    ctx.lineTo(0, 11);
    ctx.closePath();
    ctx.fill();
  }, { color: 'rgba(0, 0, 0, 0.5)', blur: 8, y: 6 });
  ctx.fillStyle = foil(ctx, 10, -10, 22, 10, 'gold');
  ctx.fillRect(12, -10, 8, 20);
  ctx.fillStyle = '#B4231E';
  ctx.fillRect(-3, -11, 4, 22); // the folded paper end
  ctx.restore();
}

// A brass bowl seen from above, with a shadow (fill it after).
function brassBowl(ctx, x, y, R) {
  paper(ctx, () => {
    ctx.fillStyle = foil(ctx, x - R, y - R, x + R, y + R, 'gold');
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.fill();
  }, { color: 'rgba(0, 0, 0, 0.5)', blur: 14, y: 8 });
  ctx.strokeStyle = 'rgba(70, 45, 10, 0.5)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x, y, R * 0.86, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 240, 200, 0.5)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, R - 1, Math.PI * 1.1, Math.PI * 1.6);
  ctx.stroke();
}

// A ring of flowers (a jaimala), drawn from angle a0 to a1.
function garlandRing(ctx, x, y, R, a0 = 0, a1 = Math.PI * 2, seed = 3) {
  const r = seeded(seed);
  const n = Math.round((R * (a1 - a0)) / 13);
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const px = x + Math.cos(a) * R;
    const py = y + Math.sin(a) * R;
    if (i % 4 === 1) stamp(ctx, blossom(20), px, py, { angle: r() * 6 });
    else stamp(ctx, marigold(10, i % 2 ? 'gold' : 'saffron'), px, py);
    if (i % 3 === 0) stamp(ctx, petal('#B4231E', 9), px + Math.cos(a) * 7, py + Math.sin(a) * 7, { angle: a });
  }
}

// Where the sangeet's string-light bulbs hang: two swags across the top.
const sangeetBulbs = (size) =>
  Array.from({ length: 9 }, (_, i) => {
    const x = size * (0.06 + i * 0.11);
    const t = (x / size) * 2 % 1;
    return [x, size * 0.17 + Math.sin(t * Math.PI) * size * 0.08];
  });

// ── The pictures ─────────────────────────────────────────────────────────────

// The mandap is drawn smaller so the canopy, pillars, seats and fire fit.
const MANDAP_SCALE = (size) => size / 560;
const MANDAP_TOP = -250; // (mandap px) so the picture starts at its valance

export const HINDU_PICTURES = {
  thali: {
    paint(ctx, size) {
      velvet(ctx, size, 0, size, { from: '#6A1A24', to: '#3A0C14', fold: 38 });
      scatter(ctx, size, 11);
      thali(ctx, size / 2, size / 2 + 8, size * 0.36);
      lamplight(ctx, size);
    },
    live: (size) => {
      const [x, y] = thaliDiyo(size);
      return (ctx, t) => bigFlame(ctx, x, y, t, 1.2);
    },
  },

  mehendi: {
    paint(ctx, size) {
      silk(ctx, size, 0, size, { base: '#3D5A2A', light: '#5E7D3E', dark: '#1E3014', motif: 46, sheen: true });
      scatter(ctx, size, 23, 22);
      mehendiCone(ctx, size * 0.12, size * 0.7, -0.38);
      mehendiCone(ctx, size * 0.2, size * 0.82, -0.12);
      bangles(ctx, size * 0.56, size * 0.36, 36);
      stamp(ctx, marigold(16, 'saffron'), size * 0.72, size * 0.7);
      stamp(ctx, marigold(13, 'gold'), size * 0.62, size * 0.78);
      stamp(ctx, marigold(12, 'saffron'), size * 0.27, size * 0.28);
      diyo(ctx, size * 0.66, size * 0.58, 14);
      lamplight(ctx, size, '255, 200, 120', 0.16);
    },
    live: (size) => (ctx, t) => bigFlame(ctx, size * 0.66, size * 0.58 - 6, t, 1.1, 2),
  },

  mandap: {
    paint(ctx, size) {
      // a dusk sky behind the canopy, warm where the fire is
      const g = ctx.createLinearGradient(0, 0, 0, size);
      g.addColorStop(0, '#24102E');
      g.addColorStop(0.55, '#5A1A2A');
      g.addColorStop(1, '#2A0E10');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const s = MANDAP_SCALE(size);
      ctx.save();
      ctx.scale(s, s);
      const shadows = ctx.__s;
      ctx.__s = (shadows || 1) * s;
      mandap(ctx, size / 2 / s, MANDAP_TOP);
      ctx.__s = shadows;
      ctx.restore();
      lamplight(ctx, size, '255, 150, 70', 0.1);
    },
    live: (size) => {
      const s = MANDAP_SCALE(size);
      const lights = mandapLights(size / 2 / s, MANDAP_TOP);
      return (ctx, t) => {
        ctx.save();
        ctx.scale(s, s);
        sacredFire(ctx, lights.fire[0], lights.fire[1], t, 0);
        lights.diyos.forEach(([x, y], i) => flame(ctx, x, y, t, i));
        ctx.restore();
      };
    },
  },

  lanterns: {
    paint(ctx, size) {
      const g = ctx.createLinearGradient(0, 0, 0, size);
      g.addColorStop(0, '#0E0A2A');
      g.addColorStop(0.6, '#2E1A48');
      g.addColorStop(0.85, '#6A2E3A');
      g.addColorStop(1, '#8A4A36');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const r = seeded(5);
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = `rgba(255, 240, 220, ${0.2 + r() * 0.5})`;
        const d = r() < 0.9 ? 1 : 1.6;
        ctx.fillRect(r() * size, r() * size * 0.7, d, d);
      }
      // the old town, small and dark against the glow
      const k = 0.42;
      ctx.save();
      ctx.scale(k, k);
      templeSkyline(ctx, size / k, size * 0.9 / k, size / k + 10, '#150B1E');
      ctx.restore();
    },
    live: (size) => {
      const r = seeded(17);
      const make = (y) => ({ x: size * (0.08 + r() * 0.84), y, s: 10 + r() ** 1.5 * 24, speed: 5 + r() * 7, phase: r() * 6 });
      const lanterns = Array.from({ length: 11 }, () => make(r() * size)).sort((a, b) => a.s - b.s);
      return (ctx, t, dt) => {
        for (const l of lanterns) {
          l.y -= l.speed * dt;
          if (l.y < -l.s * 2) Object.assign(l, make(size + l.s * 2));
          stamp(ctx, litLantern(Math.round(l.s)), l.x + Math.sin(t * 0.5 + l.phase) * 3, l.y, { angle: Math.sin(t * 0.4 + l.phase) * 0.05 });
        }
      };
    },
  },

  haldi: {
    paint(ctx, size) {
      silk(ctx, size, 0, size, { base: '#A86A14', light: '#D9A03A', dark: '#5E3806', motif: 46, sheen: true });
      scatter(ctx, size, 31, 18);
      // mango leaves tucked under the bowl
      for (const [x, y, a] of [[0.18, 0.3, -0.9], [0.78, 0.74, 2.3], [0.2, 0.72, -2.2]]) stamp(ctx, leaf(70, '#4F6B2E'), size * x, size * y, { angle: a });
      // the big brass urli, full of turmeric paste with swirls in it
      const [x, y, R] = [size * 0.47, size * 0.5, size * 0.3];
      brassBowl(ctx, x, y, R);
      const paste = ctx.createRadialGradient(x - R * 0.2, y - R * 0.2, 0, x, y, R * 0.8);
      paste.addColorStop(0, '#FAD258');
      paste.addColorStop(1, '#D99A12');
      ctx.fillStyle = paste;
      ctx.beginPath();
      ctx.arc(x, y, R * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(150, 90, 0, 0.35)';
      ctx.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.arc(x + 4, y - 2, R * (0.2 + k * 0.14), k, k + 3.4);
        ctx.stroke();
      }
      stamp(ctx, marigold(13, 'saffron'), x + R * 0.42, y + R * 0.3);
      stamp(ctx, marigold(11, 'gold'), x + R * 0.18, y + R * 0.52);
      // a little bowl of mustard oil, and fresh turmeric roots
      brassBowl(ctx, size * 0.8, size * 0.24, size * 0.09);
      ctx.fillStyle = '#C8902A';
      ctx.beginPath();
      ctx.arc(size * 0.8, size * 0.24, size * 0.07, 0, Math.PI * 2);
      ctx.fill();
      for (const [rx, ry, a] of [[0.24, 0.84, 0.3], [0.33, 0.88, -0.2]]) {
        paper(ctx, () => {
          ctx.fillStyle = '#9A5A22';
          for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            ctx.ellipse(size * rx + k * 9 * Math.cos(a), size * ry + k * 9 * Math.sin(a), 7, 5, a, 0, Math.PI * 2);
            ctx.fill();
          }
        }, { color: 'rgba(0, 0, 0, 0.4)', blur: 5, y: 3 });
        ctx.fillStyle = '#F2A020'; // the cut end
        ctx.beginPath();
        ctx.ellipse(size * rx - 6 * Math.cos(a), size * ry - 6 * Math.sin(a), 3.5, 4.5, a, 0, Math.PI * 2);
        ctx.fill();
      }
      lamplight(ctx, size, '255, 210, 120', 0.18);
    },
    live: (size) => fallingPetals(size, ['#E8862A', '#F2B33D', '#F7D25A'], 7, 4),
  },

  sangeet: {
    paint(ctx, size) {
      velvet(ctx, size, 0, size, { from: '#3A1440', to: '#1E0A26', fold: 34 });
      // the string lights: a wire in two swags, a bulb every so often
      ctx.strokeStyle = 'rgba(20, 8, 20, 0.9)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      sangeetBulbs(size).forEach(([x, y], i) => (i ? ctx.lineTo(x, y - 8) : ctx.moveTo(x, y - 8)));
      ctx.stroke();
      for (const [x, y] of sangeetBulbs(size)) stamp(ctx, edisonBulb(18), x, y);
      // the dholak, lying a little askew
      ctx.save();
      ctx.translate(size * 0.5, size * 0.66);
      ctx.rotate(-0.16);
      const L = size * 0.32;
      const end = size * 0.14;
      const mid = size * 0.17;
      paper(ctx, () => {
        const body = ctx.createLinearGradient(0, -mid, 0, mid);
        body.addColorStop(0, '#C23A2A');
        body.addColorStop(0.45, '#8E1B16');
        body.addColorStop(1, '#4A0A08');
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(-L, -end);
        ctx.quadraticCurveTo(0, -mid * 1.25, L, -end);
        ctx.lineTo(L, end);
        ctx.quadraticCurveTo(0, mid * 1.25, -L, end);
        ctx.closePath();
        ctx.fill();
      }, { color: 'rgba(0, 0, 0, 0.6)', blur: 16, y: 10 });
      // the tension ropes, zigzagging along it
      ctx.strokeStyle = 'rgba(245, 230, 200, 0.85)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let k = 0; k <= 14; k++) {
        const x = -L + (2 * L * k) / 14;
        const h = end + (mid - end) * Math.sin((Math.PI * k) / 14) * 1.1;
        ctx.lineTo(x, k % 2 ? h * 0.85 : -h * 0.85);
      }
      ctx.stroke();
      // gold bands and the two drum heads
      ctx.fillStyle = foil(ctx, 0, -mid, 0, mid, 'gold');
      for (const x of [-L * 0.82, L * 0.82]) ctx.fillRect(x - 3, -end * 1.06, 6, end * 2.12);
      for (const [x, dark] of [[-L, true], [L, false]]) {
        ctx.fillStyle = '#E8D8B8';
        ctx.beginPath();
        ctx.ellipse(x, 0, end * 0.32, end, 0, 0, Math.PI * 2);
        ctx.fill();
        if (dark) {
          ctx.fillStyle = '#2A1A14'; // the black syahi patch
          ctx.beginPath();
          ctx.ellipse(x, 0, end * 0.12, end * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      stamp(ctx, marigold(13, 'saffron'), size * 0.2, size * 0.86);
      stamp(ctx, marigold(11, 'gold'), size * 0.8, size * 0.84);
      scatter(ctx, size, 47, 12);
      lamplight(ctx, size, '255, 180, 110', 0.12);
    },
    // the bulbs glow and twinkle
    live: (size) => {
      const bulbs = sangeetBulbs(size);
      return (ctx, t) => {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        bulbs.forEach(([x, y], i) => stamp(ctx, glow(26), x, y + 3, { alpha: 0.55 + 0.35 * Math.sin(t * (1.3 + (i % 3) * 0.4) + i * 1.7) }));
        ctx.restore();
      };
    },
  },

  jaimala: {
    paint(ctx, size) {
      silk(ctx, size, 0, size, { base: '#7A1820', light: '#A8323A', dark: '#3E0A10', motif: 46, sheen: true });
      scatter(ctx, size, 53, 16);
      const R = size * 0.22;
      const [ax, bx, y] = [size * 0.38, size * 0.62, size * 0.48];
      // two garlands, linked like rings (B's left side goes under A)
      garlandRing(ctx, bx, y, R, Math.PI * 0.62, Math.PI * 1.38, 5);
      garlandRing(ctx, ax, y, R, 0, Math.PI * 2, 3);
      garlandRing(ctx, bx, y, R, -Math.PI * 0.62, Math.PI * 0.62, 7);
      // a strand hanging from the bottom of each
      for (const x of [ax, bx]) {
        for (let k = 1; k <= 4; k++) stamp(ctx, marigold(9, k % 2 ? 'gold' : 'saffron'), x, y + R + k * 14);
        stamp(ctx, blossom(18), x, y + R + 5 * 14);
      }
      lamplight(ctx, size, '255, 190, 140', 0.14);
    },
    live: (size) => fallingPetals(size, ['#C42A22', '#E8605A', '#F2B33D'], 8, 9),
  },

  puja: {
    paint(ctx, size) {
      velvet(ctx, size, 0, size, { from: '#4A1019', to: '#2A070C', fold: 40 });
      // a rangoli of petals and marigolds under the kalash
      const [cx, cy] = [size / 2, size * 0.76];
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2;
        stamp(ctx, petal(i % 2 ? '#E8862A' : '#D9604A', 12), cx + Math.cos(a) * size * 0.36, cy + Math.sin(a) * size * 0.11, { angle: a + Math.PI / 2 });
      }
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        stamp(ctx, marigold(9, i % 2 ? 'gold' : 'saffron'), cx + Math.cos(a) * size * 0.25, cy + Math.sin(a) * size * 0.075);
      }
      kalash(ctx, cx, cy, size * 0.5);
      diyo(ctx, size * 0.18, size * 0.8, 12);
      diyo(ctx, size * 0.82, size * 0.8, 12);
      // an incense stick in a little holder
      ctx.strokeStyle = '#5A2A12';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(size * 0.86, size * 0.62);
      ctx.lineTo(size * 0.8, size * 0.42);
      ctx.stroke();
      ctx.fillStyle = '#FF8A3A';
      ctx.beginPath();
      ctx.arc(size * 0.8, size * 0.42, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = foil(ctx, size * 0.83, 0, size * 0.89, 0, 'gold');
      ctx.fillRect(size * 0.83, size * 0.62, size * 0.06, 5);
      lamplight(ctx, size, '255, 170, 90', 0.2);
    },
    live: (size) => (ctx, t) => {
      bigFlame(ctx, size * 0.18, size * 0.8 - 6, t, 1, 1);
      bigFlame(ctx, size * 0.82, size * 0.8 - 6, t, 1, 3);
      // incense smoke, curling up and fading
      ctx.save();
      ctx.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = `rgba(235, 225, 230, ${0.16 - k * 0.04})`;
        ctx.lineWidth = 2 + k * 2;
        ctx.beginPath();
        for (let j = 0; j <= 20; j++) {
          const y = size * 0.42 - j * 6;
          const x = size * 0.8 + Math.sin(j * 0.45 - t * 1.4 + k) * (2 + j * 0.7);
          j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    },
  },
};
