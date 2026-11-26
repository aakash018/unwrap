// Making an invitation or a gift: opens its draft in the engine's editor and
// keeps it saved in the database (a moment after each change: app/projects/actions.ts).
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startProgress } from "@/components/PageProgress";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveDraft } from "@/app/projects/actions";
import type { Saved } from "@/engine/page/types";
import { previewUrl, type Kind } from "@/lib/projects";
import Message from "./Message";

const Editor = dynamic(() => import("@/engine/Editor"), { ssr: false });

const PAUSE_MS = 500; // save this long after the last change

type Props = { kind: Kind; id: string; saved: Saved; toName?: string };

export default function Edit({ kind, id, saved: first }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const unsaved = useRef<Saved | null>(null); // the latest version, until it's saved
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const save = useCallback(async () => {
    clearTimeout(timer.current);
    const saved = unsaved.current;
    if (!saved) return;
    try {
      const result = await saveDraft(id, saved);
      if (!result.ok) {
        setStatus(`Not saved! ${result.problem}`);
        return;
      }
      if (unsaved.current !== saved) return; // changed again meanwhile
      unsaved.current = null;
      setStatus("Saved");
    } catch (problem) {
      // (no connection, most likely: it's tried again with the next change)
      console.error("The draft wasn't saved:", problem);
      setStatus("Not saved! Check your connection.");
    }
  }, [id]);

  const onChange = useCallback(
    (saved: Saved) => {
      unsaved.current = saved;
      setStatus("Saving…");
      clearTimeout(timer.current);
      timer.current = setTimeout(save, PAUSE_MS);
    },
    [save],
  );

  // Leaving or hiding the page: don't wait for the pause. And ask before
  // leaving if something couldn't be saved.
  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && save();
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!unsaved.current) return;
      save();
      event.preventDefault();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [save]);

  return (
    <>
      <div className="hidden md:block">
        <Editor
          saved={first}
          onChange={onChange}
          previewUrl={previewUrl(kind, id)}
          channel={id}
          status={status}
          onHome={async () => {
            startProgress();
            await save();
            router.push("/home");
          }}
        />
      </div>
      <div className="md:hidden">
        <Message title="Open this on a computer">
          <p>The editor needs a bigger screen.</p>
          <p className="mt-4 flex justify-center gap-6">
            <Link href={previewUrl(kind, id)} className="underline">
              Preview it
            </Link>
            <Link href="/home" className="underline">
              Home
            </Link>
          </p>
        </Message>
      </div>
    </>
  );
}
