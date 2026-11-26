// Gift box — a present to unwrap:
//   tap once   → the ribbon comes undone and slips off; light shows under the lid
//   tap again  → the lid swings open, petals fly, and the present comes up
//   then the present is there to play with; tapping the box closes it
// What's inside is the sender's choice (presents.js). Words belong in a letter.
//
// The box is a render in layers (public/presents; how they're made:
// tools/presents): its back and inside, the present, its front, its lid. The
// silk is rendered white and tinted the sender's colour. At rest it's pictures;
// as it moves it's films, on two canvases (opening.js, film.js).

import { useEffect, useRef, useState } from 'react';
import Hint from '../shared/Hint';
import { PRESENTS } from './presents';
import { pictureOf } from './pictures';
import { AREA } from './area';
import { loadFilms } from './film';
import { createOpening } from './opening';
import { burst, preparePetals } from './burst';
import { holdOpen, whenQuiet } from '../../page/ready';
import { calm } from './pageLayer';

const STEPS = ['tap the ribbon', 'once more · खोल त!'];
const BOX_PICTURES = ['box-back', 'box-front', 'box-lid', 'box-shade', 'tied-shade', 'silk-tied', 'silk-fallen', 'floor'];
const PRESENT_AT = 430; // ms into the opening: the present starts up
const LAYER = 'pointer-events-none absolute inset-0 size-full max-w-none';
const FILM = { left: AREA.x, top: AREA.y, width: AREA.w, height: AREA.h };
// how sharp the canvases are: less on phones, which have little memory
const sharpness = () => (window.matchMedia?.('(pointer: coarse)').matches ? 1.5 : 2);
const FALLEN = { left: -60, top: 700 / 3, width: 420, height: 470 / 3 }; // where the fallen ribbon's picture goes

const Layer = ({ name, className = '' }) => <img src={pictureOf(name)} alt="" draggable={false} className={`${LAYER} ${className}`} />;

// Silk: the white render, multiplied by its colour, cut out along its edge.
function Silk({ name, color, style }) {
  const mask = `url(${pictureOf(name)})`;
  return (
    <span className={`${LAYER} isolate`} style={{ ...style, background: color, maskImage: mask, WebkitMaskImage: mask, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }}>
      <Layer name={name} className="mix-blend-multiply" />
    </span>
  );
}

// A longer name is written smaller, to fit the tag.
const tagSize = (tag) => Math.min(15, Math.max(10, 150 / tag.length));

