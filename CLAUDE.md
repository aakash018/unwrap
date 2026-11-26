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
- **Invitations and gifts are separate things** (founder, 25 Nov 2026:
  "templates and themes are different"). An **invitation** is made from a
  template (`garden-wedding`, `hindu-wedding`) and has only its chapters. A
  **gift** is made by the sender on a theme (`love`, `marigold`, `birthday`,
  `anniversary`, `plain`), with basics and surprises. Never mix them: an
  invitation has no theme and no surprises ("No, gifts only"); a gift has no
  template, chapters, guests or RSVP. Names and addresses: `lib/projects.ts`.
- **Three ways to start a gift** (founder, 25 Nov 2026): a ready-made one
  (surprises and words in place, then changed freely), a theme, or plain.
  Ready-made gifts are in `engine/ready-made`; names for people in
  `lib/projects.ts` (READY_MADE). Once started it's a gift like any other: which
  one it came from isn't saved. "Template" stays the word for invitations. Three so
  far: Love, "A sky for you"; Birthday, "A garden for you" (for anyone, not
  only a partner); and Anniversary, "A lake for two" (a paper crane in the box:
  cranes pair for life). Both are sweet and a little funny, with Nepali accents, and
  easter eggs that lead to each other.
- **Easter eggs:** the Hidden message block (`blocks/secret`) is a tiny star;
  finding all of them on a page fires `unwrap:celebrate`, which ThemeLayer hands
  to the theme (`scene.celebrate`, else a few bursts). Love's own: the moon, and
  the rooftops. Birthday's own: the branches (flowers fall), the presents on the
  grass (a balloon comes out), the cake (its candles go out) and the tall grass
  in front of the table (sways; tap or brush it, `scene.brush` from ThemeLayer).
  The table's garland is greenery, jasmine, jacaranda and roses (no vases): the
  founder found marigolds out of place at this garden party (26 Nov 2026). Its
  falling jacaranda flowers are `upright` pieces (themes/particles.js, drawn with
  `pose()`): cup up, gliding side to side and leaning into it, each a little
  heavier or lighter, instead of tumbling (the founder: they "seem like paper").
  Birthday's easter eggs (founder, 26 Nov 2026: one moment to see, one to
  feel, one to hear; spelling the name happens once, not in every egg): tap a
  flag and the middle swag of bunting turns over flag by flag, spelling the
  receiver's first name in gold (`name()`: ThemeLayer's `name` prop, from the
  gift's `opening.name`; GiftPage and Canvas pass it; no name → "Hurray");
  tap the bulbs and each chimes the next note of "Happy Birthday" with a gold
  note floating off it (`themes/chime.js`: Web Audio, no files, quiet, only
  ever from a tap; no mute button yet); a dandelion clock in the grass between
  the presents (`themes/dandelion.js`): tap or brush it and its seeds float
  away up the page, a new head grows in 16 s. The finale plays the whole song
  with the bulbs lighting in time, spells the name, blows the dandelion, and
  sends balloons up. The ready-made's hidden messages lead to each.
  Anniversary's own,
  each about the two of them (founder, 26 Nov 2026: Love's eggs make people
  feel special, the others didn't): a lamp set afloat gets a second one that
  comes to join it and stays beside it; tapping a candle joins the first stars
  into a gold heart; tapping the boat shows two people sitting close in it;
  every star found gathers the lamps into a heart on the water. A grabbable
  thing tapped without moving calls `scene.tapHeld(point)` (ThemeLayer).
- **Each surprise has its own job** (founder, 25 Nov 2026: "gift box and letter
  have the same use case"). Letter = long words. Gift box = a present to unwrap,
  never words: roses, butterflies, a paper crane or a framed photo (`blocks/giftbox/presents.js`;
  the founder turned down momo, a teddy bear, a music box and a ring). Scratch card =
  a promise or prize. Sticky note = flip. Hidden message = find.
- **Presents are rendered, not drawn** (25 Nov 2026: the drawn roses and a ring
  "look so cheap" beside the themes). The box, roses, petals, butterflies' wings and crane are 3D
  models path-traced by `tools/presents` (its own small renderer, C++) into
  `public/presents`; run `bash tools/presents/bake.sh` after changing a model.
  Every rose in front is its own picture on a spring, to brush, tap and pick
  (Roses.jsx; the founder didn't want them to turn). Butterflies and the crane
  leave the box: they live on a sheet over the page (`pageLayer.js`), moved
  directly, not by React, and are put away when the box closes. The silk is rendered grey and
  tinted the sender's colour in the browser.
  **The box opens on film** (25 Nov 2026: the opening "looks very cheap" when the
  bow squashed and the lid slid off): the ribbon's fall is simulated
  (`tools/presents/ribbon.h`) and, with the lid swinging open, rendered frame by
  frame; `opening.js` plays the films on two canvases (`film.js`, `films.js` is
  made by sheets.mjs), `burst.js` throws the petals. The films (~800 KB) are
  fetched as the box comes near the screen. Phones (touch screens) get the
  `-small` films and less sharp canvases: the full set crashed phone browsers
  (founder, 26 Nov 2026). Keep canvases few and reused there: never make one a
  frame, and set a finished one's size to 0 so its memory comes back at once.
- **Between pages: a thin line at the top** (`components/PageProgress.tsx`, in
  the site's and the editor's layouts; founder, 26 Nov 2026). It starts when a
  link to another page here is clicked (caught first, as Next.js's links stop
  the click), when a form marked `data-progress` is sent (signing in and out),
  or when code calls `startProgress()` before `router.push`. It shows only after
  150 ms, creeps towards 92%, and fills and fades when the new page is there.
  Most moves cross between the site and the editor, which reload the whole
  page: the line stays on the old one until the new one has loaded.
- **The wedding openings on cheap phones** (founder, 26 Nov 2026: the garden
  hero lagged). Measured with a weak graphics chip (`--use-angle=swiftshader`):
  8 frames a second, nearly all of it the tall grass (thousands of curved
  strokes redrawn as they sway). On touch screens now: the grass has 40% of
  its blades, a little thicker, plain ends (`grass.js`); layers redrawn every
  frame are drawn every other frame and at most 1 canvas px per page px, still
  ones at most 1.25 (`StoryScene.jsx`); still layers can be painted as one on
  phones (`phoneGroup`, with `phoneLook`), or left out (`phone: false`): in the
  garden, sky + sun, the three hills, lawn + stone + altar; no vignette. The
  names' shadows are a copy of the words with a text-shadow, not a CSS
  drop-shadow filter (worked out again every frame as they move). Result: 52
  frames a second with the weak chip. Measure a layer's cost by stopping its
  drawing, not by guessing.
  Then the founder still saw lag and the background colour while scrolling on
  the phone: the address bar sliding in and out changed the window's height,
  and an invitation's opening repainted all its pictures each time (gifts
  already ignored it). Now `page/Viewer.jsx` gives phones the full screen
  height (100lvh) and keeps it while the width stays the same. The phone
  simulation can't show an address bar: test it by changing the emulated
  height mid-scroll and counting repaints.
- **A gift opens with its loader** (founder, 26 Nov 2026: opening a gift froze,
  and the box's pictures weren't ready). `engine/page/Loader.jsx`: a fine gold bow
  draws itself over the theme's deep colour, then a line of words (default
  "मायाको कोसेली, हजुरको लागि"), the receiver's name in large italic, a gold
  hairline that fills as things load, and "unwrap कोसेली" small at the bottom
  (the site's logo font, Hanken Grotesk, `--f6`). With no name: तिम्रो लागि over
  a large कोसेली. It's markup + CSS (index.css, `.gift-loader`), so it's in the
  first HTML. Behind it everything loads: anything slow says so with
  `holdOpen(promise)` (`page/ready.js`): the theme's still pictures, each gift
  box's pictures, films and petals. It always stays at least 4 s after the
  link was opened (founder, 26 Nov 2026: "no matter what"), then until all are
  done; something that fails counts as done, and only something stuck opens it
  at 20 s anyway; a box tapped before its films are here wiggles until they are. The
  bow comes undone, the words drift up, the gift shows through. The name and
  words are saved with the gift (`opening: { name, words }`), set in the editor's
  "Opening" section with one-tap suggestions; the editor's Preview shows the
  loader too. Invitations still show their first words (components/open).
- **Phones: test with phone specs, not just a phone-sized window** (founder,
  26 Nov 2026: a long gift froze, its background never showed). The cause was
  the theme: its still pictures are page-tall, ~34 million pixels on a long
  gift, painted all at once. On touch screens ThemeLayer now gives them a pixel
  budget (`PHONE_BACKDROP`, `PHONE_LAYERS`, `PHONE_LIVE`) and paints one picture
  per turn. To check, run Chrome with its processor slowed 6× and
  `--enable-low-end-device-mode` (and once with software graphics,
  `--use-angle=swiftshader`), as a phone with touch, and measure long tasks
  and frame rate: before, a 14 s freeze on /g/demo; after, under 0.5 s. Anything else meant to look like a
  real thing should be made this way, never as flat SVG.
- **Reading:** letters and hidden messages open in `blocks/shared/Reader.jsx`
  (a portal on the body). Receivers don't see a voice note with no recording.
- **Saved shape** (format 1, `engine/page/format.js`): content, never layout.
  - invitation `{ format, kind, template, chapters: [{ id, type, props }] }`
  - gift `{ format, kind, theme, background, elements: [{ id, type, frame, frames?, props }] }`
  - Every ceremony has its own `id` (RSVP will need it). Photos are still
    data URLs until there's Storage.
  - Old drafts (`page`) are upgraded by `upToDate` in `lib/drafts.ts`; an old
    invitation's extra elements are dropped.
- **The engine** is in `src/engine`, JavaScript, moved from `../enginev1` on
  25 Nov 2026 (that folder is frozen; its CLAUDE.md has the founder's taste
  and how every scene was built). Keep it JavaScript. It has its own root
  layouts and CSS (`app/(open)`, `app/(editor)`, `engine/index.css`), because
  it uses the same Tailwind names as the site for different fonts and colours.
  - The server can't import blocks (`Path2D` at load). `page/format.js` and
    `page/info.js` are safe anywhere.
  - Guests must not load editor code: settings panels are only in
    `blocks/settings.js`. At phone size `/i/demo` is ~200 KB of JS and
    ~106 MB of canvas (2x screen), 120 fps on a Mac. The founder found the
    engine's Netlify version fine on a Nothing Phone (3a), a mid-range
    Android (25 Nov 2026); Unwrap's copy, iPhones and cheaper phones untried.
    Test phones through a hosted address, not over Wi-Fi.
  - New ids come from `utils/newId.js` (crypto.randomUUID is missing on http).
  - ESLint has lighter rules there, but `no-undef` is an error.
- **Editor:** private, computers only. `engine/Editor.jsx` loads and saves
  nothing itself; `components/editor/Edit.tsx` gives it a page and saves every
  change half a second later, through a server action (`app/projects/actions.ts`
  → `lib/project-store.ts`, the only code that touches the `projects` table).
  The edit and preview pages load the draft on the server (404 if it isn't
  yours). Photos are still kept inside the draft, made small when added
  (`engine/utils/readFileAsDataURL.js`: 1600 px, WebP); a save may be up to
  10 MB (`bodySizeLimit` in next.config, `MOST_BYTES`, the database's
  check). Drafts made before 26 Nov 2026 were in the browser (IndexedDB):
  Home moves them into the account once (`MoveDrafts.tsx`) and deletes each
  from the browser when it's saved. Two tabs editing one draft overwrite each other
  (last one wins); the preview passes over pages older than the saved draft. Removing a chapter asks first; putting it back restores
  its place and its first words. Text typed on the page keeps its letters
  (`readText` in EditableText).
- **Screens:** an invitation fills a wide screen, its words in the 430 px column
  in the middle. A **gift has three layouts** (founder, 25 Nov 2026: "so that
  everything is not in middle"): phone, tablet (640) and desktop (1200), in
  `page/layouts.js`. `frame` is the phone's place, `frames.tablet/desktop` the
  others; where there's none, `arrange` works one out from the phone's. Moving
  anything in a wide layout gives everything its own place there (`settle` in
  the reducer). Words and settings are shared; only place, size of words and
  alignment differ. The editor passes `shown` (blocks placed for the chosen
  device) to the canvas and panels, and adds `layout` to UPDATE_FRAME/ADD_BLOCK.
  Ready-made gifts place everything by hand in all three. A gift's theme is
  drawn as wide as the page, so decorations are placed from `world.width`.
- **Themes made of scenes:** Love (a night of lanterns; "looks really good"),
  Birthday (a party under the jacarandas) and Anniversary (lamps on Phewa Lake)
  have a top scene, a calm middle and an ending, each a real place at one time
  of day with its own colours (plum, lilac, teal). The founder picks the scene
  from a few ideas (25 Nov 2026). Marigold is still the older, flat kind. If a
  theme's text colours change, list the old ones in its `oldInks`. Light painted
  on a half-clear canvas goes dull when printed on paper: paint it afterwards,
  underneath (`destination-over`), as `afterglow` and `lowSun` do.
- **Theme layer:** the live canvas is only as tall as the screen and follows the
  scroll (`ThemeLayer.jsx`): whole-page
  drawing every frame isn't possible there. Swiping scrolls; tapping bursts.
- **Home (`/home`)** is two plain lists, read from the database on the server
  (the made-up samples are gone). A row's menu: Edit, Preview, Publish (the
  first time with an activation code), Publish changes (once it's been edited
  since), Share link (copy it) and Delete; all in `Row.tsx` + `Publish.tsx`.
  Status: draft until published; an invitation is past after its day. Buttons
  without a feature (Guests, Take offline) use `NotYetButton`, which says so.
- **Links:** `/g/…` (gifts) and `/i/…` (invitations) open the built-in demos
  (`lib/demos.ts`) or else the published page (`open_page`), with a link
  preview worked out from it (`previewOf` in link-preview.ts).
- **Look** (founder, 25 Nov 2026: the first dashboard was "very very bad", the
  second "childish and trash", to come back to later): white page, plain
  lists, Hanken Grotesk only, ink with one accent (`wine`) and `leaf` for
  live. No beige, cards, badges, boxes in boxes or sidebar.
- **Database** (`supabase/migrations/20261126120000_first_tables.sql`, 26 Nov
  2026; applied to Supabase the same day; `projects` and publishing are used by
  the app, the rest (guests, RSVP, blessings, opens, media) not yet. Later
  files in supabase/migrations: drafts up to 10 MB; a code stays used even if
  its project is deleted (it used to be freed, so one code could be reused).
  The database is reached through the IPv4 pooler: host
  `aws-1-ap-southeast-2.pooler.supabase.com`, port 5432, user
  `postgres.<project ref>`, password `SUPABASE_DB_PASSWORD` in .env.local (the
  direct `db.<ref>.supabase.co` is IPv6 only, unreachable from this Mac). Run
  new migrations with psql `--single-transaction`; there's no Supabase CLI
  here): `projects` (the page as one JSON document:
  `draft`, and `published`, the frozen copy people see), `activation_codes`
  (sold by hand; the first publish needs one of the right kind, after that the
  project keeps it), `media`, `guests` (personal links, `seats`), `rsvps` (one
  a household: phone, veg / non-veg counts, `edit_key` to change it) +
  `rsvp_events` (each ceremony: coming, how many), `blessings`, `opens`.
  Row-level security on everything: senders read and change only their own;
  `published`/`slug` only through `publish()`. Guests are never signed in and
  never touch a table: the server calls `open_page`, `note_open`, `send_rsvp`
  and `send_blessing` (security definer functions that check everything) with
  the publishable key, so there is no secret key in the app. RSVP happens on
  the invitation itself (founder: "no need to go to Viber or WhatsApp"): a
  "Reply by" date replaces the WhatsApp link; ceremonies need an `id` each in
  the events chapter for it (not added yet).
- **Planned:** photo uploads (Storage), guest links and RSVP, taking a link
  offline. No payment gateway. Database writes go through the
  server only.

Keep `README.md` and this file up to date.
