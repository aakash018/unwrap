// Used by proxy.ts before each page: renews the sign-in cookies when they
// are about to run out, and says whether someone is signed in
// ("unknown" = Supabase can't be reached right now).

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Env } from "@/lib/env";
import { options } from "./options";
import { isOutage, soon } from "./outage";

type SignedIn = "yes" | "no" | "unknown";

export async function refreshSession(request: NextRequest, env: Env) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseKey, {
    ...options,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list, headers) {
        // the page about to be drawn sees the new cookies…
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        // …and so does the browser (and nobody may cache this answer)
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  let signedIn: SignedIn = "unknown";
  try {
    const { data, error } = await soon(supabase.auth.getClaims());
    if (data?.claims) signedIn = "yes";
    else if (!isOutage(error)) signedIn = "no";
  } catch {
    // Supabase can't be reached
  }
  return { response, signedIn };
}
