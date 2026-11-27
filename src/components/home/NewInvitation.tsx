// "New invitation": choose a template (a card each, a tick on the chosen one),
// say whose wedding it is, and start (designed on the Claude Design canvas
// "Unwrap dashboard").
"use client";

import { useRouter } from "next/navigation";
import { startProgress } from "@/components/PageProgress";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import type { TemplateId } from "@/engine/page/types";
import { startProject } from "@/app/projects/actions";
import { editUrl, TEMPLATES } from "@/lib/projects";
import Image from "next/image";
import { COVERS } from "@/covers";
import Dialog, { DialogFooter } from "./Dialog";
import { INPUT, PRIMARY } from "./styles";

// (its button can be anything: `children`, `className`)
export default function NewInvitation({ children, className }: { children?: ReactNode; className?: string }) {
  const box = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [state, setState] = useState<"" | "starting" | "failed">("");

  const start = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const word = (name: string) => String(form.get(name) ?? "").trim();
    setState("starting");
    try {
      const { startInvitation } = await import("@/engine/templates/start");
      const made = await startProject(startInvitation(word("template") as TemplateId, [word("name1"), word("name2")]));
      if (!made.ok) return setState("failed");
      startProgress();
      router.push(editUrl("invitation", made.id));
    } catch (problem) {
      console.error("The invitation wasn't made:", problem);
      setState("failed");
    }
  };

  return (
    <>
      <button type="button" onClick={() => box.current?.showModal()} className={className ?? PRIMARY}>
        {children ?? "New invitation"}
      </button>
      <Dialog ref={box} title="New wedding invitation" note="Pick a look and add the names. You can change everything later.">
        <form onSubmit={start}>
          <div className="px-6 pt-6 pb-7 sm:px-7">
            <fieldset className="grid grid-cols-2 gap-3 sm:gap-3.5">
              <legend className="sr-only">Template</legend>
              {TEMPLATES.map(({ id, name, note }, i) => (
                <label key={id} className="group relative cursor-pointer">
                  <input type="radio" name="template" value={id} defaultChecked={i === 0} className="peer sr-only" />
                  <span className="block h-full rounded-[14px] border border-line/80 bg-white p-1.5 transition-shadow peer-checked:border-ink peer-checked:shadow-[0_0_0_1px_var(--color-ink)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-wine">
                    <span className="relative block h-28 overflow-hidden rounded-[9px] sm:h-[168px]">
                      {COVERS[id] && (
                        <Image src={COVERS[id]} alt="" fill sizes="18rem" placeholder="blur" className="object-cover object-[center_62%] transition-transform duration-500 group-hover:scale-[1.03]" />
                      )}
                    </span>
                    <span className="block px-2 pt-3 pb-2">
                      <span className="block text-[15px] font-semibold">{name.replace("Wedding", "wedding")}</span>
                      <span className="mt-0.5 block text-[13px] text-soft">{note}</span>
                    </span>
                  </span>
                  <span aria-hidden className="absolute top-3.5 right-3.5 hidden size-6 place-items-center rounded-full bg-ink shadow-[0_0_0_2px_white] peer-checked:grid">
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </label>
              ))}
            </fieldset>

            <fieldset className="mt-6">
              <legend className="mb-2 text-[13px] font-medium">The couple&apos;s first names</legend>
              <div className="flex items-center gap-2.5">
                <input name="name1" aria-label="First name" placeholder="Soni" maxLength={40} autoComplete="off" className={INPUT} />
                <span aria-hidden className="text-lg text-soft">
                  &amp;
                </span>
                <input name="name2" aria-label="Second name" placeholder="Aaku" maxLength={40} autoComplete="off" className={INPUT} />
              </div>
            </fieldset>
          </div>

          <DialogFooter note="Saved as a draft until you publish." problem={state === "failed" ? "That didn't work. Please try again." : undefined}>
            <button type="submit" disabled={state === "starting"} className={PRIMARY}>
              {state === "starting" ? "Starting…" : "Start invitation"}
            </button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
