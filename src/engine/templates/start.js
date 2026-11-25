// The first version of a new invitation or gift, as it's saved (see
// page/saved.js).

import { TEMPLATES } from './index';
import { createBlock } from '../blocks';
import { THEMES } from '../themes';
import { readyMade } from '../ready-made';
import { newId } from '../utils/newId';
import { FORMAT, withEventIds } from '../page/format';

// names: ['Soni', 'Aaku'], if they're already known
export function startInvitation(template, names) {
  const [name1, name2] = names ?? [];
  const known = name1 && name2 && { hero: { name1, name2 }, gardenHero: { name1, name2 }, couple: { names: `${name1} & ${name2}` } };
  const chapters = TEMPLATES[template]
    .chapters()
    .map(({ type, props }) => withEventIds({ id: newId(), type, props: { ...props, ...(known ? known[type] : {}) } }));
  return { format: FORMAT, kind: 'invitation', template, chapters };
}

// From a ready-made gift (`readyMadeId`), or from just a theme. The names are
// who it's for and who it's from, if they're already known.
export function startGift({ theme, readyMadeId, toName, fromName }) {
  const gift = { format: FORMAT, kind: 'gift', background: '#fff8f0' };
  if (readyMadeId) return { ...gift, ...readyMade(readyMadeId, { to: toName, from: fromName }) };
  const { id, type, frame, props } = createBlock('heading', { x: 215, y: 480 }, {
    text: toName ? `For ${toName}` : 'For you',
    color: THEMES[theme].ink,
  });
  return { ...gift, theme, elements: [{ id, type, frame, props }] };
}
