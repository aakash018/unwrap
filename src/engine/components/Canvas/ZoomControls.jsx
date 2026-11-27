// Floating bar at the bottom of the canvas:
//   [Move][Try it] | [−] 100% [+] | Fit width | Fit screen
// Move (V, a hand: founder, 27 Nov 2026): the elements don't react to the
// pointer, they can only be picked, dragged, resized, rotated. Try it (I, the
// pointer): they work as on the gift (a box opens, a card scratches). Each says its name and key on
// hover, at once. Clicking the percentage resets to 100%. A gift with
// something on it also gets Clear all (🗑, at the end), which asks first:
// there's no undo.

import Icon from '../shared/Icon';

const BTN = 'rounded-md px-2.5 py-1 text-[13px] hover:bg-stone-100';
const TOOLS = [
  ['move', 'hand', 'Move', 'V'],
  ['interact', 'cursor', 'Try it', 'I'],
];

export default function ZoomControls({ zoom, zoomIn, zoomOut, zoomTo, fitWidth, fitScreen, tool, onTool, onClearAll }) {
  return (
    <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-line bg-white p-1 shadow-lg">
      {TOOLS.map(([id, icon, name, key]) => (
        <button
          key={id}
          type="button"
          onClick={() => onTool(id)}
          aria-label={`${name} (${key})`}
          aria-pressed={tool === id}
          className={`group/tool relative grid size-8 place-items-center rounded-md ${tool === id ? 'bg-ink text-white' : 'text-ink hover:bg-stone-100'}`}
        >
          <Icon name={icon} size={16} />
          {/* its name, above it, as soon as the pointer is on it */}
          <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-[11px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tool:opacity-100">
            {name} <span className="ml-1 text-white/55">{key}</span>
          </span>
        </button>
      ))}

      <span className="mx-1 h-5 w-px bg-line" />

      <button className={BTN} onClick={zoomOut} title="Zoom out (⌘ −)">
        −
      </button>
      <button
        className={`${BTN} w-16 tabular-nums`}
        onClick={() => zoomTo(1)}
        title="Reset to 100% (⌘ 0)"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button className={BTN} onClick={zoomIn} title="Zoom in (⌘ +)">
        +
      </button>

      <span className="mx-1 h-5 w-px bg-line" />

      <button className={BTN} onClick={fitWidth}>
        Fit width
      </button>
      <button className={BTN} onClick={fitScreen}>
        Fit screen
      </button>
      {onClearAll && (
        <>
          <span className="mx-1 h-5 w-px bg-line" />
          <button type="button" onClick={onClearAll} aria-label="Clear all" className="group/tool relative grid size-8 place-items-center rounded-md text-ink-soft hover:bg-red-50 hover:text-red-700">
            <Icon name="trash" size={16} />
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-[11px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tool:opacity-100">
              Clear all
            </span>
          </button>
        </>
      )}
    </div>
  );
}
