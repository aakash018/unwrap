// Floating switch at the top of the canvas: Mobile · Tablet · Desktop.
// The page's scenery fills the width of bigger screens: see `deviceScreen` in
// config.js for how each one fits.
//   onArrange – a gift's wide layouts: forget the places chosen there, and work
//               them out from the phone's again (null: none were chosen)

import { DEVICES } from '../../config';

export default function DeviceSwitch({ device, onChange, onArrange }) {
  return (
    <div className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 gap-0.5 rounded-xl border border-line bg-white p-1 shadow-lg">
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
          title="Put everything where it would go by itself, from the Mobile layout"
          onClick={() => window.confirm('Arrange this layout again from the Mobile one? Where you put things here will be lost.') && onArrange()}
          className="ml-1 rounded-md border-l border-line px-3 py-1 text-[13px] text-ink-soft hover:bg-stone-100 hover:text-ink"
        >
          Arrange again
        </button>
      )}
    </div>
  );
}
