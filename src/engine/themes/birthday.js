// Birthday · जन्मदिन — "a party under the jacarandas"
//
// A Kathmandu garden in spring, late in the afternoon, made like the Love
// theme: painted on lokta paper, in three parts, for a page of any length.
//
//   TOP     – the first screen: a lilac sky, and flowering jacaranda boughs
//             across the top with silk bunting and bulbs strung under them.
//   MIDDLE  – grows with the page: the pale sky warming down the page, a few
//             balloons drifting up. Calm, so what the sender adds reads clearly.
//   BOTTOM  – always the last screen: the garden, its trees, and a long table
//             laid for the birthday, with the cake and its candles lit.
//
// Where they're drawn (see ThemeLayer.jsx for the canvases):
//   layers[0] – the sky, far          layers[1] – boughs far off, out of focus
//   layers[2] – the boughs, nearest   backdrop  – the garden, at the page's end
//   scene     – bunting and bulbs that swing, balloons you can fling, falling
//               flowers, the candles, and the tall grass in front of the table.
//
// Tap the cake: the candles go out, the garden cheers, and they light again.
// Tap the presents on the grass: a balloon gets out of one, with confetti.
// Tap the boughs: flowers come down. Tap the grass, or brush through it with a
// finger: it parts and springs back. Tap anywhere else: a little puff of flowers.
//
// Its easter eggs, each a different kind of moment (the hidden messages in
// ready-made/birthday.js lead to them):
//   • tap a flag: the bunting flips over, flag by flag, and spells their name
//     in gold (the name on the gift's loader: `name()`)
//   • tap the bulbs: each one chimes the next note of "Happy Birthday"
//     (chime.js), and a little gold note floats off it
//   • a dandelion clock in the grass by the table: blow on it (tap, or brush
//     past) and its seeds, their wish, float away up the page
//   • every hidden message found: the garden plays the whole song, bulbs
//     lighting in time, spells their name, blows the dandelion, and balloons
//     rise while flowers come down
//
// (Painted in jacaranda.js and party.js.)

import { edisonBulb, glow, goldFlake, leaf, smoothLine, stamp, floatAngle, rand, pick, seeded, blurred } from './draw';
import { createDrift, createBursts, DEPTHS, pose } from './particles';
import { chime, playSong, SONG } from './chime';
import { seedHead, seedSprite, dandelion } from './dandelion';
import { blossom, canopy, softCanopy, jacaranda } from './jacaranda';
import { partyTable, candles, candleFlame, wrappedGift, lawnLantern, balloon, flag } from './party';
import { paintedSky } from '../sections/texture';
import { printOnPaper } from '../sections/paper';
import { clouds } from '../sections/garden/sky';
import { hills } from '../sections/garden/garden';
import { tallGrass } from '../sections/garden/grass';

const TOP = 800; // the top scene's height
const BOTTOM = 820; // the bottom scene's height
const PAPER = 0.5; // how strongly the lokta paper shows
const SKY_PAPER = 0.3; // …on the sky, which it would darken
const LAWN = 262; // the lawn's top, above the page's end
const FOOT = 96; // the table's foot, above the page's end

const SILKS = ['#FBF3E4', '#C9B2EE', '#F3C6BE', '#E9B44C', '#A9BF9A', '#9C7FD4'];
const BALLOONS = ['#C4ACEC', '#F4CFC8', '#FFF6E8', '#E8BE6A', '#A48AD8'];

const SPELL_HOLD = 9; // s: how long the name stays up in the bunting
const WAVE = 0.09; // s between one flag turning and the next
const REGROW = 16; // s: until the dandelion has a new head
const GOLD_INK = '#A97B2C';

// The letters of a name, as people read them (a Devanagari letter with its
// marks stays one), in capitals where there are any.
function lettersOf(word) {
  const upper = word.toLocaleUpperCase();
  if (typeof Intl !== 'undefined' && Intl.Segmenter) return Array.from(new Intl.Segmenter().segment(upper), (part) => part.segment);
  return Array.from(upper);
}

// A little gold music note, `size` tall, with its foot at (0, 0).
function musicNote(ctx, size) {
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.27, size * 0.19, -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(size * 0.2, -size, size * 0.08, size);
  ctx.beginPath();
  ctx.moveTo(size * 0.28, -size);
  ctx.quadraticCurveTo(size * 0.62, -size * 0.75, size * 0.5, -size * 0.4);
  ctx.quadraticCurveTo(size * 0.48, -size * 0.66, size * 0.28, -size * 0.72);
  ctx.fill();
}

