// Roses, filling the gift box, to play with:
//   move over them  → they nod, like flowers brushed by a hand
//   tap one         → it sheds a few petals
//   drag one        → it comes out on its stem; let go and it goes back in its place
//
// Every rose in front is a picture of its own (rosesLayout.js) on a spring.
// They're moved directly, not by React, so it stays smooth.

import { useEffect, useRef, useState } from 'react';
import { newId } from '../../utils/newId';
import { pictureOf } from './pictures';
import { ROSES } from './rosesLayout';

const W = 221; // the whole picture, in the block's px
const H = 182;
const STEM = { w: 34, h: 136 };
const FOOT = [W / 2, H + 40]; // where the stems come from, down in the box
const BRUSH = 54; // px: how near the pointer must pass for a rose to nod
const DRAG_FROM = 6; // px a press must travel before it's a drag

const limit = (value, most) => Math.max(-most, Math.min(most, value));

const HEADS = ROSES.map(({ name, x, y, w, h }, i) => ({
  name,
  i,
  left: x * W,
  top: y * H,
  width: w * W,
  height: h * H,
  cx: (x + w / 2) * W,
  cy: (y + h / 2) * H,
}));

export default function Roses() {
  const box = useRef(null);
  const heads = useRef([]);
  const stems = useRef([]);
  const sim = useRef(null);
  const [petals, setPetals] = useState([]);

  // ── the springs ──
  useEffect(() => {
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const roses = HEADS.map((head, i) => ({ ...head, x: 0, y: 0, vx: 0, vy: 0, turn: 0, spin: 0, held: false, phase: i * 1.7 }));
    sim.current = roses;
    let frame;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      roses.forEach((r, i) => {
        if (!r.held) {
          r.vx += (-150 * r.x - 15 * r.vx) * dt;
          r.vy += (-150 * r.y - 15 * r.vy) * dt;
          r.x += r.vx * dt;
          r.y += r.vy * dt;
        }
        r.spin += (-70 * r.turn - 5.5 * r.spin) * dt;
        r.turn += r.spin * dt;
        const away = Math.hypot(r.x, r.y);
        const breathe = calm ? 0 : Math.sin(now / 1300 + r.phase) * 0.7;
        const head = heads.current[i];
        head.style.transform = `translate(${r.x.toFixed(2)}px, ${r.y.toFixed(2)}px) rotate(${(r.turn + breathe).toFixed(2)}deg) scale(${(1 + Math.min(0.06, away / 900)).toFixed(3)})`;
        head.style.zIndex = r.held || away > 30 ? 30 : 10 + i;
        head.style.filter = away > 4 ? `drop-shadow(0 ${Math.min(10, away / 8).toFixed(1)}px ${Math.min(9, away / 7).toFixed(1)}px rgba(20, 0, 10, 0.5))` : '';
        // its stem: still in the box, it points to where it grew; free, it hangs
        const stem = stems.current[i];
        const [hx, hy] = [r.cx + r.x, r.cy + r.y];
        const [dx, dy] = [FOOT[0] - hx, FOOT[1] - hy];
        const free = Math.min(1, Math.max(0, (Math.hypot(dx, dy) - STEM.h) / 60));
        const lean = Math.atan2(-dx, Math.max(20, dy)) * (1 - free) + (r.turn * Math.PI) / 360;
        stem.style.opacity = Math.min(1, Math.max(0, (away - 16) / 14)).toFixed(2);
        stem.style.zIndex = free > 0.9 ? 29 : 9; // behind the others, until it's out
        stem.style.transform = `translate(${(hx - STEM.w / 2).toFixed(2)}px, ${hy.toFixed(2)}px) rotate(${lean.toFixed(3)}rad)`;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // ── petals ──
  const shed = ({ cx, cy, x = 0, y = 0 }, count) =>
    setPetals((now) => [
      ...now.slice(-14),
      ...Array.from({ length: count }, () => ({
        id: newId(),
        picture: Math.floor(Math.random() * 3),
        x: cx + x - 10 + (Math.random() - 0.5) * 34,
        y: cy + y - 8 + (Math.random() - 0.5) * 24,
        dx: (Math.random() - 0.5) * 130,
        rot: (Math.random() - 0.5) * 500,
        size: 17 + Math.random() * 9,
        late: Math.random() * 0.25,
      })),
    ]);

  // ── the pointer ──
  const before = useRef(null); // where it last was
  const pull = useRef(null); // the rose being pressed: { r, startX, startY, dragging }

  const placeOf = (e) => {
    const { left, top, width } = box.current.getBoundingClientRect();
    const k = W / width; // (the block may be zoomed)
    return [(e.clientX - left) * k, (e.clientY - top) * k];
  };
  // the rose under a point: the nearest head, if it's near enough
  const roseAt = (x, y) => {
    let best = null;
    let near = 34;
    for (const r of sim.current) {
      const d = Math.hypot(r.cx + r.x - x, r.cy + r.y - y);
      if (d < near) [best, near] = [r, d];
    }
    return best;
  };

  const onPointerDown = (e) => {
    const [x, y] = placeOf(e);
    const r = roseAt(x, y);
    if (!r) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pull.current = { r, startX: x, startY: y, dragging: false };
  };

  const onPointerMove = (e) => {
    const [x, y] = placeOf(e);
    const [px, py] = before.current ?? [x, y];
    before.current = [x, y];
    const p = pull.current;
    if (p) {
      if (!p.dragging && Math.hypot(x - p.startX, y - p.startY) < DRAG_FROM) return;
      p.dragging = p.r.held = true;
      p.r.vx = (x - p.startX - p.r.x) * 30;
      p.r.vy = (y - p.startY - p.r.y) * 30;
      p.r.spin += (x - px) * 4;
      [p.r.x, p.r.y] = [x - p.startX, y - p.startY];
      return;
    }
    // brushing past: the roses along the way nod the way it's going
    const [mx, my] = [x - px, y - py];
    const far = mx * mx + my * my;
    if (!far) return;
    for (const r of sim.current) {
      const along = Math.max(0, Math.min(1, ((r.cx - px) * mx + (r.cy - py) * my) / far));
      const d = Math.hypot(r.cx - px - mx * along, r.cy - py - my * along);
      if (d > BRUSH) continue;
      const push = 1 - d / BRUSH;
      r.spin = limit(r.spin + limit(mx * 14, 130) * push, 170);
      r.vx = limit(r.vx + limit(mx * 9, 100) * push, 150);
      r.vy = limit(r.vy + limit(my * 7, 70) * push, 110);
    }
  };

  const onPointerUp = () => {
    const p = pull.current;
    pull.current = null;
    if (!p) return;
    p.r.held = false;
    if (p.dragging) {
      p.r.vx = limit(p.r.vx, 500);
      p.r.vy = limit(p.r.vy, 500);
      if (Math.hypot(p.r.x, p.r.y) > 60) shed(p.r, 2);
      return;
    }
    // a tap
    p.r.spin += (Math.random() < 0.5 ? -1 : 1) * 90;
    p.r.vy += 70;
    shed(p.r, 3);
  };

  const shake = () => {
    for (const r of sim.current) {
      r.spin += (Math.random() - 0.5) * 160;
      r.vx += (Math.random() - 0.5) * 120;
    }
    shed(HEADS[Math.floor(Math.random() * HEADS.length)], 5);
  };

  return (
    <button
      ref={box}
      type="button"
      data-no-drag // in the editor, dragging here plays with the roses
      aria-label="Roses. Shake them"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => (before.current = null)}
      onClick={(e) => e.detail === 0 && shake()} // from the keyboard
      className="relative block cursor-grab touch-none rounded-[50%_50%_0_0] outline-none select-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-gold"
      style={{ width: W, height: H }}
    >
      <img src={pictureOf('roses')} alt="" draggable={false} className="pointer-events-none absolute inset-0 size-full max-w-none" />
      {HEADS.map(({ name, i, left, top, width, height }) => (
        <span key={name}>
          <img
            ref={(el) => (stems.current[i] = el)}
            src={pictureOf('rose-stem')}
            alt=""
            draggable={false}
            className="pointer-events-none absolute top-0 left-0 max-w-none origin-top opacity-0"
            style={{ width: STEM.w, height: STEM.h }}
          />
          <img
            ref={(el) => (heads.current[i] = el)}
            src={pictureOf(name)}
            alt=""
            draggable={false}
            className="pointer-events-none absolute max-w-none will-change-transform"
            style={{ left, top, width, height }}
          />
        </span>
      ))}
      {petals.map(({ id, picture, x, y, dx, rot, size, late }) => (
        <img
          key={id}
          src={pictureOf(`petal-${picture}`)}
          alt=""
          draggable={false}
          onAnimationEnd={() => setPetals((now) => now.filter((one) => one.id !== id))}
          className="pointer-events-none absolute z-40 max-w-none animate-petal"
          style={{ left: x, top: y, width: size, animationDelay: `${late}s`, '--dx': `${dx}px`, '--rot': `${rot}deg` }}
        />
      ))}
    </button>
  );
}
