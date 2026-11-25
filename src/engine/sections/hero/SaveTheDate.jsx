// The invitation and the date — written on the pond at the end of
// chapter 1 (see pond.js). The lines rise in one after another, starting
// at `from` (a value of the chapter's `p`), and stay: the chapter ends on
// them (an optional `out` = [from, to] would fade them out).
//
// It sits exactly in the middle of the screen, inside the gold arch
// (GoldArch.jsx). While you edit the chapter every line is shown at once,
// so this block sits a little lower then, under the names.
//
// tone 'dark' writes it in dark ink and deep gold, for a light ground (the
// garden invite's stone path); while editing it's always light, as the
// words then sit over the sky.

import { useContext } from 'react';
import { Reveal, StageContext } from '../StoryScene';

const STEP = 0.02; // how much later each line starts than the one before
const FADE = 0.04; // how long each line takes to appear

const TONES = {
  light: { box: 'text-[#F7ECD6] [text-shadow:0_2px_18px_rgba(0,20,24,0.6)]', soft: 'text-[#F7ECD6]/85', main: 'text-[#F7ECD6]', gold: 'text-[#E8C27A]', foil: 'text-foil', lift: '[filter:drop-shadow(0_3px_14px_rgba(0,20,24,0.7))]' },
  dark: { box: 'text-[#3E342E]', soft: 'text-[#4A3D36]/85', main: 'text-[#3E342E]', gold: 'text-[#9A7230]', foil: 'text-foil-deep', lift: '' },
};

export default function SaveTheDate({ text, isEditing, from, out, tone = 'light' }) {
  const c = TONES[isEditing ? 'light' : tone];
  const at = (line) => [from + line * STEP, from + line * STEP + FADE];
  const place = isEditing ? 'top-[47%]' : 'top-1/2 -translate-y-1/2'; // exactly in the middle of the screen
  // on short screens (a laptop window) the words get a little smaller, so
  // they always fit inside the gold arch
  const screen = useContext(StageContext);
  const fit = isEditing ? 1 : Math.min(1, screen / 880);

  return (
    <div className={`absolute inset-x-0 flex flex-col items-center px-[70px] text-center ${c.box} ${place}`} style={{ scale: fit }}>
      <Reveal at={at(0)} out={out}>
        {text('invite', `font-display text-[19px] leading-snug whitespace-pre-wrap italic ${c.soft}`)}
      </Reveal>
      <Reveal at={at(1)} out={out} className={`mt-7 [text-shadow:none] ${c.lift}`}>
        {text('title', `font-caps ${c.foil} text-[46px] leading-[0.95] font-medium uppercase tracking-[0.06em]`, { singleLine: false })}
      </Reveal>
      <Reveal at={at(2)} out={out} rise={0} className={`my-6 flex items-center gap-3 ${c.gold}`}>
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-current" />
        <span className="size-[6px] rotate-45 border border-current" />
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-current" />
      </Reveal>
      <Reveal at={at(3)} out={out}>
        {text('bs', `font-dev text-[36px] leading-tight ${c.main}`, { singleLine: true })}
      </Reveal>
      <Reveal at={at(4)} out={out}>
        {text('ad', `mt-2 font-sans text-[11.5px] font-medium tracking-[0.3em] ${c.gold}`, { singleLine: true })}
      </Reveal>
      <Reveal at={at(5)} out={out} className="mt-8">
        {text('note', `max-w-[240px] font-display text-[18px] leading-snug whitespace-pre-wrap italic ${c.soft}`)}
      </Reveal>
    </div>
  );
}
