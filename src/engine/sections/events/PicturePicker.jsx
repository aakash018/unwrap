// The toolbar's picker for a ceremony's round picture (chapter 2).
//
// A row of small round thumbnails, one for each painted scene of the
// invite's look (pictures.js), plus "Auto" (guess from the ceremony's name, never repeating
// a picture already on the page). The thumbnails are painted once and kept.
//
//   value    – the scene picked for this ceremony ('' = Auto)
//   shown    – the scene it shows now (what Auto chose)
//   look     – the invite's look ('hindu' or 'garden'): which scenes to offer
//   onChange – called with a scene's name, or '' for Auto

import { useEffect, useState } from 'react';
import { PICTURES, PICTURE_NAMES, picturesOf } from './pictures';

const SIZE = 280; // the size the scenes are painted at
const THUMB = 34;
const thumbs = new Map(); // scene → picture (data URL)

// Paint a scene once, small, with its moving part frozen (so flames show).
function thumbnailOf(kind) {
  if (!thumbs.has(kind)) {
    const canvas = document.createElement('canvas');
    const scale = (THUMB * 2) / SIZE; // sharp on a retina screen
    canvas.width = canvas.height = THUMB * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.__s = scale;
    PICTURES[kind].paint(ctx, SIZE);
    PICTURES[kind].live?.(SIZE)(ctx, 1, 0);
    thumbs.set(kind, canvas.toDataURL('image/jpeg', 0.85));
  }
  return thumbs.get(kind);
}

export default function PicturePicker({ value, shown, look, onChange }) {
  // painted after the first render, so opening the toolbar stays quick
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const ring = (on) => (on ? 'ring-2 ring-ink ring-offset-2' : 'ring-1 ring-line hover:ring-ink-soft');

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange('')}
        aria-pressed={!value}
        title="Guess from the ceremony's name"
        className={`flex size-[34px] items-center justify-center rounded-full text-[10px] ${ring(!value)}`}
      >
        Auto
      </button>
      {picturesOf(look).map((kind) => (
        <button
          key={kind}
          type="button"
          onClick={() => onChange(kind)}
          aria-pressed={value === kind}
          aria-label={PICTURE_NAMES[kind]}
          title={PICTURE_NAMES[kind]}
          className={`size-[34px] overflow-hidden rounded-full bg-stone-200 ${ring(value === kind)} ${!value && shown === kind ? 'outline-2 outline-offset-4 outline-dashed outline-ink-soft/50' : ''}`}
        >
          {ready && <img src={thumbnailOf(kind)} alt="" className="size-full" draggable={false} />}
        </button>
      ))}
    </div>
  );
}
