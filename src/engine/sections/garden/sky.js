// The garden opening's sky, in layers at different distances, so it has
// depth as the camera tilts down (each one slides at its own speed):
//
//   clouds(ctx, w, top, bottom, opts)  – soft dusk clouds, lit from below
//                                        (no longer in the garden's sky;
//                                        the Love theme uses them)
//   stringLights(opts)                 – a live layer: a strand of little
//                                        bulbs swagged across, twinkling
//                                        (two, of Edison bulbs, hanging
//                                        down to the altar)
//   hangingBranches(ctx, w)            – long branches of roses hanging in
//                                        from the top corners, nearest of all
//   nearPetals(opts)                   – a live layer: a few big petals
//                                        drifting down close to the camera

import { stamp, glow, leaf, petal, seeded, rand } from '../../themes/draw';
import { fairyLight } from '../lanterns';
import { rose } from '../events/flowers';

// ── Clouds ───────────────────────────────────────────────────────────────────

// A band of soft clouds between `top` and `bottom`: long thin streaks,
// like the clouds of a calm sunset, lilac with their undersides warmed by
// the low sun. `alpha` sets how strongly they show.
export function clouds(ctx, w, top, bottom, { seed = 1, alpha = 0.2, body = '170, 140, 185', lit = '255, 200, 160' } = {}) {
  const r = seeded(seed);
  // one soft streak: a radial gradient squashed flat (so it fades evenly
  // all round, with no edges)
  const streak = (x, y, length, flat, rgb, a) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, flat);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, length);
    g.addColorStop(0, `rgba(${rgb}, ${a})`);
    g.addColorStop(0.5, `rgba(${rgb}, ${a * 0.45})`);
    g.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(-length, -length, length * 2, length * 2);
    ctx.restore();
  };
  const count = Math.round(7 * Math.max(1, w / 430));
  for (let i = 0; i < count; i++) {
    const x = r() * w;
    const y = top + r() * (bottom - top);
    const length = 110 + r() * 190;
    streak(x, y, length, 0.1 + r() * 0.08, body, alpha);
    streak(x + (r() - 0.5) * 40, y + length * 0.05, length * 0.8, 0.05, lit, alpha * 0.9); // the lit underside
  }
}

// ── String lights ────────────────────────────────────────────────────────────

