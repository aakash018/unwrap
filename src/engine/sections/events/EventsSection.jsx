// Chapter 2 — the celebrations, on plain teal suede.
//
// Calm and simple, like the printed invitations it's modelled on: the pond
// at the end of chapter 1 simply becomes this page (the suede is the
// water's own colour, so there's no line between them). Down it, one
// ceremony after another, each with:
//   a round painted picture (EventPicture.jsx: a thali, mehendi things,
//   the mandap's fire, lanterns over the town) with fresh champa flowers
//   spilling over its edge, then its name in Devanagari and English, the
//   date in both calendars (Bikram Sambat and international), the place,
//   and "Add to calendar · See the venue" (calendar.js).
// Then the venue. The page ends in a torn, deckled lokta edge lying on
// chapter 3's rose silk (a strip of which is painted here, lined up with
// chapter 3's).
//
// It flows (no pinning, no camera). The pictures alternate their flowers
// left and right as you go down.
//
// The garden (Christian) invite uses the same chapter with props.look =
// 'garden': sage suede (the colour its reflecting pool ends on), its own
// pictures (chapel, rings, cake…, see pictures.js) and roses instead of
// champa. See LOOKS below.

import StoryScene, { Reveal } from '../StoryScene';
import { sectionText, listText } from '../shared/text';
import { sidesOf, suede, silk, WATER, GARDEN_WATER } from '../texture';
import { gardenBorder } from '../garden/garden';
import { seeded } from '../../themes/draw';
import { ROSE } from '../couple/CoupleSection';
import { addToCalendar, mapLink, hasTime } from './calendar';
import { picturesFor } from './pictures';
import EventPicture from './EventPicture';

// The two looks, each starting exactly where its chapter 1 ends:
//   hindu  – teal suede = the hiti's water, with the pond's darker sides
//   garden – sage suede, starting with the stone path chapter 1 ends on,
//            meeting a border of flowers (gardenBorder in garden/garden.js)
const LOOKS = {
  hindu: { suede: { base: WATER.flat, light: '#1C5C64', dark: '#062328' }, sides: ['3, 12, 26', 0.45] },
  garden: { suede: { base: GARDEN_WATER.flat, light: '#5C7468', dark: '#22302A' }, sides: ['16, 24, 22', 0.4], border: true },
};

const lookOf = (look) => LOOKS[look] ?? LOOKS.hindu;
const PICTURE = 280; // each picture's width (page px)

// Where things are (page px). The words can grow a little; these leave room.
const HEAD = 300; // the title, from the chapter's top
const EVENT = 590; // one ceremony: picture, words, space after
const VENUE = 300;
const END = 70;
export const eventsHeight = (props) => HEAD + props.events.length * EVENT + VENUE + END;

const IVORY = 'text-[#F5EBD8]';
const GOLD = 'text-[#E2BE6A]';
const SOFT = 'text-[#F5EBD8]/75';
const LINK = `inline-flex min-h-11 items-center px-2 font-display text-[16px] italic ${IVORY} underline decoration-[#E2BE6A]/60 underline-offset-[5px] transition-colors hover:decoration-[#E2BE6A]`;

// A small gold ornament: a diamond between two fine lines.
const Ornament = () => (
  <span className={`flex items-center justify-center gap-2.5 ${GOLD}`} aria-hidden>
    <span className="h-px w-14 bg-gradient-to-r from-transparent to-current" />
    <span className="size-[6px] rotate-45 border border-current" />
    <span className="h-px w-14 bg-gradient-to-l from-transparent to-current" />
  </span>
);

const DECKLE = 22; // how far above the chapter's bottom the torn edge runs

// The torn bottom edge of the page: a ragged line (page px) across the width.
function deckle(w, y) {
  const r = seeded(61);
  const points = [];
  let wander = 0;
  for (let x = -10; x <= w + 10; x += 3) {
    wander = wander * 0.8 + (r() - 0.5) * 2.2; // small fibrous jags…
    points.push([x, y + wander + Math.sin(x / 47) * 2.5 + Math.sin(x / 13 + 1) * 1.2]); // …on a gentle wave
  }
  return points;
}

// The suede page, its torn edge, and the rose silk showing below it.
const paintPage = (colors) => (ctx, w, h) => {
  suede(ctx, w, 0, h, colors);
  const edge = deckle(w, h - DECKLE);
  const below = () => {
    ctx.beginPath();
    edge.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineTo(w + 10, h + 10);
    ctx.lineTo(-10, h + 10);
    ctx.closePath();
  };
  ctx.save();
  below();
  ctx.clip();
  // chapter 3's rose silk, its damask lined up with chapter 3's (origin = its top)
  silk(ctx, w, h - DECKLE - 12, h + 10, { ...ROSE, origin: h });
  // the soft shadow the page casts on it
  ctx.shadowColor = 'rgba(40, 20, 20, 0.45)';
  ctx.shadowBlur = 8 * (ctx.__s || 1);
  ctx.shadowOffsetY = 3 * (ctx.__s || 1);
  ctx.strokeStyle = 'rgba(17, 69, 78, 1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  edge.forEach(([x, y], i) => (i ? ctx.lineTo(x, y - 1) : ctx.moveTo(x, y - 1)));
  ctx.stroke();
  ctx.restore();
  // the torn edge is thinner, so a little lighter, with stray fibres
  ctx.strokeStyle = 'rgba(150, 215, 210, 0.22)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  edge.forEach(([x, y], i) => (i ? ctx.lineTo(x, y - 1.5) : ctx.moveTo(x, y - 1.5)));
  ctx.stroke();
  const r = seeded(62);
  ctx.strokeStyle = 'rgba(60, 120, 125, 0.6)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < w / 9; i++) {
    const [x, y] = edge[Math.floor(r() * edge.length)];
    ctx.beginPath();
    ctx.moveTo(x, y - 1);
    ctx.quadraticCurveTo(x + (r() - 0.5) * 6, y + 2, x + (r() - 0.5) * 8, y + 2 + r() * 4);
    ctx.stroke();
  }
};

