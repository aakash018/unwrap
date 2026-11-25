// Butterflies, out of the gift box: they leave their bed of flowers and flutter
// about the page (butterflies.js).

import { useEffect, useRef } from 'react';
import { pictureOf } from './pictures';
import { releaseButterflies } from './butterflies';

export default function Butterflies() {
  const bed = useRef(null);
  useEffect(() => releaseButterflies(bed.current), []);
  return (
    <span ref={bed} role="img" aria-label="Butterflies, flying out" className="pointer-events-none relative block h-[182px] w-[221px]">
      <img src={pictureOf('bed')} alt="" draggable={false} className="absolute inset-0 size-full max-w-none" />
    </span>
  );
}
