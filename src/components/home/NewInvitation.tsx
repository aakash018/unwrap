// "New invitation": choose a template, say whose wedding it is, and start.
"use client";

import { useRouter } from "next/navigation";
import { startProgress } from "@/components/PageProgress";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import type { TemplateId } from "@/engine/page/types";
import { startProject } from "@/app/projects/actions";
import { editUrl, TEMPLATES } from "@/lib/projects";
import Cover from "./Cover";
import Dialog from "./Dialog";
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
      <Dialog ref={box} title="New invitation">
        <form onSubmit={start} className="p-6">
          <fieldset className="grid grid-cols-2 gap-5 sm:gap-8">
            <legend className="mb-3 text-sm text-soft">Template</legend>
            {TEMPLATES.map(({ id, name, note }, i) => (
              <label key={id} className="cursor-pointer">
                <input type="radio" name="template" value={id} defaultChecked={i === 0} className="peer sr-only" />
                <span className="block rounded-md outline-offset-3 peer-checked:outline-2 peer-checked:outline-ink peer-focus-visible:outline-wine">
                  <Cover of={id} sizes="20rem" />
                </span>
                <span className="mt-3 block font-medium">{name}</span>
                <span className="block text-sm text-soft">{note}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="mt-7">
            <legend className="mb-2 text-sm text-soft">The couple&apos;s first names</legend>
            <div className="grid grid-cols-2 gap-3">
              <input name="name1" aria-label="First name" maxLength={40} autoComplete="off" className={INPUT} />
              <input name="name2" aria-label="Second name" maxLength={40} autoComplete="off" className={INPUT} />
            </div>
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
