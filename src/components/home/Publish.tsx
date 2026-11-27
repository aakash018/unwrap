// Publishing an invitation or gift, and its link to share. One box, three ways
// it opens:
//   • not published yet: an activation code, then Publish (it takes one code)
//   • published, then changed: Publish the changes (no code needed again)
//   • published: its link, to copy and send
// After publishing it shows the link. Used on Home (Row.tsx) and in the
// editor (Edit.tsx), which saves the latest changes first: `beforePublish`.
"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type RefObject } from "react";
import { publish } from "@/app/projects/actions";
import { shareUrl, type Kind } from "@/lib/projects";
import Dialog from "./Dialog";
import RememberDay from "./RememberDay";
import { INPUT, PRIMARY, SECONDARY } from "./styles";

type Props = {
  ref: RefObject<HTMLDialogElement | null>;
  kind: Kind;
  id: string;
  title: string;
  slug?: string; // once published
  changed: boolean; // edited since
  person?: string; // who a gift is for: just published, it offers to remember their day
  beforePublish?: () => Promise<boolean>; // false: it couldn't be done (said already)
  onPublished?: (slug: string) => void;
};

export default function Publish({ ref, kind, id, title, slug, changed, person, beforePublish, onPublished }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"" | "publishing" | "copied">("");
  const [problem, setProblem] = useState("");
  const [url, setUrl] = useState(slug ? shareUrl(kind, slug) : "");
  const [justPublished, setJustPublished] = useState(false);
  const [wantsLink, setWantsLink] = useState(false); // published and changed, but they only want the link

  const first = !url;
  const showLink = url && (justPublished || wantsLink || !changed);
  const link = typeof window === "undefined" ? url : new URL(url || "/", window.location.origin).toString();

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("publishing");
    setProblem("");
    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    try {
      if (beforePublish && !(await beforePublish())) {
        setProblem("Your latest changes aren't saved yet. Check your connection and try again.");
        setState("");
        return;
      }
      const done = await publish(id, kind, code);
      if (!done.ok) {
        setProblem(done.problem);
        setState("");
        return;
      }
      setUrl(done.url);
      setJustPublished(true);
      setState("");
      onPublished?.(done.url.split("/").pop() ?? "");
      router.refresh(); // Home shows it live
    } catch {
      setProblem("That didn't work. Check your connection and try again.");
      setState("");
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setState("copied");
  };

  return (
    <Dialog ref={ref} title={showLink ? "Its link" : first ? "Publish" : "Publish the changes"}>
      <div className="p-6">
        {showLink ? (
          <>
            <p className="text-soft">
              {justPublished ? `${title} is live. ` : ""}Anyone with this link can open it. Send it in Messenger, Viber or WhatsApp.
            </p>
            <div className="mt-5 flex gap-3">
              <input readOnly value={link} aria-label="The link" suppressHydrationWarning onFocus={(event) => event.currentTarget.select()} className={INPUT} />
              <button type="button" onClick={copy} className={PRIMARY}>
                {state === "copied" ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-4">
              <a href={url} target="_blank" rel="noopener" className="text-sm underline">
                Open it
              </a>
            </p>
            {justPublished && kind === "gift" && person && <RememberDay person={person} />}
          </>
        ) : (
          <form onSubmit={send}>
            {first ? (
              <>
                <p className="text-soft">Publishing gives {title} a link that anyone can open. It takes one activation code; after that, publishing changes is free.</p>
                <label className="mt-5 block">
                  <span className="mb-2 block text-sm text-soft">Activation code</span>
                  <input name="code" required autoComplete="off" spellCheck={false} placeholder="KOSELI-XXXX-XXXX" className={`${INPUT} font-mono uppercase`} />
                </label>
              </>
            ) : (
              <p className="text-soft">People with the link will see your changes straight away.</p>
            )}
            <div className="mt-6 flex items-center justify-end gap-4">
              {problem && (
                <p role="alert" className="text-sm text-wine">
                  {problem}
                </p>
              )}
              {!first && url && (
                <button type="button" onClick={() => setWantsLink(true)} className={SECONDARY}>
                  Just the link
                </button>
              )}
              <button type="submit" disabled={state === "publishing"} className={PRIMARY}>
                {state === "publishing" ? "Publishing…" : first ? "Publish" : "Publish changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
}
