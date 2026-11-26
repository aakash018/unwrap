-- Unwrap's first tables: what people make, how it's published, and what
-- guests send back (RSVPs, blessings).
--
--   projects          one gift or invitation; the page is one JSON document
--                     (`draft` while editing, `published` = the copy people see)
--   activation_codes  sold by hand (no payment gateway); one publishes one project
--   media             photos and voice notes a project uses (files in Storage)
--   guests            invitations: one personal link each ("Dear Ram Uncle")
--   rsvps             one answer per household: name, phone, veg / non-veg, a note
--   rsvp_events       …and for each ceremony: coming or not, and how many
--   blessings         the lanterns guests light, kept for the couple
--   opens             who opened a page, and when ("Maya opened your gift")
--
-- Who can do what:
--   • Senders, signed in, read and change only their own things (row-level
--     security, owner = auth.uid()). They can't publish by writing to the
--     table: only publish() can, and it needs a code.
--   • Guests and receivers aren't signed in. They never touch a table: the
--     server calls the functions at the end of this file (open_page, note_open,
--     send_rsvp, send_blessing), which check everything they're given.

-- ── Helpers ─────────────────────────────────────────────────────────────────

-- A random string of letters and digits, for links and keys. `size` long.
create function public.random_key(size int) returns text
language sql volatile set search_path = '' as $$
  select string_agg(substr('abcdefghijkmnpqrstuvwxyz23456789', 1 + floor(random() * 32)::int, 1), '')
  from generate_series(1, size)
$$;
-- (random() is fine here: the links are hard to guess, not secrets; nothing
-- private is reachable with one alone.)

-- Keeps `updated_at` current.
create function public.touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end
$$;

-- ── Tables ──────────────────────────────────────────────────────────────────

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  kind text not null check (kind in ('gift', 'invitation')),
  title text not null default '' check (length(title) <= 120),
  to_name text check (length(to_name) <= 60), -- who a gift is for
  draft jsonb not null check (pg_column_size(draft) < 2000000),
  published jsonb, -- set only by publish()
  slug text unique, -- the link: /g/… or /i/…; set only by publish()
  published_at timestamptz,
  event_date date, -- invitations: after this day it's "past"
  rsvp_by date, -- invitations: the RSVP closes after this day (Nepal time)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.projects (owner);
create trigger touch before update on public.projects for each row execute function public.touch();

create table public.activation_codes (
  code text primary key check (code ~ '^[A-Z0-9-]{8,32}$'), -- e.g. KOSELI-7H2K-9QPD
  kind text not null check (kind in ('gift', 'invitation')),
  note text, -- for us: who bought it, how ("Ram, eSewa, 26 Nov")
  project_id uuid unique references public.projects on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  path text not null unique, -- in Storage: {owner}/{project}/{id}.webp
  kind text not null check (kind in ('photo', 'audio')),
  bytes int not null check (bytes > 0 and bytes <= 15000000),
  created_at timestamptz not null default now()
);
create index on public.media (project_id);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  name text not null check (length(name) between 1 and 80),
  token text not null unique default public.random_key(10), -- their personal link: ?to=…
  seats int not null default 1 check (seats between 1 and 30), -- how many the invite covers
  side text check (length(side) <= 40), -- bride's / groom's, if wanted
  created_at timestamptz not null default now()
);
create index on public.guests (project_id);

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  guest_id uuid unique references public.guests on delete cascade, -- null: from the open link
  name text not null check (length(name) between 1 and 80),
  phone text check (length(phone) <= 30),
  veg int not null default 0 check (veg between 0 and 30),
  non_veg int not null default 0 check (non_veg between 0 and 30),
  note text check (length(note) <= 500),
  edit_key text not null unique default public.random_key(16), -- kept on their phone, to change it later
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.rsvps (project_id);
create trigger touch before update on public.rsvps for each row execute function public.touch();

create table public.rsvp_events (
  rsvp_id uuid not null references public.rsvps on delete cascade,
  event_id text not null, -- the ceremony's id in the invitation
  coming boolean not null,
  count int not null default 0 check (count between 0 and 30),
  primary key (rsvp_id, event_id),
  check (coming or count = 0)
);

create table public.blessings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  guest_id uuid references public.guests on delete set null,
  name text not null check (length(name) between 1 and 80),
  message text not null check (length(message) between 1 and 280),
  hidden boolean not null default false, -- the couple can hide one
  created_at timestamptz not null default now()
);
create index on public.blessings (project_id);

create table public.opens (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects on delete cascade,
  guest_id uuid references public.guests on delete set null,
  opened_at timestamptz not null default now()
);
create index on public.opens (project_id);

-- ── Who can touch the tables ────────────────────────────────────────────────

