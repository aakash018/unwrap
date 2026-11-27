// Every element on the page, top-most first (like Figma's layers list), told
// apart by their first words. Click one to select it and bring it into view.
// Drag one up or down to change what's in front of what: the others slide
// aside to show where it'll go (PLACE_LAYER in pageReducer.js).

import { useRef, useState } from 'react';
import { BLOCKS } from '../../blocks';

const START_AFTER = 4; // px the pointer moves before a press becomes a drag
const EDGE = 24; // px from the list's top or bottom: it scrolls while dragging there

// What an element says, if it has words of its own.
const wordsOf = ({ type, props }) => {
  const words = { heading: props.text, text: props.text, sticky: props.front, secret: props.message }[type];
  return words?.trim().replace(/\s+/g, ' ');
};

// Scroll the canvas to it, if it isn't in view.
function bringIntoView(id) {
  const el = document.querySelector(`[data-id="${CSS.escape(id)}"]`);
  const { top, bottom } = el?.getBoundingClientRect() ?? {};
  if (el && (top < 80 || bottom > window.innerHeight - 80)) el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
}

export default function LayersList({ page, dispatch }) {
  const listRef = useRef(null);
  // what scrolls: the panel it's in (data-scroll), else the list itself
  const scrollerOf = () => listRef.current.closest('[data-scroll]') ?? listRef.current;
  const press = useRef(null); // { id, from, startY, startScroll, row }: while the pointer is down on a row
  const [drag, setDrag] = useState(null); // { id, from, to, dy, row }: while dragging
  const dragged = useRef(false); // (then the click that follows isn't a click)

  if (!page.blocks.length) return <p className="px-2 py-1 text-[11px] text-ink-soft">Nothing on the page yet.</p>;
  const shown = [...page.blocks].reverse(); // top-most first

  const onPointerDown = (e, id, from) => {
    if (e.button !== 0) return;
    press.current = { id, from, startY: e.clientY, startScroll: scrollerOf().scrollTop, row: e.currentTarget.offsetHeight };
    dragged.current = false;
  };

  const onPointerMove = (e) => {
    const p = press.current;
    if (!p) return;
    const list = scrollerOf();
    // near the panel's edges, scroll it
    const box = list.getBoundingClientRect();
    if (drag && e.clientY < box.top + EDGE) list.scrollTop -= 6;
    if (drag && e.clientY > box.bottom - EDGE) list.scrollTop += 6;
    const dy = e.clientY - p.startY + (list.scrollTop - p.startScroll);
    if (!drag && Math.abs(dy) < START_AFTER) return;
    if (!drag) e.currentTarget.setPointerCapture(e.pointerId);
    dragged.current = true;
    const to = Math.max(0, Math.min(shown.length - 1, p.from + Math.round(dy / p.row)));
    setDrag({ id: p.id, from: p.from, to, dy, row: p.row });
  };

  const onPointerUp = () => {
    press.current = null;
    if (!drag) return;
    setDrag(null);
    // `to` counts from the top; the order counts from the back
    if (drag.to !== drag.from) dispatch({ type: 'PLACE_LAYER', id: drag.id, index: shown.length - 1 - drag.to });
  };

  // where each row is drawn while one is dragged: it follows the pointer, the
  // ones it passes slide a row the other way
  const shiftOf = (i) => {
    if (!drag) return 0;
    if (i === drag.from) return drag.dy;
    if (drag.from < i && i <= drag.to) return -drag.row;
    if (drag.to <= i && i < drag.from) return drag.row;
    return 0;
  };

  return (
    <div ref={listRef} className="flex flex-col" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      {shown.map((block, i) => {
        const def = BLOCKS[block.type];
        const selected = block.id === page.selectedId;
        const lifted = drag?.id === block.id;
        return (
          <button
            key={block.id}
            type="button"
            onPointerDown={(e) => onPointerDown(e, block.id, i)}
            onClick={() => {
              if (dragged.current) return;
              dispatch({ type: 'SELECT_BLOCK', id: block.id });
              bringIntoView(block.id);
            }}
            title={`${def?.label ?? block.type} · drag to put it in front of or behind others`}
            style={{ transform: `translateY(${shiftOf(i)}px)`, transition: lifted || !drag ? 'none' : 'transform 150ms ease' }}
            className={`relative flex h-7 w-full touch-none items-center gap-2 rounded-md px-2 text-left text-[12px] ${
              lifted ? 'z-10 bg-white shadow-md ring-1 ring-line' : selected ? 'bg-accent/10 text-accent' : 'hover:bg-stone-100'
            } ${drag ? 'cursor-grabbing' : ''}`}
          >
            <span className={`w-4 shrink-0 text-center text-[12px] ${selected ? '' : 'text-ink-soft'}`}>{def?.icon}</span>
            <span className="truncate">{wordsOf(block) || def?.label || block.type}</span>
          </button>
        );
      })}
    </div>
  );
}
