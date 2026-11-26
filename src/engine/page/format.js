// The shape things are saved in. Raise FORMAT when the shape changes, and
// teach `upgrade` to bring older ones up to date. (Nothing here draws, so it
// can be used anywhere, also without the rest of the engine.)
//
//   an invitation: { format, kind: 'invitation', template, chapters: [{ id, type, props }] }
//   a gift:        { format, kind: 'gift', theme, background, opening?,
//                    elements: [{ id, type, frame, frames?, props }] }
//                    (opening: { name?, words? } – on its loader, page/Loader.jsx)
//                    (frame: on a phone; frames: on tablet and desktop, see layouts.js)

import { newId } from '../utils/newId';

export const FORMAT = 1;

const CHAPTERS = ['hero', 'gardenHero', 'events', 'couple', 'details'];

// Every ceremony has an id, so guests can answer for each one.
export function withEventIds(chapter) {
  if (chapter.type !== 'events') return chapter;
  const events = (chapter.props.events ?? []).map((event) => (event.id ? event : { ...event, id: newId() }));
  return { ...chapter, props: { ...chapter.props, events } };
}

// Brings a page from before the formats ({ template, theme, background,
// blocks }) up to date. An invitation keeps only its chapters.
export function upgrade(saved) {
  if (saved.format) return saved;
  const chapters = saved.blocks.filter(({ type }) => CHAPTERS.includes(type));
  if (chapters.length) {
    const template = chapters.some(({ type }) => type === 'gardenHero') ? 'garden-wedding' : 'hindu-wedding';
    return {
      format: FORMAT,
      kind: 'invitation',
      template,
      chapters: chapters.map(({ id, type, props }) => withEventIds({ id, type, props })),
    };
  }
  return {
    format: FORMAT,
    kind: 'gift',
    theme: saved.theme === 'wedding' ? 'marigold' : saved.theme,
    background: saved.background,
    elements: saved.blocks,
  };
}
