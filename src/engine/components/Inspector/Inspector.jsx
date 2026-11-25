// Right panel (Figma's "Design" panel): the selected element's settings —
// or, with nothing selected, a gift's theme. An invitation has no theme (its
// chapters bring their own scenery), so there the panel isn't shown until
// something is selected (see Editor.jsx).
export const showsInspector = (page) => Boolean(page.selectedId) || page.kind === 'gift';
import { BLOCKS } from '../../blocks';
import SelectedBlockPanel from './SelectedBlockPanel';
import ThemePicker from './ThemePicker';
import Section from '../Toolbar/Section';

export default function Inspector({ page, dispatch }) {
  const selected = page.blocks.find((b) => b.id === page.selectedId);
  const sectionIds = page.blocks.filter((b) => BLOCKS[b.type]?.section).map((b) => b.id);

  return (
    <aside className="flex flex-col overflow-y-auto border-l border-line bg-white">
      <header className="flex h-11 shrink-0 items-center border-b border-line px-3 text-[12px] font-semibold">
        {selected ? BLOCKS[selected.type].label : 'Gift'}
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
        <Section title="Theme">
          <ThemePicker page={page} dispatch={dispatch} />
        </Section>
      )}
    </aside>
  );
}
