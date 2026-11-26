// What the gift's loader says while it opens (page/Loader.jsx): who it's for,
// and the few words above their name. A few suggestions, or their own words.
import Field from '../shared/Field';
import TextInput from '../shared/TextInput';
import { OPENING_WORDS, WORDS_SUGGESTED } from '../../page/Loader';

const MOST = 40; // letters: it's one quiet line

export default function OpeningSettings({ page, dispatch }) {
  const { name = '', words = OPENING_WORDS } = page.opening ?? {};
  const set = (opening) => dispatch({ type: 'SET_OPENING', opening });
  return (
    <div className="flex flex-col gap-3 px-1 pb-1">
      <Field label="Who it's for">
        <TextInput value={name} placeholder="Their name" maxLength={30} onChange={(next) => set({ name: next })} />
      </Field>
      <Field label="Words above their name">
        <TextInput value={words} placeholder="None" maxLength={MOST} className="font-dev" onChange={(next) => set({ words: next })} />
        <div className="mt-0.5 flex flex-wrap gap-1">
          {WORDS_SUGGESTED.filter((one) => one !== words).map((one) => (
            <button key={one} type="button" onClick={() => set({ words: one })} className="rounded-full bg-stone-100 px-2 py-0.5 font-dev text-[11px] text-ink hover:bg-stone-200">
              {one}
            </button>
          ))}
        </div>
      </Field>
      <p className="text-[11px] leading-snug text-ink-soft">Shown with a gold bow while the gift opens.</p>
    </div>
  );
}