export default function GiftBoxBlock({ props }) {
  const [step, setStep] = useState(0); // 0 tied, 1 untied, 2 open
  const [moving, setMoving] = useState(''); // '', 'untie', 'open' or 'close'
  const [out, setOut] = useState(''); // the present: '', 'rising', 'out' or 'sinking'
  const box = useRef(null);
  const mouth = useRef(null);
  const front = useRef(null);
  const rear = useRef(null);
  const opening = useRef(null);
  const ribbon = useRef(props.ribbon);
  const tag = props.tag ?? props.to?.replace(/,$/, ''); // (boxes from before had `to`)
  const { Component: Present, tap, up, rise, pictures } = PRESENTS[props.present] ?? PRESENTS.roses;

  useEffect(() => {
    ribbon.current = props.ribbon;
  }, [props.ribbon]);

  useEffect(() => {
    for (const canvas of [front.current, rear.current]) [canvas.width, canvas.height] = [AREA.w * sharpness(), AREA.h * sharpness()];
    opening.current = createOpening({ front: front.current, rear: rear.current, color: () => ribbon.current });
    return () => opening.current.free();
  }, []);

  // Everything it needs, fetched and made ready now: while the gift's loader
  // is up (page/Loader.jsx waits for these), so nothing stutters later.
  useEffect(() => {
    const ready = (name) => {
      const img = new Image();
      img.src = pictureOf(name);
      return img.decode();
    };
    holdOpen(loadFilms());
    holdOpen(whenQuiet().then(() => preparePetals(props.petals))); // (drawing: after the loader's bow)
    for (const name of [...BOX_PICTURES, ...pictures, 'petal-0', 'petal-1', 'petal-2']) holdOpen(ready(name));
  }, [pictures, props.petals]);

  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (ms, action) => timers.current.push(setTimeout(action, ms));

  const onTap = async () => {
    if (moving) return;
    const next = (step + 1) % 3;
    const action = ['close', 'untie', 'open'][next];
    setMoving('waiting');
    const ready = await loadFilms().then(
      () => true,
      () => false,
    );
    // no films (they couldn't be fetched), or less motion wanted: just change
    if (!ready || calm()) {
      opening.current.settle(next);
      setStep(next);
      setOut(next === 2 ? 'out' : '');
      setMoving('');
      return;
    }
    setMoving(action);
    if (action === 'open') {
      later(PRESENT_AT - 110, () => burst(mouth.current, props.petals));
      later(PRESENT_AT, () => setOut('rising'));
    }
    if (action === 'close') {
      setOut('sinking');
      later(340, () => setOut(''));
    }
    const played = await opening.current[action]();
    if (!played) return; // stopped halfway: it's gone from the page
    setStep(next);
    setMoving('');
  };

  // what's a picture just now, and what's in the films
  const tied = step === 0 && moving !== 'untie';
  const lidShut = moving !== 'open' && moving !== 'close' && step < 2;
  const fallen = moving === 'open' || (moving !== 'close' && moving !== 'untie' && step > 0);
  const open = step === 2 || moving === 'open';

  return (
    <div className="flex flex-col items-center">
      <div ref={box} className={`relative h-[374px] w-[300px] origin-bottom ${{ open: 'animate-heave', waiting: 'animate-wait' }[moving] ?? ''}`}>
        {/* the box's canvas: its foot is 21 px above the canvas's bottom */}
        <div className="absolute -bottom-[21px] left-0 h-[330px] w-[300px]">
          <img src={pictureOf('floor')} alt="" draggable={false} className="pointer-events-none absolute max-w-none" style={{ left: -60, top: 0, width: 420, height: 380 }} />
          <Layer name="box-back" />
          <canvas ref={rear} className="pointer-events-none absolute max-w-none" style={FILM} />
          <span ref={mouth} className="pointer-events-none absolute top-[130px] left-[40px] h-[30px] w-[220px]" />
        </div>

        {/* light out of the box */}
        <div
          className={`pointer-events-none absolute -top-[20px] left-1/2 h-[360px] w-[440px] origin-[50%_62%] -translate-x-1/2 bg-[radial-gradient(48%_50%_at_50%_62%,rgba(255,222,160,0.5),rgba(255,212,140,0.16)_52%,rgba(255,210,130,0)_76%)] ${open && moving !== 'close' ? 'animate-bloom' : 'opacity-0 transition-opacity duration-300'}`}
        />
        {out && (
          // (until it's out it's cut off at the box's foot: it's inside)
          <div className={`pointer-events-none absolute inset-0 z-10 ${out === 'out' ? '' : '[clip-path:inset(-400px_-400px_2px_-400px)]'}`}>
            <div
              style={{ bottom: up, '--rise': `${rise}px` }}
              onAnimationEnd={(e) => e.target === e.currentTarget && out === 'rising' && setOut('out')}
              className={`pointer-events-auto absolute inset-x-0 flex justify-center ${{ rising: 'animate-present', sinking: 'animate-sink' }[out] ?? ''}`}
            >
              <Present src={props.src} />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onTap}
          aria-label={['Untie the ribbon', 'Open the gift', 'Close the gift'][step]}
          className={`absolute inset-x-[34px] bottom-0 z-20 block ${open ? 'h-[128px]' : 'h-[264px]'}`}
        >
          {/* (pictures only: they reach over the present, and mustn't catch its touches) */}
          <span className="pointer-events-none absolute -bottom-[21px] -left-[34px] block h-[330px] w-[300px]">
            <Layer name="box-front" />
            {lidShut && <Layer name="box-shade" />}
            {/* untied: light shows under the lid */}
            {step === 1 && !moving && <span className="absolute top-[180px] left-[34px] h-[30px] w-[232px] animate-leak bg-[radial-gradient(52%_60%_at_50%_22%,rgba(255,218,140,0.95),rgba(255,200,110,0.4)_45%,rgba(255,200,110,0)_100%)]" />}

            {/* the tag: who it's for */}
            {tag && (
              <span className="pointer-events-none absolute top-[216px] left-[184px] block origin-top rotate-6">
                <svg width="30" height="46" viewBox="0 0 30 46" className="absolute -top-[26px] left-[-14px] overflow-visible" aria-hidden="true">
                  <path d="M0 0 C4 10 16 20 32 32" stroke="#D9B978" strokeWidth="1.2" fill="none" />
                </svg>
                <span style={{ fontSize: tagSize(tag) }} className="block max-w-[92px] truncate rounded-[3px] bg-sheet px-2.5 pt-3 pb-2 text-center font-hand leading-[15px] text-maroon shadow-[0_2px_5px_rgba(40,20,20,0.35)] before:absolute before:top-1 before:left-1/2 before:size-1.5 before:-translate-x-1/2 before:rounded-full before:bg-[#B98A3A]">
                  {tag}
                </span>
              </span>
            )}

            {lidShut && <Layer name="box-lid" className={step === 1 && !moving ? 'animate-peek' : ''} />}
            {tied && <Layer name="tied-shade" />}
            {tied && <Silk name="silk-tied" color={props.ribbon} />}
            {fallen && <Silk name="silk-fallen" color={props.ribbon} style={FALLEN} />}
            <canvas ref={front} className="pointer-events-none absolute max-w-none" style={FILM} />
          </span>
        </button>
      </div>
      <span className="mt-8">
        <Hint>{STEPS[step] ?? tap}</Hint>
      </span>
    </div>
  );
}
