// Floating zoom bar at the bottom of the canvas:  [−] 100% [+] | Fit width | Fit screen
// Clicking the percentage resets to 100%.

const BTN = 'rounded-md px-2.5 py-1 text-[13px] hover:bg-stone-100';

export default function ZoomControls({ zoom, zoomIn, zoomOut, zoomTo, fitWidth, fitScreen }) {
  return (
    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-line bg-white p-1 shadow-lg">
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
    </div>
  );
}
