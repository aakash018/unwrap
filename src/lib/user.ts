// Who is signed in.

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { readEnv } from "@/lib/env";
import { createSupabase } from "@/lib/supabase/server";

export type User = {
  id: string;
  name: string;
  email: string;
};

// The signed-in person, or null. Supabase checks the session each time.
export async function getUser(): Promise<User | null> {
  // always checked when the page is opened, never once while building the site
  await connection();
  if (!readEnv()) return null;
  const supabase = await createSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { id, email = "", user_metadata: details } = data.user;
  const name = typeof details.full_name === "string" ? details.full_name : "";
  return { id, email, name: name || email };
}

// For private pages: the signed-in person, or off to the login page.
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
