// Sky lanterns (आकाश दियो) — the signature of the wedding story.
//
// They come at three depths, like a real camera sees them:
//   far   – small and sharp, drifting up slowly behind everything
//   mid   – bigger, still sharp
//   near  – huge and out of focus (bokeh), right in front of the camera
//
// `lanternField(...)` makes a `live` layer for StoryScene. It covers one
// screen and moves its lanterns itself, so it's cheap however tall the
// scene is: when the story's camera moves down by `camera(p)` px, every
// lantern slides up by that much × `rate` (far ones less, near ones more).
// Lanterns that leave the screen come back in on the other side.

import { stamp, seeded, rand } from '../themes/draw';

const cache = new Map();

// A picture of `width × height` page px, painted at `sharpness` × size.
// (Same shape as the sprites in themes/draw.js, so `stamp` can draw it.)
function picture(key, width, height, sharpness, paint) {
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(width * sharpness));
  canvas.height = Math.max(1, Math.ceil(height * sharpness));
  const ctx = canvas.getContext('2d');
  ctx.scale(sharpness, sharpness);
  ctx.translate(width / 2, height / 2);
  paint(ctx);
  const result = { key, canvas, width, height };
  cache.set(key, result);
  return result;
}

// The lantern itself: a paper cylinder, a little wider at the top, lit from
// a flame inside its open bottom — so it's brightest at the bottom.
function body(ctx, size) {
  const top = size * 0.5; // half-width at the top
  const bottom = size * 0.4; // half-width at the bottom
  const h = size * 0.62; // half-height
  const r = size * 0.07; // rounded corners

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-top + r, -h);
  ctx.lineTo(top - r, -h);
  ctx.quadraticCurveTo(top, -h, top, -h + r);
  ctx.quadraticCurveTo(top * 1.04, 0, bottom, h - r);
  ctx.quadraticCurveTo(bottom, h, bottom - r, h);
  ctx.lineTo(-bottom + r, h);
  ctx.quadraticCurveTo(-bottom, h, -bottom, h - r);
  ctx.quadraticCurveTo(-top * 1.04, 0, -top, -h + r);
  ctx.quadraticCurveTo(-top, -h, -top + r, -h);
  ctx.closePath();

  const paperLight = ctx.createLinearGradient(0, -h, 0, h);
  paperLight.addColorStop(0, '#B9441A');
  paperLight.addColorStop(0.3, '#E57A2E');
  paperLight.addColorStop(0.7, '#FDB75E');
  paperLight.addColorStop(1, '#FFE3A1');
  ctx.fillStyle = paperLight;
  ctx.fill();
  ctx.clip();

  // the flame's hot spot, low inside
  const hot = ctx.createRadialGradient(0, h * 0.8, 0, 0, h * 0.8, h * 1.3);
  hot.addColorStop(0, 'rgba(255, 248, 215, 0.95)');
  hot.addColorStop(0.45, 'rgba(255, 214, 140, 0.35)');
  hot.addColorStop(1, 'rgba(255, 200, 120, 0)');
  ctx.fillStyle = hot;
  ctx.fillRect(-top, -h, top * 2, h * 2);

  // rounder: the sides turn away from the light
  const sides = ctx.createLinearGradient(-top, 0, top, 0);
  sides.addColorStop(0, 'rgba(110, 25, 0, 0.45)');
  sides.addColorStop(0.3, 'rgba(110, 25, 0, 0)');
  sides.addColorStop(0.7, 'rgba(110, 25, 0, 0)');
  sides.addColorStop(1, 'rgba(110, 25, 0, 0.5)');
  ctx.fillStyle = sides;
  ctx.fillRect(-top, -h, top * 2, h * 2);

  // the bamboo ribs and the darker top hem
  ctx.strokeStyle = 'rgba(130, 40, 5, 0.22)';
  ctx.lineWidth = Math.max(0.5, size * 0.012);
  for (const t of [-0.5, 0, 0.5]) {
    ctx.beginPath();
    ctx.moveTo(t * top * 1.4, -h);
    ctx.lineTo(t * bottom * 1.4, h);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(120, 30, 5, 0.35)';
  ctx.fillRect(-top, -h, top * 2, h * 0.09);
  ctx.restore();

  // the glowing open bottom
  ctx.fillStyle = '#FFF6DA';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.97, bottom * 0.62, h * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
}

