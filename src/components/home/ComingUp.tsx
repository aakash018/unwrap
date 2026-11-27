// The special days you've asked to remember, the next first, in a card in
// Home's side column: a small calendar date, whose, which day, how soon.
// "Add" opens a small box (a name, what kind, the date). Each can be
// forgotten again (its × shows on hover). (lib/special-days.ts)
"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { forgetDay, rememberDay } from "@/app/projects/special-days";
import { longDate } from "@/lib/dates";
import type { SpecialDay } from "@/lib/special-days";
import Dialog from "./Dialog";
import Icon from "./Icon";
import { CARD, INPUT, PRIMARY, SECONDARY } from "./styles";

const KIND_NAMES = { birthday: "Birthday", anniversary: "Anniversary", day: "Special day" };

const MONTH = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });
const soon = (days: number) => (days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`);

export default function ComingUp({ days }: { days: SpecialDay[] }) {
  const router = useRouter();
  const box = useRef<HTMLDialogElement>(null);
  const [kind, setKind] = useState<"birthday" | "anniversary" | "day">("birthday");
  const [problem, setProblem] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget; // (kept: the event is gone after the wait)
    const form = new FormData(formElement);
    setSaving(true);
    const done = await rememberDay({
      person: String(form.get("person") ?? ""),
      kind,
      label: String(form.get("label") ?? ""),
      date: String(form.get("date") ?? ""),
    }).catch(() => ({ ok: false, problem: "That didn't work. Check your connection." }) as const);
    setSaving(false);
    if (!done.ok) return setProblem(done.problem);
    setProblem("");
    formElement.reset();
    box.current?.close();
    router.refresh();
  };

  const forget = async (day: SpecialDay) => {
    if (!window.confirm(`Stop remembering ${day.person}'s ${KIND_NAMES[day.kind].toLowerCase()}?`)) return;
    await forgetDay(day.id);
    router.refresh();
  };

  return (
    <section aria-label="Coming up" className={`${CARD} px-5 pt-5 pb-3`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-[-0.01em]">Coming up</h2>
        <button type="button" onClick={() => box.current?.showModal()} className={`${SECONDARY} h-8 gap-1.5 px-2.5 text-[13px]`}>
          <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden>
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Add
        </button>
      </div>

      {days.length ? (
        <ul className="-mx-2 mt-3">
          {days.slice(0, 5).map((day) => (
            <li key={day.id} className="group flex items-center gap-3 rounded-[10px] p-2 hover:bg-hover">
              <span aria-hidden className="flex h-[46px] w-11 shrink-0 flex-col items-center justify-center rounded-[10px] border border-line/80 bg-white">
                <span className="text-[11px] leading-none font-semibold text-[#a12a3b]">{MONTH.format(Date.parse(`${day.next}T00:00:00Z`))}</span>
                <span className="mt-[3px] text-[17px] leading-none font-semibold">{Number(day.next.slice(8))}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{day.person}</span>
                <span className="block truncate text-[13px] text-soft">
                  {day.kind === "day" ? day.label || "Special day" : KIND_NAMES[day.kind]}
                  {day.turns ? (day.kind === "birthday" ? ` · turns ${day.turns}` : day.kind === "anniversary" ? ` · ${day.turns} ${day.turns === 1 ? "year" : "years"}` : "") : ""}
                  <span className="sr-only">, {longDate(day.next)}</span>
                </span>
              </span>
              <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap group-hover:hidden group-focus-within:hidden ${day.inDays <= 14 ? "bg-[#f8eaec] text-[#7a2232]" : "bg-canvas text-soft"}`}>{soon(day.inDays)}</span>
              <button type="button" onClick={() => forget(day)} aria-label={`Forget ${day.person}'s day`} className="hidden size-7 shrink-0 cursor-pointer place-items-center rounded-md text-soft group-hover:grid group-focus-within:grid hover:bg-ink/5 hover:text-ink">
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 pb-2 text-sm leading-relaxed text-soft">Add birthdays and anniversaries, and they&apos;ll show up here before they come round.</p>
      )}

      <Dialog ref={box} title="Add a special day">
        <form onSubmit={add} className="flex flex-col gap-5 p-6">
          <fieldset className="flex gap-2">
            <legend className="mb-2 text-sm text-soft">What is it?</legend>
            {(["birthday", "anniversary", "day"] as const).map((one) => (
              <button
                key={one}
                type="button"
                onClick={() => setKind(one)}
                aria-pressed={kind === one}
                className={`h-9 cursor-pointer rounded-full border px-4 text-sm ${kind === one ? "border-ink bg-ink text-white" : "border-line hover:bg-hover"}`}
              >
                {KIND_NAMES[one]}
              </button>
            ))}
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="mb-2 block text-sm text-soft">{kind === "anniversary" ? "With" : "Whose"}</span>
              <input name="person" required maxLength={60} autoComplete="off" placeholder="Soni" className={INPUT} />
            </label>
            <label>
              <span className="mb-2 block text-sm text-soft">{kind === "birthday" ? "Birthday" : kind === "anniversary" ? "The day it began" : "Date"}</span>
              <input name="date" type="date" required className={INPUT} />
            </label>
          </div>
          {kind === "day" && (
            <label>
              <span className="mb-2 block text-sm text-soft">What&apos;s the day?</span>
              <input name="label" maxLength={60} autoComplete="off" placeholder="The day we met" className={INPUT} />
            </label>
          )}
          <div className="flex items-center justify-end gap-4">
            {problem && (
              <p role="alert" className="text-sm text-wine">
                {problem}
              </p>
            )}
            <button type="submit" disabled={saving} className={PRIMARY}>
              {saving ? "Saving…" : "Remember it"}
            </button>
          </div>
        </form>
      </Dialog>
    </section>
  );
}
