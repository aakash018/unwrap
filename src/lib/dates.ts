// Days, counted in Nepal's time. A day is text like "2026-12-01".

const ZONE = "Asia/Kathmandu";
const DAY_MS = 24 * 60 * 60 * 1000;

const toMs = (day: string) => Date.parse(`${day}T00:00:00Z`);

// The day it is (or was at `time`).
export function today(time = Date.now()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONE }).format(time);
}

export function addDays(day: string, count: number): string {
  return new Date(toMs(day) + count * DAY_MS).toISOString().slice(0, 10);
}

// How many days from `from` to `to` (negative if `to` was earlier).
export function daysBetween(from: string, to: string): number {
  return Math.round((toMs(to) - toMs(from)) / DAY_MS);
}

// "1 December 2026"
export function longDate(day: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(toMs(day));
}

// "Tuesday 1 December"
export function weekdayDate(day: string): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(toMs(day));
}

// "today", "tomorrow", "in 7 days", "yesterday", "7 days ago"
export function fromToday(day: string, now: string): string {
  const days = daysBetween(now, day);
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(days, "day");
}
