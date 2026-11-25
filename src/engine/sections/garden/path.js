// The stone path — the end of the garden chapter, where the date is
// written (the Christian invite's version of the Hindu pond, hero/pond.js).
//
// The camera has come down the path between the benches, and its pale
// stone, warm in the low sun, now fills the screen like the paper of a
// card. A fine gold wreath of leaves turns slowly under the words
// (SaveTheDate.jsx in dark ink, inside the round GoldArch), and rose petals
// drift down onto it. Below, chapter 2 begins where the path meets a
// border of flowers (gardenBorder in garden.js).
//
// pathLayers(T) gives the chapter these layers, timed by T (values of `p`):
//   T.water   – [from, to] the stone fills the screen
//   T.arrive  – [from, to] the wreath settles into place

import { smooth } from '../StoryScene';
import { petal, stamp, rand, seeded, foil } from '../../themes/draw';
import { STONE } from './garden';

const SPIN = 3; // degrees a second the wreath turns by itself

// The path's stone filling one screen: big slabs (we're right above them),
// their joints faint, warm light from the sunset across them.
function stoneSurface(ctx, w, top, bottom) {
  ctx.fillStyle = STONE;
  ctx.fillRect(-20, top, w + 40, bottom - top);
  const r = seeded(9);
  for (let i = 0; i < 900 * (w / 430); i++) {
    ctx.fillStyle = r() < 0.5 ? `rgba(255, 250, 240, ${0.05 + r() * 0.08})` : `rgba(140, 120, 95, ${0.04 + r() * 0.06})`;
    ctx.fillRect(r() * w, top + r() * (bottom - top), 1 + r() * 2, 1 + r() * 2);
  }
  ctx.strokeStyle = 'rgba(150, 130, 105, 0.22)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let y = top + 40; y < bottom; y += 230) {
    ctx.moveTo(-20, y);
    ctx.lineTo(w + 20, y);
    const offset = ((y - top) / 230) % 2 ? 0 : 160;
    for (let x = offset - 20; x < w + 20; x += 320) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 230);
    }
  }
  ctx.stroke();
  const light = ctx.createRadialGradient(w / 2, 470, 0, w / 2, 470, 560);
  light.addColorStop(0, 'rgba(255, 238, 210, 0.55)');
  light.addColorStop(1, 'rgba(255, 238, 210, 0)');
  ctx.fillStyle = light;
  ctx.fillRect(-20, top, w + 40, bottom - top);
}

// A wreath of leaves in fine gold: two sprigs curving round a circle,
// meeting at the bottom.
function wreath(ctx, cx, cy, R) {
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = foil(ctx, cx - R, cy - R, cx + R, cy + R, 'gold');
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = 1.2;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx, cy, R, Math.PI / 2 + side * 0.15, Math.PI / 2 + side * 2.9, side < 0);
    ctx.stroke();
    for (let k = 0; k < 26; k++) {
      const a = Math.PI / 2 + side * (0.3 + k * 0.1);
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R;
      for (const out of [-1, 1]) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a + Math.PI / 2 + side * 0.7 * out);
        const l = 16 - k * 0.25;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(l * 0.3, -l * 0.5 * out, 0, -l * out);
        ctx.quadraticCurveTo(-l * 0.3, -l * 0.5 * out, 0, 0);
        ctx.fill();
        ctx.restore();
      }
    }
  }
  ctx.restore();
}

export function pathLayers(T) {
  const arrive = (p) => smooth(T.arrive[0], T.arrive[1], p);

  return [
    {
      // the path's stone, filling the screen
      band: [-100, 1100],
      anchor: 'top',
      resolution: 0.75, // (the words on it are crisp text: the stone can be a little soft)
      paint(ctx, w) {
        stoneSurface(ctx, w, -100, 1100);
      },
      look: (p) => ({ y: -smooth(T.water[1], 1, p) * 50, opacity: smooth(T.water[0], T.water[1], p) }),
    },
    {
      // the gold wreath under the words: it turns slowly on its own, and
      // a little faster while you scroll
      band: [180, 760],
      paper: false,
      paint(ctx, w) {
        wreath(ctx, w / 2, 470, 250);
      },
      look: (p, t) => ({ rotate: t * SPIN + p * 60, scale: 0.9 + arrive(p) * 0.1, opacity: arrive(p) }),
    },
    {
      // petals drifting down onto the stone
      band: [0, 932],
      live: (w, h) => {
        const colors = ['#F2C9C0', '#FBF4EA', '#E8A598'];
        const make = (y) => ({ x: rand(0, w), y, size: Math.round(rand(9, 15)), color: colors[Math.floor(rand(0, 3))], fall: rand(10, 22), spin: rand(-0.6, 0.6), phase: rand(0, 6) });
        const petals = Array.from({ length: Math.round(12 * (w / 430)) }, () => make(rand(0, h)));
        return {
          draw(ctx, t, dt) {
            for (const p of petals) {
              p.y += p.fall * dt;
              if (p.y > h + 20) Object.assign(p, make(-20));
              stamp(ctx, petal(p.color, p.size), p.x + Math.sin(t * 0.7 + p.phase) * 18, p.y, { angle: p.phase + t * p.spin, alpha: 0.9 });
            }
          },
        };
      },
      look: (p) => ({ opacity: smooth(T.water[0] + 0.02, T.arrive[0] + 0.04, p) }),
    },
    {
      // just before the panel scrolls away, its bottom settles to the
      // stone's plain colour — chapter 2 starts on it (gardenBorder)
      fill: STONE,
      anchor: 'bottom',
      mask: 'linear-gradient(0deg, black 0px, transparent 260px)',
      paper: 'left bottom',
      look: (p) => ({ opacity: smooth(0.9, 1, p) }),
    },
  ];
}
