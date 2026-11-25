// What can be in a gift box.
//   tap      – the hint once it's out
//   rise     – how far down in the box it is to begin with (px)
//   up       – how far its foot is above the box's (so it stands in the box, or on it)
//   pictures – loaded while it's being unwrapped

import Roses from './Roses';
import { ROSES } from './rosesLayout';
import Butterflies from './Butterflies';
import Crane from './Crane';
import Framed from './Framed';

export const PRESENTS = {
  roses: { label: 'Roses', Component: Roses, tap: 'tap a rose, or pick one', up: 80, rise: 125, pictures: ['roses', 'rose-stem', ...ROSES.map(({ name }) => name)] },
  butterflies: { label: 'Butterflies', Component: Butterflies, tap: 'touch one, gently', up: 74, rise: 120, pictures: ['bed', 'wing-0', 'wing-1', 'wing-2', 'wing-body'] },
  crane: { label: 'Crane', Component: Crane, tap: 'tap the crane, or throw it', up: 256, rise: 200, pictures: ['crane', 'crane-paper'] },
  photo: { label: 'Photo', Component: Framed, tap: 'tap the photo', up: 118, rise: 186, pictures: [] },
};
