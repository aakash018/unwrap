// Chapter 1 of the garden (Christian) wedding invite — the names, the
// altar under the big tree, and the date on the stone path.
//
// After a photo the founder chose: a garden on a hill at golden hour — a
// soft blue-grey sky warming to gold, the sun low on the right over
// rolling wooded hills, one big old tree; strings of Edison bulbs hanging
// down to the altar and branches of white roses hanging in over the top corners. The couple's names are
// set big in gold capitals; the altar's beam peeks up from below.
//
// Scroll, and the camera TILTS DOWN (no zoom): the altar under the big tree
// (stage.js: a white pergola, two classical columns, sheer drapes, a wooden
// cross dressed in greenery and white flowers) → the stone path between
// rows of white benches, flowers and pampas at its edges → the path
// widening towards us until its pale stone fills the screen, and the
// invitation and the date are written on it in dark ink and gold
// (path.js + SaveTheDate tone="dark", in a round gold arch with a small
// cross). Chapter 2 begins where the path meets a border of flowers.
//
// Each layer slides at its own speed (`rate`), for depth: sky 0.35, light
// motes 0.15 / 0.32 / 0.75 / 1.5, hills 0.42 / 0.56 / 0.7, the big tree 0.85, the garden and altar 1, string lights hanging down
// to the altar: 0.9 (behind it) and 1.12 (sloping),
// the hanging roses 1.9, petals near the camera 1.5.
//
// Same engine and the same timeline as the Hindu invite's opening
// (hero/HeroSection.jsx): the whole timeline is `T`, the camera's resting
// shots are `SHOTS`.

import StoryScene, { Reveal, smooth } from '../StoryScene';
import { sectionText } from '../shared/text';
import { paintedSky, vignetteOf } from '../texture';
import { lanternField } from '../lanterns';
import { hills, bigTree, grounds, benches, benchesEnd, firstBenchY, gardenSize, pathHalfAt, STONE } from './garden';
import { tallGrass } from './grass';
import { weddingStage, STAGE_HEIGHT } from './stage';
import { pathLayers } from './path';
import { stringLights, hangingBranches, nearPetals } from './sky';
import SaveTheDate from '../hero/SaveTheDate';
import GoldArch from '../hero/GoldArch';

export const GARDEN_HERO_HEIGHT = 3900;

// The chapter's timeline, in values of `p` (0 → 1 as you scroll through it).
const T = {
  namesOut: [0.08, 0.19], // the names lift away
  water: [0.7, 0.79], // the camera settles on the path; its stone fills the screen
  arrive: [0.72, 0.86], // the wreath and the gold arch settle into place
  words: 0.75, // the invitation and the date rise in on the stone, and stay
};
const path = pathLayers(T);

// Where things are in the world (page px from the top of the first screen).
const STAGE_TOP = 830; // the top of the altar's beam: it peeks in below the names
const LAWN_TOP = STAGE_TOP + 386; // the lawn's far edge (a low fence), just behind the altar's floor
const PATH_TOP = STAGE_TOP + STAGE_HEIGHT; // the path starts at the foot of the altar's step
const FULL_Y = PATH_TOP + 700; // the path, widening towards us, is wider than the screen here
const GRASS_BOTTOM = firstBenchY(PATH_TOP, FULL_Y); // the tall grass reaches down to the first benches
const PAN = FULL_Y + 60; // how far down the camera travels (past FULL_Y: only stone)
const WORLD_BOTTOM = PAN + 1100;
// When the camera rests on the altar (camera REST) the horizon — the lawn's
// far edge — is at HORIZON on screen. The farther layers slide slower than
// the camera (`rate`), so each is placed to stand on that horizon then:
const REST = 560;
const HORIZON = LAWN_TOP - REST;
const onHorizon = (rate) => HORIZON + REST * rate;
// how far each column stands from the middle: a wide altar on a wide screen
// how far down a hill layer sliding at `rate` must be painted: before the
// camera reaches the altar the lawn sits lower than the hills' foot (the
// lawn slides faster), by up to (1 - rate) × REST
const hillFoot = (rate) => onHorizon(rate) + (1 - rate) * REST + 60;
// where to put something on a layer sliding at `rate` so it's at `screenY`
// on screen when the camera rests on the altar
const atRest = (screenY, rate) => screenY + REST * rate;
const columnFor = (w) => Math.min(240, Math.max(166, w * 0.19));
const SUN_Y = onHorizon(0.35) - 250; // the low sun, just above the big hills, on the right
const SUNSET = 120; // how far the sun sinks while you scroll down to the date
const SKY_TOP = '#565A80'; // the top of the sky (and of the chapter)
// how brightly the strings of bulbs glow: brighter as the sun goes down
const dusk = (p) => 0.75 + 0.55 * smooth(0.05, 0.5, p);

