// Chapter 1 — the names, the mandap, and the date on the pond.
//
// A lapis night over Patan, full of sky lanterns. The couple's names are
// set big, in engraved gold capitals; only the brass kalash on top of the
// wedding mandap
// peeks up from below. Huge out-of-focus lanterns drift right in front of
// the camera, so the picture has real depth.
//
// Scroll, and the camera TILTS DOWN (it doesn't zoom): past the lanterns,
// down the red-and-gold silk canopy of the empty wedding mandap, its
// marigold strands and bells, to the sacred fire burning between the two
// seats, the diyos, the steps, into the brick courtyard and the sunken stone water
// spout (hiti)… until the hiti's peacock-teal water fills the screen.
// And right there, without scrolling on to another panel, the invitation
// and the date are written on the water (pond.js + SaveTheDate.jsx). The
// chapter ends on them: scroll on and chapter 2's velvet, marigold fringe
// first, rises up over the pond with the celebrations already on it.
//
// The world is one tall scene; each layer slides up at its own speed
// (`rate`): the sky slowly, the temple 1:1, the near lanterns fastest.
//
// The names have parallax too: each line rides the camera at its own speed
// (`rate`), so as you start scrolling they drift apart and lift away past
// the lanterns, the top line fastest.

import StoryScene, { Reveal, smooth } from '../StoryScene';
import { sectionText } from '../shared/text';
import { paintedSky, sidesOf, vignetteOf, WATER } from '../texture';
import { lanternField } from '../lanterns';
import { town, courtyard, poolEdge, poolLamps } from '../temple';
import { mandap, mandapLights, sacredFire, MANDAP_HEIGHT } from '../mandap';
import { flame } from '../art';
import { seeded } from '../../themes/draw';
import { pondLayers } from './pond';
import SaveTheDate from './SaveTheDate';
import GoldArch from './GoldArch';

export const HERO_HEIGHT = 3900; // ≈ 3 screens of scrolling while pinned (shortened so the date comes sooner)

// The chapter's timeline, in values of `p` (0 → 1 as you scroll through it).
const T = {
  namesOut: [0.08, 0.19], // the names lift away
  water: [0.7, 0.79], // the camera settles on the pond; its surface fills the screen
  arrive: [0.72, 0.86], // the mandala and the gold arch settle into place
  words: 0.75, // the invitation and the date rise in on the water, and stay:
  //              the chapter ends on them, and chapter 2's velvet rises over them
};
const pond = pondLayers(T);

// Where things are in the world (page px from the top of the first screen).
const MANDAP_TOP = 640; // the tip of the mandap's kalash: just peeks in below the names
const COURT_TOP = 1600;
// The hiti's shape for a page `w` wide. On a phone it's 300 px across at
// the top and its sides spread out as it comes nearer. On a wider screen
// it's wider and spreads faster, so that — like on a phone — its water
// reaches both edges of the screen just as the camera lands on it (and the
// water's surface then takes over without the courtyard still showing).
function poolFor(w) {
  const topW = 300 + Math.max(0, w - 430) * 0.5;
  const reach = PAN - 100 - 1716; // px of pool between its top and the screen's top, as the camera lands
  const spread = w <= 430 ? 0.32 : Math.max(0.32, (w / 2 + 60 - topW / 2) / reach);
  return { top: 1716, topW, spread };
}
const PAN = 2160; // how far down the camera travels
const WORLD_BOTTOM = PAN + 1100;

