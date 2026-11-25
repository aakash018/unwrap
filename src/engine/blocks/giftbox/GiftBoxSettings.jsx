// Toolbar controls for the Gift box: what's inside, the name on its tag, the
// ribbon's colour, and the petals that fly out.

import Field from '../../components/shared/Field';
import TextInput from '../../components/shared/TextInput';
import ColorInput from '../../components/shared/ColorInput';
import { buttonClasses } from '../../components/shared/Button';
import { readFileAsDataURL } from '../../utils/readFileAsDataURL';
import { PETALS } from './petals';
import { PRESENTS } from './presents';

export default function GiftBoxSettings({ props, onChange }) {
  const present = PRESENTS[props.present] ? props.present : 'roses';
  const petals = PETALS[props.petals] ? props.petals : 'marigold';
  return (
    <>
      <Field label="What's inside">
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(PRESENTS).map(([id, { label }]) => (
            <button
              key={id}
              type="button"
              aria-pressed={present === id}
              onClick={() => onChange({ present: id })}
              className={`rounded-md border py-1.5 text-xs ${present === id ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:bg-stone-50'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>
      {present === 'photo' && (
        <Field label="Photo">
          <label className={buttonClasses()}>
            {props.src ? 'Replace' : 'Upload'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) onChange({ src: await readFileAsDataURL(file) });
              }}
            />
          </label>
        </Field>
      )}
      <Field label="Name on the tag">
        <TextInput value={props.tag ?? props.to?.replace(/,$/, '') ?? ''} onChange={(tag) => onChange({ tag })} />
      </Field>
      <Field label="Ribbon">
        <ColorInput value={props.ribbon} onChange={(ribbon) => onChange({ ribbon })} />
      </Field>
      <Field label="Petals">
        <div className="flex gap-2">
          {Object.entries(PETALS).map(([id, { label, colors }]) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              title={label}
              aria-pressed={petals === id}
              onClick={() => onChange({ petals: id })}
              className={`size-7 rounded-full border-2 ${petals === id ? 'border-ink' : 'border-transparent'}`}
              style={{ background: colors[1] }}
            />
          ))}
        </div>
      </Field>
    </>
  );
}
