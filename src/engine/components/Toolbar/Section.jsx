// A titled group in a panel, Figma style: a small bold title you can click
// to fold the group away (a little chevron shows which way).
//   <Section title="Layers" action={<button>…</button>}>…</Section>
import { useState } from 'react';
import Icon from '../shared/Icon';

export default function Section({ title, children, defaultOpen = true, action }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-line px-2 py-2">
      <div className="flex h-7 items-center">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex flex-1 items-center gap-1 rounded-md px-1 text-[11px] font-semibold text-ink hover:bg-stone-100">
          <Icon name="chevron" size={12} className={`text-ink-soft transition-transform ${open ? 'rotate-90' : ''}`} />
          {title}
        </button>
        {action}
      </div>
      {open && <div className="mt-1 flex flex-col gap-0.5">{children}</div>}
    </section>
  );
}
