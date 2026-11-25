// Theme registry — the backgrounds a gift can have. (Invitations have no
// theme: their template brings its own scenery.)
//
// Each theme (see love.js, marigold.js …) has:
//   id, label, nepali   – names shown in the picker
//   background          – the CSS paper behind everything
//   ink, inkSoft        – text colours that read well on it (headings, body)
//   oldInks             – optional: text colours it used to have, and what they
//                         are now, for gifts made before (see page/saved.js)
//   dark                – true for deep backgrounds (velvet, midnight…)
//   minHeight           – optional: the page is never shorter than this (a
//                         theme with a top scene and a bottom scene, like
//                         Love, needs room for both; the middle stretches)
//   layers              – faint parallax layers [{ depth 0..1, paint(ctx, area, w, h, screen) }],
//                         far (0) to near (1); painted once, shifted by pointer/scroll
//   createScene(world, { calm, screen })
//                       – adds its decorations to the physics world and
//                         returns { backdrop, update, draw, burst }
//                         backdrop = printed ornaments, painted once
//                         celebrate() = optional: what happens when all the
//                         hidden messages are found. The layer keeps
//                         scene.view = { top, height }, the part on screen.
//                         screen = height of one screen on the viewer's
//                         device, so decorations sit on the first screen
//
// To add a theme: copy one of the files, change it, and add it below.

import love from './love';
import marigold from './marigold';
import birthday from './birthday';
import anniversary from './anniversary';

const plain = {
  id: 'plain',
  label: 'Plain',
  nepali: 'सादा',
  background: null, // uses the colour you pick instead
  dark: false,
  ink: '#3B1A17',
  inkSoft: '#5A3A30',
  createScene: null, // nothing moving
};

export const THEMES = { love, marigold, birthday, anniversary, plain };

// Order in the picker.
export const THEME_ORDER = ['love', 'marigold', 'birthday', 'anniversary', 'plain'];
