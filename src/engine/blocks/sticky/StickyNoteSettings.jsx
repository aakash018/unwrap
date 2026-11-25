// Toolbar controls for a Sticky note: just its colour.
// (The words are written on the note itself — double-click it.)
import Field from '../../components/shared/Field';

import { NOTE_COLORS } from './colors';

export default function StickyNoteSettings({ props, onChange }) {
  return (
    <>
      <Field label="Colour">
        <div className="flex gap-2">
          {NOTE_COLORS.map((color) => (
            <button
              key={color}
              aria-label={`Colour ${color}`}
              onClick={() => onChange({ color })}
              className={`size-7 rounded-full border-2 ${
                props.color === color ? 'border-ink' : 'border-transparent'
              }`}
              style={{ background: color }}
            />
          ))}
        </div>
      </Field>
      <p className="text-xs leading-relaxed text-ink-soft">
        Double-click the note to write on it. Tap to flip, then double-click to write the back.
      </p>
    </>
  );
}
