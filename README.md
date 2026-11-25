# Unwrap

The real Unwrap site: sign in, make an invitation or a gift, send it as one
link.
Next.js + TypeScript + Tailwind CSS, with Supabase for sign-in (and later
the database and photos).

The page engine is in `src/engine` (JavaScript, moved here from
`../enginev1`, which should not be changed any more).

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:4321

| Command         | What it does                     |
| --------------- | -------------------------------- |
| `npm run dev`   | Run it while you work            |
| `npm run build` | Build it, checking the types too |
| `npm run lint`  | Look for mistakes in the code    |
| `npm test`      | Run the tests                    |

## Setup (once)

Sign-in needs your own Supabase project and Google keys.

**1. Supabase.** Create a project at supabase.com. In its settings, find the
API keys and copy `.env.example` to `.env.local`, then fill in:

- `SUPABASE_URL`: the project's address, like `https://abcd.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY`: the **publishable** key (starts with
  `sb_publishable_`). Never put the secret key here.

**2. Google.** In the Google Cloud console, create a project, fill in the
OAuth consent screen, and create an **OAuth client ID** of type _Web
application_. Under _Authorized redirect URIs_ add:

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

## Two things you can make

They are separate: separate buttons, editors, addresses and saved pages.

|                 | Invitation                         | Gift                               |
| --------------- | ---------------------------------- | ---------------------------------- |
| Starts from     | a **template** (a finished story)  | a **ready-made** gift, or just a **theme** |
| Choices         | Garden Wedding, Hindu Wedding      | Love, Marigold, Birthday, Anniversary, Plain |
| Made of         | the template's chapters            | anything: text, photos, surprises  |
| Edited at       | `/invitations/…/edit`              | `/gifts/…/edit`                    |
| Opened at       | `/i/…`                             | `/g/…`                             |

Surprises (gift box, letter…) are for gifts only. Both fill tablet and
computer screens, and both editors have the Mobile · Tablet · Desktop switch. A
gift has a layout for each: move things in Desktop and the phone's stay put.
What you haven't placed there is arranged from the phone's.

## See one

- http://localhost:4321/i/demo (Garden Wedding)
- http://localhost:4321/i/demo-hindu (Hindu Wedding)
- http://localhost:4321/g/demo (a Love gift)
- http://localhost:4321/g/birthday (a Birthday gift)

## How signing in works

    /login  →  Google  →  Supabase  →  /auth/callback  →  /home

It all happens on the server. The sign-in cookies can't be read by scripts
in the page.

## Folders

    public/presents/             # pictures of the gift box and what's inside
    tools/presents/              # what renders them (bash tools/presents/bake.sh)
    src/
    ├── proxy.ts                 # before each page: keeps you signed in
    ├── app/
    │   ├── (site)/              # the site's own pages, with their own styles
    │   │   ├── layout.tsx       #   the frame around them, and globals.css
    │   │   ├── page.tsx         #   /       sends you to /home or /login
    │   │   ├── login/           #   /login
    │   │   ├── home/            #   /home   your invitations and gifts (private)
    │   │   ├── invitations/ gifts/   # no pages of their own: back to /home
    │   │   └── error.tsx        #   shown when a page can't be drawn
    │   ├── (editor)/            # making something (private): the engine's styles
    │   │   ├── invitations/[id]/    # /invitations/…/edit and …/preview
    │   │   └── gifts/[id]/          # /gifts/…/edit and …/preview
    │   ├── (open)/              # what people open from a link: the engine's styles
    │   │   ├── i/[slug]/        #   /i/…  an invitation
    │   │   └── g/[slug]/        #   /g/…  a gift
    │   └── auth/                # sign in and out; where Google sends people back
    ├── components/              # Logo, GoogleButton
    │   ├── home/                # the parts of /home
    │   │   ├── Lists.tsx        #   the two lists
    │   │   ├── InvitationRow.tsx  GiftRow.tsx   # a line in each (both use Row.tsx)
    │   │   ├── NewInvitation.tsx  NewGift.tsx   # choose a template / a theme
    │   │   ├── Cover.tsx        #   the picture of a template or theme
    │   │   └── AccountMenu, Menu, Dialog, NotYet…, styles.ts
    │   ├── editor/              # opening a draft, editing it, keeping it saved
    │   └── open/                # opening a link: names first, then the engine
    ├── covers/                  # pictures of the templates and themes
    ├── engine/                  # the page engine (JavaScript)
    │   ├── templates/           #   invitations: their chapters and first words
    │   ├── themes/              #   gifts: the moving backgrounds (birthday.js is
    │   │                        #   painted in jacaranda.js and party.js,
    │   │                        #   anniversary.js in lake.js and pergola.js)
    │   ├── ready-made/          #   gifts with their surprises in place, to start from
    │   ├── sections/            #   the chapters and their painted scenes
    │   ├── blocks/              #   text, photos and surprises (settings.js: their
    │   │                        #   controls, loaded only by the editor)
    │   ├── page/                #   what a page is, and how it's shown:
    │   │   ├── format.js        #     the saved shape (checks and fixes it)
    │   │   ├── saved.js         #     saved shape <-> the editor's page
    │   │   ├── layouts.js       #     a gift's phone, tablet and desktop layouts
    │   │   ├── info.js          #     its title and day
    │   │   └── Viewer.jsx       #     shows it, fitted to the screen
    │   ├── Editor.jsx           #   the whole editor (components/, state/ are its parts)
    │   ├── preview/             #   its live preview, with phone and tablet frames
    │   ├── Demo.jsx             #   the samples at /i/demo, /g/demo and /g/birthday
    │   └── index.css            #   the engine's styles
    └── lib/
        ├── projects.ts          # what an invitation and a gift are; their addresses
        ├── drafts.ts            # what's being made, kept in this browser (IndexedDB)
        ├── samples.ts           # made-up ones for Home, until saving is built
        ├── demos.ts             # the pages at /i/demo, /g/demo and /g/birthday
        ├── link-preview.ts      # the title and picture a link shows in a chat
        ├── engine-fonts.ts      # the engine's fonts
        ├── env.ts               # settings from .env.local
        ├── user.ts              # who is signed in (getUser, requireUser)
        ├── dates.ts             # days, in Nepal's time
        ├── safe-path.ts         # only go to our own pages after sign-in
        └── supabase/            # talking to Supabase (and what to do when it's down)
