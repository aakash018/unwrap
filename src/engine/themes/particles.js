// Things that float around the page without being tied to anything:
//
//   drift  – a gentle, never-ending fall (petals, glitter) or rise (bokeh,
//            gold dust). When a piece leaves the page it starts again.
//   bursts – a one-off puff when you tap empty space; pieces fade out and vanish.
//
// Drifting pieces live at one of three DEPTHS. Far ones are smaller, slower,
// fainter and out of focus; near ones are bigger and sharp. That layering is
// what makes the page feel deep instead of flat.

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
        piece.p.x += Math.sin(time * (piece.flutter ?? 1.3) + piece.phase) * 0.18;
        piece.spin += piece.spinSpeed ?? 0.02;
        const { x, y } = piece.p;
        const gone =
          (rising ? y < -60 : y > world.height + 30) || x < -80 || x > world.width + 80;
        if (gone) place(piece, false);
      }
    },
  };
}

export function createBursts(world) {
  const pieces = [];

  return {
    pieces,

    // Throw `count` pieces out from (x, y), mostly upwards.
    spawn(x, y, count, make, { speed = 7, gravity = 0.45, drag = 0.035, life = 2.6 } = {}) {
      for (let i = 0; i < count; i++) {
        const angle = rand(-Math.PI * 0.95, -Math.PI * 0.05); // upward fan
        const v = speed * rand(0.35, 1);
        const p = world.addPoint(x, y, { gravity, drag, wind: 1, bounded: false, light: true });
        p.px = x - Math.cos(angle) * v;
        p.py = y - Math.sin(angle) * v;
        pieces.push({ p, age: 0, life: life * rand(0.7, 1.1), spin: rand(0, 6), ...make() });
      }
    },

    update(dt) {
      for (let i = pieces.length - 1; i >= 0; i--) {
        const piece = pieces[i];
        piece.age += dt;
        piece.spin += piece.spinSpeed ?? 0.15;
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
