// A theme's ready-made gifts (its surprises and words already in place:
// ready-made/), shown under the Theme row in the right panel when it's opened
// (Inspector.jsx). Choosing one asks, then starts the page again from it,
// keeping who it's for (START_FROM in pageReducer.js).
import { readyMade } from '../../ready-made';
import { READY_MADE_NAMES } from '../../ready-made/names';
import { FORMAT } from '../../page/format';
import { THEMES } from '../../themes';
import { COVERS } from '../../../covers';

function startFrom(page, dispatch, { id, name }) {
  if (!window.confirm(`Start again from "${name}"? Everything on the page now will be replaced (who it's for stays).`)) return;
  const saved = { format: FORMAT, kind: 'gift', background: page.background, opening: page.opening, ...readyMade(id, { to: page.opening?.name?.trim() || undefined }) };
  dispatch({ type: 'START_FROM', saved });
}

export default function ReadyMades({ page, dispatch, onShowThemes }) {
  const mine = READY_MADE_NAMES.filter(({ theme }) => theme === page.theme);
  const themeName = THEMES[page.theme]?.label ?? page.theme;

  return (
    <div className="flex flex-col gap-1.5">
      {mine.length ? (
        <>
          {mine.map((one) => (
            <button
              key={one.id}
              type="button"
              onClick={() => startFrom(page, dispatch, one)}
              className="group relative flex gap-3 overflow-hidden rounded-lg p-2 text-left ring-1 ring-accent/20 transition hover:-translate-y-px hover:ring-accent/40"
              // a soft warm glow: light from the top left, gold at the far corner, and a halo around it
              style={{
                background: 'radial-gradient(120% 90% at 0% 0%, rgba(180, 67, 47, 0.14), transparent 60%), radial-gradient(90% 80% at 100% 100%, rgba(232, 181, 74, 0.22), transparent 65%), #fff',
                boxShadow: '0 6px 22px -8px rgba(180, 67, 47, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
              }}
            >
              <span className="block h-[92px] w-[66px] shrink-0 overflow-hidden rounded-md bg-stone-100 shadow-md ring-1 ring-black/5">
                {COVERS[one.id] && <img src={COVERS[one.id].src} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />}
              </span>
              <span className="flex min-w-0 flex-col py-0.5">
                <span className="text-[12px] font-medium text-ink">{one.name}</span>
                <span className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-ink-soft">{one.note.replace(/^[^.]+\.\s*/, '')}</span>
                <span className="mt-auto pt-1 text-[11px] font-medium text-accent">
                  Start from this <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </span>
            </button>
          ))}
        </>
      ) : (
        <span className="text-[11px] leading-snug text-ink-soft">No ready-made gift on {themeName} yet. Love, Birthday and Anniversary each have one.</span>
      )}
      <button type="button" onClick={onShowThemes} className="self-start rounded px-1 py-0.5 text-[11px] text-accent hover:underline">
        Change theme
      </button>
    </div>
  );
}
