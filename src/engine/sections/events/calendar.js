// "Add to calendar" and "Map" for one ceremony in chapter 2.
//
// An event has a real date and time (set in the toolbar):
//   { name, date: '2026-11-28', time: '11:00', where }
// Times are Nepal time (UTC+5:45). Each ceremony is put in the calendar as
// three hours long.
//
//   addToCalendar(event) – iPhone / iPad / Mac: downloads a small .ics file,
//                          which opens straight in Apple Calendar;
//                          everything else: opens Google Calendar, filled in
//   mapLink(place)       – a Google Maps search for the venue

const NEPAL_OFFSET_MINUTES = 5 * 60 + 45;
const HOURS = 3;

export const hasTime = (event) => /^\d{4}-\d{2}-\d{2}$/.test(event.date || '') && /^\d{2}:\d{2}$/.test(event.time || '');

export const mapLink = (place) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

// The start and end as UTC, written the way calendars want: 20261128T051500Z
function startAndEnd(event) {
  const [y, m, d] = event.date.split('-').map(Number);
  const [hh, mm] = event.time.split(':').map(Number);
  const start = Date.UTC(y, m - 1, d, hh, mm) - NEPAL_OFFSET_MINUTES * 60000;
  const end = start + HOURS * 3600000;
  const stamp = (ms) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [stamp(start), stamp(end)];
}

const isApple = () => /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);

export function addToCalendar(event) {
  const [start, end] = startAndEnd(event);
  const title = `${event.name} · शुभ विवाह`;
  if (isApple()) {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Unwrap//Wedding invite//EN',
      'BEGIN:VEVENT',
      `UID:${start}-${encodeURIComponent(event.name)}@unwrap`,
      `DTSTAMP:${start}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `LOCATION:${event.where || ''}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.name.replace(/[^\w]+/g, '-') || 'event'}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return;
  }
  const google = new URL('https://calendar.google.com/calendar/render');
  google.searchParams.set('action', 'TEMPLATE');
  google.searchParams.set('text', title);
  google.searchParams.set('dates', `${start}/${end}`);
  google.searchParams.set('location', event.where || '');
  window.open(google.toString(), '_blank', 'noopener');
}
