-- Special days: the dates a sender wants to remember for the people they make
-- gifts for (a birthday, an anniversary, or a day with its own name). Home
-- shows the next ones and offers to make a gift (components/home).
--
--   person    who it's for: "Soni"
--   kind      birthday, anniversary, or day (then `label` names it: "The day we met")
--   month/day it comes back every year; `year` (optional) is the first one,
--             so Home can say "turns 25" or "5 years"
--   calendar  'ad' for now; 'bs' (Bikram Sambat) once its dates can be worked
--             out each year
-- Each sender sees and changes only their own.

create table public.special_days (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  person text not null check (length(person) between 1 and 60),
  kind text not null check (kind in ('birthday', 'anniversary', 'day')),
  label text check (length(label) <= 60),
  month int not null check (month between 1 and 12),
  day int not null check (day between 1 and 31),
  year int check (year between 1900 and 2100),
  calendar text not null default 'ad' check (calendar in ('ad', 'bs')),
  created_at timestamptz not null default now()
);
create index on public.special_days (owner);

revoke all on public.special_days from anon, authenticated;
grant select, delete on public.special_days to authenticated;
grant insert (person, kind, label, month, day, year, calendar) on public.special_days to authenticated;
grant update (person, kind, label, month, day, year, calendar) on public.special_days to authenticated;
alter table public.special_days enable row level security;
create policy "own special days" on public.special_days for all to authenticated
  using (owner = (select auth.uid())) with check (owner = (select auth.uid()));
