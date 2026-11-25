// Toolbar controls for the Image block: replace or clear the photo.
import Field from '../../components/shared/Field';
import Button, { buttonClasses } from '../../components/shared/Button';
import { readFileAsDataURL } from '../../utils/readFileAsDataURL';

export default function ImageSettings({ props, onChange }) {
  return (
    <Field label="Photo">
      <div className="flex gap-2">
        {/* A <label> styled like a button, so clicking it opens the file picker */}
        <label className={buttonClasses()}>
          {props.src ? 'Replace' : 'Upload'}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) onChange({ src: await readFileAsDataURL(file), alt: file.name });
            }}
          />
        </label>

        {props.src && <Button onClick={() => onChange({ src: '', alt: '' })}>Clear</Button>}
      </div>
    </Field>
  );
}
