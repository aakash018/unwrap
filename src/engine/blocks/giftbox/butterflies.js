// The butterflies let out of the gift box: they flutter about the part of the
// page that's on screen, settle on its words and things, and fly up when
// something comes near. releaseButterflies(anchor) returns a way to stop.

import { calm, pageLayer } from './pageLayer';
import { pictureOf } from './pictures';

const COUNT = 10;
const WING = 46; // a wing's height (px); its picture is 270 × 450
const ROOT = [0.044, 0.524]; // where it joins the body, in its picture
const SHY = 52; // px: how near the pointer may come
const KINDS = [0, 1, 2, 0, 2, 1, 0, 2, 1, 2];

const rand = (a, b) => a + Math.random() * (b - a);

function makeButterfly(kind, size) {
  const el = document.createElement('div');
  Object.assign(el.style, { position: 'absolute', left: '-28px', top: '-28px', width: '56px', height: '56px', perspective: '190px', pointerEvents: 'auto', cursor: 'pointer', willChange: 'transform' });
  const picture = (name, width, left) => {
    const img = document.createElement('img');
    img.src = pictureOf(name);
    img.alt = '';
    img.draggable = false;
    Object.assign(img.style, { position: 'absolute', left: `${left}px`, top: `${28 - WING * ROOT[1]}px`, width: `${width}px`, height: `${WING}px`, maxWidth: 'none', pointerEvents: 'none', transformOrigin: `${ROOT[0] * 100}% ${ROOT[1] * 100}%` });
    el.append(img);
    return img;
  };
  const w = WING * 0.6;
  const left = picture(`wing-${kind}`, w, 28 - w * ROOT[0]);
  const right = picture(`wing-${kind}`, w, 28 - w * ROOT[0]);
  picture('wing-body', WING * (120 / 450), 28 - (WING * (120 / 450)) / 2);
  return { el, left, right, size };
}