const reachFor = (w) => Math.min(430, 190 + w * 0.15); // how far the boughs reach in
const tableHalf = (w) => Math.min(340, w * 0.43); // half the table's width

// ── The still pictures ───────────────────────────────────────────────────────

function springSky(ctx, w, y0, y1, h) {
  const at = (y) => Math.min(1, Math.max(0, (y - y0) / (y1 - y0)));
  paintedSky(ctx, w, y0, y1, {
    stops: [
      [at(y0), '#B9AFE0'],
      [at(TOP * 0.35), '#CBC1E8'],
      [at(TOP * 0.8), '#DED2EE'],
      [at((TOP + h - BOTTOM) / 2), '#E6D9EE'],
      [at(h - BOTTOM * 0.7), '#F4E0E4'],
      [at(h - BOTTOM * 0.48), '#FFE9DA'],
      [at(h - LAWN), '#FFF3D8'],
      [at(h), '#FFF3D8'],
    ].sort((a, b) => a[0] - b[0]),
    strokes: ['160, 148, 214', '186, 174, 226', '220, 208, 240', '236, 222, 240', '255, 232, 228', '255, 240, 216'],
    count: Math.round((y1 - y0) * 1.5 * (w / 430)),
    seed: 6,
  });
  clouds(ctx, w, 330, 560, { seed: 14, alpha: 0.3, body: '255, 246, 250', lit: '255, 236, 224' });
  clouds(ctx, w, h - BOTTOM + 60, h - 440, { seed: 18, alpha: 0.32, body: '255, 240, 236', lit: '255, 224, 190' });
}

// The low sun behind the trees. Painted under the garden once that has been
// printed on its paper, which would dull it.
function lowSun(ctx, w, h) {
  const y = h - LAWN - 130;
  const sun = ctx.createRadialGradient(w * 0.54, y, 0, w * 0.54, y, 430);
  sun.addColorStop(0, 'rgba(255, 252, 232, 1)');
  sun.addColorStop(0.14, 'rgba(255, 247, 218, 0.95)');
  sun.addColorStop(0.45, 'rgba(255, 240, 214, 0.55)');
  sun.addColorStop(1, 'rgba(255, 236, 222, 0)');
  ctx.save();
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = sun;
  ctx.fillRect(-20, y - 430, w + 40, 620);
  ctx.restore();
}

