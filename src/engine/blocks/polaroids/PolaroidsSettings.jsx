// Toolbar controls for the Polaroid stack: add photos, write captions, remove.
import Field from '../../components/shared/Field';
import TextInput from '../../components/shared/TextInput';
import { buttonClasses } from '../../components/shared/Button';
import { readFileAsDataURL } from '../../utils/readFileAsDataURL';
import { newId } from '../../utils/newId';

export default function PolaroidsSettings({ props, onChange }) {
  const photos = props.photos;

  const addPhotos = async (files) => {
    const added = await Promise.all(
      [...files].map(async (file) => ({
        id: newId(),
        src: await readFileAsDataURL(file),
        caption: '',
      })),
    );
    onChange({ photos: [...photos, ...added] });
  };

  const setPhoto = async (id, file) => {
    const src = await readFileAsDataURL(file);
    onChange({ photos: photos.map((p) => (p.id === id ? { ...p, src } : p)) });
  };
  const setCaption = (id, caption) =>
    onChange({ photos: photos.map((p) => (p.id === id ? { ...p, caption } : p)) });

  const remove = (id) => onChange({ photos: photos.filter((p) => p.id !== id) });

  return (
    <Field label={`Photos · ${photos.length}`}>
      <div className="flex flex-col gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="flex items-center gap-2">
            {/* the photo: press it to choose another */}
            <label title={photo.src ? 'Change the photo' : 'Add the photo'} className="grid size-9 shrink-0 place-items-center overflow-hidden rounded bg-stone-100 text-ink-soft hover:bg-stone-200">
              {photo.src ? <img src={photo.src} alt="" className="size-full object-cover" /> : '+'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files[0]) setPhoto(photo.id, e.target.files[0]);
                  e.target.value = '';
                }}
              />
            </label>
            <TextInput
              value={photo.caption}
              placeholder="Caption…"
              onChange={(caption) => setCaption(photo.id, caption)}
            />
            <button
              className="shrink-0 px-1 text-lg leading-none text-ink-soft hover:text-red-700"
              onClick={() => remove(photo.id)}
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ))}

        <label className={buttonClasses()}>
          + Add photos
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addPhotos(e.target.files);
              e.target.value = ''; // so the same file can be picked again
            }}
          />
        </label>
      </div>
    </Field>
  );
}
