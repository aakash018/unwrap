// The login page: a picture from the invitations, and one button.

import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { signInWithGoogle } from "@/app/auth/actions";
import GoogleButton from "@/components/GoogleButton";
import Logo from "@/components/Logo";
import { readEnv } from "@/lib/env";
import { safePath } from "@/lib/safe-path";
import { getUser } from "@/lib/user";
import treeAtNight from "./tree-night.jpg";

export const metadata: Metadata = { title: "Sign in" };

// What went wrong, from /login?error=…
const ERRORS: Record<string, string> = {
  cancelled: "Sign-in was cancelled. You can try again.",
  start: "We couldn't reach Google. Please try again.",
  failed: "Sign-in didn't finish. Please try again.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const goTo = safePath(next);
  if (await getUser()) redirect(goTo);

  const ready = readEnv() !== null;
  const message = typeof error === "string" ? (ERRORS[error] ?? ERRORS.failed) : null;

  return (
    <main className="grid min-h-dvh grid-rows-[38dvh_1fr] lg:grid-cols-[1.15fr_1fr] lg:grid-rows-1">
      <div className="relative overflow-hidden bg-[#14123a]">
        <Image
          src={treeAtNight}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="(min-width: 1024px) 54vw, 100vw"
          className="object-cover object-[50%_85%]"
        />
      </div>

      <div className="flex flex-col px-6 py-8 sm:px-12 lg:py-10">
        <Logo />

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
          <h1 className="font-display text-5xl leading-[1.05] text-cocoa">Sign in to Unwrap</h1>
          <p className="mt-4 text-ink-soft">Make an invitation, then send it to everyone as one link.</p>

          {message && (
            <p role="alert" className="mt-6 rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">
              {message}
            </p>
          )}

          <form action={signInWithGoogle} className="mt-8">
            <input type="hidden" name="next" value={goTo} />
            <GoogleButton disabled={!ready} />
          </form>

          {ready ? (
            <p className="mt-4 text-center text-sm text-ink-soft">New here? This makes your account too.</p>
          ) : (
            <p className="mt-4 text-center text-sm text-ink-soft">
              Sign-in isn&apos;t set up yet. Follow Setup in README.md.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
