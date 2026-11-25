// Toolbar controls for the sections.
// Words are edited on the page itself (double-click the section); these are
// for the things you can't type there: photos, links, adding/removing items.

import Field from '../../components/shared/Field';
import TextInput, { INPUT_CLASSES } from '../../components/shared/TextInput';
import Button, { buttonClasses } from '../../components/shared/Button';
import { readFileAsDataURL } from '../../utils/readFileAsDataURL';
import PicturePicker from '../events/PicturePicker';
import { picturesFor, PICTURE_NAMES } from '../events/pictures';
import { newId } from '../../utils/newId';

export function EditHint() {
  return <p className="text-[11px] leading-relaxed text-ink-soft">Double-click the section, then click any line to change it.</p>;
}

// Add / remove rows of a list (events, things to know).
// `blank()` makes a new row.
function ListControls({ items, onChange, blank, label, nameOf }) {
  return (
    <Field label={label}>
      <div className="flex flex-col gap-1.5">
        {items.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-[12px]">{nameOf(entry) || 'Untitled'}</span>
            <Button aria-label={`Remove ${nameOf(entry)}`} onClick={() => onChange(items.filter((_, k) => k !== i))}>
              ✕
            </Button>
          </div>
        ))}
        <Button onClick={() => onChange([...items, blank()])}>Add one</Button>
      </div>
    </Field>
  );
}

export function EventsSettings({ props, onChange }) {
  return (
    <>
      <EditHint />
      <ListControls
        label="Events"
        items={props.events}
        nameOf={(e) => e.name}
        blank={() => ({ id: newId(), name: 'New event', dev: 'कार्यक्रम', bs: 'मंसिर —, —बार', when: 'Day · date · time', date: '', time: '', where: 'Where it happens' })}
        onChange={(events) => onChange({ events })}
      />
      {/* each ceremony's round picture: guessed from its name, or picked here */}
      <Field label="Pictures">
        <div className="flex flex-col gap-3">
          {props.events.map((event, i) => {
            const shown = picturesFor(props.events, props.look)[i];
            return (
              <div key={i} className="flex flex-col gap-1.5">
                <span className="truncate text-[12px] text-ink-soft">
                  {event.name || 'Untitled'} · {PICTURE_NAMES[shown]}
                  {!event.picture && ' (auto)'}
                </span>
                <PicturePicker
                  value={event.picture ?? ''}
                  shown={shown}
                  look={props.look}
                  onChange={(picture) => onChange({ events: props.events.map((e, k) => (k === i ? { ...e, picture } : e)) })}
                />
              </div>
            );
          })}
        </div>
      </Field>
      {/* the real date and time, for guests' "Add to calendar" */}
      <Field label="Date & time (for “Add to calendar”, Nepal time)">
        <div className="flex flex-col gap-2">
          {props.events.map((event, i) => {
            const set = (change) => onChange({ events: props.events.map((e, k) => (k === i ? { ...e, ...change } : e)) });
            return (
              <div key={i} className="flex flex-col gap-1">
                <span className="truncate text-[12px] text-ink-soft">{event.name || 'Untitled'}</span>
                <div className="flex gap-1.5">
                  <input type="date" aria-label={`${event.name} date`} className={INPUT_CLASSES} value={event.date ?? ''} onChange={(e) => set({ date: e.target.value })} />
                  <input type="time" aria-label={`${event.name} time`} className={`${INPUT_CLASSES} w-[110px] shrink-0`} value={event.time ?? ''} onChange={(e) => set({ time: e.target.value })} />
                </div>
              </div>
            );
          })}
        </div>
      </Field>
      <Field label="Search Google Maps for">
        <TextInput value={props.mapQuery} onChange={(mapQuery) => onChange({ mapQuery })} placeholder={props.venue} />
      </Field>
    </>
  );
}

export function DetailsSettings({ props, onChange }) {
  return (
    <>
      <EditHint />
      <ListControls
        label="Things to know"
        items={props.items}
        nameOf={(e) => e.title}
        blank={() => ({ title: 'Something to know', text: 'A line or two about it.' })}
        onChange={(items) => onChange({ items })}
      />
      <Field label="RSVP link (form, WhatsApp, Viber…)">
        <TextInput value={props.rsvpLink} onChange={(rsvpLink) => onChange({ rsvpLink })} placeholder="https://wa.me/97798…" />
      </Field>
    </>
  );
}

export function CoupleSettings({ props, onChange }) {
  return (
    <>
      <EditHint />
      <Field label="Photo">
        <div className="flex gap-2">
          <label className={buttonClasses()}>
            {props.photo ? 'Replace' : 'Upload'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) onChange({ photo: await readFileAsDataURL(file), photoAlt: file.name });
              }}
            />
          </label>
          {props.photo && <Button onClick={() => onChange({ photo: '', photoAlt: '' })}>Clear</Button>}
        </div>
      </Field>
      <Field label="Wedding day (for the countdown)">
        <input type="date" className={INPUT_CLASSES} value={props.date ?? ''} onChange={(e) => onChange({ date: e.target.value })} />
      </Field>
      <Field label="Line under the countdown">
        <TextInput value={props.countdownNote ?? ''} onChange={(countdownNote) => onChange({ countdownNote })} />
      </Field>
    </>
  );
}
