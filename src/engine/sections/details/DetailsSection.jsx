// Chapter 4 — things to know, and the ending.
//
// Night has fallen (it started falling at the end of chapter 3). The
// practical bits rise in one by one, then the RSVP and the families'
// sign-off — and the story ends where it began: a lantern sky over the
// old town and the pagoda, its lamps lit. Tap the sky to send a lantern up,
// or write a blessing and send it up on a lantern (BlessingForm.jsx).
//
// In the garden (Christian) invite (props.look = 'garden') the finale is
// the big old tree from chapter 1, now at night, strung with lights, with
// fireflies in the grass and the lanterns rising out of its crown
// (garden/night.js), instead of the old town and the pagoda.

import StoryScene, { Reveal } from '../StoryScene';
import { sectionText, listText } from '../shared/text';
import { NIGHT_TOP } from '../couple/CoupleSection';
import { paintedSky, sidesOf } from '../texture';
import { lanternField } from '../lanterns';
import { listenForBlessings } from '../blessings';
import BlessingForm from './BlessingForm';
import { safeLink } from '../../utils/safeLink';
import { pagoda, town } from '../temple';
import { treeAtNight, nightLights, TREE_TOP } from '../garden/night';

const TOP = 240; // first item
const ITEM = 112;
const ENDING = 1200; // RSVP, sign-off, blessings, and the lantern finale below them

export const detailsHeight = (props) => TOP + props.items.length * ITEM + ENDING;

const FINALE = 760; // how tall the lantern finale at the bottom is

// The scene depends on the chapter's height (the finale sits at the bottom).
// The bottom of the finale: the old town and the pagoda, lamps lit…
function oldTown(ctx, w, h) {
  town(ctx, w, h - 60, h, { seed: 6, color: '#1C1230', lit: 0.4 });
  ctx.save();
  ctx.translate(w / 2, h - 470);
  ctx.scale(0.42, 0.42);
  pagoda(ctx, 0, 0);
  ctx.restore();
  town(ctx, w, h - 10, h, { seed: 12, color: '#120B1E', lit: 0.5 });
}

const makeScene = (height, look) => {
  const base = height - FINALE; // top of the finale
  return {
    layers: [
      {
        // the night sky, warming towards the horizon at the very bottom
        paint(ctx, w, h) {
          paintedSky(ctx, w, 0, h, {
            stops: [
              [0, NIGHT_TOP],
              [0.45, '#1A1640'],
              [0.75, '#1E2E6A'],
              [0.9, '#5A3F78'],
              [1, '#C26E5E'],
            ],
            strokes: ['50, 30, 80', '40, 50, 120', '70, 90, 170', '150, 100, 160', '230, 140, 110'],
            count: Math.round(h * 1.4),
            stars: 160,
            seed: 41,
          });
        },
        depth: 0.3,
      },
      {
        // lanterns rising over the town — tap the sky to send one up
        band: [base - 300, height],
        live: (w) => {
          const field = lanternField({ count: 34, size: [6, 30], rate: 0, rise: 16, seed: 51, tappable: true, clearAbove: [330, 440] })(w, FINALE + 300); // they fade out before they reach the words
          // a blessing from the form rises out from behind the rooftops,
          // beside the temple (the lantern sky is painted behind them)
          listenForBlessings((blessing) => {
            const side = Math.random() < 0.5 ? -1 : 1;
            field.send(w / 2 + side * (85 + Math.random() * 25), 640, blessing);
          });
          return {
            tap: (x, y) => field.tap(x, y - (base - 300)),
            draw(ctx, t, dt, p) {
              ctx.save();
              ctx.translate(0, base - 300);
              field.draw(ctx, t, dt, p);
              ctx.restore();
            },
          };
        },
      },
      ...(look === 'garden'
        ? [
            {
              // the big old tree at night, strung with fairy lights (garden/night.js)…
              band: [height - TREE_TOP - 60, height],
              paint: treeAtNight,
            },
            {
              // …some of them twinkling, Edison bulbs in its crown, fireflies
              band: [height - TREE_TOP - 60, height],
              live: nightLights(),
            },
          ]
        : [
            {
              // the old town and the pagoda, at the bottom
              band: [base + 200, height],
              paint: oldTown,
            },
          ]),
      { fill: sidesOf('6, 4, 20', 0.45) },
      // (no film grain: an 'overlay' blend over the moving lanterns made the
      // GPU redo the whole chapter every frame; the paper gives the texture)
      // the top starts in the plain night chapter 3 ended on: no line
      { fill: NIGHT_TOP, mask: 'linear-gradient(180deg, black 0px, transparent 360px)', paper: 'left top' },
    ],
  };
};

const scenes = new Map();
const sceneFor = (height, look) => {
  const key = `${height}-${look}`;
  if (!scenes.has(key)) scenes.set(key, makeScene(height, look));
  return scenes.get(key);
};

export default function DetailsSection({ props, onChange, isEditing, preview }) {
  const text = sectionText(props, onChange, isEditing);
  const item = listText(props, onChange, isEditing, 'items');
  const height = detailsHeight(props);

  return (
    <StoryScene height={height} scene={sceneFor(height, props.look)} background={NIGHT_TOP} editing={isEditing} paintKey={String(height)}>
      <Reveal self className="px-8 pt-[110px] text-center">
        {text('kicker', 'font-dev text-[17px] tracking-[0.2em] text-[#E8C27A]', { singleLine: true })}
        {text('title', 'mt-3 font-caps text-foil text-[40px] leading-none font-medium uppercase tracking-[0.06em]', { singleLine: true })}
      </Reveal>

      <div className="absolute inset-x-0 px-12" style={{ top: TOP }}>
        {props.items.map((_, i) => (
          <Reveal key={i} self rise={30} className="flex flex-col items-center text-center text-[#F7E9D2]" style={{ height: ITEM }}>
            {item(i, 'title', 'font-caps text-[15px] font-semibold uppercase tracking-[0.24em] text-[#E8C27A]')}
            {item(i, 'text', 'mt-2 max-w-[300px] font-display text-[17px] leading-snug whitespace-pre-wrap text-[#F7E9D2]/80 italic', { singleLine: false })}
          </Reveal>
        ))}
      </div>

      <Reveal self className="absolute inset-x-0 flex flex-col items-center px-10 text-center text-[#F7E9D2]" style={{ top: TOP + props.items.length * ITEM + 20 }}>
        <a
          href={safeLink(props.rsvpLink)}
          target="_blank"
          rel="noreferrer"
          data-no-drag
          onClick={(e) => (!preview || !safeLink(props.rsvpLink)) && e.preventDefault()}
          className="inline-flex min-h-12 items-center rounded-full bg-gradient-to-b from-[#F3D79C] to-[#C99A4B] px-9 font-sans text-[11.5px] font-semibold tracking-[0.24em] text-[#2A0A10] uppercase shadow-[0_14px_34px_-12px_rgba(232,181,74,0.7)] transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
        >
          {text('rsvpLabel', '', { as: 'span', singleLine: true })}
        </a>
        {text('signoff', 'mt-14 max-w-[300px] font-display text-[22px] leading-snug whitespace-pre-wrap italic')}
        {text('thanks', 'mt-4 font-dev text-foil text-[34px]', { singleLine: true })}
        <BlessingForm />
      </Reveal>
    </StoryScene>
  );
}
