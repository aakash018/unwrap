// Signing in and out. These run on the server when a form is sent.
"use server";

import { redirect } from "next/navigation";
import { requireEnv } from "@/lib/env";
import { safePath } from "@/lib/safe-path";
import { createSupabase } from "@/lib/supabase/server";

// Sends the person to Google. Google sends them back to /auth/callback.
export async function signInWithGoogle(form: FormData) {
  const { siteUrl } = requireEnv();
  const supabase = await createSupabase();

  const callback = new URL("/auth/callback", siteUrl);
  callback.searchParams.set("next", safePath(form.get("next")));

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
  });
  redirect(error || !data.url ? "/login?error=start" : data.url);
}

export async function signOut() {
  const supabase = await createSupabase();
  await supabase.auth.signOut({ scope: "local" }); // this device only
  redirect("/login");
}
