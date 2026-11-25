// Marigold · सयपत्री
// Ivory handmade paper with fine fibres and a faint paisley (buta) damask,
// a gold-foil frame with a dotted inner line, and gold-foil quarter mandalas
// in the bottom corners. Lush marigold mala swags hang across the top like a
// toran — gold beads between the flowers, mango leaves at the knots, strands
// ending in brass bells with red silk tassels — all casting soft shadows on
// the paper. Rose and marigold petals drift down.

import { PAPER } from './paper';
import {
  marigold, petal, leaf, bell, tassel, goldBead, blurred,
  stamp, stampLifted, smoothLine, hangAngle, rand, pick,
} from './draw';
import { createDrift, createBursts, DEPTHS } from './particles';
import { fibres, pattern, motifs, vignette, foilFrame, mandala } from './ornaments';
import { scatter, himalaya, pagoda, stupa, lotus, diyo } from './silhouettes';
import { PAGE_HEIGHT } from '../config';

const THREAD = '#8E1F28';
const SILK = '#A3202E';
const PETALS = ['#9E1B2C', '#BE3444', '#D9707C', '#E2741A'];
const FLOWER_RADIUS = 11;
const SHADOW = { dx: 5, dy: 8, blur: 3, alpha: 0.28 };

const FLOWER = { mass: 1, radius: 9, grabRadius: 12, grabbable: true, wind: 0.15, drag: 0.02 };

