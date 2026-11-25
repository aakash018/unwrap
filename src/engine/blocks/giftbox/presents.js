// What can be in a gift box.
//   tap      – the hint once it's out
//   up       – how far its foot is above the box's (so it stands in the box, or on it)
//   pictures – loaded while it's being unwrapped

import Roses from './Roses';
import { ROSES } from './rosesLayout';
import Butterflies from './Butterflies';
import Crane from './Crane';
import Framed from './Framed';

export const PRESENTS = {
  roses: { label: 'Roses', Component: Roses, tap: 'tap a rose, or pick one', up: 80, pictures: ['roses', 'rose-stem', ...ROSES.map(({ name }) => name)] },
  butterflies: { label: 'Butterflies', Component: Butterflies, tap: 'touch one, gently', up: 74, pictures: ['bed', 'wing-0', 'wing-1', 'wing-2', 'wing-body'] },
  crane: { label: 'Crane', Component: Crane, tap: 'tap the crane, or throw it', up: 140, pictures: ['crane', 'crane-paper'] },
  photo: { label: 'Photo', Component: Framed, tap: 'tap the photo', up: 118, pictures: [] },
};
