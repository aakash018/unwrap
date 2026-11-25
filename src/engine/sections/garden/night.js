// The ending of the garden (Christian) invite: the bottom of chapter 4
// (DetailsSection.jsx, look 'garden'). The story closes where it began:
// the big old tree from the opening, now at night — dark against the
// indigo sky over the hills, its branches strung with warm fairy lights, a
// strand of Edison bulbs swagged through its crown, fireflies drifting in
// the grass at its foot. The chapter's sky lanterns (and the guests'
// blessings) rise out of its crown.
//
// All in the chapter's coordinates: `h` = the chapter's height, the scene
// stands on its bottom edge.
//
//   treeAtNight(ctx, w, h)      – the still picture (paint): hills, the tree,
//                                 its fairy lights, the lawn
//   nightLights({ h })          – a live layer: some fairy lights twinkling,
//                                 the Edison bulbs (tap them: they swing),
//                                 and the fireflies
//   TREE_TOP                    – how far above the bottom the crown reaches

import { bigTree, hills } from './garden';
import { stringLights } from './sky';
import { stamp, glow, seeded } from '../../themes/draw';
import { fairyLight } from '../lanterns';

const GROUND = 40; // the lawn's top, above the bottom edge
const TREE = 400; // the tree's size (its crown reaches ~1.36 × this above its foot)
export const TREE_TOP = GROUND + TREE * 1.4;

const NIGHT_WOOD = '20, 15, 36'; // the tree: a solid dark silhouette against the sky
const NIGHT_LEAVES = ['rgba(34, 44, 70, 0.9)', 'rgba(26, 33, 56, 0.9)'];

// Where the fairy lights hang: points along the tree's outer branches
// (worked out by drawing the tree once, off screen).
const lightsCache = new Map();
function lightPoints(w, h) {
  const key = `${w}-${h}`;
  if (!lightsCache.has(key)) {
    const lights = [];
    const scratch = document.createElement('canvas').getContext('2d');
    bigTree(scratch, w / 2, h - GROUND, TREE, { lights });
    const r = seeded(77);
    // not every point: a scattering, a little off the branch
    lightsCache.set(key, lights.filter(() => r() < 0.4).map(([x, y]) => [x + (r() - 0.5) * 10, y + (r() - 0.5) * 8]));
  }
  return lightsCache.get(key);
}

export function treeAtNight(ctx, w, h) {
  const r = seeded(83);
  // the hills, in two ranges, dark blue in the night haze
  hills(ctx, w, h - 150, h, { color: '#2B2752', height: 180, seed: 2, woods: ['#26224C', '#312D5C', '#221F46'], mist: '80, 70, 140' });
  hills(ctx, w, h - 80, h, { color: '#1C1A3A', height: 120, seed: 5, woods: ['#18162F', '#221F42', '#151229'], mist: '50, 40, 100' });
  // the big old tree, dark against the sky
  bigTree(ctx, w / 2, h - GROUND, TREE, { wood: NIGHT_WOOD, solid: 1, leaves: NIGHT_LEAVES });
  // its fairy lights: a warm glow, then the bright little bulb
  const points = lightPoints(w, h);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, y] of points) stamp(ctx, glow(9, '255, 200, 120'), x, y, { alpha: 0.55 });
  ctx.restore();
  for (const [x, y] of points) stamp(ctx, fairyLight(6), x, y);
  // the lawn at its foot, and the grass against the lights
  ctx.fillStyle = '#13102A';
  ctx.fillRect(-20, h - GROUND, w + 40, GROUND + 20);
  ctx.strokeStyle = '#13102A';
  ctx.lineCap = 'round';
  for (let x = -10; x < w + 10; x += 2 + r() * 3) {
    ctx.lineWidth = 1 + r();
    ctx.beginPath();
    ctx.moveTo(x, h - GROUND + 2);
    ctx.quadraticCurveTo(x + (r() - 0.5) * 4, h - GROUND - 8, x + (r() - 0.5) * 10, h - GROUND - 10 - r() * 18);
    ctx.stroke();
  }
}

// A live layer: a few of the fairy lights twinkling brighter, the strand of
// Edison bulbs through the crown, and fireflies drifting in the grass.
export function nightLights() {
  return (w, h) => {
    const r = seeded(91);
    const points = lightPoints(w, h);
    const twinkly = points.filter(() => r() < 0.35).map(([x, y]) => ({ x, y, phase: r() * 6, speed: 0.8 + r() * 1.6 }));
    // the Edison bulbs: a strand swagged across the crown (tap one: it swings)
    const crownY = h - GROUND - TREE * 0.72;
    const bulbs = stringLights({ y: crownY, y2: crownY + 16, sag: 40, from: 0.5 - 250 / w, to: 0.5 + 250 / w, spacing: 46, bulb: 13, drop: 12, swagWidth: 170, edison: true, camera: () => 0, rate: 0 })(w, h);
    const flies = Array.from({ length: Math.round(16 * Math.max(1, w / 430)) }, () => ({ x: r() * w, y: h - GROUND - r() * 200, phase: r() * 6, drift: 6 + r() * 10 }));
    return {
      draw(ctx, t, dt, p) {
        // the twinkling fairy lights
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const l of twinkly) {
          const a = Math.max(0, Math.sin(t * l.speed + l.phase)) ** 3;
          if (a > 0.02) stamp(ctx, glow(12, '255, 220, 150'), l.x, l.y, { alpha: a * 0.9 });
        }
        // the fireflies: wandering slowly, blinking
        for (const f of flies) {
          const x = f.x + Math.sin(t * 0.3 + f.phase) * f.drift * 3;
          const y = f.y + Math.sin(t * 0.45 + f.phase * 2) * f.drift;
          const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 1.6 + f.phase * 3));
          stamp(ctx, glow(14, '220, 240, 140'), x, y, { alpha: a });
        }
        ctx.restore();
        bulbs.draw(ctx, t, dt, p);
      },
      tap: (x, y) => bulbs.tap(x, y),
    };
  };
}