export default {
  id: 'marigold',
  label: 'Marigold',
  nepali: 'सयपत्री',
  dark: false,
  ink: '#4A1C17',
  inkSoft: '#6E3E2E',
  background: [
    PAPER,
    'radial-gradient(120% 50% at 50% 0%, #FFFBF2 0%, rgba(255,251,242,0) 70%)',
    'linear-gradient(180deg, #FAF4E8 0%, #F1E4CC 100%)',
  ].join(', '),

  // Parallax layers, far → near: the Himalaya, then Kathmandu's temples in
  // front of it, then lotuses and diyos floating close by. Very faint.
  layers: [
    {
      depth: 0.15,
      // `screen` = how tall one screen is on the viewer's device: the range
      // and temples stand along the bottom of the first screen
      paint(ctx, area, w, h, screen = PAGE_HEIGHT) {
        ctx.fillStyle = 'rgba(176, 132, 80, 0.11)';
        himalaya(ctx, w, screen - 30, 320);
      },
    },
    {
      depth: 0.4,
      paint(ctx, area, w, h, screen = PAGE_HEIGHT) {
        ctx.fillStyle = 'rgba(150, 100, 55, 0.12)';
        const base = screen - 26;
        stupa(ctx, w * 0.09, base, 120);
        pagoda(ctx, w * 0.19, base, 175);
        pagoda(ctx, w * 0.71, base, 135);
        pagoda(ctx, w * 0.82, base, 205);
        stupa(ctx, w * 0.93, base, 96);
      },
    },
    {
      depth: 0.8,
      paint(ctx, area, w) {
        ctx.strokeStyle = 'rgba(176, 132, 60, 0.2)';
        scatter(area, w, { seed: 21, spacing: 300, edges: true }, (x, y, r) => lotus(ctx, x, y, 70 + r() * 40));
        ctx.fillStyle = 'rgba(205, 120, 40, 0.14)';
        scatter(area, w, { seed: 22, spacing: 360, edges: true }, (x, y) => diyo(ctx, x, y, 34));
      },
    },
  ],

  createScene(world, { calm }) {
    const W = world.width;

    // ── the mala: swags hanging between nails along the top, ~180px apart
    const swagCount = Math.max(3, Math.round(W / 180));
    const nails = Array.from({ length: swagCount + 1 }, (_, i) =>
      world.addPoint(-4 + (i * (W + 8)) / swagCount, 2, { pinned: true }),
    );
    const swags = [];
    for (let i = 0; i < nails.length - 1; i++) {
      swags.push(world.addRope(nails[i], nails[i + 1], 11, { sag: 1.26, droop: 44, point: FLOWER }));
    }

    // ── strands hanging straight down from every knot, each ending in a bell
    const innerNails = nails.slice(1, -1);
    const strandTops = [
      world.addPoint(12, 2, { pinned: true }),
      ...innerNails,
      world.addPoint(W - 12, 2, { pinned: true }),
    ];
    const strands = strandTops.map((top, i) => {
      const edge = i === 0 || i === strandTops.length - 1;
      const length = edge ? 92 : i % 2 ? 150 : 116;
      return world.addStrand(top, length, Math.round(length / 19), {
        point: FLOWER,
        end: { mass: 1.6, radius: 10, grabRadius: 14 },
      });
    });

    const drift = calm
      ? null
      : createDrift(world, {
          count: Math.round(W / 32),
          gravity: 0.12,
          make: () => ({ color: pick(PETALS), size: Math.round(rand(11, 18)), spinSpeed: rand(0.01, 0.04) }),
        });
    const bursts = createBursts(world);

    const tone = (i) => (i % 2 ? 'gold' : 'saffron');
    // one marigold with its shadow baked in (one draw per flower)
    const flower = (ctx, p, i) => stampLifted(ctx, marigold(FLOWER_RADIUS, tone(i)), p.x, p.y, {}, SHADOW);

    return {
      // Printed on the paper.
      backdrop(ctx, w, h) {
        fibres(ctx, w, h, { count: Math.round((w * h) / 1600) });
        pattern(ctx, w, h, { spacing: 92, alpha: 0.07, draw: motifs.paisley('#B48A3E') });
        vignette(ctx, w, h, 0.12, '90,60,20');
        foilFrame(ctx, w, h, { inset: 26, gap: 7, alpha: 0.9, dotted: true });
        mandala(ctx, 0, h, 300, { alpha: 0.9 });
        mandala(ctx, w, h, 300, { alpha: 0.9 });
      },

      update(time, dt) {
        drift?.update(time);
        bursts.update(dt);
      },

      burst(x, y) {
        bursts.spawn(x, y, 20, () => ({ color: pick(PETALS), size: Math.round(rand(11, 16)), spinSpeed: rand(0.05, 0.12) }), {
          speed: 7, gravity: 0.3, drag: 0.05, life: 2.6,
        });
      },

      draw(ctx) {
        for (const p of drift?.pieces ?? []) {
          const depth = DEPTHS[p.depth];
          let s = petal(p.color, p.size);
          if (depth.blur) s = blurred(s, depth.blur);
          stamp(ctx, s, p.p.x, p.p.y, {
            angle: p.spin,
            flip: Math.cos(p.spin * 1.3),
            scale: depth.scale,
            alpha: depth.alpha * 0.9,
          });
        }

        // 1. strands: thread, flowers, then a bell with a silk tassel
        for (const strand of strands) {
          smoothLine(ctx, strand, { color: THREAD, width: 1.2 });
          strand.slice(1, -1).forEach((p, i) => flower(ctx, p, i));
          const end = strand[strand.length - 1];
          const angle = hangAngle(strand[strand.length - 2], end);
          stampLifted(ctx, tassel(SILK, 26), end.x - Math.sin(angle) * 22, end.y + Math.cos(angle) * 22, { angle }, SHADOW);
          stampLifted(ctx, bell(18), end.x, end.y + 5, { angle }, SHADOW);
        }

        // 2. swags: leaves tucked under, thread, gold beads, flowers
        for (const swag of swags) {
          swag.forEach((p, i) => {
            if (i % 3 !== 2 || i === swag.length - 1) return;
            stampLifted(ctx, leaf(24), p.x, p.y + 14, { angle: Math.PI + hangAngle(swag[i - 1], p) * 0.3 }, SHADOW);
          });
          smoothLine(ctx, swag, { color: THREAD, width: 1.2 });
          for (let i = 1; i < swag.length - 2; i++) {
            const a = swag[i];
            const b = swag[i + 1];
            stamp(ctx, goldBead(2.6), (a.x + b.x) / 2, (a.y + b.y) / 2 + 1);
          }
          swag.slice(1, -1).forEach((p, i) => flower(ctx, p, i));
        }

        // 3. a fan of mango leaves and a big flower at each toran knot
        for (const nail of innerNails) {
          for (const a of [-0.6, 0, 0.6]) {
            stampLifted(ctx, leaf(30), nail.x + Math.sin(a) * 11, nail.y + 16, { angle: Math.PI - a }, SHADOW);
          }
          stampLifted(ctx, marigold(14, 'saffron'), nail.x, nail.y + 7, {}, SHADOW);
        }

        for (const p of bursts.pieces) {
          stamp(ctx, petal(p.color, p.size), p.p.x, p.p.y, { angle: p.spin, flip: Math.cos(p.spin), alpha: bursts.fade(p) });
        }
      },
    };
  },
};
