// The pond — the end of chapter 1, where the date is written on the water.
//
// The camera has come down the temple into the courtyard and settled on
// the hiti's peacock-teal water. Right there, without scrolling on to
// another panel: lantern light shimmers on the water, marigold petals and
// leaf-boat lamps float by, a gold mandala turns under a fine gold arch
// (GoldArch.jsx),
// and the words of the invitation rise in (see SaveTheDate.jsx). Then, as
// you scroll on, the water calms at the bottom and becomes chapter 2's
// teal suede.
//
// pondLayers(T) gives the hero its pond layers, timed by T (values of `p`):
//   T.water   – [from, to] the water's surface fills the screen
//   T.arrive  – [from, to] the mandala settles into place

import { smooth } from '../StoryScene';
import { waterSurface, WATER } from '../texture';
import { mandala } from '../../themes/ornaments';
import { petal, stamp, rand, seeded } from '../../themes/draw';

// The velvet of chapter 2 (the celebrations) starts in this colour.
export const VELVET_TOP = '#5A1520';

const SPIN = 4; // degrees a second the mandala turns by itself (a full turn ≈ 1½ minutes)

export function pondLayers(T) {
  const arrive = (p) => smooth(T.arrive[0], T.arrive[1], p);

  return [
    {
      // the water's surface, filling the screen
      band: [-100, 1100],
      anchor: 'top',
      paint(ctx, w) {
        waterSurface(ctx, w);
      },
      look: (p) => ({ y: -smooth(T.water[1], 1, p) * 50, opacity: smooth(T.water[0], T.water[1], p) }),
    },
    {
      // the gold mandala under the words: it turns slowly on its own
      // (SPIN degrees a second), and faster while you scroll
      band: [180, 760],
      paint(ctx, w) {
        mandala(ctx, w / 2, 470, 270, { alpha: 0.22 });
      },
      look: (p, t) => ({ rotate: t * SPIN + p * 120, scale: 0.9 + arrive(p) * 0.1, opacity: arrive(p) }),
    },
    {
      // lantern light on the water, petals and little leaf-boat lamps
      band: [0, 932],
      live: (w, h) => {
        const r = seeded(3);
        const glints = Array.from({ length: 22 }, () => ({ x: r() * w, y: r() * h, len: 20 + r() * 60, speed: 0.5 + r(), phase: r() * 6 }));
        const colors = ['#E8862A', '#F2B33D', '#C2272D'];
        const makePetal = (x) => ({ x, y: rand(0, h), size: Math.round(rand(9, 15)), color: colors[Math.floor(rand(0, 3))], drift: rand(4, 10), spin: rand(-0.3, 0.3), phase: rand(0, 6) });
        const petals = Array.from({ length: 14 }, () => makePetal(rand(0, w)));
        const boats = [
          { x: 60, y: 760, speed: 6 },
          { x: 330, y: 150, speed: 4 },
          { x: 380, y: 820, speed: 5 },
        ];
        return {
          draw(ctx, t, dt) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            for (const g of glints) {
              const a = 0.12 + 0.12 * Math.sin(t * g.speed + g.phase);
              ctx.fillStyle = `rgba(255, 190, 110, ${a.toFixed(3)})`;
              const wobble = Math.sin(t * 1.3 + g.phase) * 6;
              ctx.fillRect(g.x - g.len / 2 + wobble, g.y, g.len, 1.5);
              ctx.fillRect(g.x - g.len / 4 - wobble, g.y + 5, g.len / 2, 1.2);
            }
            ctx.restore();
            for (const p of petals) {
              p.x += p.drift * dt;
              if (p.x > w + 20) Object.assign(p, makePetal(-20));
              stamp(ctx, petal(p.color, p.size), p.x, p.y + Math.sin(t * 0.6 + p.phase) * 4, { angle: p.phase + t * p.spin, alpha: 0.85 });
            }
            for (const b of boats) {
              b.x += b.speed * dt;
              if (b.x > w + 40) b.x = -40;
              leafBoat(ctx, b.x, b.y + Math.sin(t + b.x * 0.01) * 2, t);
            }
          },
        };
      },
      look: (p) => ({ opacity: smooth(T.water[0] + 0.02, T.arrive[0] + 0.04, p) }),
    },
    {
      // just before the panel scrolls away, the bottom of the water calms
      // to its flat colour — the colour chapter 2's suede starts with — so
      // there's no line where the two chapters meet
      fill: WATER.flat,
      anchor: 'bottom',
      mask: 'linear-gradient(0deg, black 0px, transparent 300px)',
      paper: 'left bottom',
      look: (p) => ({ opacity: smooth(0.9, 1, p) }),
    },
  ];
}

// A small clay lamp floating on a leaf, its flame flickering.
function leafBoat(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#2F5A2A';
  ctx.beginPath();
  ctx.ellipse(0, 3, 17, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9A5428';
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI);
  ctx.fill();
  const flicker = 1 + Math.sin(t * 12 + x) * 0.1;
  ctx.globalCompositeOperation = 'lighter';
  const halo = ctx.createRadialGradient(0, -5, 0, 0, -5, 34 * flicker);
  halo.addColorStop(0, 'rgba(255, 180, 90, 0.5)');
  halo.addColorStop(1, 'rgba(255, 150, 60, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(-36, -40, 72, 72);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#FFD27A';
  ctx.beginPath();
  ctx.moveTo(0, -11 * flicker);
  ctx.quadraticCurveTo(3.5, -3, 0, 0);
  ctx.quadraticCurveTo(-3.5, -3, 0, -11 * flicker);
  ctx.fill();
  ctx.restore();
}
