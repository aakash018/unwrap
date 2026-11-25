// An invitation's chapters, in the order guests see them. Click one to select
// it. Chapters that were removed can be put back, with their first words.
import { BLOCKS } from '../../blocks';
import { TEMPLATES } from '../../templates';
import Section from './Section';

const ROW = 'flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[12px]';

export default function ChaptersList({ page, dispatch }) {
  const template = TEMPLATES[page.template];
  const all = template?.chapters() ?? [];
  const order = all.map(({ type }) => type);
  const removed = all.filter(({ type }) => !page.blocks.some((block) => block.type === type));

  return (
    <>
      <Section title={template?.label ?? 'Chapters'}>
        {page.blocks.map((block, i) => {
          const selected = block.id === page.selectedId;
          return (
            <button
              key={block.id}
              type="button"
              aria-pressed={selected}
              onClick={() => dispatch({ type: 'SELECT_BLOCK', id: block.id })}
              className={`${ROW} ${selected ? 'bg-accent/10 text-accent' : 'hover:bg-stone-100'}`}
            >
              <span className={`w-4 text-center tabular-nums ${selected ? '' : 'text-ink-soft'}`}>{i + 1}</span>
              <span className="truncate">{BLOCKS[block.type]?.label ?? block.type}</span>
            </button>
          );
        })}
        <p className="px-2 pt-2 text-[11px] leading-relaxed text-ink-soft">Double-click a chapter to change its words.</p>
      </Section>

      {removed.length > 0 && (
        <Section title="Removed">
          {removed.map((chapter) => (
            <button key={chapter.type} type="button" className={`${ROW} hover:bg-stone-100`} onClick={() => dispatch({ type: 'ADD_CHAPTER', chapter, order })}>
              <span className="w-4 text-center text-accent">+</span>
              Put back “{BLOCKS[chapter.type].label}”
            </button>
          ))}
        </Section>
      )}
    </>
  );
}
