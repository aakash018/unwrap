// Says "this isn't ready yet" when a button that does nothing so far is
// pressed. Wrap a page in <NotYetProvider>, then call useNotYet() in a button.
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const NotYetContext = createContext<(what: string) => void>(() => {});

export const useNotYet = () => useContext(NotYetContext);

export function NotYetProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<{ what: string } | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <NotYetContext value={(what) => setNotice({ what })}>
      {children}
      <div role="status" className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex justify-center">
        {notice && (
          <p className="rounded-lg bg-ink px-5 py-3 text-sm text-white shadow-lg">{notice.what} isn&apos;t ready yet.</p>
        )}
      </div>
    </NotYetContext>
  );
}