-- Nothing for anyone to start with; then only what's listed.
revoke all on public.projects, public.activation_codes, public.media, public.guests, public.rsvps,
  public.rsvp_events, public.blessings, public.opens from anon, authenticated;

alter table public.projects enable row level security;
alter table public.activation_codes enable row level security; -- no rules: functions only
alter table public.media enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.rsvp_events enable row level security;
alter table public.blessings enable row level security;
alter table public.opens enable row level security;

-- Is this project mine? (used by the rules below)
create function public.mine(project uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.projects where id = project and owner = (select auth.uid()))
$$;
revoke execute on function public.mine(uuid) from public, anon;
grant execute on function public.mine(uuid) to authenticated;

-- projects: all of your own; publishing is publish()'s job
grant select, delete on public.projects to authenticated;
grant insert (kind, title, to_name, draft, event_date, rsvp_by) on public.projects to authenticated;
grant update (title, to_name, draft, event_date, rsvp_by) on public.projects to authenticated;
create policy "own projects" on public.projects for all to authenticated
  using (owner = (select auth.uid())) with check (owner = (select auth.uid()));

-- media: your own files, in your own projects
grant select, delete on public.media to authenticated;
grant insert (project_id, path, kind, bytes) on public.media to authenticated;
create policy "own media" on public.media for all to authenticated
  using (owner = (select auth.uid())) with check (owner = (select auth.uid()) and public.mine(project_id));

-- guests: your invitations' guest lists
grant select, delete on public.guests to authenticated;
grant insert (project_id, name, seats, side) on public.guests to authenticated;
grant update (name, seats, side) on public.guests to authenticated;
create policy "own guests" on public.guests for all to authenticated
  using (public.mine(project_id)) with check (public.mine(project_id));

-- what came back: yours to read (and to hide a blessing); guests write through the functions
grant select on public.rsvps, public.rsvp_events, public.blessings, public.opens to authenticated;
grant update (hidden) on public.blessings to authenticated;
create policy "own rsvps" on public.rsvps for select to authenticated using (public.mine(project_id));
create policy "own rsvp events" on public.rsvp_events for select to authenticated
  using (exists (select 1 from public.rsvps r where r.id = rsvp_id and public.mine(r.project_id)));
create policy "own blessings" on public.blessings for select to authenticated using (public.mine(project_id));
create policy "hide blessings" on public.blessings for update to authenticated
  using (public.mine(project_id)) with check (public.mine(project_id));
create policy "own opens" on public.opens for select to authenticated using (public.mine(project_id));

-- ── Publishing ──────────────────────────────────────────────────────────────

-- Publish one of your projects: what's in `draft` becomes what people see.
-- The first time it needs an unused code of the right kind; after that the
-- project keeps its code, so publishing changes again is free. Returns the link's slug.
create function public.publish(project uuid, code text default null) returns text
language plpgsql security definer set search_path = '' as $$
declare
  p public.projects;
  c public.activation_codes;
begin
  select * into p from public.projects where id = project and owner = (select auth.uid()) for update;
  if not found then
    raise exception 'not your project' using errcode = '42501';
  end if;

  if not exists (select 1 from public.activation_codes where project_id = p.id) then
    select * into c from public.activation_codes where activation_codes.code = upper(trim(publish.code)) for update;
    if not found or c.project_id is not null then
      raise exception 'that code doesn''t work' using errcode = 'P0001', hint = 'code';
    end if;
    if c.kind <> p.kind then
      raise exception 'that code is for a %', c.kind using errcode = 'P0001', hint = 'code';
    end if;
    update public.activation_codes set project_id = p.id, used_at = now() where activation_codes.code = c.code;
  end if;

  -- a new link the first time (tried again in the rare case it's taken)
  while p.slug is null loop
    p.slug := public.random_key(8);
    if exists (select 1 from public.projects where slug = p.slug) then
      p.slug := null;
    end if;
  end loop;

  update public.projects set published = draft, slug = p.slug, published_at = now() where id = p.id;
  return p.slug;
end
$$;

-- ── For guests and receivers (not signed in) ────────────────────────────────

-- A published page by its link, and who it's for when it's a personal link.
create function public.open_page(slug text, token text default null) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'kind', p.kind,
    'page', p.published,
    'rsvp_by', p.rsvp_by,
    'guest', (select jsonb_build_object('name', g.name, 'seats', g.seats)
              from public.guests g where g.project_id = p.id and g.token = open_page.token)
  )
  from public.projects p
  where p.slug = open_page.slug and p.published is not null
$$;

-- Someone opened it (called once a visit, not on every request).
create function public.note_open(slug text, token text default null) returns void
language sql security definer set search_path = '' as $$
  insert into public.opens (project_id, guest_id)
  select p.id, (select g.id from public.guests g where g.project_id = p.id and g.token = note_open.token)
  from public.projects p
  where p.slug = note_open.slug and p.published is not null
$$;

