// "New gift": say who it's for, choose a ready-made gift (three cards, a tick
// on the chosen one) or just a theme (a small row under them), and start. Laid
// out like the new invitation box (Claude Design canvas "Unwrap dashboard").
// Its button can be anything (`children`, `className`), and it can open with
// who it's for and what to start from already chosen (`preset`: "Make
// something for Soni" for a birthday on Home).
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { startProgress } from "@/components/PageProgress";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { COVERS } from "@/covers";
import type { ReadyMadeId, ThemeId } from "@/engine/page/types";
import { startProject } from "@/app/projects/actions";
import { editUrl, READY_MADE, THEMES } from "@/lib/projects";
import Dialog, { DialogFooter } from "./Dialog";
import { INPUT, PRIMARY } from "./styles";

// the card around a choice: a dark border once it's chosen
const CHOICE =
  "block h-full rounded-[14px] border border-line/80 bg-white p-1.5 transition-shadow peer-checked:border-ink peer-checked:shadow-[0_0_0_1px_var(--color-ink)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-wine";
const LABEL = "mb-2 block text-[13px] font-medium";

function Tick() {
  return (
    <span aria-hidden className="absolute top-3 right-3 hidden size-6 place-items-center rounded-full bg-ink shadow-[0_0_0_2px_white] peer-checked:grid">
      <svg width="12" height="12" viewBox="0 0 12 12">
        <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// "Love. Roses to unwrap, …" → "Love"
const occasion = (note: string) => note.split(".")[0];

type Props = { name: string; children?: ReactNode; className?: string; preset?: { to?: string; start?: string } };

export default function NewGift({ name, children, className, preset }: Props) {
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
      const names = { toName, fromName: word("from") };
      const gift = from === "ready" ? startGift({ readyMadeId: choice as ReadyMadeId, ...names }) : startGift({ theme: choice as ThemeId, ...names });
      const made = await startProject(gift);
      if (!made.ok) return setState("failed");
      startProgress();
      router.push(editUrl("gift", made.id));
    } catch (problem) {
      console.error("The gift wasn't made:", problem);
      setState("failed");
    }
  };

  return (
    <>
      <button type="button" onClick={() => box.current?.showModal()} className={className ?? PRIMARY}>
        {children ?? "New gift"}
      </button>
      <Dialog ref={box} title="New gift" note="Who it's for, and where to start. You can change everything later." wide>
        <form onSubmit={start}>
          <div className="px-6 pt-6 pb-7 sm:px-7">
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={LABEL}>For</span>
                <input name="to" placeholder="Soni" maxLength={60} autoComplete="off" defaultValue={preset?.to} className={INPUT} />
              </label>
              <label>
                <span className={LABEL}>From</span>
                <input name="from" maxLength={60} autoComplete="off" defaultValue={name} className={INPUT} />
              </label>
            </div>

            <fieldset className="mt-6">
              <legend className={LABEL}>Start from a ready-made gift</legend>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {READY_MADE.map(({ id, name, note }, i) => (
                  <label key={id} className="group relative cursor-pointer">
                    <input type="radio" name="start" value={`ready:${id}`} defaultChecked={preset?.start ? preset.start === `ready:${id}` : i === 0} className="peer sr-only" />
                    <span className={CHOICE}>
                      <span className="relative block h-24 overflow-hidden rounded-[9px] sm:h-32">
                        {COVERS[id] && <Image src={COVERS[id]} alt="" fill sizes="14rem" placeholder="blur" className="object-cover object-[center_40%] transition-transform duration-500 group-hover:scale-[1.03]" />}
                      </span>
                      <span className="block px-1.5 pt-2.5 pb-1.5 sm:px-2">
                        <span className="block text-sm leading-snug font-semibold">{name}</span>
                        <span className="mt-0.5 block text-[13px] text-soft">{occasion(note)}</span>
                      </span>
                    </span>
                    <Tick />
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className={LABEL}>Or make it yourself, on a theme</legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {THEMES.map(({ id, name }) => (
                  <label key={id} className="group relative cursor-pointer">
                    <input type="radio" name="start" value={`theme:${id}`} defaultChecked={preset?.start === `theme:${id}`} className="peer sr-only" />
                    <span className={`${CHOICE} rounded-xl! p-1!`}>
                      <span className="relative block h-11 overflow-hidden rounded-lg bg-[#fbf7f0] ring-1 ring-ink/5 ring-inset sm:h-14">
                        {COVERS[id] && <Image src={COVERS[id]} alt="" fill sizes="8rem" className="object-cover object-[center_30%]" />}
                      </span>
                      <span className="block truncate px-1 pt-1.5 pb-0.5 text-center text-xs font-medium sm:text-[13px]">{name}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <DialogFooter note="Saved as a draft until you send it." problem={state === "failed" ? "That didn't work. Please try again." : undefined}>
            <button type="submit" disabled={state === "starting"} className={PRIMARY}>
              {state === "starting" ? "Starting…" : "Start gift"}
            </button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
