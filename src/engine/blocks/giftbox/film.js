// The gift box's films: the silk coming undone, and the lid opening. Each is a
// row of rendered pictures packed into one (films.js says where each one is).
// Phones get smaller ones (`-small`): they have far less memory, and the full
// set made them crash.
//
//   loadFilms()                      – fetches them, once; a promise
//   drawFrame(ctx, film, n, color?)  – draws one frame, tinted if there's a colour.
//                                      ctx is in the box's own px (it's 300 × 330)
//   drawLidOpen(ctx)                 – the lid standing open, sharper than the film

import { FILMS } from './films';
import { pictureOf } from './pictures';

const NAMES = ['film-silk', 'film-silk-shade', 'film-lid', 'film-lid-shade'];
const small = () => window.matchMedia?.('(max-width: 600px), (pointer: coarse)').matches ?? false;

const sheets = {}; // the pictures, once they're here, by film
let loading = null;

async function load(name, file) {
  const img = new Image();
  img.src = pictureOf(file);
  await img.decode();
  sheets[name] = { img, film: FILMS[file] ?? null };
}

export function loadFilms() {
  const pick = (name) => (small() && FILMS[`${name}-small`] ? `${name}-small` : name);
  loading ??= Promise.all([...NAMES.map((name) => load(name, pick(name))), load('lid-open', 'lid-open')]).catch((error) => {
    loading = null; // try again next time
    throw error;
  });
  return loading;
}

export const lengthOf = (name) => FILMS[name].frames.length;

// Somewhere to tint the silk: one canvas, made once, as big as the biggest
// frame (making a new one every frame is what phones can't keep up with).
let tinting = null;
function tinted(img, [sx, sy, w, h], color) {
  if (!tinting) {
    const frames = [...FILMS['film-silk'].frames, ...(FILMS['film-silk-small']?.frames ?? [])];
    tinting = document.createElement('canvas');
    tinting.width = Math.max(...frames.map((f) => f[2]));
    tinting.height = Math.max(...frames.map((f) => f[3]));
  }
  const ctx = tinting.getContext('2d');
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, w + 1, h + 1);
  const draw = () => ctx.drawImage(img, sx, sy, w, h, 0, 0, w, h);
  draw();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'destination-in';
  draw();
  ctx.globalCompositeOperation = 'source-over';
  return tinting;
}

export function drawFrame(ctx, name, n, color) {
  const sheet = sheets[name];
  if (!sheet) return;
  const { place, scale, frames } = sheet.film;
  const frame = frames[Math.max(0, Math.min(frames.length - 1, Math.round(n)))];
  const [sx, sy, w, h, dx, dy] = frame;
  const to = [place[0] + dx * scale, place[1] + dy * scale, w * scale, h * scale];
  if (color) ctx.drawImage(tinted(sheet.img, frame, color), 0, 0, w, h, ...to);
  else ctx.drawImage(sheet.img, sx, sy, w, h, ...to);
}

export function drawLidOpen(ctx) {
  if (sheets['lid-open']) ctx.drawImage(sheets['lid-open'].img, 0, -200 / 3, 300, 300);
}
