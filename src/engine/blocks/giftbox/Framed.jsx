// The sender's own photo in a gold frame, out of the gift box. Tap it and the
// light runs across the glass. (A drawing stands in until there's a photo.)

import { useState } from 'react';
import SamplePhoto from '../polaroids/SamplePhoto';

export default function Framed({ src }) {
  const [shone, setShone] = useState(0);
  return (
    <button type="button" aria-label="A photo, framed" className="block h-[208px] w-[168px] rounded-md outline-none focus-visible:ring-2 focus-visible:ring-gold" onClick={() => setShone(shone + 1)}>
      <span className="block size-full rounded-[4px] bg-[linear-gradient(135deg,#8C6420,#F6E0A2_22%,#B98A3A_45%,#FBEBB8_62%,#A97B2C_82%,#E6C67C)] p-[10px] shadow-[0_14px_26px_rgba(20,5,10,0.4)]">
        <span className="block size-full bg-[#7A561A] p-[2px]">
          <span className="block size-full bg-[#FBF5EA] p-[9px] shadow-[inset_0_2px_5px_rgba(60,40,20,0.35)]">
            <span className="relative block size-full overflow-hidden shadow-[0_0_0_1px_rgba(120,90,50,0.4)] [&>svg]:h-full">
              {src ? <img src={src} alt="" className="block size-full object-cover" draggable={false} /> : <SamplePhoto which={0} />}
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.28),rgba(255,255,255,0)_38%)]" />
              {shone > 0 && <span key={shone} className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 animate-shine bg-[linear-gradient(105deg,rgba(255,255,255,0),rgba(255,255,255,0.75),rgba(255,255,255,0))]" />}
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
