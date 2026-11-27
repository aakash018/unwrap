// A gift's three layouts: phone, tablet and desktop. (Nothing here draws.)
//
// Every element has a place on the phone (`frame`). It may have others too:
//   frames: { tablet: {…}, desktop: {…} }
// Where it has none, one is worked out from the phone's layout (`arrange`), so
// a gift made only on the phone layout still uses a wide screen well.
//
// A place is measured in its layout's column, which stands in the middle of the
// page: { x, y, w, rotation } and, for words, perhaps { size, align } there.

// Each layout's column, and the height of the screen it's designed on.
export const LAYOUTS = {
  mobile: { width: 430, height: 932 },
  tablet: { width: 640, height: 932 },
  desktop: { width: 1200, height: 900 },
};
const PHONE = LAYOUTS.mobile.width;

// Which layout suits a window this wide, and how far to zoom it to fit.
export const layoutFor = (width) => (width >= 1024 ? 'desktop' : width >= 600 ? 'tablet' : 'mobile');
export function zoomFor(layout, width, height) {
  const { width: w, height: h } = LAYOUTS[layout];
  return Math.min(width / w, Math.max(1, height / h));
}

// ── How tall things are, roughly (the real height is only known once drawn) ──

const DRAWN = { giftbox: [300, 421], letter: [300, 317], polaroids: [280, 337], voice: [300, 300], sticky: [240, 271], scratch: [320, 237], dakshina: [280, 290], secret: [44, 44] };
export const TEXT_SIZE = { heading: 44, text: 17 };

export function roughHeight({ type, props }, frame) {
  if (DRAWN[type]) return (frame.w / DRAWN[type][0]) * DRAWN[type][1];
  if (type in TEXT_SIZE) {
    const size = frame.size ?? TEXT_SIZE[type];
    const perLine = Math.max(4, frame.w / (size * (type === 'heading' ? 0.42 : 0.5)));
    const lines = (props.text || ' ').split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / perLine)), 0);
    return lines * size * (type === 'heading' ? 1.02 : 1.625);
  }
  return type === 'divider' ? 25 : frame.w * 0.75;
}

// ── Working out a wide layout from the phone's ───────────────────────────────

const isWords = ({ type }) => type in TEXT_SIZE || type === 'divider';
const bottomOf = (block) => block.frame.y + roughHeight(block, block.frame);

// The page as a row of scenes, down the phone: words on their own, or a thing
// with its title (the words just above it, and a heading above those).
function scenesOf(blocks) {
  const inOrder = blocks.filter(({ type }) => type !== 'secret').sort((a, b) => a.frame.y - b.frame.y);
  const scenes = [];
  let words = [];
  for (const block of inOrder) {
    if (isWords(block)) {
      words.push(block);
      continue;
    }
    const near = (one, below) => one && below.frame.y - bottomOf(one) < 120;
    let from = words.length;
    if (near(words[from - 1], block)) {
      from -= 1;
      if (words[from].type !== 'heading' && words[from - 1]?.type === 'heading' && near(words[from - 1], words[from])) from -= 1;
    }
    if (from > 0) scenes.push({ blocks: words.slice(0, from), alone: true });
    scenes.push({ blocks: [...words.slice(from), block], alone: false });
    words = [];
  }
  if (words.length) scenes.push({ blocks: words, alone: true });
  return scenes.map((scene) => ({ ...scene, top: Math.min(...scene.blocks.map((b) => b.frame.y)), bottom: Math.max(...scene.blocks.map(bottomOf)) }));
}

// A way to carry a height from one layout to another: along pairs [from, to].
function carrier(pairs) {
  const sorted = [...pairs].sort((a, b) => a[0] - b[0]);
  if (!sorted.length) return (y) => y;
  return (y) => {
    const [first] = sorted;
    const last = sorted[sorted.length - 1];
    if (y <= first[0]) return first[1] + (y - first[0]);
    if (y >= last[0]) return last[1] + (y - last[0]);
    const i = sorted.findIndex(([from]) => from > y);
    const [a, b] = [sorted[i - 1], sorted[i]];
    return a[1] + ((y - a[0]) / (b[0] - a[0] || 1)) * (b[1] - a[1]);
  };
}

