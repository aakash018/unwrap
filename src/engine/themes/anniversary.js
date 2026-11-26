// Anniversary · वर्षगाँठ — "lamps on the lake"
//
// Phewa Lake just after sunset, made like Love and Birthday: painted on lokta
// paper, in three parts, for a page of any length.
//
//   TOP     – the first screen: a deep teal dusk with the first stars and a thin
//             moon, seen from under a pergola of white flowers hung with candles.
//   MIDDLE  – grows with the page: the dusk, warm lights drifting up at its
//             edges. Calm, so what the sender adds reads clearly.
//   BOTTOM  – always the last screen: Machhapuchhre in the afterglow, mirrored
//             in the lake, a boat for two hung with lamps, leaf lamps afloat.
//
// Where they're drawn (see ThemeLayer.jsx for the canvases):
//   layers[0] – the sky, far          layers[1] – soft lights, nearer
//   layers[2] – the pergola, nearest  backdrop  – the lake, at the page's end
//   scene     – the hanging candles, the boat, the lamps.
//
// Easter eggs, each one about the two of you:
//   tap the water   – a lamp is set afloat, and a second one comes to join it:
//                     the two drift off together, side by side, never apart
//   tap a candle    – it swings, and the first stars over the pergola join up,
//                     one gold line at a time, into a heart
//   tap the boat    – it rocks, and two people are sitting in it, close
//   every hidden message found (celebrate) – lamps come from all over the lake
//                     and gather into a heart on the water, mirrored in it
// Tap anywhere else: gold sparks.
//
// (Painted in lake.js and pergola.js.)

import { glow, sparkle, smoothLine, stamp, hangAngle, rand, pick, seeded, blurred } from './draw';
import { createDrift, createBursts, DEPTHS } from './particles';
import { lakeside, afterglow, boat, lamp, waterSize, SHORE, BOAT_LINE } from './lake';
import { pergola, glassLantern, jasmine, BEAM } from './pergola';
import { paintedSky } from '../sections/texture';
import { printOnPaper } from '../sections/paper';
import { clouds } from '../sections/garden/sky';

const TOP = 820; // the top scene's height
const BOTTOM = 880; // the bottom scene's height
const PAPER = 0.5; // how strongly the lokta paper shows

const BOAT_UP = 178; // the boat's waterline, above the page's end
const reachFor = (w) => Math.min(380, 210 + w * 0.12); // how far the vines hang down at the sides
const boatScale = (w) => Math.min(1.35, 0.6 + w * 0.00055);

