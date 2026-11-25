// The login page: a picture from the invitations, and one button.

import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { signInWithGoogle } from "@/app/auth/actions";
import GoogleButton from "@/components/GoogleButton";
import Logo from "@/components/Logo";
import { readEnv } from "@/lib/env";
import { safePath } from "@/lib/safe-path";
import { OutageError } from "@/lib/supabase/outage";
import { getUser } from "@/lib/user";
import treeAtNight from "./tree-night.jpg";

export const metadata: Metadata = { title: "Sign in" };

// What went wrong, from /login?error=…
const FAILED = "Sign-in didn't finish. Please try again.";
const DOWN = "Sign-in isn't available right now. Please try again in a few minutes.";
const ERRORS = new Map([
  ["cancelled", "Sign-in was cancelled. You can try again."],
  ["start", "We couldn't reach Google. Please try again."],
  ["down", DOWN],
]);

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const goTo = safePath(next);
  const user = await getUser().catch((problem) => {
    if (problem instanceof OutageError) return "unknown" as const;
    throw problem;
  });
  if (user && user !== "unknown") redirect(goTo);

  const ready = readEnv() !== null;
  let message = typeof error === "string" ? (ERRORS.get(error) ?? FAILED) : null;
  if (user === "unknown") message = DOWN;

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
          <h1 className="text-4xl leading-tight font-semibold tracking-tight">Sign in to Unwrap</h1>
          <p className="mt-4 text-soft">Make an invitation or a gift, then send it as one link.</p>

          {message && (
            <p role="alert" className="mt-6 rounded-xl bg-wine/8 px-4 py-3 text-sm text-wine">
              {message}
            </p>
          )}

          <form action={signInWithGoogle} className="mt-8">
            <input type="hidden" name="next" value={goTo} />
            <GoogleButton disabled={!ready} />
          </form>

          {ready ? (
            <p className="mt-4 text-center text-sm text-soft">New here? This makes your account too.</p>
          ) : (
            <p className="mt-4 text-center text-sm text-soft">
              Sign-in isn&apos;t set up yet. Follow Setup in README.md.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
