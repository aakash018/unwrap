// When Supabase can't be reached, we can't tell whether someone is signed
// in. That is not the same as being signed out.

import { isAuthRetryableFetchError } from "@supabase/supabase-js";

export class OutageError extends Error {
  name = "OutageError";
}

// Is this Supabase having trouble, rather than "you're not signed in"?
export function isOutage(error: unknown): boolean {
  if (isAuthRetryableFetchError(error)) return true;
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status === "number" && (status >= 500 || status === 429);
}

// Waits for an answer, but not for long: Supabase keeps retrying by itself
// for up to 30 seconds, which is too long to look at an empty page.
export async function soon<T>(answer: Promise<T>, ms = 6000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const tooLate = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new OutageError("Supabase took too long")), ms);
  });
  try {
    return await Promise.race([answer, tooLate]);
  } finally {
    clearTimeout(timer);
  }
}
