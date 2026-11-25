// Toolbar controls for the Scratch card: the hidden message, the cover text,
// and a button to cover it up again (handy while testing).
import Field from '../../components/shared/Field';
import TextInput from '../../components/shared/TextInput';
import TextArea from '../../components/shared/TextArea';
import Button from '../../components/shared/Button';

export default function ScratchCardSettings({ props, onChange }) {
  return (
    <>
      <Field label="Hidden surprise">
        <TextArea rows={3} value={props.hiddenText} onChange={(hiddenText) => onChange({ hiddenText })} />
      </Field>
      <Field label="Text on the cover">
        <TextInput value={props.coverText} onChange={(coverText) => onChange({ coverText })} />
      </Field>
      <div>
        <Button onClick={() => onChange({ resetKey: Date.now() })}>↺ Cover it again</Button>
      </div>
    </>
  );
}
