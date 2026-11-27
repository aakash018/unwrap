// Floating switch at the top of the canvas: Mobile · Tablet · Desktop.
// The page's scenery fills the width of bigger screens: see `deviceScreen` in
// config.js for how each one fits.
//   onArrange – a gift's wide layouts: put everything back where it started on
//               this screen (a ready-made gift's own places; anything added
//               since, or a gift started from a theme: worked out from the
//               phone's). null: nothing has moved there since it started.

import { DEVICES } from '../../config';

export default function DeviceSwitch({ device, onChange, onArrange }) {
  return (
    <div className="absolute top-4 left-1/2 z-30 flex -translate-x-1/2 gap-0.5 rounded-xl border border-line bg-white p-1 shadow-lg">
      {Object.entries(DEVICES).map(([id, d]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={device === id}
          title={`${d.width} × ${d.height}`}
          className={`rounded-md px-3 py-1 text-[13px] ${device === id ? 'bg-ink text-white' : 'hover:bg-stone-100'}`}
        >
          {d.label}
        </button>
      ))}
      {onArrange && (
        <button
          type="button"
          title="Put everything back where it started on this screen"
          onClick={() => window.confirm('Put everything back where it started on this screen? Where you moved things here will be lost.') && onArrange()}
          className="ml-1 rounded-md border-l border-line px-3 py-1 text-[13px] text-ink-soft hover:bg-stone-100 hover:text-ink"
        >
          Arrange again
        </button>
      )}
    </div>
  );
}
