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
const save = (image, name, quality = 84) => image.webp({ quality, alphaQuality: 92, effort: 6 }).toFile(path.join(to, `${name}.webp`));

// warmer (or brighter): each colour times a number
const graded = (data, by) => {
  for (let i = 0; i < data.length; i += 4) by.forEach((k, c) => (data[i + c] = Math.min(255, data[i + c] * k)));
  return data;
};
const LAMPLIGHT = [0.98, 0.935, 0.865]; // the paper, by lantern light
const ROSES = [1.16, 1.14, 1.14]; // a little brighter

// the box, a layer each
const [W, H] = [900, 990];
for (const [name, out] of [['back', 'box-back'], ['front', 'box-front'], ['lid', 'box-lid']]) await save(picture(graded(raw(name), LAMPLIGHT), W, H), out);
// the silk, grey and brought up to full range: it's tinted in the browser
for (const [name, out] of [['band', 'silk-band'], ['bow', 'silk-bow']]) {
  const data = raw(name);
  const seen = [];
  for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 250) seen.push(data[i + 1]);
  const top = seen.sort((a, b) => a - b)[Math.floor(seen.length * 0.97)];
  for (let i = 0; i < data.length; i += 4) data.fill(Math.min(255, (data[i + 1] / top) * 255), i, i + 3);
  await save(picture(data, W, H), out, 88);
}
// what a layer's shadow takes away: the render with it, against without
for (const [lit, shaded, out] of [['lid', 'lids', 'lid-shade'], ['front', 'fronts', 'box-shade']]) {
  const [a, b] = [raw(lit), raw(shaded)];
  const shade = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i += 4) {
    const [x, y] = [a[i] + a[i + 1] + a[i + 2] + 8, b[i] + b[i + 1] + b[i + 2] + 8];
    shade.set([36, 16, 24, b[i + 3] < 250 || a[i + 3] < 250 ? 0 : Math.max(0, Math.min(255, (1 - y / x) * 255 - 4))], i);
  }
  // (the lid's shadow on the box stays once the ribbon has come off: so it has
  // no dark strip where the ribbon lay)
  if (out === 'box-shade') {
    const band = raw('band');
    let [x0, x1] = [W, 0];
    for (let i = 0; i < band.length; i += 4) {
      if (band[i + 3] === 0) continue;
      const x = (i / 4) % W;
      [x0, x1] = [Math.min(x0, x), Math.max(x1, x)];
    }
    for (let y = 0; y < H; y++) {
      const beside = shade[(y * W + x0 - 10) * 4 + 3];
      for (let x = x0 - 9; x < x1 + 10; x++) shade[(y * W + x) * 4 + 3] = beside;
    }
  }
  await save(picture(await picture(shade, W, H).blur(1.4).raw().toBuffer(), W, H), out, 70);
}
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
