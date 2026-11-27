// Making an invitation or a gift: opens its draft in the engine's editor and
// keeps it saved in the database (a moment after each change: app/projects/actions.ts).
// Its header's Publish button opens the same box as on Home (home/Publish.tsx),
// which saves the latest changes first.
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startProgress } from "@/components/PageProgress";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveDraft } from "@/app/projects/actions";
import Publish from "@/components/home/Publish";
import { infoOf } from "@/engine/page/info";
import type { Saved } from "@/engine/page/types";
import { previewUrl, type Kind } from "@/lib/projects";
import Message from "./Message";

const Editor = dynamic(() => import("@/engine/Editor"), { ssr: false });

const PAUSE_MS = 500; // save this long after the last change

type Props = {
  kind: Kind;
  id: string;
  saved: Saved;
  slug?: string; // its link's, once published
  changed: boolean; // edited since it was published
};

export default function Edit({ kind, id, saved: first, slug: firstSlug, changed: firstChanged }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const unsaved = useRef<Saved | null>(null); // the latest version, until it's saved
  const latest = useRef(first);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // published or not, and changed since
  const [slug, setSlug] = useState(firstSlug);
  const [changed, setChanged] = useState(firstChanged);
  const publishBox = useRef<HTMLDialogElement>(null);
  const [opens, setOpens] = useState(0); // (a fresh box each time it's opened)
  const [title, setTitle] = useState("");
  const [person, setPerson] = useState(""); // who a gift is for (offered to remember their day)

  // true once everything is saved
  const save = useCallback(async (): Promise<boolean> => {
    clearTimeout(timer.current);
    const saved = unsaved.current;
    if (!saved) return true;
    try {
      const result = await saveDraft(id, saved);
      if (!result.ok) {
        setStatus(`Not saved! ${result.problem}`);
        return false;
      }
      if (unsaved.current !== saved) return false; // changed again meanwhile
      unsaved.current = null;
      setStatus("Saved");
      return true;
    } catch (problem) {
      // (no connection, most likely: it's tried again with the next change)
      console.error("The draft wasn't saved:", problem);
      setStatus("Not saved! Check your connection.");
      return false;
    }
  }, [id]);

  const onChange = useCallback(
    (saved: Saved) => {
      unsaved.current = saved;
      latest.current = saved;
      setChanged(true);
      setStatus("Saving…");
      clearTimeout(timer.current);
      timer.current = setTimeout(save, PAUSE_MS);
    },
    [save],
  );

  const publish = useMemo(
    () => ({
      label: slug && !changed ? "Share" : "Publish",
      onClick: () => {
        setTitle((infoOf(latest.current) as { title: string }).title);
        setPerson(latest.current.kind === "gift" ? latest.current.opening?.name?.trim() ?? "" : "");
        setOpens((count) => count + 1);
        requestAnimationFrame(() => publishBox.current?.showModal());
      },
    }),
    [slug, changed],
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
          publish={publish}
          onHome={async () => {
            startProgress();
            await save();
            router.push("/home");
          }}
        />
        <Publish
          key={opens}
          ref={publishBox}
          kind={kind}
          id={id}
          title={title}
          slug={slug}
          changed={changed}
          person={person || undefined}
          beforePublish={save}
          onPublished={(next) => {
            setSlug(next);
            setChanged(false);
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
