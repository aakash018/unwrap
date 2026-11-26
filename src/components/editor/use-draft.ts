// Opens a draft: the one kept in this browser, or a sample's first version.
"use client";

import { useEffect, useState } from "react";
import type { Saved } from "@/engine/page/types";
import { loadDraft } from "@/lib/drafts";
import type { Gift, Invitation, Kind } from "@/lib/projects";

export type Opened =
  | { state: "opening" }
  | { state: "missing" }
  | { state: "failed" } // the draft couldn't be read
  | { state: "open"; saved: Saved; toName?: string; edited: number }; // edited: when it was saved (0: never)

async function startSample(sample: Invitation | Gift): Promise<Opened> {
  const { startGift, startInvitation } = await import("@/engine/templates/start");
  if (sample.kind === "invitation") {
    return { state: "open", saved: startInvitation(sample.template, sample.title.split(" & ")), edited: 0 };
  }
  return { state: "open", saved: startGift({ theme: sample.theme, toName: sample.toName }), toName: sample.toName, edited: 0 };
}

// Gifts from before 26 Nov 2026 didn't keep who they're for with them: its
// loader (engine/page/Loader.jsx) and its settings need it.
function withName(saved: Saved, toName?: string): Saved {
  if (saved.kind !== "gift" || !toName || saved.opening?.name !== undefined) return saved;
  return { ...saved, opening: { ...saved.opening, name: toName } };
}

export function useDraft(owner: string, kind: Kind, id: string, sample: Invitation | Gift | null): Opened {
  const [opened, setOpened] = useState<Opened>({ state: "opening" });

  useEffect(() => {
    let gone = false;
    const show = (next: Opened) => !gone && setOpened(next);
    (async () => {
      try {
        const draft = await loadDraft(owner, id);
        if (draft?.saved.kind === kind) return show({ state: "open", saved: withName(draft.saved, draft.toName), toName: draft.toName, edited: draft.edited });
        // (an invitation can't be opened as a gift, or the other way round)
        show(sample && !draft ? await startSample(sample) : { state: "missing" });
      } catch (problem) {
        // never start afresh here: it would be saved over the real draft
        console.error("The draft couldn't be read:", problem);
        show({ state: "failed" });
      }
    })();
    return () => {
      gone = true;
    };
    // (the sample is the same for the same id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, kind, id]);

  return opened;
}
