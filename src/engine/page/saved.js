// Between what's saved (see format.js) and what the engine draws and edits:
// one page of blocks (see state/pageReducer.js).

import { PAGE_WIDTH } from '../config';
import { stackSections } from '../blocks';
import { THEMES } from '../themes';
import { FORMAT } from './format';

const NIGHT = '#120B1E'; // below an invitation's last chapter, which ends at night

export function toPage(saved) {
  if (saved.kind === 'invitation') {
    // where the chapters go is worked out now, never saved: a chapter may have
    // become taller or shorter since
    const frame = { x: 0, y: 0, w: PAGE_WIDTH, rotation: 0 };
    const blocks = stackSections(saved.chapters.map((chapter) => ({ ...chapter, frame })));
    return { kind: 'invitation', template: saved.template, theme: 'plain', background: NIGHT, blocks };
  }
  // text in a colour the theme used to have takes its new one
  const inks = THEMES[saved.theme]?.oldInks ?? {};
  const blocks = saved.elements.map((one) => {
    const ink = inks[one.props.color];
    return ink ? { ...one, props: { ...one.props, color: ink } } : one;
  });
  return { kind: 'gift', theme: saved.theme, background: saved.background, opening: saved.opening, blocks };
}

export function toSaved({ kind, template, theme, background, opening, blocks }) {
  if (kind === 'invitation') {
    return { format: FORMAT, kind, template, chapters: blocks.map(({ id, type, props }) => ({ id, type, props })) };
  }
  return { format: FORMAT, kind, theme, background, ...(opening && { opening }), elements: blocks.map(({ id, type, frame, frames, first, props }) => ({ id, type, frame, ...(frames && { frames }), ...(first && { first }), props })) };
}
