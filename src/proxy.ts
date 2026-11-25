// Runs before the pages below: keeps people signed in, and sends visitors
// who aren't signed in from private pages to the login page. (The pages
// check again themselves with requireUser: this is only the quick check.)

import { NextResponse, type NextRequest } from "next/server";
import { readEnv } from "@/lib/env";
import { refreshSession } from "@/lib/supabase/refresh-session";

const PRIVATE = /^\/(home|invitations|gifts)(\/|$)/;

export async function proxy(request: NextRequest) {
  const env = readEnv();
  if (!env) return NextResponse.next();

  const { response, signedIn } = await refreshSession(request, env);
  const { pathname, search } = request.nextUrl;

  if (PRIVATE.test(pathname) && signedIn === "no") {
    const login = new URL("/login", env.siteUrl);
    login.searchParams.set("next", pathname + search);
    const redirect = NextResponse.redirect(login);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }
  return response;
}

export const config = {
  matcher: ["/", "/login", "/home", "/invitations/:path*", "/gifts/:path*"],
};