export function releaseButterflies(anchor) {
  const layer = pageLayer(anchor);
  if (!layer) return () => {};
  const still = calm();
  const start = performance.now();
  let frame;
  let last = start;

  // Somewhere on screen to go: on something that's on the page, back on the bed
  // in the box, or just a place in the air.
  const pickSpot = () => {
    const view = layer.view();
    const inView = ({ y, h, w }) => w > 60 && y + h * 0.5 > view.top + 60 && y < view.top + view.height - 60;
    const roll = Math.random();
    const bed = layer.rectOf(anchor);
    if (roll < 0.2 && inView(bed)) return { x: bed.x + bed.w * rand(0.2, 0.8), y: bed.y + bed.h * rand(0.3, 0.5), rest: true };
    if (roll < 0.72) {
      const things = [...layer.page.querySelectorAll('[data-frame]:not([data-section])')].filter((one) => !one.contains(anchor)).map(layer.rectOf).filter(inView);
      if (things.length) {
        const one = things[Math.floor(Math.random() * things.length)];
        return { x: one.x + one.w * rand(0.14, 0.86), y: Math.max(view.top + 30, one.y + Math.min(one.h * 0.4, 40) * Math.random()), rest: true };
      }
    }
    return { x: rand(0.06, 0.94) * layer.width(), y: view.top + view.height * rand(0.08, 0.85), rest: false };
  };

  const flock = Array.from({ length: COUNT }, (_, i) => {
    const b = makeButterfly(KINDS[i], rand(0.72, 1.12));
    Object.assign(b, { out: start + 500 + i * 170, mode: 'in', vx: 0, vy: 0, heading: -Math.PI / 2, phase: rand(0, 6), beat: rand(0.9, 1.15), until: 0, spot: null, shown: 0 });
    b.el.style.opacity = '0';
    layer.el.append(b.el);
    b.el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      startle(b, e);
    });
    b.el.addEventListener('click', (e) => e.stopPropagation());
    return b;
  });

  // Off, away from where it was frightened from.
  function startle(b, e) {
    if (b.mode === 'in' || still) return;
    const [x, y] = layer.toPage(e.clientX, e.clientY);
    const away = Math.atan2(b.y - y, b.x - x) + rand(-0.6, 0.6);
    const { top, height } = layer.view();
    b.mode = 'fly';
    b.vx = Math.cos(away) * 300;
    b.vy = Math.sin(away) * 300 - 80;
    b.spot = {
      x: Math.max(20, Math.min(layer.width() - 20, b.x + Math.cos(away) * rand(180, 340))),
      y: Math.max(top + 40, Math.min(top + height - 40, b.y + Math.sin(away) * rand(180, 320) - 60)),
      rest: false,
    };
  }

  const onPointer = (e) => {
    const [x, y] = layer.toPage(e.clientX, e.clientY);
    for (const b of flock) if (b.mode === 'rest' && Math.hypot(b.x - x, b.y - y) < SHY) startle(b, e);
  };
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerdown', onPointer, { passive: true });

  const tick = (now) => {
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    const view = layer.view();
    for (const b of flock) {
      if (b.mode === 'in') {
        if (now < b.out) continue;
        const bed = layer.rectOf(anchor);
        Object.assign(b, { x: bed.x + bed.w * rand(0.3, 0.7), y: bed.y + bed.h * 0.45, vx: rand(-110, 110), vy: rand(-260, -170), mode: 'fly', spot: { x: rand(0.08, 0.92) * layer.width(), y: view.top + view.height * rand(0.08, 0.4), rest: false } });
        if (still) Object.assign(b, { x: bed.x + bed.w * rand(0.1, 0.9), y: bed.y + bed.h * rand(0, 0.4), mode: 'rest', until: Infinity });
      }
      b.shown = Math.min(1, b.shown + dt * 2.5);

      if (b.mode === 'rest') {
        const gone = b.y < view.top - 120 || b.y > view.top + view.height + 120; // they've scrolled on: follow
        if (t > b.until || (gone && !still)) {
          b.mode = 'fly';
          b.spot = pickSpot();
          b.vy -= 90;
        }
      } else {
        // has its place scrolled away?
        if (b.spot.y < view.top - 60 || b.spot.y > view.top + view.height + 60) b.spot = pickSpot();
        const [dx, dy] = [b.spot.x - b.x, b.spot.y - b.y];
        const far = Math.hypot(dx, dy);
        const speed = Math.min(760, 70 + far * 0.75);
        // towards it, wavering as they do
        const aim = Math.atan2(dy, dx) + Math.sin(t * 2.3 * b.beat + b.phase) * 0.75 * Math.min(1, far / 90);
        const turn = Math.min(1, dt * 3.2);
        b.vx += (Math.cos(aim) * speed - b.vx) * turn;
        b.vy += (Math.sin(aim) * speed - b.vy) * turn + Math.sin(t * 5 + b.phase) * 60 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (far < 16) {
          if (b.spot.rest) Object.assign(b, { mode: 'rest', until: t + rand(2.5, 7.5), vx: 0, vy: 0, lie: rand(-0.7, 0.7) });
          else b.spot = pickSpot();
        }
      }

      const resting = b.mode === 'rest';
      const want = resting ? (b.lie ?? 0) - Math.PI / 2 : Math.atan2(b.vy, b.vx);
      let swing = want - b.heading;
      swing -= Math.round(swing / (Math.PI * 2)) * Math.PI * 2;
      b.heading += swing * Math.min(1, dt * 5);
      // the wings: quick in the air, slow and dreamy at rest
      const flap = resting ? 36 + 30 * Math.sin(t * 1.9 * b.beat + b.phase) : 38 + 36 * Math.sin(t * 34 * b.beat + b.phase);
      b.el.style.opacity = b.shown;
      b.el.style.transform = `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px) rotate(${(b.heading + Math.PI / 2).toFixed(3)}rad) scale(${(b.size * (0.4 + 0.6 * b.shown)).toFixed(3)})`;
      b.right.style.transform = `rotateY(${-flap.toFixed(1)}deg)`;
      b.left.style.transform = `scaleX(-1) rotateY(${-flap.toFixed(1)}deg)`;
      const shade = resting ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' : '';
      if (b.shade !== shade) b.el.style.filter = b.shade = shade;
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('pointerdown', onPointer);
    layer.remove();
  };
}
