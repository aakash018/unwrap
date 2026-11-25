// Letter — an envelope with a wax seal. Tap: the seal breaks, the letter slides
// up, and opens to be read (however long it is). Tap again to read it again.

import { useCallback, useEffect, useRef, useState } from 'react';
import Hint from '../shared/Hint';
import Reader from '../shared/Reader';

const SLIDE_MS = 650; // the letter slides up before it opens

export default function LetterBlock({ props }) {
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onTap = () => {
    clearTimeout(timer.current);
    if (open) return setReading(true);
    setOpen(true);
    timer.current = setTimeout(() => setReading(true), SLIDE_MS);
  };
  const onClose = useCallback(() => setReading(false), []);

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <button type="button" onClick={onTap} aria-label={open ? 'Read the letter again' : 'Open the letter'} className="relative block h-[250px] w-[270px]">
        {/* the flap, folded back once it's open */}
        {open && (
          <div className="absolute top-[14px] left-0 h-[78px] w-[270px] brightness-90 [clip-path:polygon(50%_0,100%_100%,0_100%)]" style={{ background: props.envelopeColor }} />
        )}
        {/* the letter, its first words showing */}
        {open && (
          <div className="absolute top-0 left-6 h-[190px] w-[222px] animate-rise overflow-hidden rounded-[2px] bg-sheet p-4 text-left shadow-paper">
            <p className="font-hand text-base leading-snug whitespace-pre-wrap text-cocoa">{props.message}</p>
          </div>
        )}
        {/* the envelope: its body, the side folds, and the flap (lined in dhaka) */}
        <div className="absolute bottom-0 left-0 h-[160px] w-[270px] overflow-hidden rounded-[4px] shadow-paper" style={{ background: props.envelopeColor }}>
          <div className="absolute inset-0 bg-[linear-gradient(155deg,rgba(255,255,255,0.28),rgba(255,255,255,0)_45%,rgba(70,20,10,0.16))]" />
          <div className="absolute inset-0 bg-black/6 [clip-path:polygon(0_0,52%_58%,0_100%)]" />
          <div className="absolute inset-0 bg-black/6 [clip-path:polygon(100%_0,48%_58%,100%_100%)]" />
          <div className="absolute inset-0 bg-white/12 [clip-path:polygon(0_100%,50%_46%,100%_100%)]" />
          {open ? (
            <div className="absolute inset-x-0 top-0 h-[10px] bg-dhaka opacity-80" />
          ) : (
            <div className="absolute inset-x-0 top-0 h-[64%] drop-shadow-[0_2px_3px_rgba(60,20,10,0.35)]">
              <div className="size-full bg-dhaka [clip-path:polygon(0_0,100%_0,50%_100%)]" />
              <div className="absolute inset-0 [clip-path:polygon(0_0,100%_0,50%_95%)]" style={{ background: props.envelopeColor }}>
                <div className="size-full bg-[linear-gradient(180deg,rgba(255,255,255,0.25),rgba(80,20,10,0.1))]" />
              </div>
            </div>
          )}
          {!open && (
            <svg viewBox="-30 -30 60 60" className="absolute top-[66px] left-1/2 size-[58px] -translate-x-1/2 drop-shadow-[0_2px_3px_rgba(50,10,10,0.45)]" aria-hidden="true">
              {/* the wax, pressed unevenly, with a heart in it */}
              <path d="M0 -24 C9 -27 20 -20 23 -10 C28 -2 25 11 18 18 C10 26 -4 27 -14 22 C-24 17 -27 4 -24 -7 C-21 -18 -10 -22 0 -24 Z" fill={props.sealColor} />
              <circle r="17" fill="rgba(0,0,0,0.12)" />
              <circle r="16" fill={props.sealColor} />
              <path d="M0 9 C-10 2 -9 -7 -4 -7 C-2 -7 0 -5 0 -3 C0 -5 2 -7 4 -7 C9 -7 10 2 0 9 Z" fill="rgba(0,0,0,0.22)" transform="translate(0.6 0.8)" />
              <path d="M0 9 C-10 2 -9 -7 -4 -7 C-2 -7 0 -5 0 -3 C0 -5 2 -7 4 -7 C9 -7 10 2 0 9 Z" fill="rgba(255,255,255,0.22)" />
              <path d="M-18 -9 C-15 -17 -6 -20 1 -20" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </button>
      <Hint>{open ? 'tap to read it again' : 'tap to break the seal'}</Hint>

      {reading && (
        <Reader label="The letter" onClose={onClose}>
          <p className="font-hand text-[19px] leading-[1.6] whitespace-pre-wrap">{props.message}</p>
        </Reader>
      )}
    </div>
  );
}
