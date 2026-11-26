// How the gift box opens and closes: what's on its two canvases, moment by moment.
//
//   front – over the box: the silk, the shadows, and the lid until it's past the rim
//   rear  – behind the present: the lid standing open, and the light on it
//
//   createOpening({ front, rear, color }) → { untie(), open(), close(), settle(step), stop(), free() }
//   untie, open and close are promises; settle(step) goes straight to 0 tied,
//   1 untied or 2 open.

import { drawFrame, drawLidOpen, lengthOf } from './film';
import { AREA } from './area';

const SILK_FPS = 33; // (filmed at 30)
const SILK_END = lengthOf('film-silk') - 1;
const LID_END = lengthOf('film-lid') - 1;
const LID_OPEN = LID_END / 1.06; // (the film goes a little past open, for the bounce)
const CLEAR = 0.5; // how far open the lid is behind the rim
const RIM = 158; // px: the rim of the box's front, on the box

const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function createOpening({ front, rear, color }) {
  const at = { silk: 0, lid: 0, speed: 0, glow: 0, moving: '' };
  let frame = 0;
  let give = null; // ends what's playing

  const prepare = (canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const k = canvas.width / AREA.w;
    ctx.setTransform(k, 0, 0, k, -AREA.x * k, -AREA.y * k);
    return ctx;
  };
  const within = (ctx, top, bottom, draw) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(AREA.x, top, AREA.w, bottom - top);
    ctx.clip();
    draw();
    ctx.restore();
  };

  function draw() {
    const lid = (at.lid * LID_OPEN).toFixed(3);
    const passed = at.lid > CLEAR;
    const r = prepare(rear);
    const f = prepare(front);
    if (!at.moving && at.silk === 0) return; // tied: it's all in pictures
    const showsLid = at.lid > 0 || at.moving === 'open' || at.moving === 'close';
    const silk = at.moving === 'untie' || at.moving === 'close';
    // the lid's shadow: on the inside, and on the front
    if (showsLid) {
      within(r, AREA.y, RIM, () => drawFrame(r, 'film-lid-shade', lid));
      within(f, RIM, AREA.y + AREA.h, () => drawFrame(f, 'film-lid-shade', lid));
    }
    const on = passed ? r : f;
    if (at.lid === 1) drawLidOpen(on);
    else if (showsLid) drawFrame(on, 'film-lid', lid);
    if (passed) {
      // the light from the box, on the inside of the lid
      r.globalCompositeOperation = 'source-atop';
      const light = r.createRadialGradient(150, RIM - 14, 6, 150, RIM - 14, 190);
      light.addColorStop(0, `rgba(255, 214, 140, ${0.62 * at.glow})`);
      light.addColorStop(0.5, `rgba(255, 205, 130, ${0.26 * at.glow})`);
      light.addColorStop(1, 'rgba(255, 200, 120, 0)');
      r.fillStyle = light;
      r.fillRect(AREA.x, AREA.y, AREA.w, RIM - AREA.y + 2);
      r.globalCompositeOperation = 'source-over';
    }
    drawFrame(f, 'film-silk-shade', at.silk);
    if (silk) drawFrame(f, 'film-silk', at.silk, color());
  }

  // Runs step(t, dt) every frame until it says it's done.
  function play(moving, step) {
    stop();
    at.moving = moving;
    return new Promise((resolve) => {
      let start = 0;
      let last = 0;
      give = () => resolve(false);
      const tick = (now) => {
        start ||= now;
        const dt = Math.min(0.033, (now - (last || now)) / 1000);
        last = now;
        const done = step((now - start) / 1000, dt);
        if (done) at.moving = '';
        draw();
        if (done) {
          give = null;
          resolve(true);
        } else frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
  }

  function stop() {
    cancelAnimationFrame(frame);
    give?.();
    give = null;
    at.moving = '';
  }

  // the lid, on a spring
  const swing = (to, stiff, damp, dt) => {
    for (let i = 0; i < 4; i++) {
      at.speed += ((to - at.lid) * stiff - at.speed * damp) * (dt / 4);
      at.lid = Math.max(0, Math.min(1.06, at.lid + at.speed * (dt / 4)));
    }
  };

  return {
    stop,
    // give the canvases' memory back (phones need it), once the box is gone
    free() {
      stop();
      for (const canvas of [front, rear]) [canvas.width, canvas.height] = [0, 0];
    },
    draw,
    settle(step) {
      stop();
      Object.assign(at, { silk: step > 0 ? SILK_END : 0, lid: step === 2 ? 1 : 0, speed: 0, glow: step === 2 ? 0.7 : 0 });
      draw();
    },
    untie: () =>
      play('untie', (t) => {
        at.silk = Math.min(SILK_END, t * SILK_FPS);
        return at.silk >= SILK_END;
      }),
    open: () =>
      play('open', (t, dt) => {
        // a breath, then up and over
        if (t > 0.14) swing(1, 44, 8.8, dt);
        at.glow = smooth(0.2, 0.75, t) * (1 - 0.3 * smooth(0.9, 2, t));
        const still = t > 2 && Math.abs(at.speed) < 0.01;
        if (still) at.lid = 1;
        return still;
      }),
    close: () =>
      play('close', (t, dt) => {
        at.glow = Math.max(0, at.glow - dt * 2.4);
        swing(t > 0.12 ? -0.02 : 1, 60, 13, dt);
        // and the ribbon ties itself again
        if (at.lid < 0.03 || t > 1.2) {
          at.lid = 0;
          at.speed = 0;
          at.silk = Math.max(0, at.silk - dt * SILK_FPS * 2.4);
        }
        return at.silk <= 0;
      }),
  };
}