// Two people sitting close in the boat, seen from behind, warm against the
// lamplight (in the boat's own px, its waterline at 0; `seen` 0 … 1).
function twoOfYou(ctx, k, seen, time) {
  ctx.save();
  ctx.globalAlpha = seen;
  ctx.scale(k, k);
  const lean = Math.sin(time * 0.6) * 0.6; // breathing, a little
  for (const [x, tall, tilt] of [[-13, 1, 0.16], [12, 0.92, -0.1]]) {
    ctx.save();
    ctx.translate(x, -38);
    ctx.rotate(tilt + lean * 0.01);
    // shoulders and back
    const body = ctx.createLinearGradient(-12, -40 * tall, 12, 0);
    body.addColorStop(0, '#3B2A30');
    body.addColorStop(1, '#22161C');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.bezierCurveTo(-13, -16 * tall, -11, -27 * tall, -6, -30 * tall);
    ctx.lineTo(6, -30 * tall);
    ctx.bezierCurveTo(11, -27 * tall, 13, -16 * tall, 12, 0);
    ctx.closePath();
    ctx.fill();
    // head
    ctx.beginPath();
    ctx.arc(0, -36 * tall, 6.4 * tall, 0, Math.PI * 2);
    ctx.fill();
    // the lamplight on their edges
    ctx.strokeStyle = 'rgba(255, 196, 120, 0.55)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(0, -36 * tall, 6.4 * tall, -2.4, -0.6);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ── The still pictures ───────────────────────────────────────────────────────

function duskSky(ctx, w, y0, y1, h) {
  const at = (y) => Math.min(1, Math.max(0, (y - y0) / (y1 - y0)));
  const glowTop = h - BOTTOM; // where the sky starts to warm
  paintedSky(ctx, w, y0, y1, {
    stops: [
      [at(y0), '#0B2233'],
      [at(TOP * 0.45), '#123448'],
      [at(Math.min(TOP, glowTop)), '#1B4757'],
      [at(glowTop + 120), '#2F6470'],
      [at(h - SHORE - 190), '#8A8C88'],
      [at(h - SHORE - 90), '#E0A67C'],
      [at(h - SHORE + 30), '#F6C58E'],
      [at(h), '#F6C58E'],
    ].sort((a, b) => a[0] - b[0]),
    strokes: ['20, 60, 84', '26, 74, 96', '34, 88, 104', '40, 96, 108', '70, 120, 124', '220, 160, 120'],
    count: Math.round((y1 - y0) * 1.5 * (w / 430)),
    seed: 9,
  });
  // the first stars
  const r = seeded(12);
  for (let i = 0; i < ((y1 - y0) / 7) * (0.6 + w / 1000); i++) {
    const y = y0 + r() * (h - BOTTOM * 0.75 - y0);
    if (r() > (y < TOP ? 0.8 : 0.35)) continue;
    ctx.fillStyle = `rgba(255, 246, 226, ${0.2 + r() * 0.55})`;
    const d = r() < 0.9 ? 1 : 1.9;
    ctx.fillRect(r() * w, y, d, d);
  }
  // a thin moon
  const [mx, my, mr] = [w * 0.26, 318, 30];
  const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 150);
  halo.addColorStop(0, 'rgba(255, 236, 200, 0.3)');
  halo.addColorStop(0.4, 'rgba(220, 220, 200, 0.08)');
  halo.addColorStop(1, 'rgba(220, 220, 200, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(mx - 150, my - 150, 300, 300);
  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(-0.5);
  ctx.beginPath();
  ctx.arc(0, 0, mr, Math.PI * 0.5, Math.PI * 1.5, true);
  ctx.ellipse(0, 0, mr * 0.7, mr, 0, Math.PI * 1.5, Math.PI * 0.5);
  ctx.fillStyle = '#FFF3D6';
  ctx.fill();
  ctx.restore();
  clouds(ctx, w, 420, 600, { seed: 31, alpha: 0.1, body: '130, 170, 180', lit: '200, 210, 200' });
  clouds(ctx, w, h - BOTTOM + 40, h - SHORE - 190, { seed: 36, alpha: 0.3, body: '150, 130, 140', lit: '255, 190, 140' });
}

// Print the lokta paper into a canvas that's just been painted.
const print = (ctx) => printOnPaper(ctx.canvas, ctx.getTransform().a, PAPER);

export default {
  id: 'anniversary',
  label: 'Anniversary',
  nepali: 'वर्षगाँठ',
  dark: true,
  ink: '#F8EEDA', // headings
  inkSoft: '#E2D6BC', // body text and hints
  oldInks: { '#F3EAD7': '#F8EEDA', '#C9C0A8': '#E2D6BC' }, // when it was green velvet
  background: '#14394A', // under everything, until the sky is painted
  minHeight: TOP + BOTTOM,

  // far → near; each slides a little as you scroll and with the pointer
  layers: [
    {
      depth: 0.05, // the sky itself, farthest
      paint(ctx, area, w, h) {
        duskSky(ctx, w, area.y0, area.y1, h);
        print(ctx);
      },
    },
    {
      depth: 0.5, // lights far out of focus, at the edges
      paint(ctx, area, w, h) {
        const r = seeded(44);
        for (let i = 0; i < 16 + w / 40; i++) {
          const y = 120 + r() * (h - BOTTOM - 40);
          const side = r() ** 1.6 * 0.24;
          const x = (r() < 0.5 ? side : 1 - side) * w;
          stamp(ctx, glow(Math.round(5 + r() * 8) * 2, '255, 206, 130'), x, y, { alpha: 0.5 + r() * 0.5 });
          stamp(ctx, glow(4, '255, 236, 190'), x, y, { alpha: 0.9 });
        }
      },
    },
    {
      depth: 0.95, // the pergola, nearest
      paint(ctx, area, w) {
        pergola(ctx, w, reachFor(w));
      },
    },
  ],

  createScene(world, { calm }) {
    const W = world.width;

    // ── Candles in glass, hanging from the pergola ──
    const count = Math.max(4, Math.round(W / 105));
    const hanging = Array.from({ length: count }, (_, i) => {
      const x = ((i + 0.5) / count) * W;
      const edge = Math.abs(x / W - 0.5) * 2;
      const long = 62 + edge * 110 + (i % 2 ? 46 : 0) + (i % 3) * 14;
      const top = world.addPoint(x, BEAM - 4, { pinned: true });
      const strand = world.addStrand(top, long, 6, {
        point: { mass: 0.15, drag: 0.03, wind: 0.25 },
        end: { mass: 1.4, drag: 0.02, wind: 0.3, radius: 22, grabRadius: 34, grabbable: true },
      });
      return { strand, size: 0.72 + (i % 3) * 0.12, phase: i * 2.1 };
    });

    // ── Leaf lamps on the water ──
    // Their place on the lake: x, and `up` = how far above the page's end.
    const r = seeded(71);
    const lamps = [];
    const setAfloat = (x, up, vx, vup, age) => {
      const l = { x, up, vx, vup, age, phase: rand(0, 6) };
      lamps.push(l);
      return l;
    };
    // a second lamp that comes to `lead` and stays beside it
    const join = (lead) => {
      const side = lead.x < W / 2 ? 1 : -1;
      lamps.push({ x: lead.x + side * 70, up: lead.up + 18, vx: 0, vup: 0, age: -0.7, phase: rand(0, 6), lead, side });
    };
    // a point on a heart, 16 wide each side, for t = 0 … 1
    const heartAt = (t) => {
      const a = t * Math.PI * 2;
      return [16 * Math.sin(a) ** 3, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))];
    };
    for (let i = 0; i < Math.round(7 + W / 70); i++) {
      const up = 40 + r() ** 0.7 * (SHORE - 70);
      setAfloat(r() * W, up, (r() - 0.5) * 3, 1.2 + r() * 1.6, 9);
    }
    const rings = []; // ripples spreading from a tap

    // ── The boat: it rocks on a spring ──
    let tilt = 0;
    let tiltSpeed = 0;
    const size = boatScale(W);

    const glints = Array.from({ length: Math.round(16 + W / 40) }, () => ({ u: r(), up: 20 + r() * (SHORE - 50), len: 8 + r() * 22, speed: 0.6 + r() * 1.2, phase: r() * 6 }));

    // warm lights drifting up the page, and a few jasmine flowers coming down
    const lights = calm
      ? null
      : createDrift(world, { count: Math.round(8 + W / 90), gravity: -0.022, drag: 0.08, make: () => ({ radius: Math.round(rand(4, 9)) }) });
    const flowers = calm
      ? null
      : createDrift(world, { count: Math.round(5 + W / 110), gravity: 0.08, make: () => ({ size: pick([10, 13]), spinSpeed: rand(0.006, 0.02) }) });
    const bursts = createBursts(world);

    const boatAt = () => ({ x: W / 2, y: world.height - BOAT_UP });

    let constellation = null; // the stars joining into a heart: { age }
    const starsJoin = () => {
      if (!constellation || constellation.age > 9) constellation = { age: 0 };
    };
    let together = false; // the two of you, in the boat
    let seen = 0; // …how much (fades in)
    // the stars of the heart, over the pergola (page px), in the order they join
    const starsOf = () => {
      const [cx, cy, k] = [W / 2, Math.max(150, Math.min(260, BEAM + 210)), Math.min(4.2, W / 110)];
      return Array.from({ length: 10 }, (_, i) => {
        const [hx, hy] = heartAt(i / 10);
        return [cx + hx * k, cy + hy * k];
      });
    };

    return {
      backdrop(ctx, w, h) {
        lakeside(ctx, w, h);
        print(ctx);
        afterglow(ctx, w, h);
      },

      update(time, dt) {
        lights?.update(time);
        flowers?.update(time);
        bursts.update(dt);
        if (constellation) constellation.age += dt;
        seen += ((together ? 1 : 0) - seen) * Math.min(1, dt * 1.5);
        tiltSpeed += (-9 * tilt - 1.1 * tiltSpeed) * dt;
        tilt += tiltSpeed * dt;
        for (let i = lamps.length - 1; i >= 0; i--) {
          const l = lamps[i];
          l.age += dt;
          const k = waterSize(world.height - l.up, world.height);
          // gathered into the heart: it glides to its place, stays, then goes on
          if (l.heart) {
            const settle = Math.min(1, dt * 1.4);
            l.x += (l.heart.x - l.x) * settle;
            l.up += (l.heart.up - l.up) * settle;
            l.heart.time -= dt;
            if (l.heart.time < 0) Object.assign(l, { heart: null, vx: rand(-2, 2), vup: rand(1, 2.5) });
            continue;
          }
          // a lamp that came to join another: beside it, a lamp's width apart
          if (l.lead) {
            if (!lamps.includes(l.lead)) l.lead = null;
            else {
              const gap = 22 * waterSize(world.height - l.lead.up, world.height);
              const follow = Math.min(1, dt * (l.age < 2 ? 1.2 : 3));
              l.x += (l.lead.x + l.side * gap - l.x) * follow;
              l.up += (l.lead.up + 3 - l.up) * follow;
              continue;
            }
          }
          l.x += (l.vx + Math.sin(time * 0.3 + l.phase) * 3) * k * dt;
          l.up += l.vup * k * dt;
          l.vup += (1.6 - l.vup) * dt * 0.25; // a push wears off
          l.vx *= 1 - dt * 0.3;
          if (l.up > SHORE - 14 || l.x < -50 || l.x > W + 50) {
            // gone to the far shore: if there are plenty, let it go; or a new one near us
            if (lamps.length > 8 + W / 70) lamps.splice(i, 1);
            else Object.assign(l, { x: rand(0.05, 0.95) * W, up: rand(26, 70), vx: rand(-2, 2), vup: rand(1, 3), age: 0 });
          }
        }
        for (let i = rings.length - 1; i >= 0; i--) {
          rings[i].age += dt;
          if (rings[i].age > 2.2) rings.splice(i, 1);
        }
      },

      // a candle pressed and let go (they can be grabbed): the stars join up
      tapHeld(point) {
        if (hanging.some(({ strand }) => strand[strand.length - 1] === point)) starsJoin();
      },

      burst(x, y) {
        // a candle: it swings
        for (const { strand } of hanging) {
          const end = strand[strand.length - 1];
          if (Math.hypot(end.x - x, end.y + 30 - y) < 46) {
            end.px = end.x - (x < end.x ? 1 : -1) * 5;
            starsJoin();
            return;
          }
        }
        const b = boatAt();
        if (Math.abs(x - b.x) < 165 * size && y > b.y - 150 * size && y < b.y + 14) {
          tiltSpeed += (x < b.x ? -1 : 1) * 0.34;
          together = true;
          rings.push({ x: b.x - 60 * size, y: b.y + 6, age: 0 }, { x: b.x + 70 * size, y: b.y + 6, age: -0.15 });
          return;
        }
        const up = world.height - y;
        if (up < SHORE - 16) {
          rings.push({ x, y, age: 0 });
          if (lamps.length < 60) join(setAfloat(x, up, rand(-5, 5), 12, 0));
          return;
        }
        bursts.spawn(x, y, 18, () => ({ color: pick(['#E8C27A', '#FFE3A6', '#D9A04E']), size: Math.round(rand(6, 11)) }), { speed: 6, gravity: 0.14, drag: 0.06, life: 2 });
      },

      // every hidden message found: lamps set afloat all over the lake, one
      // after another, and gold sparks over it
      celebrate() {
        const { view } = this;
        // a heart of lamps on the water in front of the boat, flattened as the
        // lake lies away from us; lamps come to it from all over
        const count = 26;
        const k = Math.min(5.4, W / 80);
        for (let i = 0; i < count; i++) {
          const [hx, hy] = heartAt(i / count);
          const l = setAfloat(rand(0.04, 0.96) * W, rand(24, SHORE - 120), 0, 0, -i * 0.08);
          l.heart = { x: W / 2 + hx * k, up: 92 - hy * k * 0.42, time: 16 + i * 0.05 };
        }
        rings.push({ x: W * 0.3, y: world.height - 90, age: 0 }, { x: W * 0.7, y: world.height - 140, age: -0.4 });
        if (!view) return;
        for (let i = 0; i < 4; i++) {
          bursts.spawn((0.15 + 0.23 * i) * W, view.top + view.height * 0.25, 16, () => ({ color: pick(['#E8C27A', '#FFE3A6', '#D9A04E']), size: Math.round(rand(6, 11)) }), { speed: 6, gravity: 0.12, drag: 0.05, life: 3 });
        }
      },

      draw(ctx, time) {
        const h = world.height;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const l of lights?.pieces ?? []) {
          if (l.p.y > h - SHORE) continue; // not over the water
          const depth = DEPTHS[l.depth];
          stamp(ctx, glow(Math.round(l.radius * depth.scale) * 2 + 2, '255, 208, 140'), l.p.x, l.p.y, { alpha: depth.alpha * 0.9 });
        }
        // glints on the water
        for (const g of glints) {
          const a = Math.max(0, Math.sin(time * g.speed + g.phase)) * 0.4;
          if (a < 0.03) continue;
          const k = waterSize(h - g.up, h);
          const x = W * 0.6 + (g.u - 0.5) * (90 + 320 * k);
          ctx.fillStyle = `rgba(255, 214, 150, ${a.toFixed(3)})`;
          ctx.fillRect(x - (g.len * k) / 2, h - g.up, g.len * k, 0.8 + k);
        }
        ctx.restore();

        // ripples
        ctx.lineWidth = 1.2;
        for (const ring of rings) {
          if (ring.age < 0) continue;
          const t = ring.age / 2.2;
          const k = waterSize(ring.y, h);
          for (const lag of [0, 0.22]) {
            const size2 = Math.max(0, t - lag) * 95 * k;
            if (size2 <= 0) continue;
            ctx.strokeStyle = `rgba(255, 226, 180, ${(0.5 * (1 - t)).toFixed(3)})`;
            ctx.beginPath();
            ctx.ellipse(ring.x, ring.y, size2, size2 * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // the lamps and the boat, farthest first
        const b = boatAt();
        const drawBoat = () => {
          const sway = calm ? 0 : Math.sin(time * 0.9) * 0.012;
          const bob = calm ? 0 : Math.sin(time * 1.1 + 1) * 1.6;
          const a = tilt + sway;
          // mirrored in the water
          ctx.save();
          ctx.globalAlpha = 0.32;
          ctx.translate(b.x + Math.sin(time * 1.3) * 1.5, b.y + 8 * size);
          ctx.scale(size, -size * 0.6);
          ctx.rotate(-a);
          const s = boat();
          ctx.drawImage(s.canvas, -s.width / 2, -s.height / 2 - BOAT_LINE, s.width, s.height);
          ctx.restore();
          ctx.save(); // its lamps' light on the air and the water
          ctx.globalCompositeOperation = 'lighter';
          stamp(ctx, glow(120, '255, 190, 110'), b.x, b.y - 80 * size, { scale: size * 1.2, alpha: 0.5 + 0.05 * Math.sin(time * 5) });
          stamp(ctx, glow(120, '255, 190, 110'), b.x, b.y + 50 * size, { scale: size * 0.9, alpha: 0.35 });
          ctx.restore();
          ctx.save();
          ctx.translate(b.x, b.y + bob);
          ctx.rotate(a);
          ctx.drawImage(s.canvas, (-s.width / 2) * size, (-s.height / 2 - BOAT_LINE) * size, s.width * size, s.height * size);
          if (seen > 0.01) twoOfYou(ctx, size, seen, time);
          ctx.restore();
        };
        let boatDrawn = false;
        for (const l of [...lamps].sort((m, n) => n.up - m.up)) {
          if (!boatDrawn && l.up < BOAT_UP) {
            drawBoat();
            boatDrawn = true;
          }
          const y = h - l.up;
          const far = Math.min(1, (SHORE - 14 - l.up) / 30); // fades at the far shore
          if (l.age < 0) continue; // (not set afloat yet)
          lamp(ctx, l.x, y, 0.95 * waterSize(y, h), time, l.phase, Math.min(1, l.age / 0.8) * far);
        }
        if (!boatDrawn) drawBoat();

        // flowers coming down (they stop above the water)
        for (const f of flowers?.pieces ?? []) {
          if (f.p.y > h - SHORE - 40) continue;
          const depth = DEPTHS[f.depth];
          let s = jasmine(f.size);
          if (depth.blur) s = blurred(s, depth.blur);
          stamp(ctx, s, f.p.x, f.p.y, { angle: f.spin, flip: 0.5 + 0.5 * Math.cos(f.spin), scale: depth.scale, alpha: depth.alpha * 0.85 });
        }

        // the stars joining into a heart, one line at a time
        if (constellation && constellation.age < 12) {
          const { age } = constellation;
          const fade = Math.min(1, age * 2) * Math.min(1, (12 - age) / 2);
          const stars = starsOf();
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = `rgba(255, 222, 160, ${(0.55 * fade).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          stars.forEach(([x, y], i) => {
            const [nx, ny] = stars[(i + 1) % stars.length];
            const drawn = Math.max(0, Math.min(1, age * 2.2 - 0.6 - i * 0.32)); // each line after the last
            if (drawn <= 0) return;
            ctx.moveTo(x, y);
            ctx.lineTo(x + (nx - x) * drawn, y + (ny - y) * drawn);
          });
          ctx.stroke();
          stars.forEach(([x, y], i) => {
            const lit = Math.max(0, Math.min(1, age * 2.2 - i * 0.32)) * fade;
            if (lit <= 0) return;
            const twinkle = 0.75 + 0.25 * Math.sin(time * 3 + i * 1.7);
            stamp(ctx, glow(26, '255, 230, 180'), x, y, { alpha: lit * 0.8 * twinkle });
            stamp(ctx, sparkle(9, '#FFF4DA'), x, y, { alpha: lit * twinkle });
          });
          ctx.restore();
        }

        // the hanging candles
        for (const { strand, size: k, phase } of hanging) {
          smoothLine(ctx, strand, { color: 'rgba(60, 44, 32, 0.9)', width: 1.3 });
          const end = strand[strand.length - 1];
          const angle = hangAngle(strand[strand.length - 2], end);
          const flicker = 0.82 + 0.1 * Math.sin(time * 7 + phase) + 0.06 * Math.sin(time * 12 + phase * 2);
          const x = end.x - Math.sin(angle) * 37 * k;
          const y = end.y + Math.cos(angle) * 37 * k;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          stamp(ctx, glow(90, '255, 190, 106'), x, y, { alpha: flicker * 0.75, scale: k });
          ctx.restore();
          stamp(ctx, glassLantern(), x, y, { angle, scale: k });
        }

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const p of bursts.pieces) stamp(ctx, sparkle(p.size, p.color), p.p.x, p.p.y, { angle: p.spin * 0.3, alpha: bursts.fade(p) });
        ctx.restore();
      },
    };
  },
};
