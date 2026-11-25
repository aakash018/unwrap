// Shown instead of an invitation or gift that can't be opened.

import Link from "next/link";
import type { Kind } from "@/lib/projects";
import Message from "./Message";

export default function NotOpened({ kind, state }: { kind: Kind; state: "missing" | "failed" }) {
  return (
    <Message title={state === "missing" ? `This ${kind} isn't in this browser` : `This ${kind} couldn't be read`}>
      {state === "failed" && <p className="mb-3">Refresh to try again. A private window can&apos;t keep drafts.</p>}
      <Link href="/home" className="underline">
        Back to Home
      </Link>
    </Message>
  );
}
