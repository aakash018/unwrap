// Toolbar controls for a Hidden message: its words.

import Field from '../../components/shared/Field';
import TextArea from '../../components/shared/TextArea';

export default function SecretSettings({ props, onChange }) {
  return (
    <>
      <Field label="What it says">
        <TextArea rows={4} value={props.message} onChange={(message) => onChange({ message })} />
      </Field>
      <p className="text-xs leading-relaxed text-ink-soft">
        They see only a tiny star. Hide it somewhere they&apos;ll enjoy finding it. When all of them are found, something happens.
      </p>
    </>
  );
}