// The camera glides down and comes to rest three times:
//   the whole temple → its lamp-lit steps and the hiti → the water.
// [p, camera position]
const SHOTS = [
  [0.042, 0],
  [0.25, 600],
  [0.415, 1090],
  [0.766, PAN], // lands on the pond, where the date appears
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



const layers = [
  {
    // the painted sky: deep lapis at the top, a warm glow on the horizon
    band: [0, 1700],
    anchor: 'top',
    resolution: 0.6,
    paint(ctx, w) {
      paintedSky(ctx, w, 0, 1700, {
        stops: [
          [0, '#070D2B'],
          [0.22, '#0F1E55'],
          [0.42, '#1B3478'],
          [0.58, '#2A3F86'],
          [0.7, '#5A4682'],
          [0.8, '#B4605E'],
          [0.9, '#E59A5E'],
          [1, '#F2BE7C'],
        ],
        strokes: ['30, 50, 120', '70, 100, 190', '90, 120, 210', '120, 110, 190', '230, 140, 120', '255, 190, 130'],
        count: 2400,
        stars: 140,
      });
    },
    look: slide(0.35),
  },
  {
    // far lanterns: small, sharp, everywhere — tap the sky to release one
    band: [0, 1100],
    anchor: 'top',
    live: lanternField({ count: 46, size: [5, 15], rate: 0.32, rise: 9, camera, tappable: true, seed: 11 }),
    look: (p) => ({ opacity: 1 - smooth(0.65, 0.75, p) }),
  },
  {
    // the old town, its rooftops dark against the glow
    band: [1080, 1750],
    anchor: 'top',
    paint(ctx, w) {
      town(ctx, w, 1260, 1750, { seed: 9, color: '#2A1B3A', lit: 0.25 });
      town(ctx, w, 1340, 1750, { seed: 4, color: '#1A1024', lit: 0.45 });
    },
    look: slide(0.62),
  },
  {
    // middle lanterns: bigger, still sharp
    band: [0, 1100],
    anchor: 'top',
    live: lanternField({ count: 14, size: [18, 38], rate: 0.75, rise: 13, camera, seed: 23 }),
    look: (p) => ({ opacity: 1 - smooth(0.66, 0.77, p) }),
  },
  {
    // the courtyard and the hiti
    band: [COURT_TOP, WORLD_BOTTOM],
    anchor: 'top',
    paint(ctx, w) {
      courtyard(ctx, w, COURT_TOP, WORLD_BOTTOM, poolFor(w));
    },
    look: slide(1),
  },
  {
    // the wedding mandap (in the middle of the screen, however wide)
    band: [MANDAP_TOP - 20, MANDAP_TOP + MANDAP_HEIGHT + 20],
    centered: true,
    anchor: 'top',
    paint(ctx) {
      mandap(ctx, 215, MANDAP_TOP);
    },
    look: slide(1),
  },
  {
    // the lamps' flames on the mandap and the hiti, and lanterns' reflections
    // shimmering on the water (drawn where they are on screen right now)
    band: [0, 1100],
    anchor: 'top',
    live: (w, h) => {
      // the mandap's fire and lamps (it stands in the middle of the screen)
      // and the lamps around this screen's hiti
      const pool = poolFor(w);
      const LIGHTS = mandapLights(w / 2, MANDAP_TOP);
      const LAMPS = [...LIGHTS.diyos, ...poolLamps(pool, w, WORLD_BOTTOM)];
      const r = seeded(5);
      const glints = Array.from({ length: 16 }, () => ({ x: r() * w, y: pool.top + 120 + r() * 900, len: 14 + r() * 40, speed: 0.6 + r() * 1.4, phase: r() * 6 }));
      return {
        draw(ctx, t, dt, p) {
          const cam = camera(p);
          // the sacred fire in the middle of the mandap
          const fireY = LIGHTS.fire[1] - cam;
          if (fireY > -200 && fireY < h + 200) sacredFire(ctx, LIGHTS.fire[0], fireY, t, dt);
          LAMPS.forEach(([x, y], i) => {
            const sy = y - cam;
            if (sy > -40 && sy < h + 40) flame(ctx, x, sy - 9, t, i);
          });
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          LAMPS.forEach(([x, y]) => {
            // each rim lamp's light trembling on the water just inside it
            const sy = y - cam;
            if (sy < -40 || sy > h + 40 || y < pool.top + 30) return;
            const inward = x < w / 2 ? 34 : -34;
            ctx.fillStyle = `rgba(255, 170, 80, ${(0.18 + 0.08 * Math.sin(t * 3 + y)).toFixed(3)})`;
            ctx.fillRect(x + inward - 8 + Math.sin(t * 2 + y) * 2, sy + 6, 16, 1.5);
          });
          for (const g of glints) {
            const sy = g.y - cam;
            if (sy < -20 || sy > h + 20 || Math.abs(g.x - w / 2) > poolEdge(pool, g.y) - 60) continue;
            const a = 0.12 + 0.12 * Math.sin(t * g.speed + g.phase);
            ctx.fillStyle = `rgba(255, 180, 90, ${a.toFixed(3)})`;
            ctx.fillRect(g.x - g.len / 2, sy, g.len, 1.6);
            ctx.fillRect(g.x - g.len / 4 + Math.sin(t + g.phase) * 4, sy + 4, g.len / 2, 1.2);
          }
          ctx.restore();
        },
      };
    },
  },
  // the pond: water, mandala, floating lamps and petals, gold arch (pond.js)
  ...pond,
  {
    // NEAR lanterns: huge, out of focus, right in front of the camera
    band: [0, 1100],
    anchor: 'top',
    front: true,
    live: lanternField({ count: 7, size: [70, 170], blur: 0.09, rate: 1.7, rise: 18, camera, edges: true, seed: 7, alpha: (p) => 0.92 * (1 - smooth(0.46, 0.58, p)) }),
  },
  {
    // a lens: darker corners while we're in the sky, only darker sides
    // once we're down by the pond
    fill: vignetteOf('4, 8, 26', 0.55),
    front: true,
    look: (p) => ({ opacity: 1 - smooth(0.5, 0.66, p) }),
  },
  {
    fill: sidesOf('3, 12, 26', 0.45),
    front: true,
    look: (p) => ({ opacity: smooth(0.5, 0.66, p) }),
  },
  // (no film grain: an 'overlay' blend over the moving scene made the GPU
  // redo the whole chapter every frame, and stalled it the first time it
  // came into view; the lokta paper printed on the painted layers gives the
  // texture)
];

const scene = { editAt: 0, layers, camera };

// One line of the names, riding the camera at its own speed.
//   top  – where it sits (share of the screen's height)
//   rate – how fast it flies up as you scroll (1 = as fast as the temple)
function Plane({ top, rate, className = '', children }) {
  return (
    <Reveal at={[-1, 0]} out={T.namesOut} rise={0} rate={rate} className={`absolute inset-x-0 flex justify-center ${className}`} style={{ top }}>
      {children}
    </Reveal>
  );
}

export default function HeroSection({ props, onChange, isEditing }) {
  const text = sectionText(props, onChange, isEditing);
  const name = 'font-caps text-foil text-[78px] leading-[0.92] font-medium uppercase tracking-[0.05em]';
  const glow = '[filter:drop-shadow(0_4px_18px_rgba(6,10,40,0.8))]';

  return (
    <StoryScene height={HERO_HEIGHT} scene={scene} background="#070D2B" start="#070D2B" edge={WATER.flat} pinned editing={isEditing}>
      {/* only the names; each line drifts at its own speed as you scroll */}
      <Plane top="16%" rate={1.3}>
        {text('kicker', 'font-dev text-[17px] tracking-[0.3em] text-[#E8C27A]', { singleLine: true, placeholder: 'शुभ विवाह' })}
      </Plane>
      <Plane top="21%" rate={1.18} className={glow}>
        {text('name1', name, { singleLine: true })}
      </Plane>
      <Plane top="30.5%" rate={1.06}>
        <div className="flex items-center gap-4 text-[#E8C27A]">
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#E8C27A]" />
          <span className="font-display text-[30px] leading-none italic">weds</span>
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#E8C27A]" />
        </div>
      </Plane>
      <Plane top="35%" rate={0.95} className={glow}>
        {text('name2', name, { singleLine: true })}
      </Plane>

      {/* a quiet hint to scroll, under the names */}
      <Reveal at={[-1, 0]} out={[0, 0.02]} rise={0} className="pointer-events-none absolute inset-x-0 top-[57%] flex flex-col items-center gap-2 text-[#F3DDB0]/80">
        <span className="font-sans text-[9.5px] tracking-[0.5em] uppercase">Scroll</span>
        <span className="h-8 w-px animate-pulse bg-gradient-to-b from-[#F3DDB0] to-transparent" />
      </Reveal>

      {/* the invitation and the date, written on the pond, in a gold arch
          sized to the screen (hidden while editing, so the words are clear) */}
      {!isEditing && <GoldArch at={T.arrive} />}
      <SaveTheDate text={text} isEditing={isEditing} from={T.words} />
    </StoryScene>
  );
}
