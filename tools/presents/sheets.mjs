// Turns the renders (out/*.raw) into the pictures the gift box uses, in
// public/presents. Run after bake.sh:  node tools/presents/sheets.mjs [renders] [pictures]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const sharp = createRequire(path.join(process.env.PROJECT ?? process.cwd(), 'package.json'))('sharp');
const [from, to] = process.argv.slice(2);
fs.mkdirSync(to, { recursive: true });
const raw = (name) => fs.readFileSync(path.join(from, `${name}.raw`));
const picture = (data, width, height) => sharp(data, { raw: { width, height, channels: 4 } });
const save = (image, name, quality = 84, alphaQuality = 92) => image.webp({ quality, alphaQuality, effort: 6 }).toFile(path.join(to, `${name}.webp`));

// warmer (or brighter): each colour times a number
const graded = (data, by) => {
  for (let i = 0; i < data.length; i += 4) by.forEach((k, c) => (data[i + c] = Math.min(255, data[i + c] * k)));
  return data;
};
const LAMPLIGHT = [0.98, 0.935, 0.865]; // the paper, by lantern light
const ROSES = [1.16, 1.14, 1.14]; // a little brighter

// ── the box, a layer each ──
const [W, H] = [900, 990];
for (const [name, out] of [['back', 'box-back'], ['front', 'box-front'], ['lid', 'box-lid'], ['lidopen', 'lid-open']]) {
  const [w, h] = name === 'lidopen' ? [900, 900] : [W, H];
  await save(picture(graded(raw(name), LAMPLIGHT), w, h), out);
}

// ── the silk, grey and brought up to full range: it's tinted in the browser ──
const brightest = (() => {
  const data = raw('silk');
  const seen = [];
  for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 250) seen.push(data[i + 1]);
  return seen.sort((a, b) => a - b)[Math.floor(seen.length * 0.995)];
})();
const silk = (name) => {
  const data = raw(name);
  for (let i = 0; i < data.length; i += 4) data.fill(Math.min(255, (data[i + 1] / brightest) * 255), i, i + 3);
  return data;
};
await save(picture(silk('silk'), W, H), 'silk-tied', 86);
await save(picture(silk('fallen'), 1260, 470), 'silk-fallen', 86);

// ── shadows: what something takes away (a render with it, against without) ──
const shadow = async (lit, shaded, w, h, { strength = 1, blur = 1.2, from = 4 } = {}) => {
  const shade = Buffer.alloc(lit.length);
  for (let i = 0; i < lit.length; i += 4) {
    const [x, y] = [lit[i] + lit[i + 1] + lit[i + 2] + 8, shaded[i] + shaded[i + 1] + shaded[i + 2] + 8];
    const off = shaded[i + 3] < 250 || lit[i + 3] < 250;
    shade.set([36, 16, 24, off ? 0 : Math.max(0, Math.min(255, ((1 - y / x) * 255 - from) * strength))], i);
  }
  return picture(shade, w, h).blur(blur).raw().toBuffer();
};
const over = (under, top) => {
  for (let i = 0; i < under.length; i += 4) if (top[i + 3] > under[i + 3]) under.set(top.subarray(i, i + 4), i);
  return under;
};
await save(picture(await shadow(raw('front'), raw('fronts'), W, H), W, H), 'box-shade', 70);
// (nothing of it where `hides` is in front)
const outside = (shade, hides) => {
  for (let i = 3; i < shade.length; i += 4) if (hides[i] > 10) shade[i] = 0;
  return shade;
};
await save(picture(over(outside(await shadow(raw('fronts'), raw('fronttied'), W, H), raw('lid')), await shadow(raw('lid'), raw('lids'), W, H)), W, H), 'tied-shade', 70);
const FLOOR = { strength: 0.6, blur: 2.2, from: 8 };
await save(picture(await shadow(raw('ground'), raw('floor0'), 336, 304, FLOOR), 336, 304), 'floor', 78);

