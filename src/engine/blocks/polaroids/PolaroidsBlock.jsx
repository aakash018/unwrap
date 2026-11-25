// Polaroid stack — tap to shuffle to the next photo. Each photo has a
// handwritten caption. Where there's no photo yet, a little drawing stands in.

import { useState } from 'react';
import Hint from '../shared/Hint';
import SamplePhoto, { SAMPLES } from './SamplePhoto';

export default function PolaroidsBlock({ props, preview }) {
  const [index, setIndex] = useState(0);
  const { photos } = props;
  const count = photos.length || SAMPLES;
  const i = index % count;
  const photo = photos[i];

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <button type="button" onClick={() => setIndex(index + 1)} aria-label="Show the next photo" className="relative block h-[270px] w-[236px]">
        {/* two blank polaroids underneath, for the "stack" look */}
        <div className="absolute top-2.5 left-5 h-[252px] w-[210px] rotate-6 rounded-[3px] bg-paper shadow-paper" />
        <div className="absolute top-1 left-2 h-[252px] w-[210px] -rotate-5 rounded-[3px] bg-paper shadow-paper" />
        {/* the photo on top — `key` replays the shuffle animation each time */}
        <div key={index} className="absolute top-0 left-3.5 h-[252px] w-[210px] animate-shuffle rounded-[3px] bg-paper px-3 pt-3 shadow-paper">
          {photo?.src ? (
            <img src={photo.src} alt={photo.caption} className="block h-[180px] w-full object-cover" draggable={false} />
          ) : (
            <SamplePhoto which={i} />
          )}
          <span className="mt-2 block truncate text-center font-hand text-[17px] text-cocoa">{photo?.caption || (preview ? '' : 'add photos on the right')}</span>
        </div>
      </button>
      <Hint>
        tap to shuffle · {i + 1}/{count}
      </Hint>
    </div>
  );
}
