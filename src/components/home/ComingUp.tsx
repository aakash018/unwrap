// The special days you've asked to remember, the next first: whose, which day,
// how soon. "Add a special day" opens a small box (a name, what kind, the
// date). Each can be forgotten again. (lib/special-days.ts)
"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { forgetDay, rememberDay } from "@/app/projects/special-days";
import { longDate } from "@/lib/dates";
import type { SpecialDay } from "@/lib/special-days";
import Dialog from "./Dialog";
import Icon from "./Icon";
import { INPUT, PRIMARY } from "./styles";

const KIND_NAMES = { birthday: "Birthday", anniversary: "Anniversary", day: "Special day" };

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
    <section aria-label="Coming up">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Coming up</h2>
        <button type="button" onClick={() => box.current?.showModal()} className="cursor-pointer text-sm text-soft hover:text-ink">
          + Add a special day
        </button>
      </div>

      {days.length ? (
        <ul className="mt-2">
          {days.slice(0, 5).map((day) => (
            <li key={day.id} className="group flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
              <span className="min-w-0">
                <span className="font-medium">{day.person}</span>
                <span className="text-soft"> · {day.kind === "day" ? day.label || "Special day" : KIND_NAMES[day.kind]}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-sm text-soft">
                {longDate(day.next).replace(/ \d{4}$/, "")}
                <span className={day.inDays <= 14 ? "text-ink" : ""}>· {soon(day.inDays)}</span>
                <button type="button" onClick={() => forget(day)} aria-label={`Forget ${day.person}'s day`} className="grid size-7 cursor-pointer place-items-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-ink/5 focus-visible:opacity-100">
                  <Icon name="close" size={14} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-soft">Birthdays and anniversaries you add show up here, so you never miss one.</p>
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
