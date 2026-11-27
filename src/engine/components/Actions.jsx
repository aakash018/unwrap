// The editor's actions, at the top right (like Figma's): whether it's saved,
// ▶ preview (opens the page in a new tab, the way people will see the link),
// and Publish. In the right panel's header (Inspector.jsx), or, when there's
// no right panel (an invitation with nothing selected), floating over the
// canvas's top right corner (Canvas.jsx).
//   status   – 'Saved', 'Saving…', 'Not saved! …'
//   publish  – { label, onClick }, or nothing
import Icon from './shared/Icon';

export default function Actions({ status, onPreview, publish }) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <span role="status" title={status} className="mr-1 truncate text-[11px] font-normal text-ink-soft">
        {status}
      </span>
      <button type="button" onClick={onPreview} title="Preview, in a new tab" aria-label="Preview, in a new tab" className="grid size-7 shrink-0 place-items-center rounded-md text-ink hover:bg-stone-100">
        <Icon name="play" size={15} />
      </button>
      {publish && (
        <button type="button" onClick={publish.onClick} className="flex h-6 shrink-0 items-center rounded-md bg-ink px-2 text-[11px] font-medium text-white hover:bg-cocoa">
          {publish.label}
        </button>
      )}
    </div>
  );
}
