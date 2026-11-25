// Templates — what an invitation is made from. Each one is complete: its
// chapters bring their own scenery, so there's no theme to choose.
//
// To add one: give it an id, a name, and its chapters (types from
// src/engine/sections, with the words they start with).

import { SECTIONS } from '../sections';
import { GARDEN } from '../sections/garden/defaults';

const chapter = (type, props = {}) => ({ type, props: { ...structuredClone(SECTIONS[type].defaults), ...structuredClone(props) } });

export const TEMPLATES = {
  'hindu-wedding': {
    label: 'Hindu Wedding',
    chapters: () => ['hero', 'events', 'couple', 'details'].map((type) => chapter(type)),
  },
  // a golden-hour garden, then the same chapters in their garden look, with
  // their own words (sections/garden/defaults.js)
  'garden-wedding': {
    label: 'Garden Wedding',
    chapters: () => ['gardenHero', 'events', 'couple', 'details'].map((type) => chapter(type, GARDEN[type])),
  },
};
