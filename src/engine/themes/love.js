// Love · माया — "a night of lanterns"
//
// Made like the wedding story's scenery (painted, lit, printed on lokta
// paper), but as a backdrop people build their own gift on. It has three
// parts, so it works for a page of any length:
//
//   TOP     – the first screen: a deep plum night with a full moon and soft
//             clouds, long branches of crimson and blush roses hanging in
//             from the top corners, sky lanterns drifting up.
//   MIDDLE  – grows with the page: the night sky deepening down the page,
//             a few stars, faint far lanterns at the edges. Calm, so what
//             the sender adds reads clearly.
//   BOTTOM  – always the last screen: the old town of Patan at the end of
//             the page, its windows lit and a warm glow above the rooftops,
//             lanterns rising from it, roses in the corners.
//
// Where they're drawn (see ThemeLayer.jsx for the canvases):
//   layers[0] – the sky, far: it slides a little as you scroll (depth)
//   layers[1] – far lanterns, a little nearer
//   layers[2] – the rose branches at the top, nearest of all
//   backdrop  – the bottom scene, pinned to the page's end
//   scene     – the lanterns you can grab and fling, and falling petals;
//               tap empty space to send a new lantern up
//
// Easter eggs: tap the moon (it blushes, and a star falls; the third time the
// lanterns gather into a heart), tap the rooftops (a heart of fireworks).
//
// `minHeight` keeps a page at least as tall as the top and bottom scenes.

import { PAGE_HEIGHT } from '../config';
import { petal, sparkle, stamp, glow, rand, pick, seeded } from './draw';
import { createDrift, createBursts, DEPTHS } from './particles';
import { paintedSky } from '../sections/texture';
import { printOnPaper } from '../sections/paper';
import { litLantern } from '../sections/lanterns';
import { town, pagoda } from '../sections/temple';
import { clouds, branch } from '../sections/garden/sky';
import { rose } from '../sections/events/flowers';
import { leaf } from './draw';

const TOP = 860; // the top scene's height
const BOTTOM = 820; // the bottom scene's height
const PAPER = 0.85; // how strongly the lokta paper shows (same as the stories)
const PETALS = ['#7E1226', '#9E1C34', '#B4283C'];
const ROSES = ['crimson', 'crimson', 'blush', 'white'];

