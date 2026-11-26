-- A draft keeps its photos inside it for now (made small first:
-- engine/utils/readFileAsDataURL.js), so it may be up to 10 MB, not 2.
-- (When photos move to Storage, drafts become small again.)

alter table public.projects drop constraint projects_draft_check;
alter table public.projects add constraint projects_draft_check check (pg_column_size(draft) < 10000000);
