// Supabase for pages, server actions and route handlers: it knows who is
// signed in from the request's cookies. Make a new one for every request.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireEnv } from "@/lib/env";
import { options } from "./options";

export async function createSupabase() {
  const { supabaseUrl, supabaseKey } = requireEnv();
  const store = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    ...options,
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Pages can't write cookies while rendering. That's fine: proxy.ts
          // has already renewed them before the page started.
        }
      },
    },
  });
}
