// Things that float around the page without being tied to anything:
//
//   drift  – a gentle, never-ending fall (petals, glitter) or rise (bokeh,
//            gold dust). When a piece leaves the page it starts again.
//   bursts – a one-off puff when you tap empty space; pieces fade out and vanish.
//
// Drifting pieces live at one of three DEPTHS. Far ones are smaller, slower,
// fainter and out of focus; near ones are bigger and sharp. That layering is
// what makes the page feel deep instead of flat.
//
// Most pieces tumble as they go (petals, foil). A piece made with `upright:
// true` falls like a whole flower instead: its heavy end down, gliding side to
// side as it comes down, leaning the way it's going, and turning slowly on its
// own stem. Draw it with pose(piece).

import { rand } from './draw';

export const DEPTHS = [
  { scale: 0.55, speed: 0.5, blur: 2, alpha: 0.45 }, // far
  { scale: 0.85, speed: 0.8, blur: 0.8, alpha: 0.75 }, // middle
  { scale: 1.15, speed: 1.15, blur: 0, alpha: 1 }, // near
];

const randomDepth = () => {
  const r = Math.random();
  return r < 0.45 ? 0 : r < 0.8 ? 1 : 2;
};

// gravity > 0 falls, gravity < 0 rises.
export function createDrift(world, { count, gravity = 0.12, drag = 0.07, make }) {
  const pieces = [];
  const rising = gravity < 0;

  const place = (piece, anywhere) => {
    const x = rand(-20, world.width + 20);
    let y;
    if (anywhere) y = rand(-40, world.height);
    else y = rising ? world.height + rand(10, 60) : rand(-60, -10);
    Object.assign(piece.p, { x, y, px: x, py: y });
  };

  for (let i = 0; i < count; i++) {
    const piece = { phase: rand(0, Math.PI * 2), spin: rand(0, Math.PI * 2), depth: randomDepth(), ...make() };
    const d = DEPTHS[piece.depth];
    piece.p = world.addPoint(0, 0, {
      gravity: gravity * d.speed,
      drag,
      wind: 1.4 * d.speed,
      bounded: false,
      light: true,
    });
    place(piece, true);
    pieces.push(piece);
  }
  // draw far pieces first, near pieces last
  pieces.sort((a, b) => a.depth - b.depth);

  return {
    pieces,
    update(time) {
      for (const piece of pieces) {
        // a little side-to-side flutter on top of the wind
        if (piece.upright) settle(piece, time);
        else {
          piece.p.x += Math.sin(time * (piece.flutter ?? 1.3) + piece.phase) * 0.18;
          piece.spin += piece.spinSpeed ?? 0.02;
        }
        const { x, y } = piece.p;
        const gone =
          (rising ? y < -60 : y > world.height + 30) || x < -80 || x > world.width + 80;
        if (gone) place(piece, false);
      }
    },
  };
}

// A flower falling upright: a slow glide from side to side, and a lean into it.
function settle(piece, time) {
  const { p } = piece;
  piece.glide ??= { rate: rand(1.1, 1.8), reach: rand(0.35, 0.6) * p.drag, phase: rand(0, Math.PI * 2), turn: rand(0, 6), turning: rand(0.6, 1.4) * (Math.random() < 0.5 ? -1 : 1) };
  const g = piece.glide;
  const falling = Math.min(1, Math.max(0, (p.y - p.py) / 0.3)); // the glide only once it's coming down
  // (a push each step adds up to a speed of about push ÷ drag: so the push is a share of the drag)
  p.x += Math.sin(time * g.rate + g.phase) * g.reach * falling;
  const lean = Math.max(-0.45, Math.min(0.45, (p.x - p.px) * 0.9));
  piece.lean = (piece.lean ?? 0) + (lean - (piece.lean ?? 0)) * 0.1;
  g.turn += g.turning / 60;
}

// How to draw an upright piece: its lean, and how far round it has turned
// (a flower seen a little from the side looks a little narrower).
export const pose = (piece) => ({ angle: piece.lean ?? 0, flip: 0.84 + 0.16 * Math.cos(piece.glide?.turn ?? 0) });

export function createBursts(world) {
  const pieces = [];

  return {
    pieces,

    // Throw `count` pieces out from (x, y), mostly upwards.
    spawn(x, y, count, make, { speed = 7, gravity = 0.45, drag = 0.035, life = 2.6 } = {}) {
      for (let i = 0; i < count; i++) {
        const angle = rand(-Math.PI * 0.95, -Math.PI * 0.05); // upward fan
        const v = speed * rand(0.35, 1);
        const piece = { age: 0, life: life * rand(0.7, 1.1), spin: rand(0, 6), ...make() };
        // flowers aren't all alike: some fall a little faster, so a puff opens out as it comes down
        const weight = piece.upright ? rand(0.65, 1.35) : 1;
        piece.p = world.addPoint(x, y, { gravity: gravity * weight, drag, wind: 1, bounded: false, light: true });
        piece.p.px = x - Math.cos(angle) * v;
        piece.p.py = y - Math.sin(angle) * v;
        pieces.push(piece);
      }
    },

    update(dt) {
      for (let i = pieces.length - 1; i >= 0; i--) {
        const piece = pieces[i];
        piece.age += dt;
        if (piece.upright) settle(piece, piece.age);
        else piece.spin += piece.spinSpeed ?? 0.15;
        if (piece.age > piece.life) {
          world.removePoint(piece.p);
          pieces.splice(i, 1);
        }
      }
    },

    // 1 → 0 over the last 0.6 s of a piece's life
    fade: (piece) => Math.max(0, Math.min(1, (piece.life - piece.age) / 0.6)),
  };
}
