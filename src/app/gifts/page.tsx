// The signed-in home. Your invitations will be listed here.

import type { Metadata } from "next";
import { signOut } from "@/app/auth/actions";
import Logo from "@/components/Logo";
import { requireUser } from "@/lib/user";

export const metadata: Metadata = { title: "Your invitations" };

export default async function GiftsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="flex items-center justify-between gap-4">
        <Logo />
        <div className="flex min-w-0 items-center gap-4 text-sm">
          <span className="hidden truncate text-ink-soft sm:block">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="h-9 cursor-pointer rounded-full border border-line px-4 font-medium whitespace-nowrap hover:border-ink/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="py-24 text-center">
        <p lang="ne" className="font-dev text-lg text-accent">
          नमस्ते
        </p>
        <h1 className="mt-2 font-display text-5xl text-cocoa">{user.name}</h1>
        <p className="mt-4 text-ink-soft">You don&apos;t have any invitations yet.</p>
      </main>
    </div>
  );
}
