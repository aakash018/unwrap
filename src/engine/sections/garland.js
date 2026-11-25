// A marigold garland (mala) swagged across the page, with strands hanging
// at each nail, ending in a brass bell.
//
// The wedding story hangs it at the top of the couple chapter, once that
// chapter reaches the top of the screen. It moves in a soft breeze.

import { marigold, leaf, bell, crystal, stampLifted } from '../themes/draw';
import { rose } from './events/flowers';
import { World } from '../themes/physics';

// How many swags across a page `w` wide: three on a phone, more on wider
// screens, so each swag keeps the same graceful size.
export const swagsFor = (w) => Math.max(3, Math.round((w + 20) / 150));

// The garland's line at `x`: how low the swag hangs there.
export function swagY(w, x, y, { swags = swagsFor(w), sag = 56 } = {}) {
  const span = (w + 20) / swags;
  const t = (((x + 10) % span) + span) % span / span;
  return y + Math.sin(t * Math.PI) * sag;
}

// A breeze that comes and goes (px/s²) — slow swells with small gusts.
const breeze = (t) => 34 * Math.sin(t * 0.4) + 16 * Math.sin(t * 1.1 + 2) + 6 * Math.sin(t * 2.7);

const STEP = 1 / 60; // physics runs at a fixed 60 steps per second

// The garland as a LIVE layer with real physics (themes/physics.js): each
// swag is a rope of marigolds nailed up at both ends, and a strand hangs
// from each inner nail with a brass bell on the end. A soft breeze makes
// the swags sway and the strands swing; a tap gives them a little push.
//
//   live: swingingGarland(y)   – y = where it's nailed up (in the layer's px)
//
// `hangAt` (a value of the story's `p`): before it, the garland isn't
// there — it waits above the screen. When the story reaches it, the
// garland is hung up nail by nail from the middle outwards, and each swag
// falls, swings and settles by itself (real time, not tied to scrolling).
// Scrolling back above it takes the garland down again.
//
// `look: 'garden'` (the Christian invite) strings white and blush roses
// with soft green leaves, and hangs crystal drops instead of brass bells.
const RAISED = 320; // px above its place while it waits
const HANG_TIME = 0.55; // seconds for one nail to come down into place
const HANG_STAGGER = 0.09; // seconds between one nail and the next
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2); // slow, fast, slow

