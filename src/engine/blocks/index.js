// Block registry — every kind of element the gift page can contain.
//
// Each block type lives in its own folder:
//   blocks/letter/LetterBlock.jsx     – how it looks on the page
//   blocks/letter/LetterSettings.jsx  – its controls in the toolbar
//
// To add a new block type:
//   1. Make a folder with a Block component (and optionally a Settings component).
//   2. Add an entry to BLOCKS below. The toolbar and canvas pick it up automatically.
//
// Each entry:
//   group        – which toolbar section it appears in (see GROUPS)
//   label        – name shown in the toolbar
//   icon         – small symbol shown on the toolbar button
//   width        – starting width on the page (px)
//   minWidth     – can't be resized narrower than this
//   resize       – 'reflow': content fills the width (text re-wraps, photos grow)
//                  'scale' : the whole thing scales like a picture; `width` is the
//                            size it's drawn at (used for the surprises)
//   editableText – true if double-clicking lets you type into it
//   section      – a full-width scene that stacks down the page (src/sections)
//   defaults     – starting props for a new block of this type
//   Component    – how it looks on the page   ({ props, onChange, isSelected, isEditing, preview })
//                  `preview` is true when a receiver is viewing (no editor hints)
//
// The controls for each type are in blocks/settings.js: only the editor loads
// those, so guests opening a gift don't download them.

import { PAGE_WIDTH } from '../config';
import { newId } from '../utils/newId';

// Basics
import HeadingBlock from './heading/HeadingBlock';
import TextBlock from './text/TextBlock';
import ImageBlock from './image/ImageBlock';
import DividerBlock from './divider/DividerBlock';

// Surprises (the interactive pieces from the landing page)
import GiftBoxBlock from './giftbox/GiftBoxBlock';
import LetterBlock from './letter/LetterBlock';
import PolaroidsBlock from './polaroids/PolaroidsBlock';
import VoiceNoteBlock from './voice/VoiceNoteBlock';
import StickyNoteBlock from './sticky/StickyNoteBlock';
import { NOTE_COLORS } from './sticky/colors';
import ScratchCardBlock from './scratch/ScratchCardBlock';
import DakshinaBlock from './dakshina/DakshinaBlock';
import SecretBlock from './secret/SecretBlock';

// Sections (full-width illustrated scenes, see src/sections)
import { SECTIONS, stackSections as stack } from '../sections';

// What can be added to a gift, in the toolbar's order. (An invitation's
// chapters come from its template instead.)
export const GROUPS = [
  { id: 'basic', title: 'Basics' },
  { id: 'surprise', title: 'Surprises' },
];

