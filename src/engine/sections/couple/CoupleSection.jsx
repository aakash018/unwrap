// Chapter 3 — the couple.
//
// Begins on rose silk, under chapter 2's torn teal edge. When the chapter
// reaches the top of the screen a marigold garland is hung up there,
// swaying in a breeze, and STAYS at the top while this chapter is on
// screen. A gold arch draws in, their
// photo is uncovered inside it from the bottom up, then their names and a
// few words. As you keep scrolling the sun goes down: night comes down from
// the top of the sky, and under the moon big gold numbers count the days
// left until the wedding (Countdown.jsx). Chapter 4 begins on that night.

import { useContext } from 'react';
import StoryScene, { Reveal, smooth, StageContext } from '../StoryScene';
import { sectionText } from '../shared/text';
import Countdown from './Countdown';
import { silk } from '../texture';
import { swingingGarland } from '../garland';
import { rose, lotus, crescent } from '../../themes/silhouettes';
import { foil, petal, stamp, rand, seeded } from '../../themes/draw';

export const COUPLE_HEIGHT = 2600;

// The chapter's timeline, in values of `p` (0 → 1 as you scroll through it).
const T = {
  photo: [0.28, 0.42], // the photo is uncovered (while the chapter slides in)
  words: 0.4, // the kicker, names and note follow, one after another
  wordsOut: [0.62, 0.7], // …then fade as the sun goes down
  night: [0.66, 0.82], // night comes down from the top and covers everything
  countdown: [0.8, 0.88], // the countdown appears under the moon, and stays
};

// The night that falls = the top of chapter 4.
export const NIGHT_TOP = '#22122A';

// The rose silk this chapter is on.
export const ROSE = { base: '#E3B2A6', light: '#F3D3C8', dark: '#9C5A4E' };

const NAIL = 8; // where the garland is nailed up, at the top of the screen
const PHOTO = { top: 170, width: 250, height: 420 }; // where the photo sits (scene px), under the garland

// A marigold garland swaying in a breeze (real physics) at the top of the
// screen. It isn't there while the chapter slides in under chapter 2's torn
// edge: the moment the chapter reaches the top of the screen it's hung up,
// nail by nail from the middle outwards, each swag falling and swinging
// into place (see `hangAt` in garland.js). It then stays.
const GARLAND = { band: [-40, 300], anchor: 'top', front: true };

const layers = [
  {
    // rose silk, with big faint roses and lotuses drawn on it in fine line-art
    band: [-100, 1032],
    anchor: 'top',
    paint(ctx, w) {
      silk(ctx, w, -100, 1032, { ...ROSE, origin: 0 });
      ctx.strokeStyle = 'rgba(122, 40, 32, 0.14)';
      rose(ctx, 40, 150, 150, -0.4);
      rose(ctx, w - 30, 600, 170, 0.5);
      lotus(ctx, 60, 760, 120);
      lotus(ctx, w - 70, 110, 90);
    },
    look: (p) => ({ y: -smooth(0.37, 1, p) * 90 }),
  },
  // (no film grain: an 'overlay' blend over the moving scene made the GPU
  // redo the whole chapter every frame, and stalled it the first time it
  // came into view; the lokta paper printed on the painted layers gives the
  // texture)
  {
    // the gold arch, drawing in around the photo
    band: [60, 600],
    paint(ctx, w) {
      const x = w / 2 - PHOTO.width / 2;
      const top = PHOTO.top;
      const bottom = PHOTO.top + PHOTO.height;
      const arch = (inset) => {
        const L = x - inset;
        const R = x + PHOTO.width + inset;
        const r = (R - L) / 2;
        ctx.beginPath();
        ctx.moveTo(L, bottom + inset);
        ctx.lineTo(L, top + r - inset);
        ctx.arc((L + R) / 2, top + r - inset, r, Math.PI, 0);
        ctx.lineTo(R, bottom + inset);
        ctx.closePath();
      };
      ctx.strokeStyle = foil(ctx, x, top, x + PHOTO.width, bottom, 'gold');
      ctx.lineWidth = 1.6;
      arch(10);
      ctx.stroke();
      ctx.lineWidth = 0.7;
      arch(16);
      ctx.stroke();
    },
    look: (p) => ({ scale: 1.12 - smooth(0.2, 0.45, p) * 0.12, origin: [215, 330], opacity: smooth(0.2, 0.4, p) * (1 - smooth(T.wordsOut[0], T.wordsOut[1], p)) }),
  },
  {
    // petals drifting down
    band: [0, 932],
    live: (w, h) => {
      const colors = ['#D9604A', '#E8A0A0', '#F2B33D'];
      const make = (y) => ({ x: rand(0, w), y, size: Math.round(rand(8, 13)), color: colors[Math.floor(Math.random() * 3)], fall: rand(18, 32), spin: rand(-1, 1), phase: rand(0, 6) });
      const petals = Array.from({ length: 10 }, () => make(rand(0, h)));
      return {
        draw(ctx, t, dt) {
          for (const p of petals) {
            p.y += p.fall * dt;
            if (p.y > h + 20) Object.assign(p, make(-20));
            stamp(ctx, petal(p.color, p.size), p.x + Math.sin(t * 0.8 + p.phase) * 16, p.y, { angle: t * p.spin + p.phase, alpha: 0.75 });
          }
        },
      };
    },
  },
  GARLAND,
  {
    // the sun goes down: night comes down from the top of the sky, its
    // lower edge glowing like a sunset, until it covers everything
    // (chapter 4 begins in exactly this night colour)
    band: [-200, 1232],
    anchor: 'top',
    front: true,
    paint(ctx, w) {
      ctx.fillStyle = NIGHT_TOP;
      ctx.fillRect(-10, -300, w + 20, 1232);
      // the dusk edge: night → violet → a warm glow → clear
      const dusk = ctx.createLinearGradient(0, 932, 0, 1232);
      dusk.addColorStop(0, NIGHT_TOP);
      dusk.addColorStop(0.35, 'rgba(74, 34, 66, 0.92)');
      dusk.addColorStop(0.7, 'rgba(196, 100, 84, 0.45)');
      dusk.addColorStop(1, 'rgba(240, 160, 110, 0)');
      ctx.fillStyle = dusk;
      ctx.fillRect(-10, 932, w + 20, 300);
      const r = seeded(77);
      ctx.fillStyle = '#FFF2D8';
      for (let i = 0; i < 120; i++) {
        ctx.globalAlpha = 0.2 + r() * 0.7;
        const s = 0.6 + r() * 1.4;
        ctx.fillRect(r() * w, -200 + r() * 1100, s, s);
      }
      ctx.globalAlpha = 1;
      const moon = ctx.createRadialGradient(w * 0.24, 260, 0, w * 0.24, 260, 90);
      moon.addColorStop(0, 'rgba(255, 236, 200, 0.35)');
      moon.addColorStop(1, 'rgba(255, 236, 200, 0)');
      ctx.fillStyle = moon;
      ctx.fillRect(w * 0.24 - 90, 170, 180, 180);
      ctx.fillStyle = '#FFF0D2';
      crescent(ctx, w * 0.24, 260, 20);
    },
    look: (p) => {
      const fall = smooth(T.night[0], T.night[1], p);
      return { y: -(1 - fall) * 1260, opacity: fall > 0 ? 1 : 0 };
    },
  },
];

