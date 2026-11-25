// Ready-made gifts: a theme with its surprises and words already in place, to
// start from and change freely. (Once started it's a gift like any other: it
// doesn't remember where it came from.)
//
// To add one: write a file like love.js (a function giving the elements for
// `to` and `from`), add it here, and to READY_MADE in lib/projects.ts.

import { createBlock } from '../blocks';
import birthday from './birthday';
import love from './love';

const READY_MADE = {
  'love-sky': { theme: 'love', elements: love },
  'birthday-garden': { theme: 'birthday', elements: birthday },
};

// A place: [x, y, w], and perhaps { rotation, size, align }.
const place = ([x, y, w, more]) => ({ x, y, w, rotation: 0, ...more });

// Its theme, and its elements as they're saved. (Each is written { type, mobile,
// tablet, desktop, props }: its place in each layout, see page/layouts.js.)
export function readyMade(id, names) {
  const { theme, elements } = READY_MADE[id];
  return {
    theme,
    elements: elements(names).map(({ type, mobile, tablet, desktop, props }) => ({
      ...createBlock(type, undefined, props),
      frame: place(mobile),
      frames: { tablet: place(tablet), desktop: place(desktop) },
    })),
  };
}
