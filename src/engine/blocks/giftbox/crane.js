// The paper crane out of the gift box. flyCrane(anchor) returns a way to stop. It hovers over the box, and:
//   tap it   → it unfolds into its square of paper, folds itself up again, and
//              flies a round of the page before coming home
//   drag it  → it goes where you take it; let go, and it glides home

import { calm, pageLayer } from './pageLayer';
import { pictureOf } from './pictures';

const W = 240; // the crane's picture on the page (440 × 380)
const H = W * (380 / 440);
const PAPER = 150; // its square of paper
const BEATS = 11; // pictures of its wings, from low to high
const FOLDS = 7; // pictures of the paper, from square to folded

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (2 - 2 * t) ** 2 / 2);
const part = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const mix = (a, b, t) => a + (b - a) * t;

// A smooth way through some points, t = 0 … 1.
function along(points, t) {
  const x = Math.min(0.9999, Math.max(0, t)) * (points.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const [a, b, c, d] = [points[i - 1] ?? points[i], points[i], points[i + 1], points[i + 2] ?? points[i + 1]];
  return [0, 1].map((k) => 0.5 * (2 * b[k] + (c[k] - a[k]) * f + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * f * f + (3 * b[k] - a[k] - 3 * c[k] + d[k]) * f ** 3));
}

export function flyCrane(anchor) {
  const layer = pageLayer(anchor);
  if (!layer) return () => {};
  const still = calm();

  const box = (width, height, sheet, steps) => {
    const el = document.createElement('div');
    Object.assign(el.style, { position: 'absolute', left: `${-width / 2}px`, top: `${-height / 2}px`, width: `${width}px`, height: `${height}px`, backgroundImage: `url(${pictureOf(sheet)})`, backgroundSize: `${steps * 100}% 100%`, pointerEvents: 'none' });
    return el;
  };
  const el = document.createElement('div');
  Object.assign(el.style, { position: 'absolute', left: '0', top: '0', willChange: 'transform', opacity: '0' });
  const bird = box(W, H, 'crane', BEATS);
  const paper = box(PAPER, PAPER, 'crane-paper', FOLDS);
  paper.style.opacity = '0';
  // what can be touched: about its body and wings
  const grip = document.createElement('button');
  grip.type = 'button';
  grip.setAttribute('aria-label', 'A paper crane. Touch it');
  Object.assign(grip.style, { position: 'absolute', left: '-84px', top: '-64px', width: '168px', height: '128px', borderRadius: '50%', pointerEvents: 'auto', touchAction: 'none', cursor: 'grab', background: 'none', border: '0', outlineOffset: '2px' });
  el.append(paper, bird, grip);
  layer.el.append(el);

  const started = performance.now();
  let frame;
  let last = started;
  let mode = 'home'; // 'home' | 'unfold' | 'fly' | 'held'
  let since = started; // when the mode began
  let path = null; // [points, seconds], while flying
  let x = null;
  let y = null;
  let face = 1; // 1 = looking left (as it's pictured), -1 = right
  let tilt = 0;
  let beat = 0;
  let wings = 3; // which picture of the wings

  const home = () => {
    const rect = layer.rectOf(anchor);
    return [rect.x + rect.w / 2, rect.y + rect.h / 2];
  };
  const become = (next, now = performance.now()) => {
    mode = next;
    since = now;
  };

  // A round of what's on screen, and home.
  const setOff = (first) => {
    const { top, height } = layer.view();
    const [hx, hy] = home();
    const wide = layer.width();
    const reach = Math.min(wide * 0.4, 460);
    const at = (dx, fy) => [Math.max(70, Math.min(wide - 70, hx + dx * reach)), top + height * fy];
    const round = Math.random() < 0.5 ? 1 : -1;
    path = [[[x, y], ...(first ? [first] : []), at(0.95 * round, 0.34), at(0.35 * round, 0.12), at(-0.9 * round, 0.26), at(-0.6 * round, 0.6), [hx, hy]], first ? 5.2 : 6.4];
    become('fly');
  };

  // ── touching it ──
  let press = null; // { id, startX, startY, dx, dy, dragging, seen: [[x, y, time]…] }
  grip.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (mode === 'unfold') return;
    const [px, py] = layer.toPage(e.clientX, e.clientY);
    press = { id: e.pointerId, startX: px, startY: py, dx: x - px, dy: y - py, dragging: false, seen: [] };
    grip.setPointerCapture(e.pointerId);
  });
  grip.addEventListener('pointermove', (e) => {
    if (press?.id !== e.pointerId) return;
    const [px, py] = layer.toPage(e.clientX, e.clientY);
    if (!press.dragging && Math.hypot(px - press.startX, py - press.startY) < 7) return;
    if (!press.dragging) become('held');
    press.dragging = true;
    press.to = [px + press.dx, py + press.dy];
    press.seen = [...press.seen.slice(-4), [px, py, e.timeStamp]];
  });
  const letGo = (e) => {
    if (press?.id !== e.pointerId) return;
    const { dragging, seen } = press;
    press = null;
    if (!dragging) return;
    // thrown: first on the way it was going
    const [a, b] = [seen[0], seen[seen.length - 1]];
    const time = Math.max(16, b[2] - a[2]) / 1000;
    const [vx, vy] = [(b[0] - a[0]) / time, (b[1] - a[1]) / time];
    const force = Math.min(1, Math.hypot(vx, vy) / 900);
    if (force > 0.35) setOff([Math.max(60, Math.min(layer.width() - 60, x + vx * 0.22)), y + Math.max(-260, Math.min(200, vy * 0.22))]);
    else {
      path = [[[x, y], home()], 1.4];
      become('fly');
    }
  };
  grip.addEventListener('pointerup', letGo);
  grip.addEventListener('pointercancel', letGo);
  grip.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mode === 'home') become('unfold'); // (after a drag it's flying)
  });

  const show = (element, steps, at) => {
    element.style.backgroundPosition = `${(Math.max(0, Math.min(steps - 1, Math.round(at))) / (steps - 1)) * 100}% 0`;
  };

  const tick = (now) => {
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    const t = (now - since) / 1000;
    const [hx, hy] = home();
    if (x === null) [x, y] = [hx, hy];
    let [toX, toY] = [x, y];
    let turn = 0; // of the paper
    let squash = 1;
    let seen = 1; // how much of the bird shows, against the paper

    if (mode === 'home') {
      [toX, toY] = [hx, hy + (still ? 0 : Math.sin(now / 900) * 5)];
      x = mix(x, toX, Math.min(1, dt * 8));
      y = mix(y, toY, Math.min(1, dt * 8));
      wings = mix(wings, 5.2 + (still ? 0 : Math.sin(now / 620) * 2.6), Math.min(1, dt * 6));
      face = mix(face, 1, Math.min(1, dt * 4));
      tilt = mix(tilt, 0, Math.min(1, dt * 5));
    } else if (mode === 'unfold') {
      x = mix(x, hx, Math.min(1, dt * 8));
      y = mix(y, hy - 26, Math.min(1, dt * 5));
      tilt = mix(tilt, 0, Math.min(1, dt * 8));
      face = mix(face, 1, Math.min(1, dt * 8));
      // wings up · the bird becomes folded paper · it opens · and back again
      wings = mix(4, BEATS - 1, ease(part(t, 0, 0.4)) * (1 - ease(part(t, 4.0, 4.4))));
      seen = 1 - ease(part(t, 0.35, 0.75)) * (1 - ease(part(t, 3.55, 3.95)));
      squash = mix(0.45, 1, seen);
      show(paper, FOLDS, (FOLDS - 1) * (1 - ease(part(t, 0.75, 1.5)) * (1 - ease(part(t, 2.7, 3.45)))));
      turn = Math.sin(now / 300) * 3 * part(t, 1.4, 1.8) * (1 - part(t, 2.5, 2.8));
      if (t > 4.4) {
        if (still) become('home', now);
        else setOff();
      }
    } else if (mode === 'held') {
      const [px, py] = press?.to ?? [x, y];
      const vx = px - x;
      x = mix(x, px, Math.min(1, dt * 18));
      y = mix(y, py, Math.min(1, dt * 18));
      if (Math.abs(vx) > 4) face = mix(face, vx > 0 ? -1 : 1, Math.min(1, dt * 8));
      tilt = mix(tilt, Math.max(-14, Math.min(14, vx * 0.25)), Math.min(1, dt * 6));
      beat += dt * 13;
      wings = 5 + Math.sin(beat) * 4.5;
    } else if (mode === 'fly') {
      const [points, seconds] = path;
      points[points.length - 1] = [hx, hy]; // (the page may have scrolled or grown)
      const k = t / seconds;
      [toX, toY] = along(points, k < 0.15 ? k * (0.4 + 4 * k) : k); // away gently
      const [vx, vy] = [(toX - x) / Math.max(dt, 0.001), (toY - y) / Math.max(dt, 0.001)];
      [x, y] = [toX, toY];
      if (Math.abs(vx) > 12) face = mix(face, vx > 0 ? -1 : 1, Math.min(1, dt * 5));
      tilt = mix(tilt, Math.max(-24, Math.min(24, (vy / (Math.abs(vx) + 140)) * -26 * Math.sign(face))), Math.min(1, dt * 4));
      beat += dt * (vy < -20 ? 15 : 8); // harder going up, gliding down
      wings = 5 + Math.sin(beat) * (vy > 60 ? 1.6 : 4.4);
      if (k >= 1) become('home', now);
    }

    const come = Math.min(1, (now - started - 350) / 800); // out of the box
    el.style.opacity = Math.max(0, come).toFixed(2);
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${mix(0.4, 1, ease(Math.max(0, come))).toFixed(3)})`;
    show(bird, BEATS, wings);
    bird.style.opacity = seen.toFixed(2);
    bird.style.transform = `scale(${(face * squash).toFixed(3)}, ${mix(0.8, 1, squash).toFixed(3)}) rotate(${tilt.toFixed(1)}deg)`;
    paper.style.opacity = (1 - seen).toFixed(2);
    paper.style.transform = `rotate(${turn.toFixed(1)}deg) scale(${mix(1.06, 0.9, seen).toFixed(3)})`;
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    layer.remove();
  };
}