export const BLOCKS = {
  // ─── Basics ─────────────────────────────────────────────
  heading: {
    group: 'basic',
    label: 'Heading',
    icon: 'H',
    width: 360,
    minWidth: 60,
    resize: 'reflow',
    editableText: true,
    defaults: { text: 'Happy Birthday!', align: 'center', color: '#3B1A17' },
    Component: HeadingBlock,
  },
  text: {
    group: 'basic',
    label: 'Text',
    icon: '¶',
    width: 340,
    minWidth: 60,
    resize: 'reflow',
    editableText: true,
    defaults: { text: 'Write your message here…', align: 'left', color: '#5A3A30' },
    Component: TextBlock,
  },
  image: {
    group: 'basic',
    label: 'Image',
    icon: '▣',
    width: 300,
    minWidth: 40,
    resize: 'reflow',
    defaults: { src: '', alt: '' },
    Component: ImageBlock,
  },
  divider: {
    group: 'basic',
    label: 'Divider',
    icon: '—',
    width: 300,
    minWidth: 20,
    resize: 'reflow',
    defaults: {},
    Component: DividerBlock,
  },

  // ─── Surprises ──────────────────────────────────────────
  giftbox: {
    group: 'surprise',
    label: 'Gift box',
    icon: '❖',
    width: 300,
    minWidth: 90,
    resize: 'scale',
    defaults: { present: 'roses', src: '', tag: 'for you', ribbon: '#8E2A20', petals: 'marigold' }, // src: its photo, if that's inside
    Component: GiftBoxBlock,
  },
  letter: {
    group: 'surprise',
    label: 'Letter',
    icon: '✉',
    width: 300,
    minWidth: 90,
    resize: 'scale',
    defaults: {
      message: 'Write your letter here.\nIt appears when they break the seal.',
      envelopeColor: '#E9B8A4',
      sealColor: '#8E2A20',
    },
    Component: LetterBlock,
  },
  polaroids: {
    group: 'surprise',
    label: 'Polaroids',
    icon: '▧',
    width: 280,
    minWidth: 90,
    resize: 'scale',
    defaults: { photos: [] }, // [{ id, src, caption }]: without a src, a drawing until there's a photo
    Component: PolaroidsBlock,
  },
  voice: {
    group: 'surprise',
    label: 'Voice note',
    icon: '◉',
    width: 300,
    minWidth: 90,
    resize: 'scale',
    defaults: { src: '', label: 'for you · side A' },
    Component: VoiceNoteBlock,
  },
  sticky: {
    group: 'surprise',
    label: 'Sticky note',
    icon: '▦',
    width: 240,
    minWidth: 90,
    resize: 'scale',
    editableText: true, // double-click to write on it
    defaults: { front: 'a little thing I love about you', back: '…and why', color: NOTE_COLORS[0] },
    Component: StickyNoteBlock,
  },
  scratch: {
    group: 'surprise',
    label: 'Scratch card',
    icon: '✶',
    width: 320,
    minWidth: 90,
    resize: 'scale',
    defaults: { hiddenText: 'A surprise just for you', coverText: 'scratch here ✶', resetKey: 0 },
    Component: ScratchCardBlock,
  },
  dakshina: {
    group: 'surprise',
    label: 'Dakshina',
    icon: '₨',
    width: 280,
    minWidth: 90,
    resize: 'scale',
    defaults: {
      label: 'दक्षिणा',
      from: 'from Mama',
      greeting: 'विजया दशमीको शुभकामना',
      amount: 'Rs 1,001',
      wallet: 'eSewa',
    },
    Component: DakshinaBlock,
  },

  secret: {
    group: 'surprise',
    label: 'Hidden message',
    icon: '✦',
    width: 44,
    minWidth: 30,
    resize: 'scale',
    defaults: { message: 'You found me!' },
    Component: SecretBlock,
  },

  // ─── Sections (see src/sections/index.js) ───────────────
  ...SECTIONS,
};

// Re-stack the sections down the page (call after anything changes them).
export const stackSections = (blocks) => stack(blocks, BLOCKS);

// Make a fresh block, ready to put on the page.
// `at` = the page point to centre it on (usually the middle of the screen).
// `props` = anything to change from the defaults (e.g. the theme's text colour).
export function createBlock(type, at = { x: PAGE_WIDTH / 2, y: 120 }, props = {}) {
  const definition = BLOCKS[type];
  if (!definition) throw new Error(`Unknown block type: ${type}`);

  if (definition.section) {
    // stackSections() puts it in its place
    return {
      id: newId(),
      type,
      frame: { x: 0, y: 0, w: PAGE_WIDTH, rotation: 0 },
      props: { ...structuredClone(definition.defaults), ...props },
    };
  }

  const w = Math.min(definition.width, PAGE_WIDTH);

  return {
    id: newId(),
    type,
    frame: {
      x: Math.round(Math.max(0, Math.min(PAGE_WIDTH - w, at.x - w / 2))),
      y: Math.round(Math.max(16, at.y - 100)), // roughly centred; we don't know its height yet
      w,
      rotation: 0,
    },
    // deep copy, so blocks never share the same arrays (e.g. polaroid photos)
    props: { ...structuredClone(definition.defaults), ...props },
  };
}
