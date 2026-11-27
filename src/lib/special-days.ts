// Special days: the dates a sender wants to remember (a birthday, an
// anniversary, a day with its own name), from the database
// (supabase/migrations/…_special_days.sql). Only the server uses this, as the
// signed-in sender, who only ever reaches their own.
//
//   listSpecialDays()   all of them, the next one first, with how far away it is
//   addSpecialDay(day)
//   deleteSpecialDay(id)

import { createSupabase } from "@/lib/supabase/server";
import { daysBetween, today } from "./dates";

export type Kind = "birthday" | "anniversary" | "day";

export type SpecialDay = {
  id: string;
  person: string;
  kind: Kind;
  label?: string; // a "day"'s own name: "The day we met"
  month: number;
  day: number;
  year?: number;
  next: string; // its next date, YYYY-MM-DD (today counts)
  inDays: number; // 0: today
  turns?: number; // how old they'll be, or how many years, if `year` is known
};

const pad = (n: number) => String(n).padStart(2, "0");

// The next time month/day comes round from `now` (29 Feb: 28 Feb in other years).
function nextDate(month: number, day: number, now: string): string {
  const year = Number(now.slice(0, 4));
  const on = (y: number) => {
    const last = new Date(Date.UTC(y, month, 0)).getUTCDate();
    return `${y}-${pad(month)}-${pad(Math.min(day, last))}`;
  };
  return on(year) >= now ? on(year) : on(year + 1);
}

type Row = { id: string; person: string; kind: Kind; label: string | null; month: number; day: number; year: number | null };

export async function listSpecialDays(): Promise<SpecialDay[]> {
  const supabase = await createSupabase();
  const { data, error } = await supabase.from("special_days").select("id, person, kind, label, month, day, year");
  if (error) throw error;
  const now = today();
  return (data as Row[])
    .map((row) => {
      const next = nextDate(row.month, row.day, now);
      return {
        id: row.id,
        person: row.person,
        kind: row.kind,
        label: row.label ?? undefined,
        month: row.month,
        day: row.day,
        year: row.year ?? undefined,
        next,
        inDays: daysBetween(now, next),
        turns: row.year ? Number(next.slice(0, 4)) - row.year : undefined,
      };
    })
    .sort((a, b) => a.inDays - b.inDays);
}

export async function addSpecialDay(day: { person: string; kind: Kind; label?: string; month: number; day: number; year?: number }): Promise<void> {
  const supabase = await createSupabase();
  const { error } = await supabase.from("special_days").insert({
    person: day.person.trim().slice(0, 60),
    kind: day.kind,
    label: day.kind === "day" ? day.label?.trim().slice(0, 60) || null : null,
    month: day.month,
    day: day.day,
    year: day.year ?? null,
  });
  if (error) throw error;
}

export async function deleteSpecialDay(id: string): Promise<void> {
  const supabase = await createSupabase();
  const { error } = await supabase.from("special_days").delete().eq("id", id);
  if (error) throw error;
}
