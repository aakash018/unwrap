// Left panel (Figma's left side). For an invitation: its chapters. For a gift:
// every layer on the page, and what can be added (Basics, Surprises). The
// selected thing's settings, and a gift's theme, are on the right
// (components/Inspector).
import { BLOCKS, GROUPS } from '../../blocks';
import Section from './Section';
import LayersList from './LayersList';
import ChaptersList from './ChaptersList';
import Icon from '../shared/Icon';

// One compact row: an icon and a name.
const ROW = 'flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] hover:bg-stone-100';

export default function Toolbar({ page, dispatch, onAdd, onPreview, onHome, status }) {
  return (
    <aside className="flex flex-col overflow-y-auto border-r border-line bg-white">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-line px-3">
        <button type="button" onClick={onHome} className="-ml-1 flex h-7 items-center rounded-md px-1 text-[12px] font-medium text-ink hover:bg-stone-100">
          ‹&nbsp; Home
        </button>
        <span role="status" className="ml-auto mr-2 text-[11px] text-ink-soft">
          {status}
        </span>
        {/* opens the page in a new tab, the way people will see your link */}
        <button type="button" onClick={onPreview} title="Open a preview in a new tab" className="flex h-6 items-center gap-1 rounded-md bg-ink px-2 text-[11px] font-medium text-white hover:bg-cocoa">
          Preview
          <Icon name="external" size={12} />
        </button>
      </header>

      {page.kind === 'invitation' ? (
        <ChaptersList page={page} dispatch={dispatch} />
      ) : (
        <>
          <Section title="Layers">
            <LayersList page={page} dispatch={dispatch} />
          </Section>

          {GROUPS.map((group) => (
            <Section key={group.id} title={group.title}>
              {Object.entries(BLOCKS)
                .filter(([, block]) => block.group === group.id)
                .map(([type, block]) => (
                  <button key={type} type="button" className={ROW} onClick={() => onAdd(type)} title={`Add ${block.label}`}>
                    <span className="w-4 text-center text-[12px] text-accent">{block.icon}</span>
                    {block.label}
                  </button>
                ))}
            </Section>
          ))}
        </>
      )}
    </aside>
  );
}
