// Making an invitation or a gift: opens its draft in the engine's editor and
// keeps it saved in this browser.
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startProgress } from "@/components/PageProgress";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Saved } from "@/engine/page/types";
import { saveDraft } from "@/lib/drafts";
import { previewUrl, type Gift, type Invitation, type Kind } from "@/lib/projects";
import Message from "./Message";
import NotOpened from "./NotOpened";
import { useDraft } from "./use-draft";

const Editor = dynamic(() => import("@/engine/Editor"), { ssr: false });

const PAUSE_MS = 500; // save this long after the last change

type Props = { owner: string; kind: Kind; id: string; sample: Invitation | Gift | null };

export default function Edit({ owner, kind, id, sample }: Props) {
  const opened = useDraft(owner, kind, id, sample);
  const toName = opened.state === "open" ? opened.toName : undefined;

  const router = useRouter();
  const [status, setStatus] = useState("");
  const unsaved = useRef<Saved | null>(null); // the latest version, until it's saved
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const save = useCallback(async () => {
    clearTimeout(timer.current);
    const saved = unsaved.current;
    if (!saved) return;
    try {
      await saveDraft(owner, id, saved, toName);
      if (unsaved.current !== saved) return; // changed again meanwhile
      unsaved.current = null;
      setStatus("Saved");
    } catch (problem) {
      console.error("The draft wasn't saved:", problem);
      setStatus("Not saved!");
    }
  }, [owner, id, toName]);

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

  if (opened.state === "opening") return <Message title="Opening…" />;
  if (opened.state !== "open") return <NotOpened kind={kind} state={opened.state} />;

  return (
    <>
      <div className="hidden md:block">
        <Editor
          saved={opened.saved}
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