// ── films: each frame cut down to what's on it, all packed into one picture.
// Where each is goes in films.js: [x, y, w, h in the picture, x, y in the frame] ──
const films = {};
async function film(out, frames, fullW, fullH, place, quality, alphaQuality, size = 1) {
  const ATLAS = 2400;
  const [w, h] = [Math.round(fullW * size), Math.round(fullH * size)];
  const cut = [];
  for (let data of frames) {
    if (size !== 1) data = await picture(data, fullW, fullH).resize(w, h, { kernel: 'lanczos3' }).raw().toBuffer();
    let [x0, y0, x1, y1] = [w, h, 0, 0];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 5) [x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x + 1), Math.max(y1, y + 1)];
    if (x1 <= x0) [x0, y0, x1, y1] = [0, 0, 1, 1];
    cut.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0, input: await picture(data, w, h).extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 }).png().toBuffer() });
  }
  let [ax, ay, row] = [0, 0, 0];
  for (const one of cut) {
    if (ax + one.w > ATLAS) [ax, ay, row] = [0, ay + row + 2, 0];
    [one.ax, one.ay] = [ax, ay];
    ax += one.w + 2;
    row = Math.max(row, one.h);
  }
  await save(sharp({ create: { width: Math.max(...cut.map((one) => one.ax + one.w)), height: ay + row, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(cut.map(({ input, ax: left, ay: top }) => ({ input, left, top }))), out, quality, alphaQuality);
  films[out] = { place, scale: place[2] / w, frames: cut.map(({ ax: x, ay: y, w: fw, h: fh, x: dx, y: dy }) => [x, y, fw, fh, dx, dy]) };
}
const several = (count, make) => Promise.all(Array.from({ length: count }, (_, i) => make(i)));
// (a film's place: x, y, w, h in the box's own px, where it's 300 × 330)
// (and smaller ones for phones, which have far less memory: `-small`)
const silkFrames = await several(58, (i) => silk(`silk${i}`));
const silkShades = await several(58, async (i) => over(await shadow(raw('plain'), raw(`shade${i}`), 336, 304, { blur: 1.8, from: 9 }), outside(await shadow(raw('floor0'), raw(`floor${i}`), 336, 304, FLOOR), raw('plain'))));
const lidFrames = await several(28, (i) => graded(raw(`lid${i}`), LAMPLIGHT));
await film('film-silk', silkFrames, 672, 608, [-60, 0, 420, 380], 68, 70);
await film('film-silk-small', silkFrames, 672, 608, [-60, 0, 420, 380], 70, 72, 0.62);
await film('film-silk-shade', silkShades, 336, 304, [-60, 0, 420, 380], 40, 72);
await film('film-silk-shade-small', silkShades, 336, 304, [-60, 0, 420, 380], 40, 72, 0.7);
await film('film-lid', lidFrames, 540, 640, [-18.75, -62.5, 337.5, 400], 78);
await film('film-lid-small', lidFrames, 540, 640, [-18.75, -62.5, 337.5, 400], 80, 92, 0.62);
await film('film-lid-shade', await several(28, (i) => shadow(raw('open'), raw(`lidshade${i}`), 240, 264, { blur: 1.8 })), 240, 264, [0, 0, 300, 330], 40, 80);
const FILMS = path.join(process.env.PROJECT ?? process.cwd(), 'src/engine/blocks/giftbox/films.js');
fs.writeFileSync(
  FILMS,
  `// The gift box opening: where each frame of its films is. Made by tools/presents/sheets.mjs.
//   place  – where the film goes on the box, which is 300 × 330 (x, y, w, h)
//   scale  – the box's px for each px of the picture
//   frames – [x, y, w, h in the picture, x, y in the frame]
export const FILMS = {
${Object.entries(films)
  .map(([name, { place, scale, frames }]) => `  '${name}': { place: ${JSON.stringify(place)}, scale: ${scale}, frames: ${JSON.stringify(frames)} },`)
  .join('\n')}
};
`,
);
// the roses: one picture of those that stay, one of each that can be picked,
// and where each of those goes (in rosesLayout.js, as parts of the whole)
const [RW, RH] = [880, 726];
await save(picture(graded(raw('base'), ROSES), RW, RH), 'roses');
const layout = [];
for (const k of '23456789ab') {
  // half shaded by its neighbours, half as it is by itself: so it looks right
  // among them, and isn't black underneath when it's picked
  const [data, alone] = [raw(`pick${k}`), raw(`alone${k}`)];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) data.set(alone.subarray(i, i + 4), i);
    else for (let c = 0; c < 3; c++) data[i + c] = data[i + c] * 0.45 + alone[i + c] * 0.55;
  }
  graded(data, ROSES);
  let [x0, y0, x1, y1] = [RW, RH, 0, 0];
  for (let y = 0; y < RH; y++) {
    for (let x = 0; x < RW; x++) {
      if (data[(y * RW + x) * 4 + 3] < 20) continue;
      [x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)];
    }
  }
  const [left, top, width, height] = [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
  await save(picture(data, RW, RH).extract({ left, top, width, height }), `rose-${k}`, 86);
  layout.push({ name: `rose-${k}`, x: +(left / RW).toFixed(4), y: +(top / RH).toFixed(4), w: +(width / RW).toFixed(4), h: +(height / RH).toFixed(4) });
}
await save(picture(graded(raw('stem'), ROSES), 160, 640), 'rose-stem');
fs.writeFileSync(
  path.join(process.env.PROJECT ?? process.cwd(), 'src/engine/blocks/giftbox/rosesLayout.js'),
  `// Where each rose that can be picked goes, as parts of the whole picture. (Made\n// by tools/presents/sheets.mjs: back to front.)\nexport const ROSES = ${JSON.stringify(layout, null, 2)};\n`,
);
for (let i = 0; i < 3; i++) await save(picture(graded(raw(`petal${i}`), ROSES), 96, 96), `petal-${i}`, 85);