export function swingingGarland(nailY, { swags: fixedSwags, sag = 56, flower = 11, hangAt = -1, look = 'hindu' } = {}) {
  const garden = look === 'garden';
  return (w) => {
    const swags = fixedSwags ?? swagsFor(w);
    const world = new World(w, 2000);
    world.gravity = 700;
    const nails = Array.from({ length: swags + 1 }, (_, i) => world.addPoint(-10 + ((w + 20) / swags) * i, nailY, { pinned: true }));
    const flowerPoint = { mass: 1, wind: 0.5, drag: 0.04, bounded: false };

    // the swags: ropes that hang `sag` px low in the middle
    const ropes = [];
    for (let s = 0; s < swags; s++) {
      const span = nails[s + 1].x - nails[s].x;
      const segments = Math.round(span / (flower * 1.1));
      const length = 1 + (8 * sag * sag) / (3 * span * span); // a curve that drops `sag` px
      ropes.push(world.addRope(nails[s], nails[s + 1], segments, { sag: length, droop: sag, point: flowerPoint }));
    }
    // the strands, swinging more freely, with a heavier bell at the end
    const strands = nails.slice(1, -1).map((nail) =>
      world.addStrand(nail, 6 * flower * 1.5 + 12, 7, {
        point: { mass: 0.8, wind: 1.7, drag: 0.03, bounded: false },
        end: { mass: 2.2, wind: 1 },
      }),
    );
    for (let i = 0; i < 180; i++) world.step(STEP); // settle before anyone sees it

    // hanging it up: each nail's progress (0 = waiting above, 1 = in place),
    // and its turn — the middle nail first, then outwards
    const homeY = nails.map((n) => n.y);
    const turn = nails.map((n) => Math.round(Math.abs(n.x - w / 2) / ((w + 20) / swags)));
    let down = nails.map(() => 1);
    let hung = null; // not decided until the first frame
    let since = 0; // seconds since it started going up or down
    const moveAll = (dy) => {
      for (const p of world.points) {
        p.y += dy;
        p.py += dy;
      }
    };

    const shadow = { dx: 4, dy: 9, blur: 4, alpha: 0.45 };
    let pending = 0;

    return {
      // a tap near the garland gives it a little push
      tap(x, y) {
        for (const p of world.points) {
          if (p.pinned || Math.hypot(p.x - x, p.y - y) > 90) continue;
          p.px = p.x - (Math.random() - 0.5) * 8;
          p.py = p.y + 4;
        }
      },
      draw(ctx, t, dt, p) {
        const wantHung = p >= hangAt;
        if (hung === null || (wantHung !== hung && dt === 0)) {
          // first frame (or reduced motion): just be there, or not, settled
          if (hung !== null || !wantHung) moveAll(wantHung ? RAISED : -RAISED);
          down = nails.map(() => (wantHung ? 1 : 0));
          nails.forEach((n, i) => (n.y = homeY[i] - (wantHung ? 0 : RAISED)));
          hung = wantHung;
        } else if (wantHung !== hung) {
          hung = wantHung;
          since = 0;
        }
        since += dt;
        nails.forEach((n, i) => {
          // going up: all together, quickly; coming down: one by one
          const target = hung ? 1 : 0;
          if (down[i] === target) return;
          const start = hung ? turn[i] * HANG_STAGGER : 0;
          const k = Math.min(1, Math.max(0, (since - start) / (hung ? HANG_TIME : HANG_TIME * 0.6)));
          down[i] = hung ? Math.max(down[i], k) : Math.min(down[i], 1 - k);
          n.y = homeY[i] - RAISED * (1 - ease(down[i]));
          n.py = n.y;
        });

        pending += dt;
        while (pending >= STEP) {
          world.wind = breeze(world.time);
          world.step(STEP);
          pending -= STEP;
        }

        // the swags: two rows of flowers along each rope, leaves tucked in
        for (const rope of ropes) {
          rope.forEach((p, i) => {
            if (garden) {
              if (i % 3 === 1) stampLifted(ctx, leaf(24, i % 2 ? '#7E9A86' : '#5F7D69'), p.x, p.y + 12, { angle: Math.PI * (0.8 + (i % 6) * 0.07) }, shadow);
              stampLifted(ctx, rose(Math.round(flower * 2.5), i % 4 === 2 ? 'blush' : 'white'), p.x, p.y + 3, { angle: i * 1.7 }, shadow);
              return;
            }
            if (i % 4 === 2) stampLifted(ctx, leaf(22), p.x, p.y + 14, { angle: Math.PI * (0.85 + (i % 8) * 0.04) }, shadow);
            stampLifted(ctx, marigold(flower, i % 3 ? 'saffron' : 'gold'), p.x, p.y + 5, {}, shadow);
            stampLifted(ctx, marigold(flower * 0.9, i % 2 ? 'gold' : 'saffron'), p.x + flower * 0.5, p.y - 4, {}, shadow);
          });
        }
        // the strands and their bells — or crystal drops (they tilt with the strand)
        for (const strand of strands) {
          strand.slice(1, -1).forEach((p, k) =>
            stampLifted(ctx, garden ? rose(Math.round(flower * 1.5), k % 3 === 1 ? 'blush' : 'white') : marigold(flower * 0.85, k % 2 ? 'gold' : 'saffron'), p.x, p.y, { angle: k }, shadow),
          );
          const end = strand[strand.length - 1];
          const above = strand[strand.length - 2];
          const angle = Math.atan2(above.x - end.x, end.y - above.y);
          stampLifted(ctx, garden ? crystal(20) : bell(22), end.x, end.y, { angle }, shadow);
          stampLifted(ctx, garden ? rose(Math.round(flower * 2.4), 'white') : marigold(flower * 1.25, 'saffron'), strand[0].x, strand[0].y, {}, shadow);
        }
      },
    };
  };
}
