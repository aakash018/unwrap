// Toolbar controls for the Voice note: record from the mic or upload a file,
// plus the label written on the tape.
import { useRef, useState } from 'react';
import Field from '../../components/shared/Field';
import TextInput from '../../components/shared/TextInput';
import Button, { buttonClasses } from '../../components/shared/Button';
import { readFileAsDataURL } from '../../utils/readFileAsDataURL';

export default function VoiceNoteSettings({ props, onChange }) {
  const recorderRef = useRef(null);
  const [recording, setRecording] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop()); // turn the mic off
        const blob = new Blob(chunks, { type: recorder.mimeType });
        onChange({ src: await readFileAsDataURL(blob) });
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      alert('Could not use the microphone. Check your browser permissions.');
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <>
      <Field label="Recording">
        <div className="flex flex-wrap gap-2">
          {recording ? (
            <Button variant="danger" onClick={stopRecording}>
              ■ Stop
            </Button>
          ) : (
            <Button onClick={startRecording}>● Record</Button>
          )}

          <label className={buttonClasses()}>
            Upload
            <input
              type="file"
              accept="audio/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) onChange({ src: await readFileAsDataURL(file) });
              }}
            />
          </label>

          {props.src && !recording && <Button onClick={() => onChange({ src: '' })}>Clear</Button>}
        </div>
        {!props.src && !recording && <span className="text-xs leading-relaxed text-ink-soft">Until you record something, they won&apos;t see this.</span>}
        {recording && <span className="text-xs text-red-700">Recording… press Stop when done.</span>}
      </Field>

      <Field label="Label on the tape">
        <TextInput value={props.label} onChange={(label) => onChange({ label })} />
      </Field>
    </>
  );
}