// id → place, for every element.
export function arrange(blocks, layout) {
  const { width } = LAYOUTS[layout];
  const places = new Map();
  const put = (scene, dx, dy) => scene.blocks.forEach(({ id, frame }) => places.set(id, { ...frame, x: frame.x + dx, y: Math.round(frame.y + dy) }));
  const middle = (width - PHONE) / 2;
  const scenes = scenesOf(blocks);

  if (layout === 'tablet') {
    // the same page, winding left and right
    let turn = -1;
    for (const scene of scenes) {
      put(scene, scene.alone ? middle : middle + turn * 84, 0);
      if (!scene.alone) turn = -turn;
    }
  } else {
    // two columns, read left, right, left…; words on their own across the middle
    const columns = [width * 0.27 - PHONE / 2, width * 0.73 - PHONE / 2];
    let ends = [0, 0];
    let begun = false; // in a run of two columns
    scenes.forEach((scene, i) => {
      if (scene.alone) {
        const top = i === 0 ? scene.top : Math.max(...ends) + 130;
        put(scene, middle, top - scene.top);
        ends = [top + scene.bottom - scene.top, top + scene.bottom - scene.top];
        begun = false;
        return;
      }
      if (!begun) ends = [ends[0] + 70, ends[1] + 170]; // the right one a little lower
      begun = true;
      const column = ends[0] <= ends[1] ? 0 : 1;
      put(scene, columns[column], ends[column] - scene.top);
      ends[column] += scene.bottom - scene.top + 90;
    });
  }

  // the hidden stars: as far down as before, and as far out to the side
  const down = carrier(blocks.filter(({ id }) => places.has(id)).map(({ id, frame }) => [frame.y, places.get(id).y]));
  for (const { id, type, frame } of blocks) {
    if (type === 'secret') places.set(id, { ...frame, x: Math.round(((frame.x + frame.w / 2) / PHONE) * width - frame.w / 2), y: Math.round(down(frame.y)) });
  }
  return places;
}

// id → place, in a layout: the sender's own places, and for the rest one that's
// worked out.
export function placesIn(blocks, layout) {
  if (layout === 'mobile') return new Map(blocks.map(({ id, frame }) => [id, frame]));
  const own = blocks.filter(({ frames }) => frames?.[layout]);
  if (!own.length) return arrange(blocks, layout);
  // (something added since: about where it is on the phone, among the others)
  const down = carrier(own.map(({ frame, frames }) => [frame.y, frames[layout].y]));
  const middle = (LAYOUTS[layout].width - PHONE) / 2;
  return new Map(blocks.map(({ id, frame, frames }) => [id, frames?.[layout] ?? { ...frame, x: frame.x + middle, y: Math.round(down(frame.y)) }]));
}

// Has anything been moved in this wide layout since the gift was started?
// (Then "Arrange again" can put it back: ARRANGE in pageReducer.js.)
export const movedSinceStart = (blocks, layout) =>
  layout !== 'mobile' && blocks.some(({ frames, first }) => JSON.stringify(frames?.[layout]) !== JSON.stringify(first?.[layout]));

// Where on the phone something put at `y` in a wide layout belongs.
export function phoneHeight(blocks, layout, y) {
  const places = placesIn(blocks, layout);
  return Math.max(16, Math.round(carrier(blocks.map(({ id, frame }) => [places.get(id).y, frame.y]))(y)));
}

// The elements as they're shown in a layout: each `frame` is its place there.
export function shownIn(blocks, layout) {
  const places = placesIn(blocks, layout);
  return blocks.map((block) => {
    const frame = places.get(block.id);
    if (!(block.type in TEXT_SIZE)) return frame === block.frame ? block : { ...block, frame };
    const props = { ...block.props, align: frame.align ?? block.props.align, size: frame.size ?? TEXT_SIZE[block.type] };
    return { ...block, frame, props };
  });
}
