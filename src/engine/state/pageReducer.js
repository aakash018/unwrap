// pageReducer — the single source of truth for the gift page.
//
// Shape of `page`:
// {
//   kind: 'gift',                 // or 'invitation', made of its template's chapters only
//   template: 'garden-wedding',   // an invitation's (see templates)
//   theme: 'love',                // a gift's background (see themes)
//   background: '#fff8f0',        // colour used by the 'plain' theme
//   opening: { name, words },     // a gift's: what its loader says (page/Loader.jsx)
//   blocks: [                     // elements on the page; later ones sit on top
//     {
//       id: 'abc',
//       type: 'heading',
//       frame: { x: 40, y: 60, w: 340, rotation: 0 },   // where it sits (page px, degrees)…
//       frames: { tablet: {…}, desktop: {…} },          // …and in the wider layouts, if
//                                                       // it has its own place there
//       props: { text: 'Hi!', align: 'center', ... },  // what it says / shows
//     },
//   ],
//   selectedId: 'abc' | null,     // which element is selected in the editor
// }
// (No height in `frame`: it follows from the content and the width.)
//
// Actions you can dispatch:
//   { type: 'ADD_BLOCK',      blockType: 'heading', at: { x, y }, layout } // `at` = where to centre it
//   { type: 'UPDATE_BLOCK',   id, props: { text: 'new' } }          // merges into props
//   { type: 'UPDATE_FRAME',   id, frame: { x: 10 }, layout }        // merges into its place in that layout
//   { type: 'ARRANGE',        layout }                              // forget that layout's places: work them out
//   { type: 'REMOVE_BLOCK',   id }
//   { type: 'MOVE_LAYER',     id, direction: 'forward' | 'backward' }
//   { type: 'SELECT_BLOCK',   id }                                  // id = null to deselect
//   { type: 'SET_OPENING',    opening: { name?, words? } }          // merges into what the loader says
//   { type: 'SET_THEME',      theme: 'marigold' }
//   { type: 'SET_BACKGROUND', color: '#ffeedd' }                    // for the plain theme
//   { type: 'MOVE_SECTION',   id, direction: 'up' | 'down' }        // reorder full-width sections
//   { type: 'ADD_CHAPTER',    chapter, order }                      // put back an invitation's chapter
//                                                                  // (order = its template's chapter types)
//
// Sections (full-width scenes, src/sections) are re-stacked down the page
// after every change that could move or resize them.

import { BLOCKS, createBlock, stackSections } from '../blocks';
import { THEMES } from '../themes';
import { toPage } from '../page/saved';
import { withEventIds } from '../page/format';
import { newId } from '../utils/newId';
import { LAYOUTS, phoneHeight, placesIn } from '../page/layouts';

// An element's middle always stays in its layout's column: on a wide page it could
// be dragged out to the side, where narrower windows would never show it.
const inColumn = (frame, layout) => ({ ...frame, x: Math.min(LAYOUTS[layout].width - frame.w / 2, Math.max(-frame.w / 2, frame.x)) });

// Give every element its own place in a wide layout: the one it's shown at.
function settle(blocks, layout) {
  if (blocks.every(({ frames }) => frames?.[layout])) return blocks;
  const places = placesIn(blocks, layout);
  return blocks.map((block) => ({ ...block, frames: { ...block.frames, [layout]: places.get(block.id) } }));
}

const themeOf = (id) => THEMES[id] ?? THEMES.plain;
const isSection = (block) => Boolean(BLOCKS[block?.type]?.section);

// New headings and text take the theme's colours, so they're readable on it.
function themeColors(blockType, theme) {
  if (blockType === 'heading') return { color: theme.ink };
  if (blockType === 'text') return { color: theme.inkSoft };
  return {};
}

// What's saved, ready to be edited.
export const openPage = (saved) => ({ ...toPage(saved), selectedId: null });

// Apply `change(block)` to the block with this id, leave the others alone.
const updateOne = (blocks, id, change) =>
  blocks.map((block) => (block.id === id ? change(block) : block));

