# Unwrap (the real project)

Read `README.md` for setup and the folder map.

- **Founder:** Aakash. Code must stay easy for him to read: plain names, one
  component per file, a short comment at the top of every file.
- **Stack:** Next.js (App Router) + TypeScript + Tailwind v4 + Supabase.
  Expect 100–200 senders at most: keep it simple.
- **Next.js 16:** `middleware` is now called `proxy` (`src/proxy.ts`). The
  docs for this version are in `node_modules/next/dist/docs`.
- **Sign-in:** Google through Supabase, server-side only (httpOnly cookies,
  no Supabase client in the browser). Private pages call `requireUser()`;
  proxy.ts is only the quick check.
- **Return addresses** always go through `safePath()`.
- **Port 4321**, because 3000 and 3100 are used by other things on this Mac.
- **The engine** is in `../enginev1` (its CLAUDE.md has the founder's taste).
- **Planned:** save drafts, photo uploads, publish with an activation code,
  guest links and RSVP. No payment gateway. Database writes go through the
  server only.

Keep `README.md` and this file up to date.
