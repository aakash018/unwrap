// The settings from .env.local. They are only read on the server.

export type Env = {
  siteUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
};

// The settings, or null while some are still missing.
export function readEnv(): Env | null {
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!siteUrl || !supabaseUrl || !supabaseKey) return null;
  return { siteUrl, supabaseUrl, supabaseKey };
}

// The settings, for code that can't work without them.
export function requireEnv(): Env {
  const env = readEnv();
  if (!env) {
    throw new Error("Missing settings: copy .env.example to .env.local and fill it in.");
  }
  return env;
}
