// A button for something that isn't built yet: pressing it says so.
"use client";

import type { ReactNode } from "react";
import { useNotYet } from "./NotYet";

type Props = { what: string; className?: string; label?: string; children: ReactNode };

export default function NotYetButton({ what, className, label, children }: Props) {
  const notYet = useNotYet();
  return (
    <button type="button" aria-label={label} onClick={() => notYet(what)} className={className}>
      {children}
    </button>
  );
}
