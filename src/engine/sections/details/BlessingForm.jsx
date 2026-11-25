// "Light a lantern" — guests send the couple a blessing (आशीर्वाद).
//
// A quiet gold link at the end of the invite. Tap it and two fields open:
// your blessing and your name. Send, and a lantern carrying your words
// rises into the night sky over the town (see blessings.js, lanterns.js).
//
// For now the blessing only lives on the guest's own screen; saving it for
// the couple needs the backend (not built yet).

import { useState } from 'react';
import { sendBlessing } from '../blessings';

const MAX = 80; // a blessing is short: it has to fit under a lantern

const FIELD =
  'w-full border-0 border-b border-[#E8C27A]/50 bg-transparent px-1 py-2 text-center text-[#F7E9D2] outline-none placeholder:text-[#F7E9D2]/40 focus:border-[#E8C27A]';

export default function BlessingForm() {
  const [step, setStep] = useState('closed'); // 'closed' → 'writing' → 'sent'
  const [text, setText] = useState('');
  const [name, setName] = useState('');

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !name.trim()) return;
    sendBlessing({ name: name.trim(), text: text.trim() });
    setStep('sent');
    setText('');
  };

  return (
    // taps here are for the form, not for releasing lanterns in the sky behind it
    <div data-no-drag className="mt-12 flex w-full max-w-[300px] flex-col items-center" onPointerDown={(e) => e.stopPropagation()}>
      <div className="font-dev text-[17px] tracking-[0.2em] text-[#E8C27A]">आशीर्वाद</div>

      {step === 'closed' && (
        <button
          type="button"
          onClick={() => setStep('writing')}
          className="mt-3 min-h-11 font-display text-[21px] text-[#F7E9D2] italic underline decoration-[#E8C27A]/60 underline-offset-[6px] transition-colors hover:text-[#E8C27A]"
        >
          Light a lantern with your blessing
        </button>
      )}

      {step === 'writing' && (
        <form onSubmit={send} className="mt-4 flex w-full flex-col items-center gap-3">
          <label className="sr-only" htmlFor="blessing-text">Your blessing</label>
          <input
            id="blessing-text"
            className={`${FIELD} font-display text-[18px] italic`}
            placeholder="May your home always be full of laughter"
            maxLength={MAX}
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          <label className="sr-only" htmlFor="blessing-name">Your name</label>
          <input
            id="blessing-name"
            className={`${FIELD} font-sans text-[13px] tracking-[0.12em]`}
            placeholder="Your name"
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="submit"
            disabled={!text.trim() || !name.trim()}
            className="mt-2 inline-flex min-h-11 items-center rounded-full border border-[#E8C27A]/80 px-7 font-sans text-[11px] font-medium tracking-[0.24em] text-[#F7E9D2] uppercase transition-colors duration-300 hover:bg-[#E8C27A] hover:text-[#2A0A10] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#F7E9D2]"
          >
            Send it up ✦
          </button>
        </form>
      )}

      {step === 'sent' && (
        <div className="mt-3 flex flex-col items-center gap-2">
          <p className="font-display text-[19px] text-[#F7E9D2] italic">Your lantern is on its way ✦</p>
          <button
            type="button"
            onClick={() => setStep('writing')}
            className="min-h-11 font-sans text-[11px] tracking-[0.24em] text-[#E8C27A] uppercase hover:text-[#F7E9D2]"
          >
            Send another
          </button>
        </div>
      )}
    </div>
  );
}