// A lantern with its halo of warm light, sharp. `size` = width in page px.
export function litLantern(size) {
  const s = Math.round(size);
  return picture(`lit-${s}`, s * 2.8, s * 2.8, Math.min(3, 160 / s + 1), (ctx) => {
    const halo = ctx.createRadialGradient(0, s * 0.2, 0, 0, s * 0.2, s * 1.35);
    halo.addColorStop(0, 'rgba(255, 170, 70, 0.45)');
    halo.addColorStop(0.4, 'rgba(255, 140, 50, 0.16)');
    halo.addColorStop(1, 'rgba(255, 120, 40, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(-s * 1.4, -s * 1.4, s * 2.8, s * 2.8);
    body(ctx, s);
  });
}

// The same lantern out of focus: blurred by `blur` page px.
// (Uses the canvas blur filter where the browser has it; otherwise it's
// painted tiny and stretched, which blurs it just as well.)
export function bokehLantern(size, blur) {
  const s = Math.round(size);
  const b = Math.round(blur);
  return picture(`bokeh-${s}-${b}`, s * 2.8 + b * 4, s * 2.8 + b * 4, 1, (ctx) => {
    const sharp = litLantern(s);
    if ('filter' in ctx) {
      ctx.filter = `blur(${b}px)`;
      ctx.drawImage(sharp.canvas, -sharp.width / 2, -sharp.height / 2, sharp.width, sharp.height);
      ctx.filter = 'none';
    } else {
      const tiny = document.createElement('canvas');
      tiny.width = Math.max(2, Math.round(sharp.width / b));
      tiny.height = Math.max(2, Math.round(sharp.height / b));
      tiny.getContext('2d').drawImage(sharp.canvas, 0, 0, tiny.width, tiny.height);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(tiny, -sharp.width / 2, -sharp.height / 2, sharp.width, sharp.height);
    }
  });
}

// A live layer of lanterns. Options:
//   count       – how many
//   size        – [smallest, biggest] width in page px
//   blur        – 0 = sharp; otherwise blur = this × size (0.08 is very soft)
//   rate        – how much they move with the camera (0.3 far … 1.8 near)
//   rise        – px per second they float up on their own
//   camera(p)   – the story's camera position (px it has moved down)
//   alpha(p)    – how visible the whole layer is at this point of the story
//   edges       – true: keep them to the sides (so they don't cover the words)
//   tappable    – true: a tap releases a new lantern there
//   seed        – the same seed gives the same starting sky
//   clearAbove  – [y0, y1]: lanterns fade out as they rise from y1 up to y0
//                 (keeps the space above clear, e.g. for words)
//   light       – true: little points of light instead of lanterns (fairy
//                 lights / fireflies; out of focus = soft bokeh discs) —
//                 the garden invite's version of the lantern sky
//
// The layer also has send(x, y, { name, text }): a bigger lantern rises
// from there carrying a blessing, written under it (see blessings.js).
export function lanternField({ count, size, blur = 0, rate = 1, rise = 14, camera = () => 0, alpha = () => 1, edges = false, tappable = false, seed = 1, clearAbove = null, light = false }) {
  return (w, h) => {
    const r = seeded(seed);
    const pickX = () => {
      if (!edges) return r() * w;
      return r() < 0.5 ? -size[1] * 0.25 + r() * w * 0.32 : w * 0.68 + r() * (w * 0.32 + size[1] * 0.25);
    };
    const make = (y) => {
      const s = size[0] + (size[1] - size[0]) * r() ** 1.5; // more small ones than big ones
      return { x: pickX(), y, s, sway: 0.3 + r() * 0.5, phase: r() * 6, speed: rise * (0.6 + r() * 0.8) * (0.6 + s / size[1] * 0.4), age: 9 };
    };
    // `count` is for a phone-wide sky; a wider sky gets more, as densely spread
    const n = Math.round(count * Math.max(1, w / 430));
    const lanterns = Array.from({ length: n }, () => make(r() * (h + 200) - 100));
    lanterns.sort((a, b) => a.s - b.s); // small (far) ones first, big ones on top
    let lastCamera = null;

    const look = (l) => {
      if (light && !l.label) return blur ? bokehLight(l.s, (l.phase * 10) % 3) : fairyLight(l.s);
      return blur ? bokehLantern(l.s, Math.max(2, l.s * blur)) : litLantern(l.s);
    };

    return {
      tap: tappable
        ? (x, y) => {
            if (lanterns.length >= n + 14) return;
            lanterns.push({ x, y, s: size[1], sway: 0.5, phase: rand(0, 6), speed: rise * 1.5, age: 0 });
          }
        : undefined,
      // a lantern carrying a blessing, rising slowly so it can be read
      send(x, y, label) {
        lanterns.push({ x, y, s: Math.round(size[1] * 1.4), sway: 0.4, phase: rand(0, 6), speed: rise * 1.1, age: 0, label });
      },
      draw(ctx, t, dt, p) {
        const cam = camera(p);
        const moved = lastCamera === null ? 0 : cam - lastCamera;
        lastCamera = cam;
        const layerAlpha = alpha(p);
        if (layerAlpha <= 0.003) return;

        for (let i = lanterns.length - 1; i >= 0; i--) {
          const l = lanterns[i];
          l.age += dt;
          l.y -= l.speed * dt + moved * rate;
          const reach = l.s * 1.6 + (l.label ? 70 : 0);
          if (l.y < -reach) {
            // gone off the top: a blessing's lantern is gone for good, the others come back in below
            if (l.label) lanterns.splice(i, 1);
            else Object.assign(l, make(h + reach + r() * 80));
            continue;
          }
          if (l.y > h + reach + 120) Object.assign(l, make(-reach - r() * 80)); // scrolled back up
          const x = l.x + Math.sin(t * l.sway + l.phase) * l.s * 0.12;
          const fadeIn = Math.min(1, l.age / 1.2) * (clearAbove ? Math.min(1, Math.max(0, (l.y - clearAbove[0]) / (clearAbove[1] - clearAbove[0]))) : 1);
          stamp(ctx, look(l), x, l.y, { alpha: layerAlpha * fadeIn, angle: Math.sin(t * l.sway * 0.8 + l.phase) * 0.05 });
          // (the writing is kept on screen even when the lantern is near an edge)
          if (l.label) writeBlessing(ctx, l.label, Math.min(w - 100, Math.max(100, x)), l.y + l.s * 0.8, layerAlpha * fadeIn);
        }
      },
    };
  };
}

// A fairy light (or a firefly): a bright warm point in a soft halo.
// `size` = the halo's width in page px.
export function fairyLight(size) {
  const s = Math.round(size);
  return picture(`fairy-${s}`, s, s, 3, (ctx) => {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s / 2);
    g.addColorStop(0, 'rgba(255, 250, 225, 1)');
    g.addColorStop(0.12, 'rgba(255, 226, 160, 0.9)');
    g.addColorStop(0.35, 'rgba(255, 190, 110, 0.3)');
    g.addColorStop(1, 'rgba(255, 170, 90, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(-s / 2, -s / 2, s, s);
  });
}

// A light far out of focus: a soft disc with a slightly brighter rim, in
// one of three warm tints (0 champagne, 1 peach, 2 warm white).
const TINTS = ['255, 214, 150', '255, 176, 130', '255, 236, 205'];
export function bokehLight(size, tint = 0) {
  const s = Math.round(size);
  const rgb = TINTS[Math.floor(tint) % 3];
  return picture(`bokeh-light-${s}-${rgb}`, s, s, 1, (ctx) => {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s / 2);
    g.addColorStop(0, `rgba(${rgb}, 0.32)`);
    g.addColorStop(0.8, `rgba(${rgb}, 0.42)`);
    g.addColorStop(0.93, `rgba(${rgb}, 0.55)`);
    g.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

// The blessing written under its lantern: the name in small gold capitals,
// the words in italic, wrapped to two short lines.
function writeBlessing(ctx, { name, text }, x, y, alpha) {
  const lines = [];
  let line = '';
  for (const word of (text || '').split(/\s+/)) {
    if ((line + ' ' + word).trim().length > 26 && line) {
      lines.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(6, 4, 20, 0.85)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#F7E9D2';
  ctx.font = 'italic 16px "Instrument Serif", serif';
  lines.slice(0, 2).forEach((l, k) => ctx.fillText(l, x, y + 16 + k * 18));
  ctx.fillStyle = '#E8C27A';
  ctx.font = '600 9px "DM Sans", sans-serif';
  ctx.fillText(`— ${(name || '').toUpperCase()}`, x, y + 22 + Math.min(2, lines.length) * 18);
  ctx.restore();
}
