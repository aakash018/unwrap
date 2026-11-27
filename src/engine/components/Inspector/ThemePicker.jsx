// The left rail's Theme tab (Toolbar.jsx): a small live preview of each
// background to choose from. (A theme's ready-made gifts are under it in the
// right panel: ReadyMades.jsx; "Plain"'s colour too: Inspector.jsx.)
import { THEMES, THEME_ORDER } from '../../themes';
import ThemeThumbnail from '../../themes/ThemeThumbnail';

export default function ThemePicker({ page, dispatch }) {
  return (
    <div className="flex flex-col gap-3 px-1 pb-1">
      <div className="grid grid-cols-2 gap-1.5">
        {THEME_ORDER.map((id) => {
          const theme = THEMES[id];
          const active = page.theme === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => dispatch({ type: 'SET_THEME', theme: id })}
              aria-pressed={active}
              className={`flex flex-col gap-1 rounded-md p-1 text-left ${active ? 'bg-accent/10 ring-1 ring-accent' : 'hover:bg-stone-100'}`}
            >
              <ThemeThumbnail themeId={id} color={page.background} />
              <span className="flex items-baseline justify-between px-0.5">
                <span className="text-[11px]">{theme.label}</span>
                <span className="font-dev text-[10px] text-ink-soft">{theme.nepali}</span>
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
