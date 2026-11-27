// Right panel (Figma's "Design" panel): the selected element's settings —
// or, with nothing selected, what a gift's loader says and its theme. An invitation has no theme (its
// chapters bring their own scenery), so there the panel isn't shown until
// something is selected (see Editor.jsx).
export const showsInspector = (page) => Boolean(page.selectedId) || page.kind === 'gift';
import { BLOCKS } from '../../blocks';
import SelectedBlockPanel from './SelectedBlockPanel';
import { useState } from 'react';
import OpeningSettings from './OpeningSettings';
import ReadyMades from './ReadyMades';
import Section from '../Toolbar/Section';
import ThemeThumbnail from '../../themes/ThemeThumbnail';
import { THEMES } from '../../themes';
import Icon from '../shared/Icon';
import ColorInput from '../shared/ColorInput';

// a Plain page's colour: a few to pick from, or any (the last swatch)
const PLAIN_COLOURS = ['#fff8f0', '#f6e4dc', '#e6ebdf', '#e2e8ef', '#efe6f2'];

// With nothing selected, a gift's own settings, short enough to see at once
// (founder, 27 Nov 2026: the big theme pictures pushed everything off the
// screen): its theme as one line, which opens to show that theme's
// ready-made gifts (ReadyMades.jsx; the theme pictures are in the left rail's
// Theme tab), a Plain page's colour, and what its loader says.
function GiftSettings({ page, dispatch, onShowThemes }) {
  const theme = THEMES[page.theme] ?? THEMES.plain;
  const [open, setOpen] = useState(true); // the theme's ready-made gifts, showing (at first, yes)
  return (
    <>
      <div className="flex flex-col gap-3 border-b border-line px-3 py-3">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} title="This theme's ready-made gifts" className="-mx-1 flex items-center gap-2.5 rounded-md p-1 text-left hover:bg-stone-100">
          <span className="block h-9 w-7 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-line">
            <span className="block origin-top-left" style={{ zoom: 28 / 110 }}>
              <ThemeThumbnail themeId={page.theme} color={page.background} />
            </span>
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[11px] text-ink-soft">Theme &amp; ready-made</span>
            <span className="text-[12px]">
              {theme.label} <span className="font-dev text-[11px] text-ink-soft">{theme.nepali}</span>
            </span>
          </span>
          <Icon name="chevron" size={12} className={`text-ink-soft transition-transform ${open ? 'rotate-90' : ''}`} />
        </button>
        {open && <ReadyMades page={page} dispatch={dispatch} onShowThemes={onShowThemes} />}

        {page.theme === 'plain' && (
          <div className="flex items-center gap-1.5">
            <span className="mr-auto text-[11px] text-ink-soft">Colour</span>
            {PLAIN_COLOURS.map((colour) => (
              <button
                key={colour}
                type="button"
                aria-label={`Colour ${colour}`}
                aria-pressed={page.background === colour}
                onClick={() => dispatch({ type: 'SET_BACKGROUND', color: colour })}
                className={`size-6 shrink-0 rounded-full ring-1 ring-line ${page.background === colour ? 'outline-2 outline-offset-1 outline-accent' : ''}`}
                style={{ background: colour }}
              />
            ))}
            <ColorInput round custom={!PLAIN_COLOURS.includes(page.background)} value={page.background} onChange={(color) => dispatch({ type: 'SET_BACKGROUND', color })} />
          </div>
        )}
      </div>

      <Section
        title="Opening"
        action={
          <span title="Shown with a gold bow while the gift opens" className="grid size-6 place-items-center text-ink-soft">
            <Icon name="info" size={13} />
          </span>
        }
      >
        <OpeningSettings page={page} dispatch={dispatch} />
      </Section>
    </>
  );
}

// `actions`: saved · ▶ preview · Publish, at the right of its header (Actions.jsx)
// `onShowThemes`: open the left rail's Theme tab
export default function Inspector({ page, dispatch, actions, onShowThemes }) {
  const selected = page.blocks.find((b) => b.id === page.selectedId);
  const sectionIds = page.blocks.filter((b) => BLOCKS[b.type]?.section).map((b) => b.id);

  return (
    <aside className="flex flex-col overflow-y-auto border-l border-line bg-white">
      <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-line px-3 text-[12px] font-semibold">
        <span className="shrink-0">{selected ? BLOCKS[selected.type].label : 'Gift'}</span>
        {actions}
      </header>
      {selected ? (
        <SelectedBlockPanel
          block={selected}
          index={page.blocks.indexOf(selected)}
          total={page.blocks.length}
          layout={page.layout}
          sectionIds={sectionIds}
          dispatch={dispatch}
        />
      ) : (
        <GiftSettings page={page} dispatch={dispatch} onShowThemes={onShowThemes} />
      )}
    </aside>
  );
}
