// Where Google sends people back to: swaps the one-time code in the link
// for a session, then goes to the page they wanted.

import { NextResponse, type NextRequest } from "next/server";
import { readEnv } from "@/lib/env";
import { safePath } from "@/lib/safe-path";
import { isOutage } from "@/lib/supabase/outage";
import { createSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const env = readEnv();
  if (!env) return NextResponse.redirect(new URL("/login", request.url));

  const goTo = (path: string) => {
    const response = NextResponse.redirect(new URL(path, env.siteUrl));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  };

  const params = request.nextUrl.searchParams;
  // they pressed Cancel on Google's page
  if (params.get("error") === "access_denied") return goTo("/login?error=cancelled");

  const code = params.get("code");
  if (!code) return goTo("/login?error=failed");

  const supabase = await createSupabase();
  const flowId = params.get("sb_flow_id"); // which tab's sign-in this is
  const { error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
  if (error) {
    console.error("Google sign-in failed:", error.message);
    return goTo(isOutage(error) ? "/login?error=down" : "/login?error=failed");
  }
  return goTo(safePath(params.get("next")));
}
