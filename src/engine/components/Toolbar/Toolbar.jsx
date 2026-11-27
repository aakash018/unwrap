// Left side (like Figma's): a narrow rail of tabs, and the panel of the one
// that's open.
//
//   ┌──────┬────────────────┐
//   │ Home │  Layers        │   a gift:        Layers · Basics · Surprises · Themes
//   │──────│  …             │   an invitation: Chapters
//   │Layers│                │
//   │Basics│                │   Basics and Surprises are tiles, each with a
//   │Surpr.│                │   small picture of it (public/elements): click
//   └──────┴────────────────┘   one to add it in the middle of what's in view,
//                                or drag it onto the page (Canvas.jsx: DROP_TYPE).
//
// The selected thing's settings, and a gift's theme, are on the right
// (components/Inspector); saved · ▶ · Publish at the top right (Actions.jsx).
import { BLOCKS } from '../../blocks';
import LayersList from './LayersList';
import ChaptersList from './ChaptersList';
import ThemePicker from '../Inspector/ThemePicker';
import Icon from '../shared/Icon';
import { DROP_TYPE } from '../Canvas/Canvas';

const GIFT_TABS = [
  { id: 'layers', label: 'Layers', icon: 'layers' },
  { id: 'basic', label: 'Basics', icon: 'basics' },
  { id: 'surprise', label: 'Surprises', icon: 'gift' },
  { id: 'theme', label: 'Themes', icon: 'theme' },
];
const INVITATION_TABS = [{ id: 'chapters', label: 'Chapters', icon: 'chapters' }];

// a button in the rail: an icon in a rounded square, its name under it
function RailButton({ icon, label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className="group flex w-full flex-col items-center gap-1 py-1.5 text-[10px] text-ink">
      <span className={`grid size-9 place-items-center rounded-lg ${active ? 'bg-accent/10 text-accent' : 'text-ink group-hover:bg-stone-100'}`}>
        <Icon name={icon} size={17} />
      </span>
      <span className={active ? 'font-medium text-accent' : ''}>{label}</span>
    </button>
  );
}

// what can be added from a group, as tiles: a picture of it (made from the
// real element, see CLAUDE.md) and its name. Click, or drag onto the page.
function Tiles({ group, onAdd }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {Object.entries(BLOCKS)
        .filter(([, block]) => block.group === group)
        .map(([type, block]) => (
          <button
            key={type}
            type="button"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(DROP_TYPE, type);
              e.dataTransfer.effectAllowed = 'copy';
              const picture = e.currentTarget.querySelector('img');
              if (picture) e.dataTransfer.setDragImage(picture, picture.width / 2, picture.height / 2);
            }}
            onClick={() => onAdd(type)}
            title={`Add ${block.label}: click, or drag it onto the page`}
            className="flex cursor-grab flex-col items-center gap-1.5 rounded-lg border border-line bg-stone-50/60 px-2 pt-3 pb-2 text-[11px] text-ink hover:border-accent/40 hover:bg-accent/5 active:cursor-grabbing"
          >
            <span className="grid h-16 w-full place-items-center">
              <img src={`/elements/${type}.webp`} alt="" draggable={false} className="max-h-16 max-w-[88%] object-contain drop-shadow-sm" />
            </span>
            {block.label}
          </button>
        ))}
    </div>
  );
}

// `open` / `onOpen`: which tab shows (the editor keeps it, so the right panel
// can open the Theme tab)
export default function Toolbar({ page, dispatch, onAdd, onHome, open, onOpen }) {
  const tabs = page.kind === 'invitation' ? INVITATION_TABS : GIFT_TABS;
  const tab = tabs.find(({ id }) => id === open) ?? tabs[0];

  return (
    <aside className="flex min-h-0 border-r border-line bg-white">
      <nav aria-label="Panels" className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-line pt-1.5">
        <RailButton icon="home" label="Home" onClick={onHome} />
        <span className="my-1 h-px w-8 bg-line" />
        {tabs.map(({ id, label, icon }) => (
          <RailButton key={id} icon={icon} label={label} active={tab.id === id} onClick={() => onOpen(id)} />
        ))}
      </nav>

      <div data-scroll className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="flex h-11 shrink-0 items-center border-b border-line px-3 text-[12px] font-semibold">{tab.label}</header>
        <div className="p-2">
          {tab.id === 'layers' && <LayersList page={page} dispatch={dispatch} />}
          {tab.id === 'chapters' && <ChaptersList page={page} dispatch={dispatch} />}
          {(tab.id === 'surprise' || tab.id === 'basic') && <Tiles group={tab.id} onAdd={onAdd} />}
          {tab.id === 'theme' && <ThemePicker page={page} dispatch={dispatch} />}
        </div>
      </div>
    </aside>
  );
}
