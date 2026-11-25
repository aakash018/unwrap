// Exact numbers for the selected element, Figma style: X, Y, width and
// rotation (and, for words, their size), each a small grey box with its letter inside on the left.
import { INPUT_CLASSES } from '../shared/TextInput';

function NumberField({ label, value, onChange, title }) {
  return (
    <label className="relative" title={title}>
      <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-[11px] text-ink-soft">{label}</span>
      <input
        type="number"
        className={`${INPUT_CLASSES} pl-6 tabular-nums`}
        value={Math.round(value)}
        onChange={(e) => {
          if (e.target.value === '') return; // ignore while the box is cleared
          onChange(Number(e.target.value));
        }}
      />
    </label>
  );
}

// defaultSize: for words, how big they are if nothing else is chosen
export default function FrameFields({ frame, defaultSize, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <NumberField label="X" title="Left" value={frame.x} onChange={(x) => onChange({ x })} />
      <NumberField label="Y" title="Top" value={frame.y} onChange={(y) => onChange({ y })} />
      <NumberField label="W" title="Width" value={frame.w} onChange={(w) => onChange({ w: Math.max(20, w) })} />
      <NumberField label="°" title="Rotation" value={frame.rotation} onChange={(rotation) => onChange({ rotation })} />
      {defaultSize && (
        <NumberField label="A" title="Size of the words" value={frame.size ?? defaultSize} onChange={(size) => onChange({ size: Math.min(200, Math.max(10, size)) })} />
      )}
    </div>
  );
}
