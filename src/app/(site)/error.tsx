// Shown when a page can't be drawn, for example while Supabase can't be
// reached.
"use client";

import Logo from "@/components/Logo";

export default function ErrorPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <Logo />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">This page didn&apos;t load</h1>
      <p className="text-soft">Something went wrong on our side. Please try again in a moment.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 h-11 cursor-pointer rounded-lg border border-line px-6 font-medium hover:border-ink/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
      >
        Try again
      </button>
    </main>
  );
}
