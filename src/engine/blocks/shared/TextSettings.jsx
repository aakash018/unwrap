// Toolbar controls for text-like blocks (Heading, Text): alignment + colour.
import Field from '../../components/shared/Field';
import ColorInput from '../../components/shared/ColorInput';

const ALIGNMENTS = ['left', 'center', 'right'];

export default function TextSettings({ props, onChange }) {
  return (
    <>
      <Field label="Alignment">
        <div className="flex divide-x divide-line overflow-hidden rounded-lg border border-line">
          {ALIGNMENTS.map((align) => (
            <button
              key={align}
              className={`flex-1 py-1.5 text-xs capitalize ${
                props.align === align ? 'bg-ink text-white' : 'bg-white hover:bg-stone-50'
              }`}
              onClick={() => onChange({ align })}
            >
              {align}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Colour">
        <ColorInput value={props.color} onChange={(color) => onChange({ color })} />
      </Field>
    </>
  );
}
