// Toolbar controls for the Letter: the message + envelope and seal colours.
import Field from '../../components/shared/Field';
import TextArea from '../../components/shared/TextArea';
import ColorInput from '../../components/shared/ColorInput';

export default function LetterSettings({ props, onChange }) {
  return (
    <>
      <Field label="Letter">
        <TextArea rows={6} value={props.message} onChange={(message) => onChange({ message })} />
      </Field>
      <div className="flex gap-6">
        <Field label="Envelope">
          <ColorInput
            value={props.envelopeColor}
            onChange={(envelopeColor) => onChange({ envelopeColor })}
          />
        </Field>
        <Field label="Wax seal">
          <ColorInput value={props.sealColor} onChange={(sealColor) => onChange({ sealColor })} />
        </Field>
      </div>
    </>
  );
}