// `p` at the moment the chapter reaches the top of the screen: it has slid
// in by one screen (see StoryScene's pinning), out of COUPLE_HEIGHT.
const pinnedAt = (screen) => Math.min(screen, COUPLE_HEIGHT) / COUPLE_HEIGHT;

// The scene, for this screen height (the garland's timing depends on it)
// and the invite's look ('garden': a garland of roses, see garland.js).
const scenes = new Map();
const sceneFor = (screen, look) => {
  const key = `${screen}-${look}`;
  if (!scenes.has(key)) {
    const garland = { ...GARLAND, live: swingingGarland(NAIL, { hangAt: pinnedAt(screen), look }) };
    scenes.set(key, { editAt: 0.5, layers: layers.map((layer) => (layer === GARLAND ? garland : layer)) });
  }
  return scenes.get(key);
};

export default function CoupleSection({ props, onChange, isEditing, preview }) {
  const text = sectionText(props, onChange, isEditing);
  const screen = useContext(StageContext); // the viewer's screen height (page px)

  return (
    <StoryScene
      height={COUPLE_HEIGHT}
      scene={sceneFor(screen, props.look)}
      background={ROSE.base}
      start={ROSE.base}
      edge={NIGHT_TOP}
      pinned
      editing={isEditing}
      // the countdown is written on the night, above it (hidden while editing;
      // its date and line are set in the toolbar)
      over={!isEditing && <Countdown date={props.date} note={props.countdownNote} at={T.countdown} />}
    >
      <div className="absolute inset-x-0 top-1/2 h-[932px] -translate-y-1/2">
        {/* the photo, uncovered from the bottom up */}
        <Reveal
          wipe
          rise={30}
          at={T.photo}
          out={T.wordsOut}
          className="absolute left-1/2 -ml-[125px] overflow-hidden rounded-t-[125px] bg-[#E6C9B5] shadow-[0_30px_60px_-30px_rgba(74,26,28,0.6)]"
          style={{ top: PHOTO.top, width: PHOTO.width, height: PHOTO.height }}
        >
          {props.photo ? (
            <img src={props.photo} alt={props.photoAlt || 'The couple'} className="size-full object-cover" draggable={false} />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 px-8 text-center text-[#8E3B2A]/70">
              <span className="font-display text-[44px] italic">S &amp; A</span>
              {!preview && <span className="font-sans text-[12px]">Add your photo in the panel on the left</span>}
            </div>
          )}
        </Reveal>

        <div className="absolute inset-x-0 flex flex-col items-center px-10 text-center text-[#4A1A1C]" style={{ top: PHOTO.top + PHOTO.height + 36 }}>
          <Reveal at={[T.words, T.words + 0.06]} out={T.wordsOut}>
            {text('kicker', 'font-dev text-[17px] tracking-[0.2em] text-[#8E3B2A]', { singleLine: true })}
          </Reveal>
          <Reveal at={[T.words + 0.03, T.words + 0.09]} out={T.wordsOut} className="mt-2">
            {text('names', 'font-caps text-[38px] leading-none font-medium uppercase tracking-[0.06em] text-[#4A1019]', { singleLine: true })}
          </Reveal>
          <Reveal at={[T.words + 0.07, T.words + 0.13]} out={T.wordsOut} className="mt-5">
            {text('note', 'max-w-[300px] font-display text-[18px] leading-snug whitespace-pre-wrap text-[#5A2E2A] italic')}
          </Reveal>
        </div>
      </div>
    </StoryScene>
  );
}