// The camera glides down and comes to rest three times:
//   the altar under the big tree → the path between the benches → the stone.
// [p, camera position]
const SHOTS = [
  [0.042, 0],
  [0.25, REST],
  [0.43, 1180],
  [0.766, PAN],
];
function camera(p) {
  if (p <= SHOTS[0][0]) return 0;
  for (let i = 1; i < SHOTS.length; i++) {
    const [a, from] = SHOTS[i - 1];
    const [b, to] = SHOTS[i];
    if (p <= b) return from + (to - from) * smooth(a, b, p);
  }
  return PAN;
}
const slide = (rate) => (p) => ({ y: -camera(p) * rate });

// Several live layers drawn on one canvas (fewer full-screen canvases to
// clear and redraw every frame); taps go to each of them.
const together = (...parts) => (w, h) => {
  const all = parts.map((part) => part(w, h));
  return {
    draw: (...args) => all.forEach((one) => one.draw(...args)),
    tap: (x, y) => all.forEach((one) => one.tap?.(x, y)),
  };
};

const layers = [
  {
    // the sky at golden hour: warm almost all the way up, like the photo —
    // a soft slate blue only at the very top (so the gold names still
    // read), then rose, peach and gold
    band: [0, 1700],
    phoneGroup: 'sky', // (on phones, the sun is painted into the sky: it doesn't set)
    anchor: 'top',
    resolution: 0.4, // a soft gradient: sharpness would only cost memory
    paint(ctx, w) {
      paintedSky(ctx, w, 0, 1700, {
        stops: [
          [0, SKY_TOP],
          [0.12, '#7D7A98'],
          [0.24, '#B394A0'],
          [0.34, '#E0AE94'],
          [0.44, '#F4C891'],
          [0.56, '#FBDDAA'],
          [1, '#FCE8C2'],
        ],
        strokes: ['100, 100, 140', '170, 140, 160', '230, 170, 145', '250, 200, 150', '255, 222, 172', '255, 235, 200'],
        count: 2400,
        stars: 0,
        seed: 7,
      });
    },
    look: slide(0.35),
  },
  {
    // the low sun on the right, on its own layer so it can SINK as you
    // scroll down (time passing on the way to the date): it slips down
    // towards the hills, which pass in front of it
    band: [SUN_Y - 500, SUN_Y + 500],
    phoneGroup: 'sky',
    anchor: 'top',
    resolution: 0.4,
    paint(ctx, w) {
      const sx = w * 0.8;
      const halo = ctx.createRadialGradient(sx, SUN_Y, 0, sx, SUN_Y, 480);
      halo.addColorStop(0, 'rgba(255, 244, 214, 0.95)');
      halo.addColorStop(0.12, 'rgba(255, 226, 170, 0.6)');
      halo.addColorStop(0.45, 'rgba(250, 196, 140, 0.22)');
      halo.addColorStop(1, 'rgba(250, 190, 140, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(sx - 480, SUN_Y - 480, 960, 960);
      const disc = ctx.createRadialGradient(sx, SUN_Y, 0, sx, SUN_Y, 34);
      disc.addColorStop(0, '#FFFBEA');
      disc.addColorStop(0.75, '#FFEFC2');
      disc.addColorStop(1, 'rgba(255, 228, 170, 0)');
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(sx, SUN_Y, 34, 0, Math.PI * 2);
      ctx.fill();
    },
    look: (p) => ({ y: -camera(p) * 0.35 + SUNSET * smooth(0.05, 0.5, p) }),
    look: slide(0.35),
  },
  {
    // motes of light at three distances — tiny and dim far away, small ones
    // nearer (tap to add one), bigger ones nearer still — each moving at its
    // own speed, but all drawn on ONE canvas, a little soft (they're glows:
    // full sharpness would only cost the phone more work every frame)
    band: [0, 1100],
    anchor: 'top',
    resolution: 0.5,
    live: together(
      lanternField({ light: true, count: 24, size: [4, 8], rate: 0.15, rise: 2, camera, seed: 3, alpha: (p) => 0.6 * (1 - smooth(0.6, 0.72, p)) }),
      lanternField({ light: true, count: 26, size: [7, 16], rate: 0.32, rise: 4, camera, tappable: true, seed: 11, alpha: (p) => 1 - smooth(0.62, 0.74, p) }),
      lanternField({ light: true, count: 10, size: [18, 34], rate: 0.75, rise: 6, camera, seed: 23, alpha: (p) => 1 - smooth(0.64, 0.76, p) }),
    ),
    look: (p) => ({ opacity: 1 - smooth(0.75, 0.76, p) }), // (gone: stop drawing it)
  },
  {
    // big rolling wooded hills, three ranges: a far one blue-mauve in the
    // haze, a middle one in autumn greens and golds, a near dark green one
    // (only as tall as the hills, down to where the lawn always covers them)
    band: [onHorizon(0.42) - 300 - 60, hillFoot(0.42)],
    phoneGroup: 'hills', // (on phones, the three ranges are one picture…
    phoneLook: slide(0.56), // …moving at the middle one's speed)
    anchor: 'top',
    resolution: 0.75, // hazy with distance: no need to be sharp
    paint(ctx, w) {
      hills(ctx, w, onHorizon(0.42), hillFoot(0.42), { color: '#A99AA0', height: 300, seed: 2, woods: ['#9A8C96', '#B3A4A6', '#A39297'], sun: w * 0.8 });
    },
    look: slide(0.42),
  },
  {
    // (only as tall as the hills, down to where the lawn always covers them)
    band: [onHorizon(0.56) - 220 - 60, hillFoot(0.56)],
    phoneGroup: 'hills',
    anchor: 'top',
    resolution: 0.75, // hazy with distance: no need to be sharp
    paint(ctx, w) {
      hills(ctx, w, onHorizon(0.56), hillFoot(0.56), { color: '#8F8A58', height: 220, seed: 5, woods: ['#7E7C48', '#A0904E', '#B08A4A', '#6E7442', '#9A9858'], sun: w * 0.8 });
    },
    look: slide(0.56),
  },
  {
    // (only as tall as the hills, down to where the lawn always covers them)
    band: [onHorizon(0.7) - 130 - 60, hillFoot(0.7)],
    phoneGroup: 'hills',
    anchor: 'top',
    resolution: 0.75, // hazy with distance: no need to be sharp
    paint(ctx, w) {
      hills(ctx, w, onHorizon(0.7), hillFoot(0.7), { color: '#56643A', height: 130, seed: 8, woods: ['#4A5832', '#64733E', '#76804A', '#3E4C2C', '#8A7E40'], sun: w * 0.8 });
    },
    look: slide(0.7),
  },
  {
    // the big old tree behind the altar
    band: [onHorizon(0.85) - 950, onHorizon(0.85) + 40], // tall: its limbs reach far above the trunk
    anchor: 'top',
    resolution: 0.75, // hazy with distance
    paint(ctx, w) {
      bigTree(ctx, w / 2 + 6, onHorizon(0.85), 560);
    },
    look: slide(0.85),
  },
  {
    // a strand of bulbs strung behind the altar, between the trees, at the
    // big tree's distance (it passes behind the pergola, like in the photo)
    band: [atRest(330, 0.9) - 40, atRest(330, 0.9) + 100],
    anchor: 'top',
    brushable: true,
    resolution: 0.75,
    live: stringLights({ y: atRest(338, 0.9), y2: atRest(322, 0.9), sag: 26, spacing: 78, bulb: 14, drop: 10, alpha: 0.95, swagWidth: 240, edison: true, bright: dusk, camera, rate: 0.9 }),
    look: slide(0.9),
  },
  {
    // the lawn, the fence, the wild flowers and the stone path, down to
    // where the path is wider than the screen…
    band: [LAWN_TOP, FULL_Y + 100],
    phoneGroup: 'ground', // (on phones, one picture with the stone and the altar: they move together)
    anchor: 'top',
    paint(ctx, w) {
      grounds(ctx, w, LAWN_TOP, PATH_TOP, FULL_Y, WORLD_BOTTOM);
    },
    look: slide(1),
  },
  {
    // …and from there on, only the path's stone: painted at half sharpness
    // (it's plain, and the stone layer of path.js soon covers it) to save memory
    band: [FULL_Y, WORLD_BOTTOM],
    phoneGroup: 'ground',
    anchor: 'top',
    resolution: 0.5,
    paint(ctx, w) {
      grounds(ctx, w, LAWN_TOP, PATH_TOP, FULL_Y, WORLD_BOTTOM);
    },
    look: slide(1),
  },
  {
    // the altar, in the middle of the screen (drawn across the full width:
    // it's wider than the story column)
    band: [STAGE_TOP - 60, PATH_TOP + 20],
    phoneGroup: 'ground',
    anchor: 'top',
    paint(ctx, w) {
      weddingStage(ctx, w / 2, STAGE_TOP, { column: columnFor(w) });
    },
    look: slide(1),
  },
  {
    // tall grass and wild flowers between the altar and the benches,
    // swaying in the breeze; tap it, or drag through it (grass.js)
    band: [LAWN_TOP - 220, GRASS_BOTTOM + 20], // (room above for the fireflies to rise)
    anchor: 'top',
    brushable: true,
    resolution: 0.75,
    live: tallGrass({
      top: LAWN_TOP + 4,
      bottom: GRASS_BOTTOM,
      // none on the path, or behind the altar's platform
      avoid: (w) => (x, y) => Math.abs(x - w / 2) < (y < PATH_TOP + 4 ? columnFor(w) + 74 : pathHalfAt(w, y, PATH_TOP, FULL_Y) + 8),
      size: (y) => gardenSize(Math.max(y, PATH_TOP), PATH_TOP, FULL_Y) * (y < PATH_TOP ? 0.85 : 1),
      camera,
    }),
    look: slide(1),
  },
  {
    // the white benches, in front of the grass
    band: [PATH_TOP - 180, benchesEnd(PATH_TOP, FULL_Y)], // (from the arrangements' pampas to the last bench)
    anchor: 'top',
    paint(ctx, w) {
      benches(ctx, w, PATH_TOP, FULL_Y);
    },
    look: slide(1),
  },
  // the path's stone, the gold wreath, petals drifting down (path.js)
  ...path,
  {
    // a long strand hanging DOWN across the scene towards the altar, like
    // in the photo: tied low on the left, high on the right, the bulbs on
    // little cords
    band: [atRest(-60, 1.12), atRest(400, 1.12)],
    anchor: 'top',
    front: true,
    brushable: true,
    resolution: 0.75,
    live: stringLights({ y: atRest(170, 1.12), y2: atRest(-30, 1.12), sag: 110, spacing: 140, bulb: 32, drop: 28, swagWidth: 5000, edison: true, bright: dusk, camera, rate: 1.12 }),
    look: slide(1.12),
  },
  {
    // long branches of white and blush roses hanging in from the top
    // corners — the nearest thing to us: they lift away fastest of all
    band: [-40, 600],
    anchor: 'top',
    front: true,
    paper: false,
    resolution: 0.6, // painted a little soft: they're the nearest thing, out of focus
    paint: hangingBranches,
    look: (p) => ({ y: -camera(p) * 1.9 }),
  },
  {
    // a few big light motes close to the camera, and rose petals drifting
    // down near it (one canvas, a little soft)
    band: [0, 1100],
    anchor: 'top',
    front: true,
    resolution: 0.6,
    live: together(
      lanternField({ light: true, count: 5, size: [26, 40], rate: 1.5, rise: 8, camera, seed: 31, alpha: (p) => 1 - smooth(0.55, 0.66, p) }),
      nearPetals({ camera, rate: 1.5, alpha: (p) => 1 - smooth(0.6, 0.7, p) }),
    ),
    look: (p) => ({ opacity: 1 - smooth(0.7, 0.71, p) }), // (gone: stop drawing it)
  },
  // (no film grain on top here: an 'overlay' blend over the whole moving
  // scene made the GPU redo all of it every frame, and the painted layers
  // are already printed on lokta paper, which gives the texture)
  {
    // a lens: softly darker corners
    fill: vignetteOf('60, 40, 50', 0.35),
    phone: false, // (left out on phones: one more layer over the whole screen)
    front: true,
    look: (p) => ({ opacity: 1 - smooth(0.55, 0.7, p) }),
  },
];

const scene = { editAt: 0, layers, camera };

// One line of the names, riding the camera at its own speed.
// `shade`: these words again, as a soft shadow behind them. (Painted once with
// the words: a CSS drop-shadow filter is worked out again on every frame as
// the line moves, which made the opening lag on cheaper phones.)
function Plane({ top, rate, className = '', shade, shadeClass = '', shadow, children }) {
  return (
    <Reveal at={[-1, 0]} out={T.namesOut} rise={0} rate={rate} className={`absolute inset-x-0 flex justify-center ${className}`} style={{ top }}>
      {shade ? (
        <div className="grid">
          <div aria-hidden="true" className={`pointer-events-none col-start-1 row-start-1 text-transparent ${shadeClass}`} style={{ textShadow: shadow }}>
            {shade}
          </div>
          <div className="col-start-1 row-start-1">{children}</div>
        </div>
      ) : (
        children
      )}
    </Reveal>
  );
}

export default function GardenHero({ props, onChange, isEditing }) {
  const text = sectionText(props, onChange, isEditing);
  const name = 'font-caps text-foil text-[78px] leading-[0.92] font-medium uppercase tracking-[0.05em]';
  const shadow = '0 4px 18px rgba(30, 30, 60, 0.8)';
  const shade = (key) => ({ shade: props[key], shadeClass: name.replace('text-foil ', ''), shadow });

  return (
    <StoryScene height={GARDEN_HERO_HEIGHT} scene={scene} background={SKY_TOP} start={SKY_TOP} edge={STONE} pinned editing={isEditing}>
      {/* only the names; each line drifts at its own speed as you scroll */}
      <Plane top="16%" rate={1.3}>
        {text('kicker', 'font-dev text-[17px] tracking-[0.3em] text-[#F3D79C]', { singleLine: true, placeholder: 'शुभ विवाह' })}
      </Plane>
      <Plane top="21%" rate={1.18} {...shade('name1')}>
        {text('name1', name, { singleLine: true })}
      </Plane>
      <Plane top="30.5%" rate={1.06}>
        <div className="flex items-center gap-4 text-[#F3D79C]">
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#F3D79C]" />
          <span className="font-display text-[34px] leading-none italic">&amp;</span>
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#F3D79C]" />
        </div>
      </Plane>
      <Plane top="35%" rate={0.95} {...shade('name2')}>
        {text('name2', name, { singleLine: true })}
      </Plane>

      {/* a quiet hint to scroll, under the names */}
      <Reveal at={[-1, 0]} out={[0, 0.02]} rise={0} className="pointer-events-none absolute inset-x-0 top-[57%] flex flex-col items-center gap-2 text-[#FBE8C8]/85">
        <span className="font-sans text-[9.5px] tracking-[0.5em] uppercase">Scroll</span>
        <span className="h-8 w-px animate-pulse bg-gradient-to-b from-[#FBE8C8] to-transparent" />
      </Reveal>

      {/* the invitation and the date, written on the path's stone, in a round gold arch */}
      {!isEditing && <GoldArch at={T.arrive} round />}
      <SaveTheDate text={text} isEditing={isEditing} from={T.words} tone="dark" />
    </StoryScene>
  );
}