-- An RSVP, or a change to one. `answers` is a list like
--   [{"event": "wedding-1", "coming": true, "count": 3}, …]
-- with one entry for each ceremony they're answering. From a personal link
-- (`token`) it's that guest's answer; from the open link, `edit_key` (returned
-- the first time) lets the same phone change it later. Returns the edit key.
create function public.send_rsvp(
  slug text, name text, answers jsonb,
  token text default null, edit_key text default null,
  phone text default null, veg int default 0, non_veg int default 0, note text default null
) returns text
language plpgsql security definer set search_path = '' as $$
declare
  p public.projects;
  g public.guests;
  r public.rsvps;
  seats int;
  answer jsonb;
begin
  select * into p from public.projects
  where projects.slug = send_rsvp.slug and published is not null and kind = 'invitation';
  if not found then
    raise exception 'no such invitation' using errcode = 'P0002';
  end if;
  if p.rsvp_by is not null and (now() at time zone 'Asia/Kathmandu')::date > p.rsvp_by then
    raise exception 'the RSVP has closed' using errcode = 'P0001', hint = 'closed';
  end if;

  if token is not null then
    select * into g from public.guests where project_id = p.id and guests.token = send_rsvp.token;
    if not found then
      raise exception 'no such guest' using errcode = 'P0002';
    end if;
  end if;
  seats := coalesce(g.seats, 10); -- the open link: at most 10 a household

  if jsonb_typeof(answers) <> 'array' or jsonb_array_length(answers) = 0 then
    raise exception 'answer at least one ceremony' using errcode = '22023';
  end if;
  for answer in select * from jsonb_array_elements(answers) loop
    if not jsonb_path_exists(p.published, '$.chapters[*] ? (@.type == "events").props.events[*] ? (@.id == $e)',
                             jsonb_build_object('e', answer->>'event')) then
      raise exception 'no such ceremony: %', answer->>'event' using errcode = '22023';
    end if;
    if coalesce((answer->>'count')::int, 0) > seats then
      raise exception 'more people than the invitation is for' using errcode = '22023';
    end if;
  end loop;
  if veg + non_veg > seats then
    raise exception 'more meals than the invitation is for' using errcode = '22023';
  end if;

  -- their earlier answer, if there is one
  if g.id is not null then
    select * into r from public.rsvps where guest_id = g.id;
  elsif edit_key is not null then
    select * into r from public.rsvps where project_id = p.id and rsvps.edit_key = send_rsvp.edit_key;
  end if;

  if r.id is null then
    insert into public.rsvps (project_id, guest_id, name, phone, veg, non_veg, note)
    values (p.id, g.id, trim(send_rsvp.name), nullif(trim(phone), ''), veg, non_veg, nullif(trim(note), ''))
    returning * into r;
  else
    update public.rsvps set name = trim(send_rsvp.name), phone = nullif(trim(send_rsvp.phone), ''),
      veg = send_rsvp.veg, non_veg = send_rsvp.non_veg, note = nullif(trim(send_rsvp.note), '')
    where id = r.id;
    delete from public.rsvp_events where rsvp_id = r.id;
  end if;

  insert into public.rsvp_events (rsvp_id, event_id, coming, count)
  select r.id, a->>'event', (a->>'coming')::boolean,
         case when (a->>'coming')::boolean then greatest(1, coalesce((a->>'count')::int, 1)) else 0 end
  from jsonb_array_elements(answers) a;

  return r.edit_key;
end
$$;

-- A blessing (a lantern), kept for the couple.
create function public.send_blessing(slug text, name text, message text, token text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
  p public.projects;
begin
  select * into p from public.projects
  where projects.slug = send_blessing.slug and published is not null and kind = 'invitation';
  if not found then
    raise exception 'no such invitation' using errcode = 'P0002';
  end if;
  if (select count(*) from public.blessings where project_id = p.id) >= 3000 then
    raise exception 'too many blessings' using errcode = 'P0001';
  end if;
  insert into public.blessings (project_id, guest_id, name, message)
  values (p.id, (select id from public.guests where project_id = p.id and guests.token = send_blessing.token),
          trim(name), trim(message));
end
$$;

-- Functions can be called by everyone unless we say otherwise: only these.
revoke execute on function public.publish(uuid, text), public.open_page(text, text), public.note_open(text, text),
  public.send_rsvp(text, text, jsonb, text, text, text, int, int, text), public.send_blessing(text, text, text, text),
  public.touch() from public, anon, authenticated;
-- (random_key stays callable: it's the default for new guests' links)
grant execute on function public.publish(uuid, text) to authenticated;
grant execute on function public.open_page(text, text), public.note_open(text, text),
  public.send_rsvp(text, text, jsonb, text, text, text, int, int, text), public.send_blessing(text, text, text, text)
  to anon, authenticated;
