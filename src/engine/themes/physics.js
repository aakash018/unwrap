// A tiny physics engine for the theme decorations ("Verlet integration").
//
// Everything is made of POINTS joined by LINKS:
//   • a balloon   = one light point that floats up (negative gravity) + a string
//   • a garland   = a rope of heavy points (the flowers) pinned at both ends
//   • a petal     = one feather-light point that drifts in the wind
//
// Each step, every point keeps moving the way it was moving (its "velocity" is
// just where it is now minus where it was last step), gravity and wind nudge
// it, then links pull points back to the right distance from each other.
// That's all it takes for ropes to swing and balloons to bob.

const ITERATIONS = 6; // how many times per step links are tightened (more = stiffer ropes)
const MAX_FLING = 30; // px per step — stops a fast flick from launching things to the moon

export class World {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.points = [];
    this.links = [];
    this.gravity = 900; // px / s²
    this.wind = 0; // px / s², set by the theme layer every frame
    this.time = 0;
  }

  // ── Building ─────────────────────────────────────────────────────────────

  // Options:
  //   pinned     – never moves (a nail in the wall)
  //   gravity    – 1 = normal, 0 = weightless, negative = floats up (balloons)
  //   drag       – 0..1, air resistance (petals: high, flowers: low)
  //   wind       – how much the wind pushes it
  //   mass       – heavier points move less when a link pulls
  //   radius     – size, for bumping into walls and each other
  //   collide    – bumps into other `collide` points (balloons don't overlap)
  //   bounded    – stays inside the page (falling petals don't)
  //   grabbable  – can be dragged with the mouse / finger
  //   light      – gets blown away when the pointer passes close by
  addPoint(x, y, options = {}) {
    const point = {
      x,
      y,
      px: x, // previous position
      py: y,
      pinned: false,
      grabbed: false,
      gravity: 1,
      drag: 0.02,
      wind: 1,
      mass: 1,
      radius: 0,
      collide: false,
      bounded: true,
      grabbable: false,
      light: false,
      ...options,
    };
    this.points.push(point);
    return point;
  }

  // Keep two points `length` apart. `slackOnly` = like a string: it can go
  // loose, but never stretch longer than `length`.
  addLink(a, b, { length, stiffness = 1, slackOnly = false } = {}) {
    const link = {
      a,
      b,
      length: length ?? Math.hypot(b.x - a.x, b.y - a.y),
      stiffness,
      slackOnly,
    };
    this.links.push(link);
    return link;
  }

  // A rope from point `a` to point `b`, `segments` pieces long.
  // `sag` = how much longer than the straight distance (1.2 = 20% droop).
  // Returns every point along it, including a and b.
  addRope(a, b, segments, { sag = 1.1, droop = 0, point = {}, ...linkOptions } = {}) {
    const total = Math.hypot(b.x - a.x, b.y - a.y) * sag;
    const pieceLength = total / segments;
    const points = [a];

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      // start roughly in a curve so it settles quickly
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t + Math.sin(t * Math.PI) * droop;
      points.push(this.addPoint(x, y, point));
    }
    points.push(b);

    for (let i = 0; i < points.length - 1; i++) {
      this.addLink(points[i], points[i + 1], { length: pieceLength, slackOnly: true, ...linkOptions });
    }
    return points;
  }

  // A strand hanging straight down from `top`, `length` px long.
  // Returns its points; the last one is the free end (add a bell, a star…).
  addStrand(top, length, segments, { point = {}, end = {} } = {}) {
    const piece = length / segments;
    const points = [top];
    for (let i = 1; i <= segments; i++) {
      const isEnd = i === segments;
      const p = this.addPoint(top.x, top.y + piece * i, isEnd ? { ...point, ...end } : point);
      this.addLink(points[i - 1], p, { length: piece, slackOnly: true });
      points.push(p);
    }
    return points;
  }

  removePoint(point) {
    this.points = this.points.filter((p) => p !== point);
    this.links = this.links.filter((l) => l.a !== point && l.b !== point);
  }

  // ── Simulating ───────────────────────────────────────────────────────────

  step(dt) {
    this.time += dt;
    const dt2 = dt * dt;

    // 1. Move every free point
    for (const p of this.points) {
      if (p.pinned || p.grabbed) continue;
      const vx = (p.x - p.px) * (1 - p.drag);
      const vy = (p.y - p.py) * (1 - p.drag);
      p.px = p.x;
      p.py = p.y;
      p.x += vx + this.wind * p.wind * dt2;
      p.y += vy + this.gravity * p.gravity * dt2;
    }

    // 2. Pull links back to length, bump balloons apart, keep things on the page
    for (let i = 0; i < ITERATIONS; i++) {
      for (const link of this.links) this.#solveLink(link);
      this.#solveCollisions();
    }
    for (const p of this.points) this.#keepInside(p);
  }

  #solveLink({ a, b, length, stiffness, slackOnly }) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.hypot(dx, dy) || 0.0001;
    if (slackOnly && distance <= length) return; // string is loose, nothing to do

    const wa = a.pinned || a.grabbed ? 0 : 1 / a.mass;
    const wb = b.pinned || b.grabbed ? 0 : 1 / b.mass;
    const total = wa + wb;
    if (total === 0) return;

    const push = ((distance - length) / distance) * stiffness;
    a.x += dx * push * (wa / total);
    a.y += dy * push * (wa / total);
    b.x -= dx * push * (wb / total);
    b.y -= dy * push * (wb / total);
  }

  #solveCollisions() {
    const bodies = this.points.filter((p) => p.collide);
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy) || 0.0001;
        const overlap = a.radius + b.radius - distance;
        if (overlap <= 0) continue;
        const nx = (dx / distance) * overlap * 0.5;
        const ny = (dy / distance) * overlap * 0.5;
        if (!a.grabbed) { a.x -= nx; a.y -= ny; }
        if (!b.grabbed) { b.x += nx; b.y += ny; }
      }
    }
  }

  #keepInside(p) {
    if (!p.bounded || p.pinned) return;
    const r = p.radius;
    const bounce = 0.4;
    if (p.x < r) { const v = p.x - p.px; p.x = r; p.px = r + v * bounce; }
    if (p.x > this.width - r) { const v = p.x - p.px; p.x = this.width - r; p.px = p.x + v * bounce; }
    if (p.y < r) { const v = p.y - p.py; p.y = r; p.py = r + v * bounce; }
    if (p.y > this.height - r) { const v = p.y - p.py; p.y = this.height - r; p.py = p.y + v * bounce; }
  }

  // ── Touching ─────────────────────────────────────────────────────────────

  // The grabbable point under (x, y), or null.
  pick(x, y) {
    let best = null;
    let bestDistance = Infinity;
    for (const p of this.points) {
      if (!p.grabbable) continue;
      const d = Math.hypot(p.x - x, p.y - y);
      const reach = (p.grabRadius ?? p.radius) + 8;
      if (d < reach && d < bestDistance) {
        best = p;
        bestDistance = d;
      }
    }
    return best;
  }

  grab(p) {
    p.grabbed = true;
  }

  // Move a grabbed point to the pointer. Its previous position is kept, so on
  // release it carries on with the speed it was moving at (a "fling").
  drag(p, x, y) {
    p.px = p.x;
    p.py = p.y;
    p.x = x;
    p.y = y;
  }

  release(p) {
    p.grabbed = false;
    const vx = Math.max(-MAX_FLING, Math.min(MAX_FLING, p.x - p.px));
    const vy = Math.max(-MAX_FLING, Math.min(MAX_FLING, p.y - p.py));
    p.px = p.x - vx;
    p.py = p.y - vy;
  }

  // Blow `light` points away from (x, y) — like a hand passing through petals.
  blow(x, y, radius = 60, strength = 3) {
    for (const p of this.points) {
      if (!p.light) continue;
      const dx = p.x - x;
      const dy = p.y - y;
      const d = Math.hypot(dx, dy);
      if (d > radius || d === 0) continue;
      const f = (1 - d / radius) * strength;
      p.x += (dx / d) * f;
      p.y += (dy / d) * f;
    }
  }
}
