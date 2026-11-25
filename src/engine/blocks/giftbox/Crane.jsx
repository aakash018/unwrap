// A paper crane, out of the gift box. (It's drawn over the page, so it can fly
// about: crane.js. Here's only the place it hovers.)

import { useEffect, useRef } from 'react';
import { flyCrane } from './crane';

export default function Crane() {
  const place = useRef(null);
  useEffect(() => flyCrane(place.current), []);
  return <span ref={place} className="pointer-events-none block h-[178px] w-[206px]" />;
}