// the butterflies' wings, body and bed
for (let i = 0; i < 3; i++) await save(picture(raw(`wing${i}`), 270, 450), `wing-${i}`, 86);
await save(picture(raw('wingbody'), 120, 450), 'wing-body', 86);
// (the tips of its leaves come out of the render black: they take the colour
// of the leaf beside them, working outwards)
const greenTips = (data, w, h) => {
  const solid = (i) => data[i + 3] > 20;
  const black = new Set();
  for (let y = 0; y < h * 0.62; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (!solid(i) || Math.max(data[i], data[i + 1], data[i + 2]) > 34) continue;
      // only those near the edge of the bed: darker ones inside it are shadows
      const edge = [[-9, 0], [9, 0], [0, -9], [-7, -7], [7, -7]].some(([dx, dy]) => x + dx < 0 || x + dx >= w || y + dy < 0 || !solid(((y + dy) * w + x + dx) * 4));
      if (edge) black.add(i);
    }
  }
  while (black.size) {
    const found = [];
    for (const i of black) {
      const near = [];
      for (const dy of [-1, 0, 1]) for (const dx of [-1, 0, 1]) {
        const j = i + (dy * w + dx) * 4;
        if (j !== i && j >= 0 && j < data.length && solid(j) && !black.has(j)) near.push(j);
      }
      if (near.length) found.push([i, [0, 1, 2].map((c) => near.reduce((sum, j) => sum + data[j + c], 0) / near.length)]);
    }
    if (!found.length) break;
    for (const [i, color] of found) {
      data.set(color, i);
      black.delete(i);
    }
  }
  return data;
};
await save(picture(graded(greenTips(raw('bed'), 660, 545), ROSES), 660, 545), 'bed', 82);
// things in steps, in a row: the crane's wings beating, its paper folding
async function row(name, count, width, height, out) {
  const steps = await Promise.all(Array.from({ length: count }, async (_, i) => ({ input: await picture(raw(`${name}${i}`), width, height).png().toBuffer(), left: i * width, top: 0 })));
  await save(sharp({ create: { width: width * count, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(steps), out, 84);
}
await row('crane', 11, 440, 380, 'crane');
await row('kite', 7, 300, 300, 'crane-paper');
