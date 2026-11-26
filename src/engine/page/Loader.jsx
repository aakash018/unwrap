// What people see while a gift gets ready: a fine gold bow draws itself, with
// a few words and the name of who it's for; a gold hairline fills as things
// load. When everything is ready (ready.js), the bow comes undone, the words
// drift up and the gift shows through.
//
//   <Loader theme name words>{the gift}</Loader>
//
// It's plain markup and CSS (index.css: .gift-loader), so it's on the screen
// before any code has loaded. The gift itself is only built once the bow has
// been drawn (DRAWN): building it while the bow draws made the drawing
// stutter (its code still downloads from the start: Open.tsx). It always stays at least SHORTEST (founder,
// 26 Nov 2026: "at least 4 s no matter what"), then for as long as the gift
// is still loading. Something that fails counts as done (ready.js); only
// something that never finishes at all (a stuck connection) hits CAP, and
// then the gift shows anyway and goes on loading by itself.
'use client';

import { useEffect, useState } from 'react';
import { watchReady, holdOpen, keepQuiet, whenQuiet } from './ready';

const SHORTEST = 4000; // ms after the link was opened: always at least this
const CAP = 20000; // ms after the link was opened: only for something stuck
const LEAVING = 1300; // ms: the bow coming undone
// ms after the link was opened: the bow drawn and the words in (index.css). The
// heavy painting behind waits until then, or the drawing stutters (ready.js).
const DRAWN = 2650;

// The words above the name, unless the sender wrote their own.
export const OPENING_WORDS = 'मायाको कोसेली, हजुरको लागि';
export const WORDS_SUGGESTED = ['मायाको कोसेली, हजुरको लागि', 'तिम्रो लागि', 'हजुरको लागि', 'मायाले', 'टाढाबाट, मायासहित'];

// Each theme's deep colour, behind the bow.
const SHADES = {
  love: ['#12070f', '#34173a'],
  birthday: ['#150b20', '#41295f'],
  anniversary: ['#04161a', '#164149'],
  marigold: ['#170506', '#4a1019'],
  plain: ['#141110', '#3a322b'],
};

export default function Loader({ theme, name, words, children }) {
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState('loading'); // 'loading', 'leaving' or 'gone'
  // (said while drawing, before the gift's own code starts its work)
  useState(() => keepQuiet(DRAWN));
  const [built, setBuilt] = useState(false); // the gift, behind
  useEffect(() => {
    let gone = false;
    whenQuiet().then(() => !gone && setBuilt(true));
    return () => {
      gone = true;
    };
  }, []);

  useEffect(() => {
    let ready = false;
    holdOpen(document.fonts?.ready);
    const stop = watchReady(({ mounted, total, done }) => {
      setProgress(mounted && total ? done / total : 0.05);
      ready = mounted && done === total;
    });
    // look every so often, rather than at each change: it has to be at least SHORTEST too
    const timer = setInterval(() => {
      const waited = performance.now(); // (since the link was opened, not since this code arrived)
      if ((ready && waited > SHORTEST) || waited > CAP) {
        clearInterval(timer);
        setProgress(1);
        setState('leaving');
      }
    }, 100);
    return () => {
      stop();
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (state !== 'leaving') return undefined;
    const timer = setTimeout(() => setState('gone'), LEAVING);
    return () => clearTimeout(timer);
  }, [state]);

  const named = Boolean(name?.trim());
  const line = words ?? (named ? OPENING_WORDS : 'तिम्रो लागि');
  const [deep, mid] = SHADES[theme] ?? SHADES.plain;
  // long names are written smaller, to stay on one line
  const size = named ? Math.min(66, Math.round(560 / Math.max(4, name.trim().length + 2))) : 54;

  return (
    <>
      {built && children}
      {state !== 'gone' && (
        <div className={`gift-loader ${state === 'leaving' ? 'is-leaving' : ''}`} style={{ '--deep': deep, '--mid': mid, '--p': progress }} role="status" aria-label="Opening your gift">
          <svg className="gift-loader-bow" viewBox="-100 -60 200 150" aria-hidden="true">
            <defs>
              <linearGradient id="gift-loader-foil" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#a87b34" />
                <stop offset=".35" stopColor="#f3d79c" />
                <stop offset=".6" stopColor="#c99a4b" />
                <stop offset="1" stopColor="#e9c47e" />
              </linearGradient>
            </defs>
            <path className="draw d1" pathLength="1" d="M0 0 C-14 -22 -56 -46 -80 -30 C-98 -17 -84 10 -52 9 C-30 8 -11 4 0 0" />
            <path className="draw d2" pathLength="1" d="M0 0 C14 -22 56 -46 80 -30 C98 -17 84 10 52 9 C30 8 11 4 0 0" />
            <path className="draw d3 fold" pathLength="1" d="M-6 -3 C-24 -17 -52 -29 -68 -20" />
            <path className="draw d4 fold" pathLength="1" d="M6 -3 C24 -17 52 -29 68 -20" />
            <path className="draw d5" pathLength="1" d="M-3 4 C-10 24 -20 46 -40 74 C-44 79 -47 82 -50 84" />
            <path className="draw d5" pathLength="1" d="M3 4 C10 26 19 49 35 77 C38 82 41 86 45 89" />
            <ellipse className="draw d5" pathLength="1" cx="0" cy="1" rx="6.5" ry="8" />
            <path className="glint" pathLength="1" d="M0 0 C-14 -22 -56 -46 -80 -30 C-98 -17 -84 10 -52 9 C-30 8 -11 4 0 0 C11 4 30 8 52 9 C84 10 98 -17 80 -30 C56 -46 14 -22 0 0" />
          </svg>
          <div className="gift-loader-words">
            {line && <div className="gift-loader-line">{line}</div>}
            {named ? (
              <div className="gift-loader-name" style={{ fontSize: size }}>{name.trim()}</div>
            ) : (
              <div className="gift-loader-name is-koseli">कोसेली</div>
            )}
            <div className="gift-loader-progress"><i /></div>
          </div>
          {named && (
            <div className="gift-loader-mark">
              <span className="logo">unwrap</span>
              <span>कोसेली</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
