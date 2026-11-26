// Tall meadow grass with little wild flowers, growing on the lawn between
// the altar and the first row of benches (where the far benches used to
// be). It's alive: every blade sways in a slow evening breeze, gusts roll
// across it now and then, and a tap or click pushes the grass apart there
// like a hand brushing through it, letting a few seeds of fluff float up;
// dragging through it (mouse held, or a finger swiping sideways) sweeps
// the blades it passes the way it moves, and wakes a few fireflies that
// rise out of the grass, blinking.
//
//   tallGrass({ top, bottom, w → avoid(x, y), size(y), camera, seed })
//     a live layer (see StoryScene). `top`/`bottom` = where blades may
//     stand (world px); `avoid(x, y)` = true where none should (the path,
//     the altar's platform); `size(y)` = how big things are at that height
//     (perspective); `camera(p)` = the scene's camera, so a tap lands on
//     the right blades while the layer slides with the garden. `density`: how
//     many blades (1 = the garden's; fewer for a narrow strip of it).

import { seeded, stamp, glow } from '../../themes/draw';

const GREENS = ['#5E7238', '#6F8142', '#7F8C48', '#4E6232', '#8D9550'];
const GOLD = ['#D8C27A', '#E6CF8A', '#C9AE62']; // tips backlit by the low sun
const FLOWERS = ['#FFFBF0', '#FFF3D2', '#F4DC74', '#F2C4BA', '#DCCBEB'];

// On a phone: fewer blades, a little thicker, so it still looks as full. The
// grass was by far the costliest thing in the garden opening to draw (each
// blade is a curved stroke, redrawn as it sways), and made cheap phones lag.
const PHONE_DENSITY = 0.4;

