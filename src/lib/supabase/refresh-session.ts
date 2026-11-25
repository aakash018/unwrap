// Used by proxy.ts before each page: renews the sign-in cookies when they
// are about to run out, and says whether someone is signed in.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Env } from "@/lib/env";
import { cookieOptions } from "./cookie-options";

export async function refreshSession(request: NextRequest, env: Env) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseKey, {
    cookieOptions,
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

  const { data } = await supabase.auth.getClaims();
  return { response, signedIn: Boolean(data?.claims) };
}
