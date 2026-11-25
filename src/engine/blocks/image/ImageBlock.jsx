// A photo. Starts as an empty "pick a photo" box until an image is chosen.
// It fills the element's width and keeps its own shape (height follows).
import { readFileAsDataURL } from '../../utils/readFileAsDataURL';

export default function ImageBlock({ props, onChange, preview }) {
  if (!props.src) {
    if (preview) return null; // receivers don't see an empty photo slot
    return (
      <label className="flex h-50 items-center justify-center rounded-xl border-2 border-dashed border-line bg-white/50 text-sm text-ink-soft hover:border-accent hover:text-accent">
        <span>Click to add a photo</span>
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
    );
  }

  return <img className="block w-full rounded-xl" src={props.src} alt={props.alt} draggable={false} />;
}