function garden(ctx, w, h) {
  const lawn = h - LAWN;
  // hills in the haze, then a far row of jacarandas
  hills(ctx, w, lawn - 60, lawn + 10, { color: '#D5C8E4', height: 130, seed: 3, woods: ['#CCBEE0', '#DCD0E8'], mist: '255, 240, 224' });
  hills(ctx, w, lawn - 14, lawn + 10, { color: '#C6C89E', height: 74, seed: 8, woods: ['#BCC292', '#D2D0A8', '#C9B6D4'], mist: '255, 240, 200' });
  const r = seeded(19);
  const gap = 118;
  const far = Math.ceil(w / gap) + 1;
  for (let i = 0; i < far; i++) {
    const x = (i + 0.3) * gap - 50 + (r() - 0.5) * 40;
    jacaranda(ctx, x, lawn + 4, 112 + r() * 46, { far: 0.6, seed: 50 + i });
  }

  // the lawn: sunlit far away, greener near us
  const grass = ctx.createLinearGradient(0, lawn - 4, 0, h);
  grass.addColorStop(0, '#CFCF9E');
  grass.addColorStop(0.2, '#B6C07E');
  grass.addColorStop(0.6, '#839A5A');
  grass.addColorStop(1, '#5C7846');
  ctx.fillStyle = grass;
  ctx.fillRect(-20, lawn, w + 40, LAWN + 20);
  ctx.lineCap = 'round';
  for (let i = 0; i < w * 4.2; i++) {
    const t = r() ** 0.8;
    const y = lawn + t * LAWN;
    ctx.strokeStyle = ['rgba(236, 224, 150, 0.4)', 'rgba(84, 112, 62, 0.4)', 'rgba(150, 172, 96, 0.5)'][Math.floor(r() * 3)];
    ctx.lineWidth = 0.5 + t;
    const x = r() * (w + 20) - 10;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 5, y - 3 - t * 9);
    ctx.stroke();
  }

  // two big trees, either side: half out of the picture on a phone
  const size = Math.min(540, 380 + w * 0.1);
  const side = w < 700 ? -0.06 : 0.12;
  for (const [x, seed, k, sun] of [[w * side, 7, 1, 1], [w * (1 - side), 23, 0.9, -1]]) {
    const foot = lawn + 34;
    ctx.save(); // its shade, soft
    ctx.translate(x, foot);
    ctx.scale(1, 0.09);
    const shade = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.62);
    shade.addColorStop(0, 'rgba(70, 66, 96, 0.4)');
    shade.addColorStop(1, 'rgba(70, 66, 96, 0)');
    ctx.fillStyle = shade;
    ctx.fillRect(-size, -size, size * 2, size * 2);
    ctx.restore();
    jacaranda(ctx, x, foot, size * k, { seed, sun });
    // the flowers that have fallen under it
    for (let i = 0; i < 260; i++) {
      const d = Math.sqrt(r()) * size * 0.62;
      const a = r() * Math.PI * 2;
      const y = foot + 14 + Math.sin(a) * d * 0.2;
      stamp(ctx, blossom(y > foot + 20 ? 9 : 6), x + Math.cos(a) * d, y, { angle: r() * 6, alpha: 0.85 });
    }
  }
  for (let i = 0; i < w * 0.28; i++) {
    const y = lawn + 30 + r() * (LAWN - 30);
    stamp(ctx, blossom(7 + Math.round((y - lawn) / 50)), r() * w, y, { angle: r() * 6, alpha: 0.8 });
  }

  // the party
  const cx = w / 2;
  const foot = h - FOOT;
  const half = tableHalf(w);
  partyTable(ctx, cx, foot, half);
  wrappedGift(ctx, cx - half * 0.62, foot + 34, 62, 50, '#8E74C8', '#F6E3C0');
  wrappedGift(ctx, cx - half * 0.62 + 52, foot + 46, 44, 34, '#F1C4BC', '#FFF8EC');
  wrappedGift(ctx, cx + half * 0.66, foot + 40, 54, 62, '#F7EBD6', '#A98AD6');
  wrappedGift(ctx, cx + half * 0.66 - 52, foot + 48, 46, 30, '#E3B251', '#FFF8EC');
  lawnLantern(ctx, cx - half - (w > 700 ? 60 : -2), foot + 44, 58);
  lawnLantern(ctx, cx + half + (w > 700 ? 60 : 0), foot + 50, 50);

  // grass in front, right at our feet
  for (let x = -10; x < w + 10; x += 2.2) {
    ctx.strokeStyle = ['#4E6B3C', '#5F7E48', '#73904F', '#8CA45C'][Math.floor(r() * 4)];
    ctx.lineWidth = 1 + r() * 1.2;
    const tall = 14 + r() * 26;
    ctx.beginPath();
    ctx.moveTo(x, h + 2);
    ctx.quadraticCurveTo(x + (r() - 0.5) * 6, h - tall * 0.6, x + (r() - 0.5) * 16, h - tall);
    ctx.stroke();
  }
  for (let i = 0; i < w / 16; i++) {
    const [x, y] = [r() * w, h - 8 - r() * 26];
    stamp(ctx, blossom(11), x, y, { angle: (r() - 0.5) * 2.4 });
    if (r() < 0.4) stamp(ctx, leaf(18, '#6C8A4C'), x + 8, y + 8, { angle: r() * 2 - 1 });
  }
}

// Print the lokta paper into a canvas that's just been painted.
const print = (ctx, strength = PAPER) => printOnPaper(ctx.canvas, ctx.getTransform().a, strength);

