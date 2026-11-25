# Unwrap

The real Unwrap site: sign in, make an invitation, send it as one link.
Next.js + TypeScript + Tailwind CSS, with Supabase for sign-in (and later
the database and photos).

The gift-page engine still lives in `../enginev1`. It isn't part of this
project yet.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:4321

| Command | What it does |
|---|---|
| `npm run dev` | Run it while you work |
| `npm run build` | Build it, checking the types too |
| `npm run lint` | Look for mistakes in the code |
| `npm test` | Run the tests |

## Setup (once)

Sign-in needs your own Supabase project and Google keys.

**1. Supabase.** Create a project at supabase.com. In its settings, find the
API keys and copy `.env.example` to `.env.local`, then fill in:
- `SUPABASE_URL`: the project's address, like `https://abcd.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY`: the **publishable** key (starts with
  `sb_publishable_`). Never put the secret key here.

**2. Google.** In the Google Cloud console, create a project, fill in the
OAuth consent screen, and create an **OAuth client ID** of type *Web
application*. Under *Authorized redirect URIs* add:

    https://YOUR-PROJECT.supabase.co/auth/v1/callback

**3. Connect them.** In Supabase, under Authentication → Sign In / Providers,
turn on **Google** and paste Google's client ID and client secret there. They
don't go in this project.

**4. Allow the way back.** In Supabase, under Authentication → URL
Configuration:
- Site URL: `http://localhost:4321`
- Redirect URLs: `http://localhost:4321/auth/callback**`

Restart `npm run dev` after changing `.env.local`. When the site goes online,
add its address in step 4 and set `SITE_URL` to it on the host.

## How signing in works

    /login  →  Google  →  Supabase  →  /auth/callback  →  /gifts

It all happens on the server. The sign-in cookies can't be read by scripts
in the page.

## Folders

    src/
    ├── proxy.ts                 # before each page: keeps you signed in
    ├── app/
    │   ├── layout.tsx           # the frame around every page
    │   ├── globals.css          # brand colours and fonts
    │   ├── page.tsx             # /       sends you to /gifts or /login
    │   ├── login/page.tsx       # /login  (and its picture)
    │   ├── gifts/page.tsx       # /gifts  your invitations (private)
    │   └── auth/
    │       ├── actions.ts       # sign in, sign out
    │       └── callback/route.ts# where Google sends people back to
    ├── components/              # Logo, GoogleButton
    └── lib/
        ├── env.ts               # settings from .env.local
        ├── user.ts              # who is signed in (getUser, requireUser)
        ├── safe-path.ts         # only go to our own pages after sign-in
        └── supabase/            # talking to Supabase