// The scene for one look (made once and kept).
const scenes = new Map();
const sceneFor = (look) => {
  if (scenes.has(look)) return scenes.get(look);
  const { suede: colors, sides, border } = lookOf(look);
  const scene = {
    layers: [
      // the suede page (printed on lokta paper like all the scenery)
      { paint: paintPage(colors), resolution: 0.8 },
      // the top is exactly how chapter 1's pool ends (its flat colour, its
      // darker sides, its grain), so the water simply becomes the page
      { fill: colors.base, mask: 'linear-gradient(180deg, black 0px, transparent 280px)', paper: 'left top' },
      // (the darker sides stop before the torn edge, so the rose below stays clear)
      { fill: sidesOf(...sides), mask: 'linear-gradient(180deg, black calc(100% - 320px), transparent calc(100% - 60px))' },
      // (no film grain: an 'overlay' blend over the moving scene made the
      // GPU redo the whole chapter every frame, and stalled it the first
      // time it came into view; the lokta paper printed on the painted
      // layers gives the texture)
      // the garden: the path's stone, then a border of flowers, at the top
      ...(border ? [{ band: [0, 110], paint: gardenBorder }] : []),
    ],
  };
  scenes.set(look, scene);
  return scene;
};

export default function EventsSection({ props, onChange, isEditing, preview }) {
  const text = sectionText(props, onChange, isEditing);
  const item = listText(props, onChange, isEditing, 'events');
  const height = eventsHeight(props);
  const pictures = picturesFor(props.events, props.look); // picked in the toolbar, or guessed
  // links don't leave the editor
  const stay = (e) => !preview && e.preventDefault();

  return (
    <StoryScene height={height} scene={sceneFor(props.look)} background={lookOf(props.look).suede.base} editing={isEditing} paintKey={`${height}`}>
      <div className="absolute inset-x-0 top-0 flex flex-col items-center text-center" style={{ paddingTop: HEAD - 150 }}>
        {/* the title */}
        <Reveal self rise={16} className="flex h-[150px] flex-col items-center">
          {text('kicker', `font-dev text-[17px] tracking-[0.16em] ${GOLD}`, { singleLine: true })}
          {text('title', `mt-2 font-caps text-[34px] leading-none font-normal uppercase tracking-[0.1em] ${IVORY}`, { singleLine: true })}
          <div className="mt-6">
            <Ornament />
          </div>
        </Reveal>

        {/* the ceremonies */}
        {props.events.map((event, i) => (
          <div key={i} className="flex flex-col items-center" style={{ height: EVENT }}>
            <Reveal self rise={30} grow={0.04}>
              <EventPicture kind={pictures[i]} size={PICTURE} side={i % 2 ? 'right' : 'left'} look={props.look} />
            </Reveal>
            <Reveal self rise={18} className="mt-10 flex flex-col items-center">
              {item(i, 'dev', `font-dev text-[16px] ${GOLD}`)}
              {item(i, 'name', `mt-0.5 font-caps text-[30px] leading-tight font-normal uppercase tracking-[0.1em] ${IVORY}`)}
              {item(i, 'bs', `mt-2.5 font-dev text-[17px] ${IVORY}`)}
              {item(i, 'when', `mt-0.5 font-sans text-[11.5px] font-medium tracking-[0.2em] ${GOLD}`)}
              {item(i, 'where', `mt-2 font-display text-[18px] italic ${SOFT}`)}
              <div data-no-drag className="mt-1 flex items-center">
                {hasTime(event) && (
                  <>
                    <button type="button" onClick={() => preview && addToCalendar(event)} className={LINK}>
                      Add to calendar
                    </button>
                    <span className={`${GOLD} opacity-60`} aria-hidden>
                      ·
                    </span>
                  </>
                )}
                <a href={mapLink(event.where)} target="_blank" rel="noreferrer" onClick={stay} className={LINK}>
                  See the venue
                </a>
              </div>
            </Reveal>
          </div>
        ))}

        {/* the venue */}
        <Reveal self rise={18} className="flex flex-col items-center" style={{ height: VENUE }}>
          <Ornament />
          <div className={`mt-8 font-dev text-[16px] tracking-[0.16em] ${GOLD}`}>स्थान</div>
          {text('venue', `mt-1 font-caps text-[26px] leading-tight font-normal uppercase tracking-[0.08em] ${IVORY}`, { singleLine: true })}
          {text('address', `mt-2 max-w-[280px] font-display text-[18px] leading-snug whitespace-pre-wrap italic ${SOFT}`)}
          <a
            href={mapLink(props.mapQuery || props.venue)}
            target="_blank"
            rel="noreferrer"
            data-no-drag
            onClick={stay}
            className="mt-7 inline-flex min-h-11 items-center rounded-full border border-[#E2BE6A]/70 px-7 font-sans text-[11px] font-medium tracking-[0.22em] text-[#F5EBD8] uppercase transition-colors duration-300 hover:bg-[#E2BE6A] hover:text-[#11454E]"
          >
            Open in Google Maps
          </a>
        </Reveal>
      </div>
    </StoryScene>
  );
}
