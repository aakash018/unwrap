// What the gift's loader says while it opens (page/Loader.jsx): who it's for,
// and the few words above their name. The words are typed, or picked from a
// few suggestions under the ▾ (founder, 27 Nov 2026: the chips were clutter).
import { useEffect, useRef, useState } from 'react';
import Field from '../shared/Field';
import TextInput from '../shared/TextInput';
import Icon from '../shared/Icon';
import { OPENING_WORDS, WORDS_SUGGESTED } from '../../page/Loader';

const MOST = 40; // letters: it's one quiet line

export default function OpeningSettings({ page, dispatch }) {
  const { name = '', words = OPENING_WORDS } = page.opening ?? {};
  const set = (opening) => dispatch({ type: 'SET_OPENING', opening });
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  // closes when you press outside it, or Escape
  useEffect(() => {
    if (!open) return undefined;
    const onPress = (e) => !box.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPress);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPress);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="flex flex-col gap-2.5 px-1 pb-1">
      <Field label="Who it's for">
        <TextInput value={name} placeholder="Their name" maxLength={30} onChange={(next) => set({ name: next })} />
      </Field>
      <Field label="Words above their name">
        <div ref={box} className="relative">
          <TextInput value={words} placeholder="None" maxLength={MOST} className="pr-7 font-dev" onChange={(next) => set({ words: next })} />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Suggestions"
            aria-expanded={open}
            className="absolute inset-y-0 right-0 grid w-7 place-items-center rounded-r-md text-ink-soft hover:text-ink"
          >
            <Icon name="chevron" size={12} className={`transition-transform ${open ? '-rotate-90' : 'rotate-90'}`} />
          </button>
          {open && (
            <div className="absolute inset-x-0 top-full z-20 mt-1 flex flex-col rounded-md border border-line bg-white p-1 shadow-lg">
              {WORDS_SUGGESTED.map((one) => (
                <button
                  key={one}
                  type="button"
                  onClick={() => {
                    set({ words: one });
                    setOpen(false);
                  }}
                  className={`rounded px-2 py-1.5 text-left font-dev text-[12px] hover:bg-stone-100 ${one === words ? 'text-accent' : 'text-ink'}`}
                >
                  {one}
                </button>
              ))}
            </div>
          )}
        </div>
      </Field>
    </div>
  );
}
