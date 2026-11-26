// Drafts made before they were saved in the database are still in this
// browser (lib/drafts.ts). On Home they're moved into the account, one by
// one; each leaves the browser only once it's safely saved. Shows a line while
// it works, and nothing once it's done.
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { startProject } from "@/app/projects/actions";
import type { Saved } from "@/engine/page/types";
import { deleteDraft, listDrafts } from "@/lib/drafts";

// Gifts from before 26 Nov 2026 kept who they're for beside them, not inside:
// their loader (engine/page/Loader.jsx) needs it inside.
function withName(saved: Saved, toName?: string): Saved {
  if (saved.kind !== "gift" || !toName || saved.opening?.name !== undefined) return saved;
  return { ...saved, opening: { ...saved.opening, name: toName } };
}

async function moveAll(owner: string, onCount: (left: number) => void): Promise<number> {
  const drafts = await listDrafts(owner);
  let moved = 0;
  for (const [i, draft] of drafts.entries()) {
    onCount(drafts.length - i);
    const made = await startProject(withName(draft.saved, draft.toName));
    if (!made.ok) continue; // (left in the browser: tried again next time)
    await deleteDraft(owner, draft.id);
    moved++;
  }
  return moved;
}

let started = false; // once a page load

export default function MoveDrafts({ owner }: { owner: string }) {
  const router = useRouter();
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (started) return;
    started = true;
    const work = async () => {
      const moved = await moveAll(owner, setLeft).catch((problem) => {
        console.error("Drafts in this browser weren't moved:", problem);
        return 0;
      });
      setLeft(0);
      if (moved) router.refresh();
    };
    // one tab at a time (two Homes open would move them twice)
    if (navigator.locks) navigator.locks.request("unwrap-move-drafts", { ifAvailable: true }, (lock) => (lock ? work() : undefined));
    else work();
  }, [owner, router]);

  if (!left) return null;
  return (
    <p role="status" className="mb-8 text-sm text-soft">
      Moving {left === 1 ? "a draft" : `${left} drafts`} from this browser into your account…
    </p>
  );
}
