// The countdown under the moon — the end of chapter 3.
//
// Night has fallen over the couple's photo; in the dark, big gold numbers
// say how many days are left until the wedding, in English and in Nepali
// numerals. It counts down by itself every day:
//   before the day  → "11 · days to go · ११ दिन बाँकी"
//   the day before  → "1 · day to go · भोलि!"
//   on the day      → "आज · today is the day"
//   after the day   → "शुभ विवाह · just married"
//
//   date – the wedding day, 'YYYY-MM-DD' (set in the toolbar)
//   note – a line under it (set in the toolbar)
//   at   – [from, to] values of the chapter's `p` while it appears

import { Reveal } from '../StoryScene';

const NEPALI_DIGITS = '०१२३४५६७८९';
const inNepali = (n) => String(n).replace(/\d/g, (d) => NEPALI_DIGITS[d]);

// Whole days from today until `iso` (0 = today, negative = it's passed).
export function daysUntil(iso) {
  const [y, m, d] = (iso || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(y, m - 1, d) - today) / 86400000);
}

export default function Countdown({ date, note, at }) {
  const days = daysUntil(date);
  if (days === null) return null;

  let big = String(days);
  let caption = days === 1 ? 'day to go' : 'days to go';
  let nepali = days === 1 ? 'भोलि!' : `${inNepali(days)} दिन बाँकी`;
  if (days === 0) [big, caption, nepali] = ['आज', 'today is the day', 'शुभ दिन'];
  if (days < 0) [big, caption, nepali] = ['शुभ विवाह', 'just married', 'धन्यवाद'];
  const bigFont = days <= 0 ? 'font-dev text-[64px]' : 'font-caps text-[150px] font-medium';
  const step = (k) => [at[0] + k * 0.02, at[1] + k * 0.02];

  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-[40%] flex-col items-center px-10 text-center text-[#F7E9D2]">
      <Reveal at={step(0)} rise={40} className="[filter:drop-shadow(0_6px_30px_rgba(6,4,20,0.9))]">
        <div className={`text-foil leading-[0.9] ${bigFont}`}>{big}</div>
      </Reveal>
      <Reveal at={step(1)} className="mt-3 font-sans text-[12px] font-medium tracking-[0.42em] text-[#F7E9D2] uppercase">
        {caption}
      </Reveal>
      <Reveal at={step(2)} rise={0} className="my-5 flex items-center gap-3 text-[#E8C27A]">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-current" />
        <span className="size-[6px] rotate-45 border border-current" />
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-current" />
      </Reveal>
      <Reveal at={step(3)} className="font-dev text-[22px] text-[#E8C27A]">
        {nepali}
      </Reveal>
      {note && (
        <Reveal at={step(4)} className="mt-3 max-w-[290px] font-display text-[18px] leading-snug text-[#F7E9D2]/80 italic">
          {note}
        </Reveal>
      )}
    </div>
  );
}
