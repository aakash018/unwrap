// A few words in the middle of an otherwise empty screen.

import type { ReactNode } from "react";

export default function Message({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white px-6 text-center text-ink">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="max-w-sm text-ink-soft">{children}</div>
    </main>
  );
}
