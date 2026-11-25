// Every element on the page, top-most first (like Figma's layers list), told
// apart by their first words. Click one to select it and bring it into view.

import { BLOCKS } from '../../blocks';

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
  if (!page.blocks.length) return <p className="px-2 py-1 text-[11px] text-ink-soft">Nothing on the page yet.</p>;
  return (
    <div className="max-h-[42vh] overflow-y-auto">
      {[...page.blocks].reverse().map((block) => {
        const def = BLOCKS[block.type];
        const selected = block.id === page.selectedId;
        return (
          <button
            key={block.id}
            type="button"
            onClick={() => {
              dispatch({ type: 'SELECT_BLOCK', id: block.id });
              bringIntoView(block.id);
            }}
            title={def?.label}
            className={`flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] ${selected ? 'bg-accent/10 text-accent' : 'hover:bg-stone-100'}`}
          >
            <span className={`w-4 shrink-0 text-center text-[12px] ${selected ? '' : 'text-ink-soft'}`}>{def?.icon}</span>
            <span className="truncate">{wordsOf(block) || def?.label || block.type}</span>
          </button>
        );
      })}
    </div>
  );
}
