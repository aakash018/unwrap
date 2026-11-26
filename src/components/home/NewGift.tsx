// "New gift": say who it's for, choose a ready-made gift or just a theme, and
// start.
"use client";

import { useRouter } from "next/navigation";
import { startProgress } from "@/components/PageProgress";
import { useRef, useState, type FormEvent } from "react";
import type { ReadyMadeId, ThemeId } from "@/engine/page/types";
import { newId } from "@/engine/utils/newId";
import { saveDraft } from "@/lib/drafts";
import { editUrl, READY_MADE, THEMES } from "@/lib/projects";
import Cover from "./Cover";
import Dialog from "./Dialog";
import { INPUT, PRIMARY } from "./styles";

const CHOICE = "block rounded-md outline-offset-3 peer-checked:outline-2 peer-checked:outline-ink peer-focus-visible:outline-wine";

export default function NewGift({ owner, name }: { owner: string; name: string }) {
  const box = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [state, setState] = useState<"" | "starting" | "failed">("");

  const start = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const word = (field: string) => String(form.get(field) ?? "").trim();
    const toName = word("to");
    const [from, choice] = word("start").split(":"); // "ready:love-sky" or "theme:love"
    setState("starting");
    try {
      const { startGift } = await import("@/engine/templates/start");
      const id = newId();
      const names = { toName, fromName: word("from") };
      const gift = from === "ready" ? startGift({ readyMadeId: choice as ReadyMadeId, ...names }) : startGift({ theme: choice as ThemeId, ...names });
      await saveDraft(owner, id, gift, toName || undefined);
      startProgress();
      router.push(editUrl("gift", id));
    } catch (problem) {
      console.error("The gift wasn't made:", problem);
      setState("failed");
    }
  };

  return (
    <>
      <button type="button" onClick={() => box.current?.showModal()} className={PRIMARY}>
        New gift
      </button>
      <Dialog ref={box} title="New gift">
        <form onSubmit={start} className="p-6">
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="mb-2 block text-sm text-soft">Who is it for?</span>
              <input name="to" maxLength={60} autoComplete="off" className={INPUT} />
            </label>
            <label>
              <span className="mb-2 block text-sm text-soft">From</span>
              <input name="from" maxLength={60} autoComplete="off" defaultValue={name} className={INPUT} />
            </label>
          </div>

          <fieldset className="mt-6 grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 text-sm text-soft">Ready-made, to change as you like</legend>
            {READY_MADE.map(({ id, name, note }, i) => (
              <label key={id} className="block cursor-pointer">
                <input type="radio" name="start" value={`ready:${id}`} defaultChecked={i === 0} className="peer sr-only" />
                <span className={`flex h-full items-center gap-4 ${CHOICE}`}>
                  <span className="w-24 shrink-0">
                    <Cover of={id} sizes="8rem" />
                  </span>
                  <span className="pr-3">
                    <span className="block font-medium">{name}</span>
                    <span className="mt-1 block text-sm text-soft">{note}</span>
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          <fieldset className="mt-7 grid grid-cols-3 gap-4 sm:grid-cols-5">
            <legend className="mb-3 text-sm text-soft">Or make it yourself, on a theme</legend>
            {THEMES.map(({ id, name }) => (
              <label key={id} className="cursor-pointer">
                <input type="radio" name="start" value={`theme:${id}`} className="peer sr-only" />
                <span className={CHOICE}>
                  <Cover of={id} sizes="9rem" />
                </span>
                <span className="mt-2.5 block text-sm font-medium">{name}</span>
              </label>
            ))}
          </fieldset>

          <div className="mt-7 flex items-center justify-end gap-4">
            {state === "failed" && <p role="alert" className="text-sm text-wine">That didn&apos;t work. Please try again.</p>}
            <button type="submit" disabled={state === "starting"} className={PRIMARY}>
              Start
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