export function pageReducer(page, action) {
  switch (action.type) {
    case 'ADD_BLOCK': {
      // New elements go on top of everything else.
      const newBlock = createBlock(
        action.blockType,
        action.at,
        themeColors(action.blockType, themeOf(page.theme)),
      );
      const { layout = 'mobile' } = action;
      if (layout !== 'mobile') {
        // it's put here in this layout, and about there on the phone
        const { w } = newBlock.frame;
        const here = inColumn({ x: Math.round(action.at.x - w / 2), y: Math.round(Math.max(16, action.at.y - 100)), w, rotation: 0 }, layout);
        newBlock.frame = { x: Math.round((LAYOUTS.mobile.width - w) / 2), y: phoneHeight(page.blocks, layout, here.y), w, rotation: 0 };
        newBlock.frames = { [layout]: here };
        return { ...page, blocks: [...settle(page.blocks, layout), newBlock], selectedId: newBlock.id };
      }
      return { ...page, blocks: stackSections([...page.blocks, newBlock]), selectedId: newBlock.id };
    }

    case 'UPDATE_BLOCK':
      return {
        ...page,
        blocks: stackSections(
          updateOne(page.blocks, action.id, (b) => ({
            ...b,
            props: { ...b.props, ...action.props },
          })),
        ),
      };

    case 'UPDATE_FRAME': {
      if (isSection(page.blocks.find((b) => b.id === action.id))) return page; // sections stay put
      const { layout = 'mobile' } = action;
      const moved = (frame) => inColumn({ ...frame, ...action.frame }, layout);
      if (layout === 'mobile') return { ...page, blocks: updateOne(page.blocks, action.id, (b) => ({ ...b, frame: moved(b.frame) })) };
      return { ...page, blocks: updateOne(settle(page.blocks, layout), action.id, (b) => ({ ...b, frames: { ...b.frames, [layout]: moved(b.frames[layout]) } })) };
    }

    case 'ARRANGE':
      return {
        ...page,
        blocks: page.blocks.map(({ frames, ...block }) => {
          const rest = { ...frames };
          delete rest[action.layout];
          return Object.keys(rest).length ? { ...block, frames: rest } : block;
        }),
      };

    case 'REMOVE_BLOCK': {
      const blocks = page.blocks.filter((block) => block.id !== action.id);
      const selectedId = page.selectedId === action.id ? null : page.selectedId;
      return { ...page, blocks: stackSections(blocks), selectedId };
    }

    case 'MOVE_LAYER': {
      // forward = one step closer to the top
      const from = page.blocks.findIndex((b) => b.id === action.id);
      const to = action.direction === 'forward' ? from + 1 : from - 1;
      if (from === -1 || to < 0 || to >= page.blocks.length) return page;
      // sections stay behind everything else (reorder them with MOVE_SECTION)
      if (isSection(page.blocks[from]) || isSection(page.blocks[to])) return page;

      const blocks = [...page.blocks];
      [blocks[from], blocks[to]] = [blocks[to], blocks[from]];
      return { ...page, blocks };
    }

    case 'MOVE_SECTION': {
      // swap with the section above / below
      const order = page.blocks.filter(isSection);
      const from = order.findIndex((b) => b.id === action.id);
      const to = action.direction === 'up' ? from - 1 : from + 1;
      if (from === -1 || to < 0 || to >= order.length) return page;
      [order[from], order[to]] = [order[to], order[from]];
      const blocks = [...order, ...page.blocks.filter((b) => !isSection(b))];
      return { ...page, blocks: stackSections(blocks) };
    }

    case 'ADD_CHAPTER': {
      const frame = { x: 0, y: 0, w: 0, rotation: 0 }; // stackSections puts it in its place
      const chapter = { ...withEventIds({ ...action.chapter, id: newId() }), frame };
      // before the first chapter that comes later in the template
      const later = action.order.slice(action.order.indexOf(chapter.type) + 1);
      const at = page.blocks.findIndex(({ type }) => later.includes(type));
      const blocks = [...page.blocks];
      blocks.splice(at === -1 ? blocks.length : at, 0, chapter);
      return { ...page, blocks: stackSections(blocks), selectedId: chapter.id };
    }

    case 'SELECT_BLOCK':
      return { ...page, selectedId: action.id };

    case 'SET_THEME': {
      // Text still in the old theme's colour switches to the new theme's
      // colour (so cream text doesn't vanish on ivory). Colours you picked
      // yourself are left alone.
      const from = themeOf(page.theme);
      const to = themeOf(action.theme);
      const blocks = page.blocks.map((block) => {
        const old = themeColors(block.type, from).color;
        if (!old || block.props.color !== old) return block;
        return { ...block, props: { ...block.props, ...themeColors(block.type, to) } };
      });
      return { ...page, theme: action.theme, blocks };
    }

    case 'SET_BACKGROUND':
      return { ...page, background: action.color };

    // what the gift's loader says: { name?, words? }
    case 'SET_OPENING':
      return { ...page, opening: { ...page.opening, ...action.opening } };

    default:
      console.warn('Unknown action:', action);
      return page;
  }
}
