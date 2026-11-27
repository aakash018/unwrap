// Asked right after a gift is published (in Publish.tsx): "Remember Soni's
// birthday?" A birthday or an anniversary, and its date; saved as a special
// day (lib/special-days.ts), so Home brings it up before it comes round. Easy
// to skip: it's just there, nothing has to be done.
"use client";

import { useState, type FormEvent } from "react";
import { rememberDay } from "@/app/projects/special-days";
import { INPUT, SECONDARY } from "./styles";

export default function RememberDay({ person }: { person: string }) {
  const [kind, setKind] = useState<"birthday" | "anniversary">("birthday");
  const [state, setState] = useState<"" | "saving" | "saved" | "failed">("");

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const date = String(new FormData(event.currentTarget).get("date") ?? "");
    setState("saving");
    const done = await rememberDay({ person, kind, date }).catch(() => ({ ok: false }) as const);
    setState(done.ok ? "saved" : "failed");
  };

  if (state === "saved") {
    return <p className="mt-6 border-t border-line pt-5 text-sm text-leaf">Saved. You&apos;ll see it on Home before it comes round.</p>;
  }

  return (
    <form onSubmit={save} className="mt-6 border-t border-line pt-5">
      <p className="font-medium">Remember {person}&apos;s {kind}?</p>
      <p className="text-sm text-soft">It shows on Home before it comes round, so you can make something again.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(["birthday", "anniversary"] as const).map((one) => (
          <button
            key={one}
            type="button"
            onClick={() => setKind(one)}
            aria-pressed={kind === one}
            className={`h-9 cursor-pointer rounded-full border px-3.5 text-sm capitalize ${kind === one ? "border-ink bg-ink text-white" : "border-line hover:bg-hover"}`}
          >
            {one}
          </button>
        ))}
        <input name="date" type="date" required aria-label={`${person}'s ${kind}`} className={`${INPUT} w-auto flex-1`} />
        <button type="submit" disabled={state === "saving"} className={SECONDARY}>
          Remember
        </button>
      </div>
      {state === "failed" && (
        <p role="alert" className="mt-2 text-sm text-wine">
          That didn&apos;t work. Please try again.
        </p>
      )}
    </form>
  );
}