export default {
  id: 'birthday',
  label: 'Birthday',
  nepali: 'जन्मदिन',
  dark: false,
  ink: '#3D2457', // headings
  inkSoft: '#5A4070', // body text and hints
  oldInks: { '#F4EAD7': '#3D2457', '#CFC2AB': '#5A4070' }, // when it was a night theme
  background: '#DDD2EC', // under everything, until the sky is painted
  minHeight: TOP + BOTTOM,

  // far → near; each slides a little as you scroll and with the pointer
  layers: [
    {
      depth: 0.05, // the sky itself, farthest
      paint(ctx, area, w, h) {
        springSky(ctx, w, area.y0, area.y1, h);
        print(ctx, SKY_PAPER);
      },
    },
    {
      depth: 0.4, // boughs far off, out of focus
      paint(ctx, area, w) {
        softCanopy(ctx, w, reachFor(w));
      },
    },
    {
      depth: 0.95, // the flowering boughs, nearest
      paint(ctx, area, w) {
        canopy(ctx, w, reachFor(w));
      },
    },
  ],

  createScene(world, { calm, name = () => '' }) {
    const W = world.width;

    // ── Bunting and bulbs, tied to the boughs (on a wide page also higher up,
    // out of sight) ──
    const hang = (y0, y1, count, pieces, options) => {
      const ends = Array.from({ length: count + 1 }, (_, i) =>
        world.addPoint(-8 + (i * (W + 16)) / count, i === 0 || i === count ? y0 : y1, { pinned: true, bounded: false }),
      );
      return ends.slice(0, -1).flatMap((end, i) => [world.addRope(end, ends[i + 1], pieces, options)]);
    };
    const swags = W < 900 ? 1 : W < 2000 ? 3 : 5; // an odd number, so none meet in the middle
    const piece = (px) => Math.round((W + 16) / swags / px); // how many pieces that long
    const bulbCords = hang(96, -6, swags, piece(37), { sag: swags > 1 ? 1.09 : 1.06, droop: 50, point: { mass: 0.6, drag: 0.04, wind: 0.3, grabbable: true, grabRadius: 12 } });
    const bulbs = bulbCords.flatMap((cord) => cord.slice(1, -1));
    const middle = Math.floor(swags / 2); // the swag in the middle (the only one on a phone)
    const cords = hang(178, -6, swags, piece(30), { sag: swags > 1 ? 1.16 : 1.1, droop: 70, point: { mass: 0.5, drag: 0.04, wind: 0.5, grabbable: true, grabRadius: 13 } });
    const flags = cords.flatMap((cord, swag) =>
      cord.slice(0, -1).map((a, i) => {
        const b = cord[i + 1];
        const tip = world.addPoint((a.x + b.x) / 2, a.y + 36, { mass: 0.12, drag: 0.07, wind: 1.1, gravity: 0.7, bounded: false });
        for (const end of [a, b]) world.addLink(end, tip, { length: 38, stiffness: 0.6 });
        return { a, b, tip, color: SILKS[i % SILKS.length], swag, turn: 0, letter: null, from: 0, to: 0 };
      }),
    );

    // ── Balloons tied to the table's ends (they stay with the page's end) ──
    const half = tableHalf(W);
    const tied = [];
    const points = []; // all that has to move when the page grows
    for (const [x, list] of [
      [W / 2 - half * 0.97, [[-24, 250, 26], [16, 300, 30], [-40, 340, 28]]],
      [W / 2 + half * 0.97, [[22, 270, 28], [-14, 320, 30], [34, 350, 25]]],
    ]) {
      const before = world.points.length;
      const knot = world.addPoint(x, world.height - FOOT - 120, { pinned: true });
      list.forEach(([dx, length, radius], i) => {
        const b = world.addPoint(x + dx, knot.y - length + 100, {
          gravity: -0.35, drag: 0.04, wind: 0.5, mass: 0.6, radius, collide: true, grabbable: true,
        });
        const string = world.addRope(knot, b, 8, { sag: 1.02, point: { mass: 0.06, gravity: 0.1, drag: 0.06, wind: 0.5, bounded: false } });
        tied.push({ b, string, radius, color: BALLOONS[(i + (x > W / 2 ? 2 : 0)) % BALLOONS.length] });
      });
      points.push(...world.points.slice(before));
    }
    let pageEnd = world.height;

    // ── Easter eggs: balloons that get out of the presents, or rise in a crowd ──
    const risen = [];
    // where the presents stand on the grass: x, and how wide and tall
    const presents = () => {
      const foot = world.height - FOOT;
      return [
        [W / 2 - half * 0.62, foot + 34, 62, 50],
        [W / 2 - half * 0.62 + 52, foot + 46, 44, 34],
        [W / 2 + half * 0.66, foot + 40, 54, 62],
        [W / 2 + half * 0.66 - 52, foot + 48, 46, 30],
      ];
    };

    // ── Balloons let go, drifting up the page ──
    const loose = [];
    for (const [fx, fy, radius] of [[0.13, 0.62, 24], [0.88, 0.5, 28], [0.08, 0.9, 20]]) {
      loose.push({
        p: world.addPoint(fx * W, fy * TOP, { gravity: -0.02, drag: 0.09, wind: 0.2, mass: 0.6, radius, grabbable: true }),
        home: fx,
        radius,
        color: BALLOONS[loose.length],
        phase: rand(0, 6),
      });
    }

    const make = () => ({ size: pick([12, 14, 16, 18]), upright: true });
    const drift = calm ? null : createDrift(world, { count: Math.round(16 + W / 45), gravity: 0.1, make });
    const bursts = createBursts(world);

    // ── The candles ──
    const lit = [1, 1, 1, 1, 1]; // how brightly each burns
    let blownAt = null; // when they were blown out
    const smoke = [];
    const cakeAt = () => candles(W / 2, world.height - FOOT);

    // ── Tall grass in front of the table: it sways in the breeze; a tap parts
    // it, a finger brushes through it (sections/garden/grass.js). Made again
    // when the page grows, as it stands at the page's end. ──
    let grass = null;
    let grassFor = 0;
    const grassNow = () => {
      const h = world.height;
      if (grassFor !== h) {
        grassFor = h;
        const [top, bottom] = [h - FOOT + 6, h + 6];
        // short enough not to hide the presents (they can be tapped), and none
        // growing up in front of them
        const avoid = () => (x, y) => presents().some(([px, py, pw]) => Math.abs(x - px) < pw * 0.62 && y < py + 18);
        grass = tallGrass({ top, bottom, avoid, size: (y) => 0.3 + (0.32 * (y - top)) / (bottom - top), camera: () => 0, seed: 9, density: 0.55 })(W);
      }
      return grass;
    };
    let grassTime = 0;

    // ── Easter egg: their name in the bunting. The middle swag's flags turn
    // over one after another, each with a gold letter on its back. ──
    let spelled = false;
    const spell = () => {
      if (spelled) return;
      const row = flags.filter((f) => f.swag === middle);
      let word = lettersOf((name() ?? '').trim().split(/\s+/)[0] ?? '');
      if (!word.length) word = lettersOf(row.length >= 14 ? 'Happy birthday' : 'Hurray');
      word = word.slice(0, row.length);
      const start = Math.floor((row.length - word.length) / 2);
      const now = world.time;
      row.forEach((f, i) => {
        const letter = word[i - start];
        if (!letter?.trim()) return;
        f.letter = letter;
        f.from = now + (i - start) * WAVE;
        f.to = f.from + SPELL_HOLD;
      });
      spelled = true;
    };
    const flagAt = (x, y) => flags.find((f) => Math.hypot(x - (f.a.x + f.b.x + f.tip.x) / 3, y - (f.a.y + f.b.y + f.tip.y) / 3) < 17);

    // ── Easter egg: the bulbs chime "Happy Birthday", a note a tap ──
    let note = 0;
    const flare = bulbs.map(() => 0);
    const floating = []; // little gold notes, rising off the bulbs
    const ring = (i, sound = true) => {
      if (sound) chime(note++);
      flare[i] = 1;
      floating.push({ x: bulbs[i].x, y: bulbs[i].y + 24, age: 0, side: rand(-1, 1) });
    };
    const bulbAt = (x, y) => bulbs.findIndex((p) => Math.hypot(x - p.x, y - (p.y + 9)) < 18);
    // the whole song, the bulbs of the middle strand lighting up in time: low notes on the left
    let song = [];
    const sing = () => {
      const strand = bulbCords[middle].slice(1, -1).map((p) => bulbs.indexOf(p));
      const pitches = [...new Set(SONG.map((n) => n.freq))].sort((m, n) => m - n);
      const start = world.time;
      playSong((i, delay) => {
        const k = pitches.indexOf(SONG[i].freq) / (pitches.length - 1);
        song.push({ at: start + delay, bulb: strand[Math.round(0.12 * (strand.length - 1) + k * 0.76 * (strand.length - 1))] });
      });
    };

    // ── Easter egg: a dandelion clock in the grass, for a wish ──
    const wish = { blownAt: -Infinity, seeds: [] };
    const stemAt = () => ({ x: W / 2 + 4, foot: world.height + 4, height: 50 }); // low in the grass, between the presents
    const headAt = () => {
      const { x, foot, height } = stemAt();
      return { x, y: foot - height };
    };
    const full = () => world.time - wish.blownAt > REGROW;
    const blow = () => {
      if (!full()) return;
      wish.blownAt = world.time;
      const head = headAt();
      for (let i = 0; i < 48; i++) {
        const a = rand(0, Math.PI * 2);
        wish.seeds.push({
          x: head.x + Math.cos(a) * 10,
          y: head.y + Math.sin(a) * 10,
          vx: Math.cos(a) * rand(15, 60) + 18,
          vy: Math.sin(a) * rand(10, 40) - 25,
          rise: rand(30, 62),
          drift: rand(6, 22),
          phase: rand(0, 6),
          age: -rand(0, 0.5), // not all at once
          life: rand(11, 16),
          size: Math.round(rand(9, 13)),
        });
      }
    };
    const nearHead = (x, y, reach) => {
      const head = headAt();
      return Math.hypot(x - head.x, y - head.y) < reach;
    };

    return {
      backdrop(ctx, w, h) {
        garden(ctx, w, h);
        print(ctx);
        lowSun(ctx, w, h);
      },

      update(time, dt) {
        // the page grew or shrank: what's tied to its end goes with it
        if (world.height !== pageEnd) {
          const dy = world.height - pageEnd;
          pageEnd = world.height;
          for (const p of points) {
            p.y += dy;
            p.py += dy;
          }
        }
        drift?.update(time);
        bursts.update(dt);
        for (const l of loose) {
          if (l.p.grabbed) continue;
          l.p.x += Math.sin(time * 0.5 + l.phase) * 0.06 + (l.home * W - l.p.x) * 0.0016; // back to its side
          if (l.p.y < -60 || l.p.y < l.radius + 2) {
            const y = world.height - BOTTOM * 0.7;
            const x = l.home * W;
            Object.assign(l.p, { x, y, px: x, py: y });
          }
        }
        for (let i = risen.length - 1; i >= 0; i--) {
          const r = risen[i];
          r.age += dt;
          if (r.age < 0) continue;
          r.y -= (70 + r.age * 26) * dt;
          r.x += Math.sin(time * 1.1 + r.phase) * 14 * dt;
          if (r.age > 9) risen.splice(i, 1);
        }
        // lit again, one after another
        if (blownAt !== null) {
          const since = time - blownAt;
          lit.forEach((_, i) => (lit[i] = since < 3.2 + i * 0.25 ? 0 : Math.min(1, lit[i] + dt * 3)));
          if (since > 6) blownAt = null;
        }
        for (let i = smoke.length - 1; i >= 0; i--) {
          smoke[i].age += dt;
          if (smoke[i].age > 2.4) smoke.splice(i, 1);
        }

        // the bunting turning over, and back
        if (spelled) {
          let still = false;
          for (const f of flags) {
            if (!f.letter) continue;
            const over = time >= f.from && time < f.to ? 1 : 0;
            f.turn += Math.sign(over - f.turn) * Math.min(Math.abs(over - f.turn), dt / 0.55);
            if (over || f.turn > 0 || time < f.from) still = true;
            else f.letter = null; // turned back: done
          }
          spelled = still;
        }
        // the song, and the bulbs lighting up
        for (let i = song.length - 1; i >= 0; i--) {
          if (time < song[i].at) continue;
          if (song[i].bulb >= 0) ring(song[i].bulb, false);
          song.splice(i, 1);
        }
        flare.forEach((f, i) => (flare[i] = Math.max(0, f - dt * 1.4)));
        for (let i = floating.length - 1; i >= 0; i--) {
          floating[i].age += dt;
          if (floating[i].age > 1.8) floating.splice(i, 1);
        }
        // the wish, floating away
        for (let i = wish.seeds.length - 1; i >= 0; i--) {
          const seed = wish.seeds[i];
          seed.age += dt;
          if (seed.age < 0) continue;
          const easy = Math.min(1, dt * 0.9);
          seed.vx += (seed.drift + Math.sin(time * 0.9 + seed.phase) * 22 + world.wind * 0.02 - seed.vx) * easy;
          seed.vy += (-seed.rise - seed.vy) * easy;
          seed.x += seed.vx * dt;
          seed.y += seed.vy * dt;
          if (seed.age > seed.life) wish.seeds.splice(i, 1);
        }
      },

      // a finger or the mouse, held down and moving: through the grass
      brush(x, y, dx, dy) {
        if (nearHead(x, y, 26)) blow();
        if (y > world.height - FOOT - 40) grassNow().brush(x, y, dx, dy);
      },

      // pressed and let go on something you can grab: a bulb chimes, a flag spells
      tapHeld(point) {
        const bulb = bulbs.indexOf(point);
        if (bulb >= 0) return ring(bulb);
        if (flags.some((f) => f.a === point || f.b === point)) spell();
      },

      burst(x, y) {
        if (nearHead(x, y, 30)) return blow();
        const bulb = bulbAt(x, y);
        if (bulb >= 0) return ring(bulb);
        if (flagAt(x, y)) return spell();
        const flames = cakeAt();
        const [mx, my] = [flames[2].x, flames[2].y];
        if (Math.abs(x - mx) < 75 && y > my - 50 && y < my + 190) {
          // blown out: smoke, then flowers and gold over the table
          if (blownAt !== null) return;
          blownAt = world.time;
          lit.fill(0);
          flames.forEach((f, i) => smoke.push({ x: f.x, y: f.y, age: -i * 0.06, phase: i }));
          bursts.spawn(mx, my - 10, 46, () => (Math.random() < 0.5
            ? { gold: true, size: Math.round(rand(8, 13)), variant: Math.floor(rand(0, 6)), spinSpeed: rand(0.05, 0.14) }
            : make()), { speed: 13, gravity: 0.26, drag: 0.045, life: 3.4 });
          return;
        }
        const present = presents().find(([px, py, pw, ph]) => Math.abs(x - px) < pw * 0.7 && y < py + 10 && y > py - ph * 1.5);
        if (present) {
          const [px, py, , ph] = present;
          risen.push({ x: px, y: py - ph - 10, radius: Math.round(rand(20, 27)), color: pick(BALLOONS), age: 0, phase: rand(0, 6), grow: true });
          bursts.spawn(px, py - ph, 26, () => ({ gold: true, size: Math.round(rand(7, 12)), variant: Math.floor(rand(0, 6)), spinSpeed: rand(0.05, 0.14) }), { speed: 9, gravity: 0.26, drag: 0.045, life: 3 });
          return;
        }
        if (y > world.height - FOOT) {
          grassNow().tap(x, y);
          return;
        }
        const boughs = y < 60 + reachFor(W) * 0.7 * Math.min(1, Math.abs(x / W - 0.5) * 2);
        if (boughs) {
          for (let i = 0; i < 3; i++) bursts.spawn(x + rand(-50, 50), y + rand(-20, 20), 12, make, { speed: 1.6, gravity: 0.24, drag: 0.08, life: 5.5 });
        } else bursts.spawn(x, y, 12, make, { speed: 4, gravity: 0.26, drag: 0.08, life: 4 });
      },

      // all the hidden messages found: balloons rise past, flowers come down
      celebrate() {
        const { view } = this;
        if (!view) return;
        sing();
        spell();
        blow();
        for (let i = 0; i < 18; i++) {
          risen.push({ x: rand(0.05, 0.95) * W, y: view.top + view.height + rand(30, 120), radius: Math.round(rand(20, 34)), color: BALLOONS[i % BALLOONS.length], age: -i * 0.22, phase: rand(0, 6) });
        }
        for (let i = 0; i < 5; i++) {
          bursts.spawn((0.1 + 0.2 * i) * W, view.top + 30, 16, () => (Math.random() < 0.4 ? { gold: true, size: Math.round(rand(8, 13)), variant: Math.floor(rand(0, 6)), spinSpeed: rand(0.05, 0.14) } : make()), { speed: 7, gravity: 0.16, drag: 0.06, life: 5 });
        }
      },

      draw(ctx, time) {
        // flowers drifting down
        for (const f of drift?.pieces ?? []) {
          const depth = DEPTHS[f.depth];
          let s = blossom(f.size, f.depth ? 'near' : 'far');
          if (depth.blur) s = blurred(s, depth.blur);
          stamp(ctx, s, f.p.x, f.p.y, { ...pose(f), scale: depth.scale, alpha: depth.alpha });
        }

        // the bulbs
        for (const cord of bulbCords) smoothLine(ctx, cord, { color: 'rgba(70, 50, 70, 0.8)', width: 1.2 });
        bulbs.forEach((p, i) => {
          const lit = flare[i];
          stamp(ctx, glow(30, '255, 214, 140'), p.x, p.y + 10, { alpha: Math.min(1, 0.4 + 0.2 * Math.sin(time * 1.6 + i * 1.7) + lit * 0.6), scale: 1 + lit * 1.3 });
          stamp(ctx, edisonBulb(17), p.x, p.y + 9);
        });
        ctx.fillStyle = GOLD_INK;
        for (const n of floating) {
          const k = n.age / 1.8;
          ctx.save();
          ctx.globalAlpha *= Math.min(1, n.age * 6) * (1 - k);
          ctx.translate(n.x + n.side * 14 * k + Math.sin(n.age * 5) * 2, n.y + 8 - 34 * k);
          musicNote(ctx, 11);
          ctx.restore();
        }

        // the bunting
        for (const f of flags) {
          if (f.turn <= 0) {
            flag(ctx, f.a, f.b, f.tip, f.color);
            continue;
          }
          // turning over about the line from its middle to its tip: narrower, then its back
          const k = Math.cos(Math.PI * f.turn);
          const wide = Math.max(0.04, Math.abs(k));
          const [mx, my] = [(f.a.x + f.b.x) / 2, (f.a.y + f.b.y) / 2];
          const a = { x: mx + (f.a.x - mx) * wide, y: my + (f.a.y - my) * wide };
          const b = { x: mx + (f.b.x - mx) * wide, y: my + (f.b.y - my) * wide };
          if (k >= 0) {
            flag(ctx, a, b, f.tip, f.color);
            continue;
          }
          flag(ctx, a, b, f.tip, '#FBF3E4');
          ctx.save();
          ctx.translate(mx + (f.tip.x - mx) * 0.4, my + (f.tip.y - my) * 0.4);
          ctx.rotate(Math.atan2(f.tip.y - my, f.tip.x - mx) - Math.PI / 2);
          ctx.scale(wide, 1);
          ctx.fillStyle = GOLD_INK;
          ctx.font = '19px "Instrument Serif", "Tiro Devanagari Hindi", Georgia, serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(f.letter, 0, 0);
          ctx.restore();
        }
        for (const cord of cords) smoothLine(ctx, cord, { color: '#F8EEDC', width: 2.2 });

        // balloons
        for (const { b, string, radius, color } of tied) {
          smoothLine(ctx, string, { color: 'rgba(120, 96, 140, 0.65)', width: 0.9 });
          stamp(ctx, balloon(color, radius), b.x, b.y, { angle: floatAngle(b, string[string.length - 3]) * 0.6 });
        }
        for (const l of loose) {
          const sway = Math.sin(time * 0.7 + l.phase) * 0.08;
          const tail = Array.from({ length: 5 }, (_, i) => ({ x: l.p.x + Math.sin(time * 1.1 + l.phase + i * 0.9) * i * 1.6, y: l.p.y + l.radius * 1.3 + i * 11 }));
          smoothLine(ctx, tail, { color: 'rgba(120, 96, 140, 0.55)', width: 0.9 });
          stamp(ctx, balloon(l.color, l.radius), l.p.x, l.p.y, { angle: sway });
        }

        for (const r of risen) {
          if (r.age < 0) continue;
          const size = r.grow ? Math.min(1, 0.25 + r.age * 1.4) : 1;
          const show = Math.min(1, (9 - r.age) / 1.5);
          const tail = Array.from({ length: 6 }, (_, i) => ({ x: r.x + Math.sin(time * 1.4 + r.phase + i * 0.8) * i * 1.5, y: r.y + r.radius * 1.3 * size + i * 10 * size }));
          smoothLine(ctx, tail, { color: 'rgba(120, 96, 140, 0.55)', width: 0.9, alpha: show });
          stamp(ctx, balloon(r.color, r.radius), r.x, r.y, { angle: Math.sin(time * 0.8 + r.phase) * 0.1, scale: size, alpha: show });
        }

        // the candles
        cakeAt().forEach((f, i) => {
          if (lit[i] <= 0.02) return;
          ctx.save();
          ctx.globalAlpha = lit[i];
          candleFlame(ctx, f.x, f.y, time, i);
          ctx.restore();
        });
        ctx.save();
        ctx.lineCap = 'round';
        for (const s of smoke) {
          if (s.age < 0) continue;
          const k = s.age / 2.4;
          ctx.strokeStyle = `rgba(120, 110, 130, ${0.4 * (1 - k)})`;
          ctx.lineWidth = 1.4 + k * 3;
          ctx.beginPath();
          for (let u = 0; u <= 1; u += 0.12) {
            ctx.lineTo(s.x + Math.sin(u * 5 + time * 2 + s.phase) * 5 * u * (0.4 + k), s.y - 4 - u * 46 * Math.min(1, k * 2.4));
          }
          ctx.stroke();
        }
        ctx.restore();

        // the tall grass (only while the garden is on screen)
        const dt = Math.min(0.05, Math.max(0, time - grassTime));
        grassTime = time;
        const { view } = this;
        const garden = !view || view.top + view.height > world.height - FOOT - 60;
        if (garden) grassNow().draw(ctx, time, dt, 0);

        // the dandelion, and its seeds on their way
        if (garden) {
          const { x, foot, height } = stemAt();
          const since = world.time - wish.blownAt;
          const sway = Math.sin(time * 1.2) * 2.5 + Math.sin(time * 2.9) * 0.8;
          const top = dandelion(ctx, x, foot, height, sway, seedHead(17, false));
          if (since > REGROW - 2) stamp(ctx, seedHead(17, true), top.x, top.y, { alpha: Math.min(1, (since - REGROW + 2) / 2) });
        }
        for (const seed of wish.seeds) {
          if (seed.age < 0) continue;
          const show = Math.min(1, seed.age * 4, (seed.life - seed.age) / 2);
          stamp(ctx, seedSprite(seed.size), seed.x, seed.y, { angle: Math.max(-0.5, Math.min(0.5, seed.vx * 0.012)), alpha: show });
        }

        for (const b of bursts.pieces) {
          if (b.gold) stamp(ctx, goldFlake(b.size, b.variant, 'gold'), b.p.x, b.p.y, { angle: b.spin, flip: Math.cos(b.spin * 1.2), alpha: bursts.fade(b) });
          else stamp(ctx, blossom(b.size), b.p.x, b.p.y, { ...pose(b), alpha: bursts.fade(b) });
        }
      },
    };
  },
};
