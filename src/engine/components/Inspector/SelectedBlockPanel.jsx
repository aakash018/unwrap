// The selected element's settings, in the right panel: its layer order
// and delete (small icon buttons), its exact position, then its own
// settings (from the registry, e.g. a gift box's message).
import { BLOCKS } from '../../blocks';
import { SETTINGS } from '../../blocks/settings';
import Section from '../Toolbar/Section';
import FrameFields from './FrameFields';
import Icon from '../shared/Icon';
import { TEXT_SIZE } from '../../page/layouts';

// A small square icon button.
function IconButton({ icon, label, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex size-7 items-center justify-center rounded-md hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent ${danger ? 'text-red-700' : 'text-ink'}`}
    >
      <Icon name={icon} size={15} />
    </button>
  );
}

export default function SelectedBlockPanel({ block, index, total, layout, dispatch, sectionIds = [] }) {
  const { editableText, section } = BLOCKS[block.type];
  const Settings = SETTINGS[block.type];
  const update = (props) => {
    // (in a wide layout, words are aligned for that layout only)
    if ('align' in props && layout !== 'mobile') dispatch({ type: 'UPDATE_FRAME', id: block.id, frame: props });
    else dispatch({ type: 'UPDATE_BLOCK', id: block.id, props });
  };
  const remove = () => dispatch({ type: 'REMOVE_BLOCK', id: block.id });

  // the order buttons: sections swap places with each other; other
  // elements move back and forward among the layers
  let actions;
  if (section) {
    const at = sectionIds.indexOf(block.id);
    const move = (direction) => dispatch({ type: 'MOVE_SECTION', id: block.id, direction });
    actions = (
      <>
        <IconButton icon="up" label="Move up" disabled={at <= 0} onClick={() => move('up')} />
        <IconButton icon="down" label="Move down" disabled={at === sectionIds.length - 1} onClick={() => move('down')} />
      </>
    );
  } else {
    const moveLayer = (direction) => dispatch({ type: 'MOVE_LAYER', id: block.id, direction });
    actions = (
      <>
        <IconButton icon="down" label="Send back" disabled={index <= sectionIds.length} onClick={() => moveLayer('backward')} />
        <IconButton icon="up" label="Bring forward" disabled={index === total - 1} onClick={() => moveLayer('forward')} />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-0.5 border-b border-line px-2 py-1.5">
        {actions}
        <span className="flex-1" />
        <IconButton icon="trash" label="Delete" danger onClick={remove} />
      </div>

      {!section && (
        <Section title="Position">
          <FrameFields frame={block.frame} defaultSize={TEXT_SIZE[block.type]} onChange={(frame) => dispatch({ type: 'UPDATE_FRAME', id: block.id, frame })} />
        </Section>
      )}

      {Settings && (
        <Section title="Settings">
          <div className="flex flex-col gap-3 px-1 pb-1">
            <Settings props={block.props} onChange={update} />
          </div>
        </Section>
      )}

      {!section && (
        <p className="px-3 py-3 text-[11px] leading-relaxed text-ink-soft">
          Drag to move · handles to resize · ↻ to rotate (Shift snaps){editableText && ' · double-click to type'}
        </p>
      )}
    </>
  );
}
