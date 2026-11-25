// Gift box — a present to unwrap:
//   tap once   → the ribbon comes undone
//   tap again  → the lid lifts, petals fly, and the present comes up
//   then the present is there to play with; tapping the box closes it
// What's inside is the sender's choice (presents.js). Words belong in a letter.
//
// The box is a render in layers (public/presents; how they're made:
// tools/presents): its back and inside, the present, its front, its lid. The
// silk is rendered white and tinted the sender's colour.

import { useEffect, useState } from 'react';
import Hint from '../shared/Hint';
import { PETALS } from './petals';
import { PRESENTS } from './presents';
import { pictureOf } from './pictures';

// Where each petal flies to (x, y, spin).
const FLIGHTS = [
  [-170, -230, 260], [160, -250, -200], [-220, -80, 180], [220, -110, -240], [-90, -300, 300], [90, -310, -320], [-250, -190, 140],
  [250, -200, -160], [20, -340, 220], [-30, -260, -260], [-140, -320, 200], [150, -340, -180], [-200, -280, 240], [205, -270, -220],
];

const STEPS = ['tap the ribbon', 'once more · खोल त!'];
const LAYER = 'pointer-events-none absolute inset-0 size-full max-w-none';

const Layer = ({ name, className = '' }) => <img src={pictureOf(name)} alt="" draggable={false} className={`${LAYER} ${className}`} />;

// Silk: the white render, multiplied by its colour.
function Silk({ name, color, className = '' }) {
  const mask = `url(${pictureOf(name)})`;
  return (
    <span className={`${LAYER} isolate ${className}`}>
      <span className={LAYER} style={{ background: color, maskImage: mask, WebkitMaskImage: mask, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }} />
      <Layer name={name} className="mix-blend-multiply" />
    </span>
  );
}

// A longer name is written smaller, to fit the tag.
const tagSize = (tag) => Math.min(15, Math.max(10, 150 / tag.length));

export default function GiftBoxBlock({ props }) {
  const [step, setStep] = useState(0); // 0 tied, 1 untied, 2 open
  const petals = PETALS[props.petals] ?? PETALS.marigold;
  const tag = props.tag ?? props.to?.replace(/,$/, ''); // (boxes from before had `to`)
  const { Component: Present, tap, up, pictures } = PRESENTS[props.present] ?? PRESENTS.roses;

  // load what's inside while it's being unwrapped
  useEffect(() => {
    for (const name of [...pictures, 'petal-0', 'petal-1', 'petal-2']) new Image().src = pictureOf(name);
  }, [pictures]);

  return (
    <div className="flex flex-col items-center gap-2 pb-4">
      <div className="relative h-[374px] w-[300px]">
        {/* the box's canvas: its foot is 21 px above the canvas's bottom */}
        <div className="absolute -bottom-[21px] left-0 h-[330px] w-[300px]">
          <Layer name="box-back" />
        </div>

        {step === 2 && (
          <>
            {/* light out of the box */}
            <div className="pointer-events-none absolute -top-[20px] left-1/2 h-[360px] w-[440px] -translate-x-1/2 animate-fade bg-[radial-gradient(48%_50%_at_50%_62%,rgba(255,222,160,0.45),rgba(255,212,140,0.14)_52%,rgba(255,210,130,0)_76%)]" />
            <div style={{ bottom: up }} className="absolute inset-x-0 z-10 flex animate-present justify-center">
              <Present src={props.src} />
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setStep((step + 1) % 3)}
          aria-label={['Untie the ribbon', 'Open the gift', 'Close the gift'][step]}
          className={`absolute inset-x-[34px] bottom-0 z-20 block ${step === 2 ? 'h-[128px]' : 'h-[264px]'}`}
        >
          {/* (pictures only: they reach over the present, and mustn't catch its touches) */}
          <span className="pointer-events-none absolute -bottom-[21px] -left-[34px] block h-[330px] w-[300px]">
            <Layer name="box-front" />
            {step < 2 && <Layer name="box-shade" />}
            <Silk name="silk-band" color={props.ribbon} className={step > 0 ? 'animate-band' : ''} />
            <span className={`${LAYER} ${step === 2 ? 'animate-lid' : ''}`}>
              <Layer name="box-lid" />
              <span className={`${LAYER} ${step > 0 ? 'animate-untie' : ''} origin-[50%_34%]`}>
                <Layer name="lid-shade" />
                <Silk name="silk-bow" color={props.ribbon} />
              </span>
            </span>

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
          </span>
        </button>

        {step === 2 &&
          FLIGHTS.map(([dx, dy, rot], i) => (
            <span
              key={i}
              className={`pointer-events-none absolute top-[60%] left-1/2 z-30 animate-burst bg-contain bg-no-repeat ${petals.picture ? 'size-5' : 'h-[11px] w-4 rounded-[70%_30%_70%_30%]'}`}
              style={{
                '--dx': `${dx}px`,
                '--dy': `${dy}px`,
                '--rot': `${rot}deg`,
                ...(petals.picture ? { backgroundImage: `url(${pictureOf(`petal-${i % 3}`)})` } : { backgroundColor: petals.colors[i % petals.colors.length] }),
              }}
            />
          ))}
      </div>
      <Hint>{STEPS[step] ?? tap}</Hint>
    </div>
  );
}