// The night sky from `y0` to `y1` for a page `h` tall: plum at the top,
// deepening through the middle, warming to rose low down, ready for the
// town's glow. Colours are pinned to the top and bottom scenes (in px),
// so the middle simply stretches.
function nightSky(ctx, w, y0, y1, h) {
  const at = (y) => Math.min(1, Math.max(0, (y - y0) / (y1 - y0)));
  paintedSky(ctx, w, y0, y1, {
    stops: [
      [at(0), '#170A22'],
      [at(TOP * 0.45), '#24102F'],
      [at(TOP), '#2E1232'],
      [at((TOP + h - BOTTOM) / 2), '#2A0F2C'],
      [at(h - BOTTOM), '#341330'],
      [at(h - BOTTOM * 0.45), '#5A1F38'],
      [at(h - 240), '#9A3E48'],
      [at(h), '#C86A58'],
    ].sort((a, b) => a[0] - b[0]),
    strokes: ['60, 30, 90', '80, 40, 100', '90, 40, 90', '110, 40, 80', '170, 70, 80', '220, 120, 100'],
    count: Math.round((y1 - y0) * 1.6 * (w / 430)),
    seed: 5,
  });
  // stars: many in the top scene, a few down the middle, none near the town
  const r = seeded(7);
  for (let i = 0; i < (y1 - y0) / 6; i++) {
    const y = y0 + r() * (y1 - y0);
    const k = y < TOP ? 1 : y < h - BOTTOM ? 0.35 : 0.1;
    if (r() > k) continue;
    ctx.fillStyle = `rgba(255, 238, 220, ${0.2 + r() * 0.55})`;
    const d = r() < 0.9 ? 1 : 1.8;
    ctx.fillRect(r() * w, y, d, d);
  }
  // the full moon, high and a little right of centre (clear of the roses), in a soft halo
  const [mx, my] = [w * 0.6, 250];
  const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 220);
  halo.addColorStop(0, 'rgba(255, 228, 210, 0.35)');
  halo.addColorStop(0.3, 'rgba(240, 180, 190, 0.12)');
  halo.addColorStop(1, 'rgba(240, 180, 190, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(mx - 220, my - 220, 440, 440);
  const disc = ctx.createRadialGradient(mx - 14, my - 14, 0, mx, my, 54);
  disc.addColorStop(0, '#FFF6EC');
  disc.addColorStop(0.75, '#F4DCCB');
  disc.addColorStop(1, '#E6C2B4');
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(mx, my, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(190, 150, 150, 0.18)'; // its soft grey seas
  for (const [dx, dy, rr] of [[-14, -8, 12], [10, 12, 9], [16, -16, 6], [-6, 20, 7]]) {
    ctx.beginPath();
    ctx.arc(mx + dx, my + dy, rr, 0, Math.PI * 2);
    ctx.fill();
  }
  // soft clouds drifting past the moon, and warm ones low over the town
  clouds(ctx, w, 300, 420, { seed: 21, alpha: 0.11, body: '150, 100, 150', lit: '240, 190, 200' });
  clouds(ctx, w, h - BOTTOM + 200, h - 380, { seed: 23, alpha: 0.14, body: '170, 90, 120', lit: '255, 180, 150' });
}

// The bottom scene: a warm glow over the old town of Patan, its windows
// lit, a pagoda among the roofs, roses in the corners. Pinned to `h`.
function townAtNight(ctx, w, h) {
  const glow = ctx.createRadialGradient(w / 2, h - 200, 0, w / 2, h - 200, 560);
  glow.addColorStop(0, 'rgba(255, 170, 120, 0.6)');
  glow.addColorStop(0.45, 'rgba(220, 110, 110, 0.22)');
  glow.addColorStop(1, 'rgba(200, 90, 100, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(-20, h - 720, w + 40, 720);
  town(ctx, w, h - 210, h, { seed: 9, color: '#4A2036', lit: 0.25 });
  ctx.save();
  ctx.translate(w * 0.3, h - 560);
  ctx.scale(0.34, 0.34);
  pagoda(ctx, 0, 0);
  ctx.restore();
  town(ctx, w, h - 110, h, { seed: 4, color: '#24101E', lit: 0.45 });
  // roses growing up in the bottom corners
  const r = seeded(31);
  for (const [cx, dir] of [[-10, 1], [w + 10, -1]]) {
    for (let i = 0; i < 26; i++) {
      const x = cx + dir * r() * 110;
      const y = h - r() * 150;
      stamp(ctx, leaf(Math.round(26 + r() * 20), r() < 0.5 ? '#3F5A3C' : '#2E4430'), x, y, { angle: (r() - 0.5) * 2.4 });
      if (r() < 0.6) stamp(ctx, rose(Math.round(22 + r() * 18), ROSES[Math.floor(r() * ROSES.length)]), x, y - 6, { angle: r() * 6 });
    }
  }
}

// Print the lokta paper into a canvas that's just been painted.
const print = (ctx) => printOnPaper(ctx.canvas, ctx.getTransform().a, PAPER);

export default {
  id: 'love',
  label: 'Love',
  nepali: 'माया',
  dark: true,
  ink: '#F6E8DC', // headings
  inkSoft: '#E0C5B6', // body text and hints
  background: '#24102C', // under everything, until the sky is painted
  minHeight: TOP + BOTTOM,

  // far → near; each slides a little as you scroll and with the pointer
  layers: [
    {
      depth: 0.05, // the sky itself, farthest
      paint(ctx, area, w, h) {
        nightSky(ctx, w, area.y0, area.y1, h);
        print(ctx);
      },
    },
    {
      depth: 0.35, // far lanterns: small, faint, more near the top and bottom
      paint(ctx, area, w, h) {
        const r = seeded(17);
        for (let i = 0; i < 70; i++) {
          const y = area.y0 + r() * (area.y1 - area.y0);
          const middle = y > TOP && y < h - BOTTOM;
          if (middle && r() < 0.7) continue;
          const x = middle ? (r() < 0.5 ? r() * w * 0.18 : w - r() * w * 0.18) : r() * w;
          stamp(ctx, litLantern(Math.round(6 + r() * 8)), x, y, { alpha: 0.35 + r() * 0.35 });
        }
      },
    },
    {
      depth: 0.95, // rose branches hanging in from the top corners, nearest
      paint(ctx, area, w) {
        const reach = Math.min(420, 180 + w * 0.14);
        for (const [x, dir, len, seed] of [
          [-10, 1, reach, 3],
          [24, 1, reach * 0.62, 5],
          [w + 10, -1, reach * 0.85, 7],
          [w - 26, -1, reach * 0.55, 9],
        ]) branch(ctx, x, -20, len, dir, seed, ROSES);
      },
    },
  ],

  // `screen` = how tall one screen is on the viewer's device (page px)
  createScene(world, { calm, screen = PAGE_HEIGHT }) {
    const W = world.width;
    const lanterns = [];

    // Sky lanterns you can grab and fling. Each lives in a band of the
    // page and drifts up through it; when it leaves the top of its band
    // it fades back in at the bottom. (Bands are read from the page's
    // height every frame, so the town's lanterns follow the page's end.)
    const BANDS = {
      top: () => [70, TOP - 60],
      middle: () => [TOP, world.height - BOTTOM],
      town: () => [world.height - BOTTOM + 80, world.height - 170],
    };
    const add = (band, size, x, y) => {
      const p = world.addPoint(x, y, {
        gravity: -0.05, // floats up, slowly
        drag: 0.1,
        wind: 0.25,
        mass: 0.5,
        radius: size * 0.5,
        grabbable: true,
        bounded: true,
      });
      lanterns.push({ p, band, size, age: 9, phase: rand(0, 6) });
    };
    const [t0, t1] = BANDS.top();
    for (const [fx, fy, size] of [[0.2, 0.55, 40], [0.48, 0.8, 30], [0.62, 0.35, 24], [0.86, 0.7, 34], [0.34, 0.25, 20]]) {
      add('top', size, fx * W, t0 + fy * (t1 - t0));
    }
    for (let i = 0; i < 3; i++) {
      const [m0, m1] = BANDS.middle();
      add('middle', 16 + i * 3, i % 2 ? W * 0.88 : W * 0.1, m0 + ((i + 0.5) / 3) * Math.max(0, m1 - m0));
    }
    for (let i = 0; i < 8; i++) {
      const [b0, b1] = BANDS.town();
      add('town', Math.round(18 + rand(0, 22)), rand(0.08, 0.92) * W, rand(b0, b1));
    }
    // lanterns sent up with a tap: they rise and fade away
    const released = [];

    // ── easter eggs ──
    let moonTaps = 0;
    let blush = 0; // how pink the moon is, 1 … 0
    const falling = []; // falling stars
    const hearts = []; // lanterns gathering into a heart
    const fireworks = [];
    // where the moon is now (its layer slides a little as the page scrolls)
    const moonAt = (view) => ({ x: W * 0.6, y: 250 + (calm ? 0 : Math.max(0, view?.top ?? 0) * 0.19) });
    // a point on a heart, 16 wide each side, for t = 0 … 1
    const heartAt = (t) => {
      const a = t * Math.PI * 2;
      return [16 * Math.sin(a) ** 3, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))];
    };
    const gather = (view) => {
      if (hearts.length || !view) return;
      const size = Math.min(W * 0.022, view.height * 0.016);
      const [cx, cy] = [W / 2, view.top + view.height * 0.4];
      for (let i = 0; i < 34; i++) {
        const [hx, hy] = heartAt(i / 34);
        hearts.push({ x: cx + hx * size, y: cy + hy * size, fromX: cx + rand(-0.5, 0.5) * Math.min(W, 700), fromY: view.top + view.height + rand(40, 200), late: rand(0, 0.9), age: 0, size: Math.round(rand(15, 21)), phase: rand(0, 6) });
      }
    };

    // crimson rose petals drifting down, blown aside by the pointer
    const petals = calm
      ? null
      : createDrift(world, {
          count: Math.round(W / 60),
          gravity: 0.1,
          make: () => ({ color: pick(PETALS), size: Math.round(rand(12, 18)), spinSpeed: rand(0.01, 0.03) }),
        });
    const bursts = createBursts(world);

    return {
      // the bottom scene, painted once for this page height (and printed)
      backdrop(ctx, w, h) {
        townAtNight(ctx, w, h);
        print(ctx);
      },

      update(time, dt) {
        petals?.update(time);
        bursts.update(dt);
        for (const l of lanterns) {
          l.age += dt;
          if (l.p.grabbed) continue;
          const [b0, b1] = BANDS[l.band]();
          if (b1 - b0 < 40) continue; // a band with no room (a short page)
          if (l.p.y < b0 - 30 || l.p.y > b1 + 200) {
            // gone off the top of its band: back in at the bottom
            const x = rand(0.08, 0.92) * W;
            const y = b1 - rand(0, 40);
            Object.assign(l.p, { x, y, px: x, py: y });
            l.age = 0;
          }
          l.p.x += Math.sin(time * 0.5 + l.phase) * 0.05; // a gentle sway
        }
        blush = Math.max(0, blush - dt * 0.4);
        for (const list of [falling, hearts, fireworks]) {
          for (let i = list.length - 1; i >= 0; i--) {
            list[i].age += dt;
            if (list[i].age > (list === falling ? 1.6 : list === hearts ? 11 : 3.4)) list.splice(i, 1);
          }
        }
        for (let i = released.length - 1; i >= 0; i--) {
          const l = released[i];
          l.age += dt;
          l.y -= 22 * dt;
          if (l.age > 9) released.splice(i, 1);
        }
      },

      // tap empty space: a new lantern rises from there, with a few sparks
      burst(x, y) {
        const moon = moonAt(this.view);
        if (Math.hypot(x - moon.x, y - moon.y) < 66) {
          blush = 1;
          moonTaps += 1;
          falling.push({ x: moon.x - W * 0.5, y: moon.y - 150 + rand(-30, 30), age: 0 });
          if (moonTaps % 3 === 0) gather(this.view);
          return;
        }
        if (y > world.height - 190) {
          fireworks.push({ x, from: y, y: world.height - 470 - rand(0, 90), age: 0 });
          return;
        }
        released.push({ x, y, size: 30, age: 0, phase: rand(0, 6) });
        bursts.spawn(x, y, 10, () => ({ size: Math.round(rand(5, 9)) }), { speed: 5, gravity: 0.12, drag: 0.06, life: 1.6 });
      },

      celebrate() {
        const { view } = this;
        hearts.length = 0; // (a heart may still be there from the moon)
        gather(view);
        // three fireworks, on the part of the page they're looking at
        for (let i = 0; i < 3; i++) {
          fireworks.push({ x: W * (0.22 + 0.28 * i), from: view.top + view.height, y: view.top + view.height * (0.26 + 0.1 * (i % 2)), age: -2.8 - i * 0.6 });
        }
      },

      draw(ctx, time) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        if (blush > 0.01) {
          const moon = moonAt(this.view);
          stamp(ctx, glow(110, '255, 110, 130'), moon.x, moon.y, { alpha: blush });
        }
        for (const s of falling) {
          const k = s.age / 1.6;
          const [x, y] = [s.x + k * W * 0.9, s.y + k * 190];
          const tail = ctx.createLinearGradient(x, y, x - 130, y - 27);
          tail.addColorStop(0, `rgba(255, 244, 220, ${0.95 * Math.sin(Math.PI * k)})`);
          tail.addColorStop(1, 'rgba(255, 230, 200, 0)');
          ctx.strokeStyle = tail;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 130, y - 27);
          ctx.stroke();
          stamp(ctx, sparkle(13, '#FFF6E0'), x, y, { alpha: Math.sin(Math.PI * k) });
        }
        // a rocket, then sparks opening into a heart and falling
        for (const f of fireworks) {
          if (f.age < 0) continue;
          if (f.age < 0.7) {
            const k = 1 - (1 - f.age / 0.7) ** 2;
            stamp(ctx, sparkle(9, '#FFE2A0'), f.x, f.from + (f.y - f.from) * k);
            continue;
          }
          const k = (f.age - 0.7) / 2.7;
          const grow = 1 - (1 - Math.min(1, k * 1.7)) ** 3;
          stamp(ctx, glow(90, '255, 130, 130'), f.x, f.y, { alpha: Math.max(0, 1 - k * 3) });
          for (let i = 0; i < 44; i++) {
            const [hx, hy] = heartAt(i / 44);
            const twinkle = 0.6 + 0.4 * Math.sin(time * 18 + i * 2.3);
            stamp(ctx, sparkle(i % 2 ? 8 : 11, i % 3 ? '#FFB0A8' : '#FFE0A2'), f.x + hx * 6.4 * grow, f.y + hy * 6.4 * grow + k * k * 70, { alpha: Math.max(0, 1 - k) * twinkle });
          }
        }
        ctx.restore();
        for (const l of hearts) {
          const go = Math.min(1, Math.max(0, (l.age - l.late) / 2.6));
          const ease = 1 - (1 - go) ** 3;
          const leave = Math.max(0, l.age - 7.5 - l.late * 0.6); // then they drift off
          const x = l.fromX + (l.x - l.fromX) * ease + Math.sin(time * 1.2 + l.phase) * (2 + leave * 5);
          const y = l.fromY + (l.y - l.fromY) * ease + Math.cos(time + l.phase) * 2 - leave * leave * 26;
          stamp(ctx, litLantern(l.size), x, y, { alpha: Math.min(1, go * 4) * Math.max(0, 1 - leave / 2.6) });
        }
        for (const pt of petals?.pieces ?? []) {
          const depth = DEPTHS[pt.depth];
          stamp(ctx, petal(pt.color, pt.size), pt.p.x, pt.p.y, { angle: pt.spin, flip: Math.cos(pt.spin * 1.3), scale: depth.scale, alpha: depth.alpha * 0.9 });
        }
        for (const l of lanterns) {
          const flicker = 0.9 + 0.1 * Math.sin(time * 7 + l.phase);
          const fade = Math.min(1, l.age / 1.5);
          stamp(ctx, litLantern(l.size), l.p.x, l.p.y, { alpha: fade * flicker, angle: Math.sin(time * 0.6 + l.phase) * 0.05 });
        }
        for (const l of released) {
          const fade = Math.min(1, l.age / 0.6, (9 - l.age) / 2);
          stamp(ctx, litLantern(l.size), l.x + Math.sin(time + l.phase) * 6, l.y, { alpha: fade });
        }
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const b of bursts.pieces) stamp(ctx, sparkle(b.size, '#F1D497'), b.p.x, b.p.y, { angle: b.spin * 0.2, alpha: bursts.fade(b) });
        ctx.restore();
      },
    };
  },
};
