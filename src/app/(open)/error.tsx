// Shown when an invitation or gift can't be opened.
"use client";

export default function OpenError() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 text-center">
      <h1 className="font-display text-4xl text-cocoa">This didn&apos;t open</h1>
      <button type="button" onClick={() => window.location.reload()} className="mt-6 h-11 rounded-full border border-line px-6">
        Try again
      </button>
    </main>
  );
}
