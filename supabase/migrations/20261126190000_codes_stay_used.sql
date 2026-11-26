-- Fixes to publish() (first_tables.sql), found while trying it in the app:
--   • a code stays used for good. Deleting a published project used to free
--     its code (project_id becomes null), so publishing, deleting and
--     publishing again could reuse one code for ever.
--   • "that code is for an invitation", not "a invitation".

create or replace function public.publish(project uuid, code text default null) returns text
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
    if not found or c.used_at is not null then -- (used once is used: even if that project was deleted since)
      raise exception 'that code doesn''t work' using errcode = 'P0001', hint = 'code';
    end if;
    if c.kind <> p.kind then
      raise exception 'that code is for %', case c.kind when 'gift' then 'a gift' else 'an invitation' end
        using errcode = 'P0001', hint = 'code';
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
