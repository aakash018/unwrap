// How we talk to Supabase, the same everywhere.

// Give up after a few seconds, so a slow Supabase can't leave pages hanging.
const SLOWEST_MS = 5000;

export const options = {
  // The sign-in cookies. Scripts in the page can't read them (httpOnly),
  // because signing in and out happens on the server.
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
  // Gives each sign-in its own ID, so starting it in two tabs works.
  auth: { experimental: { appendPkceFlowIdToRedirects: true } },
  global: {
    fetch: (url: RequestInfo | URL, init?: RequestInit) =>
      fetch(url, { ...init, signal: AbortSignal.timeout(SLOWEST_MS) }),
  },
} as const;
