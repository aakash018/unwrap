// Who is signed in.

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { readEnv } from "@/lib/env";
import { isOutage, OutageError, soon } from "@/lib/supabase/outage";
import { createSupabase } from "@/lib/supabase/server";

export type User = {
  id: string;
  name: string;
  email: string;
};

// The signed-in person, or null. Supabase checks the session each time.
// Throws OutageError when Supabase can't be reached.
export async function getUser(): Promise<User | null> {
  // always checked when the page is opened, never once while building the site
  await connection();
  if (!readEnv()) return null;
  const supabase = await createSupabase();
  const { data, error } = await soon(supabase.auth.getUser());
  if (!data.user) {
    if (isOutage(error)) throw new OutageError("Supabase can't be reached");
    return null;
  }

  const { id, email = "", user_metadata: details } = data.user;
  const name = typeof details.full_name === "string" ? details.full_name : "";
  return { id, email, name: name || email };
}

// For private pages: the signed-in person, or off to the login page (which
// brings them back to `path` afterwards).
export async function requireUser(path: string): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(path)}`);
  return user;
}