export function tallGrass({ top, bottom, avoid, size, camera, seed = 5, density: thickness = 1 }) {
  return (w) => {
    const r = seeded(seed);
    const skip = avoid(w);
    const blades = [];
    const phone = typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches ?? false);
    const density = (phone ? PHONE_DENSITY : 1) * thickness;
    const count = Math.round((((bottom - top) * (w + 40)) / 30) * density);
    for (let i = 0; i < count; i++) {
      const y = top + (bottom - top) * Math.sqrt(r()); // more of them near us
      const x = -20 + r() * (w + 40);
      if (skip(x, y)) continue;
      const s = size(y);
      const kind = r();
      blades.push({
        x,
        y,
        s,
        len: (30 + r() * 34) * s * (kind > 0.84 ? 1.3 : 1),
        lean: (r() - 0.5) * 0.5,
        // widths rounded to half a px, so blades can be drawn in batches
        width: Math.max(0.5, Math.round((0.9 + r() * 0.8) * s * 2 * (phone ? 1.35 : 1)) / 2),
        color: GREENS[Math.floor(r() * GREENS.length)],
        tip: r() < 0.55 ? GOLD[Math.floor(r() * GOLD.length)] : null,
        // about one in six carries a flower, one in twelve a feathery seed head
        flower: kind > 0.84 ? FLOWERS[Math.floor(r() * FLOWERS.length)] : null,
        seedHead: kind < 0.08,
        phase: r() * Math.PI * 2,
        bend: 0, // how far it's pushed from its rest, by taps (radians)
        speed: 0,
      });
    }
    blades.sort((a, b) => a.y - b.y); // far ones first

    const fluff = []; // seeds floating up after a tap
    const fireflies = []; // little lights rising out of the grass where you touch it
    let camNow = 0;

    // how big things are at height y, or null if y is off the grass
    const sizeNear = (y) => (y < top - 80 || y > bottom + 40 ? null : size(Math.min(Math.max(y, top), bottom)));
    // give the blades within `reach` of (x, y) a push (`kick(dx)`, rad/s),
    // more the nearer they are; true if any were touched
    const push = (x, y, reach, kick) => {
      let hit = false;
      for (const b of blades) {
        const dx = b.x - x;
        const d = Math.hypot(dx, (b.y - b.len * 0.5 - y) * 1.6);
        if (d > reach) continue;
        hit = true;
        b.speed = Math.max(-8, Math.min(8, b.speed + kick(dx) * (1 - d / reach)));
      }
      return hit;
    };
    // a few seeds of fluff floating up from (x, y)
    const puff = (x, y, s, count) => {
      for (let i = 0; i < count; i++) {
        fluff.push({ x: x + (Math.random() - 0.5) * 60 * s, y: y - Math.random() * 20 * s, vx: 10 + Math.random() * 20, vy: -(18 + Math.random() * 30), size: (1 + Math.random() * 1.2) * s, phase: Math.random() * 6, age: 0, life: 2.5 + Math.random() * 2 });
      }
    };

    // a few fireflies rising out of the grass at (x, y): they drift up,
    // wander and blink, then fade
    const wake = (x, y, s, count) => {
      for (let i = 0; i < count && fireflies.length < 40; i++) {
        fireflies.push({ x: x + (Math.random() - 0.5) * 50 * s, y: y - Math.random() * 25 * s, vx: (Math.random() - 0.5) * 20, vy: -(26 + Math.random() * 22), phase: Math.random() * 6, age: 0, life: 4.5 + Math.random() * 2.5 });
      }
    };

    // the breeze at x: a slow sway, a faster flutter, and a gust that
    // rolls across the lawn every so often
    const wind = (x, t, phase) =>
      0.1 * Math.sin(t * 0.8 + x * 0.011) + 0.04 * Math.sin(t * 2.3 + phase) + 0.22 * Math.max(0, Math.sin(t * 0.33 - x * 0.006)) ** 3;

    return {
      draw(ctx, t, dt, p) {
        camNow = camera(p);
        const step = Math.min(dt, 0.05);
        // Every blade goes into one path per colour and width, and every
        // flower into one path per colour: a handful of strokes and fills a
        // frame instead of thousands (this layer is redrawn every frame).
        const strokes = new Map();
        const fills = new Map();
        const pathFor = (map, key) => {
          let path = map.get(key);
          if (!path) map.set(key, (path = new Path2D()));
          return path;
        };
        for (const b of blades) {
          // a spring pulls each pushed blade back, with a little wobble
          if (b.bend !== 0 || b.speed !== 0) {
            b.speed += (-16 * b.bend - 2 * b.speed) * step;
            b.bend += b.speed * step;
            if (Math.abs(b.bend) < 0.001 && Math.abs(b.speed) < 0.01) b.bend = b.speed = 0;
          }
          const a = b.lean + wind(b.x, t, b.phase) + b.bend;
          const tx = b.x + Math.sin(a) * b.len;
          const ty = b.y - Math.cos(a) * b.len;
          const mx = b.x + Math.sin(a * 0.35) * b.len * 0.5;
          const my = b.y - b.len * 0.5;
          const blade = pathFor(strokes, `${b.color}|${b.width}`);
          blade.moveTo(b.x, b.y);
          blade.quadraticCurveTo(mx, my, tx, ty);
          if (b.tip) {
            // the top third lit gold by the sun
            const tip = pathFor(strokes, `${b.tip}|${b.width * 0.8}`);
            tip.moveTo((mx + tx) / 2, (my + ty) / 2);
            tip.lineTo(tx, ty);
          }
          if (b.flower) {
            const petals = pathFor(fills, b.flower);
            for (const [dx, dy] of [[0, 0], [-1.6, 1.2], [1.6, 1.2]]) {
              const fx = tx + dx * b.s;
              const fy = ty + dy * b.s;
              petals.moveTo(fx + 1.5 * b.s, fy);
              petals.arc(fx, fy, 1.5 * b.s, 0, Math.PI * 2);
            }
            const heart = pathFor(fills, 'rgba(230, 180, 60, 0.9)');
            heart.moveTo(tx + 0.7 * b.s, ty + 0.6 * b.s);
            heart.arc(tx, ty + 0.6 * b.s, 0.7 * b.s, 0, Math.PI * 2);
          } else if (b.seedHead) {
            // a soft oat-like head, glowing in the light
            const head = pathFor(fills, 'rgba(240, 215, 150, 0.85)');
            head.moveTo(tx + 1.8 * b.s, ty + 3 * b.s);
            head.ellipse(tx, ty + 3 * b.s, 1.8 * b.s, 5 * b.s, a, 0, Math.PI * 2);
          }
        }
        ctx.save();
        ctx.lineCap = phone ? 'butt' : 'round'; // (round ends cost more to draw)
        for (const [key, path] of strokes) {
          const [color, width] = key.split('|');
          ctx.strokeStyle = color;
          ctx.lineWidth = Number(width);
          ctx.stroke(path);
        }
        for (const [color, path] of fills) {
          ctx.fillStyle = color;
          ctx.fill(path);
        }
        // the seeds of fluff, drifting up and away on the breeze
        for (let i = fluff.length - 1; i >= 0; i--) {
          const f = fluff[i];
          f.age += step;
          if (f.age > f.life) {
            fluff.splice(i, 1);
            continue;
          }
          f.x += (f.vx + 14 * Math.sin(t * 1.3 + f.phase)) * step;
          f.y += f.vy * step;
          f.vy *= 0.995;
          const k = f.age / f.life;
          ctx.globalAlpha = Math.min(1, k * 6) * (1 - k);
          ctx.fillStyle = '#FFF6DE';
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        // the fireflies: a warm glow and a bright core, blinking
        for (let i = fireflies.length - 1; i >= 0; i--) {
          const f = fireflies[i];
          f.age += step;
          if (f.age > f.life) {
            fireflies.splice(i, 1);
            continue;
          }
          f.x += (f.vx + 18 * Math.sin(t * 0.9 + f.phase)) * step;
          f.y += (f.vy + 8 * Math.sin(t * 1.7 + f.phase * 2)) * step;
          f.vy *= 1 - step * 0.25; // slowing as they rise
          const k = f.age / f.life;
          const blink = 0.55 + 0.45 * Math.sin(t * 3.2 + f.phase * 5);
          const a = Math.min(1, k * 4) * (1 - k) * blink;
          stamp(ctx, glow(26, '255, 214, 90'), f.x, f.y, { alpha: Math.min(1, a * 1.4) });
          stamp(ctx, glow(10, '255, 236, 150'), f.x, f.y, { alpha: a });
          ctx.globalAlpha = a;
          ctx.fillStyle = '#FFF4B0';
          ctx.beginPath();
          ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      },
      // a tap at (x, y) on screen: push the blades near it away from it
      tap(x, sy) {
        const y = sy + camNow; // the layer slides with the camera
        const s = sizeNear(y);
        if (s === null) return;
        const hit = push(x, y, 120 * s, (dx) => Math.sign(dx || 1) * 5);
        if (hit) {
          puff(x, y, s, 8);
          wake(x, y, s, 6);
        }
      },
      // a drag through the grass: the blades it passes are swept the way
      // the pointer is moving, like a hand brushing through them
      brush(x, sy, mx, my) {
        const y = sy + camNow;
        const s = sizeNear(y);
        if (s === null || Math.abs(mx) < 0.5) return;
        const sweep = Math.max(-4, Math.min(4, mx * 0.35));
        // along the whole stretch it moved since last time (a fast drag
        // jumps many px between two events)
        const steps = Math.min(20, Math.ceil(Math.hypot(mx, my) / 20));
        let hit = false;
        for (let k = 1; k <= steps; k++) {
          const f = k / steps;
          if (push(x - mx * (1 - f), y - my * (1 - f), 70 * s, () => sweep / steps * 2)) hit = true;
        }
        if (hit && Math.random() < 0.12) puff(x, y, s, 2);
        if (hit && Math.random() < 0.3) wake(x, y, s, 1);
      },
    };
  };
}
