// The gift box's films: the silk coming undone, and the lid opening. Each is a
// row of rendered pictures packed into one (films.js says where each one is).
//
//   loadFilms()                      – fetches them, once; a promise
//   drawFrame(ctx, film, n, color?)  – draws one frame, tinted if there's a colour.
//                                      ctx is in the box's own px (it's 300 × 330)
//   drawLidOpen(ctx)                 – the lid standing open, sharper than the film

import { FILMS } from './films';
import { pictureOf } from './pictures';

const sheets = {}; // the pictures, once they're here
let loading = null;

async function load(name) {
  const img = new Image();
  img.src = pictureOf(name);
  await img.decode();
  // (made ready for drawing now, so the first frame isn't late)
  sheets[name] = window.createImageBitmap ? await createImageBitmap(img).catch(() => img) : img;
}

export function loadFilms() {
  loading ??= Promise.all([...Object.keys(FILMS), 'lid-open'].map(load)).catch((error) => {
    loading = null; // try again next time
    throw error;
  });
  return loading;
}

export const lengthOf = (name) => FILMS[name].frames.length;

// somewhere to tint the silk
let tinting = null;
function tinted(img, [sx, sy, w, h], color) {
  tinting ??= document.createElement('canvas');
  tinting.width = w; // (this clears it too)
  tinting.height = h;
  const ctx = tinting.getContext('2d');
  const draw = () => ctx.drawImage(img, sx, sy, w, h, 0, 0, w, h);
  draw();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'destination-in';
  draw();
  return tinting;
}

export function drawFrame(ctx, name, n, color) {
  const img = sheets[name];
  if (!img) return;
  const { place, scale, frames } = FILMS[name];
  const frame = frames[Math.max(0, Math.min(frames.length - 1, Math.round(n)))];
  const [sx, sy, w, h, dx, dy] = frame;
  const to = [place[0] + dx * scale, place[1] + dy * scale, w * scale, h * scale];
  if (color) ctx.drawImage(tinted(img, frame, color), ...to);
  else ctx.drawImage(img, sx, sy, w, h, ...to);
}

export function drawLidOpen(ctx) {
  if (sheets['lid-open']) ctx.drawImage(sheets['lid-open'], 0, -200 / 3, 300, 300);
}