// A live layer: a strand of bulbs swagged between `from` and `to` (x as a
// share of the width; `y` = where it's tied on the left, `y2` on the right
// (a different height makes it slope down across the scene, like strands
// tied high in a tree and low on a post); `sag` = how low it dips), each
// bulb glowing and twinkling. `bulb` = the bulb's size; `alpha` dims a far
// strand; `drop` = bulbs hang that far below the wire on little cords,
// swinging gently in the breeze; `edison` = draw each as a big Edison bulb
// (glass teardrop, glowing filament, dark cap) instead of a fairy light;
// `bright(p)` = how brightly they glow as you scroll (brighter at dusk).
//
// Hanging bulbs can be touched: tap one, or drag across them, and it
// swings on its cord and flares bright for a moment. For that, give the
// layer's `camera` and `rate` (how fast it slides with the camera), so a
// tap on the screen finds the right bulb.
export function stringLights({ y = 34, y2 = y, sag = 64, from = -0.02, to = 1.02, spacing = 30, bulb = 14, alpha = 1, swagWidth = 260, drop = 0, edison = false, bright = () => 1, camera = null, rate = 1 }) {
  return (w) => {
    const x0 = from * w;
    const x1 = to * w;
    const swags = Math.max(1, Math.round((x1 - x0) / swagWidth));
    // the wire's height at x
    const wireAt = (x) => {
      const u = (x - x0) / (x1 - x0);
      return y + (y2 - y) * u + Math.sin(((u * swags) % 1) * Math.PI) * sag;
    };
    const wire = [];
    for (let x = x0; x <= x1 + 8; x += 8) wire.push([Math.min(x, x1), wireAt(Math.min(x, x1))]);
    // each bulb: where it hangs from, how far it's swung (angle, speed) and
    // how much it's flaring
    const bulbs = [];
    for (let x = x0 + spacing / 2; x <= x1; x += spacing) bulbs.push({ x, y: wireAt(x), swing: 0, speed: 0, flare: 0 });
    const cord = drop + (edison ? bulb * 0.4 : 0); // from the wire to the bulb's middle
    let camNow = 0;
    let at = []; // where each bulb is this frame

    // a nudge to the bulbs near (x, sy) on screen: `push(dx)` = how hard
    const touch = (x, sy, reach, push) => {
      if (!camera || !drop) return;
      const ty = sy + camNow * rate; // the layer slides with the camera
      at.forEach(([bx, by], i) => {
        const dx = bx - x;
        const d = Math.hypot(dx, by - ty);
        if (d > reach) return;
        const b = bulbs[i];
        b.speed = Math.max(-6, Math.min(6, b.speed + push(dx) * (1 - d / reach)));
        b.flare = 1;
      });
    };

    return {
      draw(ctx, t, dt, p) {
        if (camera) camNow = camera(p);
        const step = Math.min(dt, 0.05);
        const glowAlpha = alpha * bright(p);
        // swinging bulbs: a pendulum on its cord, settling slowly
        for (const b of bulbs) {
          if (b.swing !== 0 || b.speed !== 0) {
            b.speed += (-(900 / Math.max(cord, 10)) * Math.sin(b.swing) - 0.9 * b.speed) * step;
            b.swing += b.speed * step;
            if (Math.abs(b.swing) < 0.001 && Math.abs(b.speed) < 0.01) b.swing = b.speed = 0;
          }
          b.flare = Math.max(0, b.flare - step * 0.8);
        }
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = 'rgba(40, 25, 40, 0.75)';
        ctx.lineWidth = Math.max(0.6, bulb / 14);
        ctx.beginPath();
        wire.forEach(([x, wy], i) => (i ? ctx.lineTo(x, wy - bulb * 0.4) : ctx.moveTo(x, wy - bulb * 0.4)));
        ctx.stroke();
        // where each bulb hangs: on the wire, or swinging on its cord below it
        at = bulbs.map((b, i) => {
          if (!drop) return [b.x, b.y];
          const a = b.swing + Math.sin(t * 0.9 + i * 1.3) * 0.12; // + the breeze
          return [b.x + Math.sin(a) * cord, b.y + Math.cos(a) * cord];
        });
        if (drop) {
          ctx.lineWidth = Math.max(0.5, bulb / 20);
          ctx.beginPath();
          bulbs.forEach((b, i) => {
            const a = Math.atan2(at[i][0] - b.x, at[i][1] - b.y);
            ctx.moveTo(b.x, b.y - bulb * 0.4);
            ctx.lineTo(b.x + Math.sin(a) * drop, b.y + Math.cos(a) * drop - bulb * 0.4);
          });
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'lighter';
        at.forEach(([x, by], i) => {
          const flare = bulbs[i].flare;
          const size = Math.round(bulb * (edison ? 2.2 : 1.4) * (1 + flare * 0.8));
          stamp(ctx, glow(size), x, by, { alpha: Math.min(1, glowAlpha * (0.5 + 0.3 * Math.sin(t * 1.4 + i * 1.9)) + flare * 0.6) });
        });
        ctx.globalCompositeOperation = 'source-over';
        at.forEach(([x, by], i) => {
          const a = drop ? Math.atan2(at[i][0] - bulbs[i].x, at[i][1] - bulbs[i].y) : 0;
          stamp(ctx, edison ? edisonBulb(bulb) : fairyLight(bulb), x, by, { angle: -a });
        });
        ctx.restore();
      },
      // tap a bulb: it swings away from your finger and flares
      tap(x, sy) {
        touch(x, sy, bulb * 1.6, (dx) => Math.sign(dx || 1) * 3);
      },
      // drag across the bulbs: they swing the way you're moving
      brush(x, sy, mx) {
        touch(x, sy, bulb * 1.3, () => Math.max(-2, Math.min(2, mx * 0.12)));
      },
    };
  };
}

// An Edison bulb `size` px tall, centred on its glass: a dark cap on top, a
// clear glass teardrop glowing warm, and a bright filament inside.
const BULB_SPRITES = new Map();
function edisonBulb(size) {
  const h = Math.round(size);
  if (BULB_SPRITES.has(h)) return BULB_SPRITES.get(h);
  const k = 3; // drawn sharper than its size
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(h * k);
  canvas.height = Math.ceil(h * 1.4 * k);
  const c = canvas.getContext('2d');
  c.scale(k, k);
  c.translate(h / 2, h * 0.7);
  const r = h * 0.3; // the glass's widest radius
  // the glass: round at the bottom, narrowing up to the cap
  const glass = c.createRadialGradient(0, r * 0.2, 0, 0, r * 0.2, r * 1.3);
  glass.addColorStop(0, 'rgba(255, 250, 225, 1)');
  glass.addColorStop(0.35, 'rgba(255, 214, 140, 0.95)');
  glass.addColorStop(1, 'rgba(240, 160, 80, 0.75)');
  c.fillStyle = glass;
  c.beginPath();
  c.moveTo(-r * 0.4, -h * 0.42);
  c.quadraticCurveTo(-r * 1.1, -r * 0.2, -r, r * 0.3);
  c.arc(0, r * 0.3, r, Math.PI, 0, true);
  c.quadraticCurveTo(r * 1.1, -r * 0.2, r * 0.4, -h * 0.42);
  c.closePath();
  c.fill();
  // the filament
  c.strokeStyle = 'rgba(255, 255, 240, 0.95)';
  c.lineWidth = Math.max(0.6, h / 28);
  c.beginPath();
  c.moveTo(-r * 0.35, -h * 0.3);
  c.lineTo(-r * 0.25, r * 0.2);
  c.lineTo(r * 0.25, r * 0.2);
  c.lineTo(r * 0.35, -h * 0.3);
  c.stroke();
  // the dark cap it hangs by
  c.fillStyle = '#2E2420';
  c.fillRect(-r * 0.45, -h * 0.58, r * 0.9, h * 0.17);
  const result = { key: `edison-${h}`, canvas, width: h, height: h * 1.4 };
  BULB_SPRITES.set(h, result);
  return result;
}

// ── Hanging branches ─────────────────────────────────────────────────────────

// One long branch hanging from (x, y): a soft arching stem with leaves all
// along it and roses clustered along its length. `dir` = 1 swings right.
// `tones` = the roses' colours (see rose() in events/flowers.js).
export function branch(ctx, x, y, length, dir, seed, tones = ['white', 'white', 'blush']) {
  const r = seeded(seed);
  const points = [];
  for (let k = 0; k <= 24; k++) {
    const t = k / 24;
    // out from the corner, then hanging down under its own weight
    points.push([x + dir * length * 0.55 * Math.sin(t * 1.4), y + length * t * t * 0.95 + length * 0.12 * t]);
  }
  ctx.strokeStyle = '#4A5E46';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  points.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.stroke();
  points.forEach(([px, py], i) => {
    if (i === 0) return;
    const size = 32 + r() * 24 - i * 0.4;
    stamp(ctx, leaf(Math.round(size), r() < 0.5 ? '#6E8C76' : '#4F6B58'), px + (r() - 0.5) * 18, py + (r() - 0.5) * 10, { angle: (r() - 0.5) * 2.6 + dir * 0.6 });
    if (i % 2 === 1) stamp(ctx, rose(Math.round(24 + r() * 18), tones[Math.floor(r() * tones.length)]), px + (r() - 0.5) * 14, py + 6, { angle: r() * 6 });
  });
}

// Branches of roses hanging in from both top corners of a `w`-wide screen
// (longer on a wide one). They're the nearest things to the camera, so
// they should look slightly out of focus: their layer is painted at lower
// sharpness (`resolution` in GardenHero) instead of blurring them, which
// was slow.
export function hangingBranches(ctx, w) {
  const reach = Math.min(520, 200 + w * 0.16);
  for (const [x, dir, len, seed] of [
    [-10, 1, reach, 3],
    [20, 1, reach * 0.7, 5],
    [-30, 1, reach * 0.5, 11],
    [w + 10, -1, reach * 0.9, 7],
    [w - 24, -1, reach * 0.6, 9],
    [w + 30, -1, reach * 0.45, 13],
  ]) branch(ctx, x, -20, len, dir, seed);
}

// ── Petals near the camera ───────────────────────────────────────────────────

// A live layer: a few big rose petals drifting down close to the camera,
// moving up past us by `rate` × the camera as it tilts down.
export function nearPetals({ camera, rate = 1.5, count = 6, alpha = () => 1 }) {
  return (w, h) => {
    const colors = ['#F2C9C0', '#FBF4EA', '#E8A598'];
    const make = (y) => ({ x: rand(0, w), y, size: Math.round(rand(18, 26)), color: colors[Math.floor(rand(0, 3))], fall: rand(14, 26), spin: rand(-0.5, 0.5), phase: rand(0, 6) });
    const petals = Array.from({ length: Math.round(count * Math.max(1, w / 430)) }, () => make(rand(0, h)));
    let last = null;
    return {
      draw(ctx, t, dt, p) {
        const a = alpha(p);
        const cam = camera(p);
        const moved = last === null ? 0 : cam - last;
        last = cam;
        if (a <= 0.01) return;
        for (const q of petals) {
          q.y += q.fall * dt - moved * rate;
          if (q.y > h + 40) Object.assign(q, make(-40));
          if (q.y < -60) Object.assign(q, make(h + 40));
          stamp(ctx, petal(q.color, q.size), q.x + Math.sin(t * 0.6 + q.phase) * 24, q.y, { angle: q.phase + t * q.spin, alpha: a * 0.85 });
        }
      },
    };
  };
}
