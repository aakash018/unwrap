// Dakshina — a red festival envelope. Tap to open it and see the blessing
// and the amount. (The eSewa/Khalti button is just a picture for now —
// real payments arrive later.)
import { useState } from 'react';
import Hint from '../shared/Hint';

export default function DakshinaBlock({ props }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close the dakshina envelope' : 'Open the dakshina envelope'}
        className="flex min-h-[220px] items-center justify-center"
      >
        {open ? (
          <div className="flex w-[240px] animate-rise flex-col items-center gap-2 rounded-[10px] bg-paper p-5 text-center text-cocoa shadow-paper">
            <span className="font-dev text-lg text-[#B4232A]">{props.greeting}</span>
            <span className="font-display text-[46px] leading-none">{props.amount}</span>
            <span className="mt-1 rounded-full bg-[#2E6B35] px-3.5 py-2 text-[13px] text-white">
              Receive in {props.wallet}
            </span>
          </div>
        ) : (
          <div className="flex h-[210px] w-[156px] flex-col items-center justify-center gap-2.5 rounded-md border-2 border-gold bg-[#B4232A] shadow-paper">
            <span className="size-4 rounded-full bg-[#FFD36B]" aria-hidden="true" />
            <span className="font-dev text-[30px] text-[#FFE7B0]">{props.label}</span>
            <span className="font-hand text-sm text-[#FFE7B0]">{props.from}</span>
          </div>
        )}
      </button>

      <Hint>{open ? 'tap to close' : 'tap to open'}</Hint>
    </div>
  );
}
