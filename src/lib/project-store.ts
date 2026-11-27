// Invitations and gifts, kept in the database (supabase/migrations). Only
// the server uses this. Every call runs as the signed-in person, so they only
// ever reach their own (the database's row-level security sees to that);
// people opening a link reach only what's published, through open_page().
//
//   listProjects()            Home's lists, the latest first
//   loadProject(id)           one, to edit or preview
//   createProject(saved)      a new one → its id
//   saveProject(id, saved)    its draft, again
//   deleteProject(id)
//   publishProject(id, code)  what people see becomes the draft → its link's slug
//   openPublished(slug)       a published page, for anyone with the link
//   noteOpened(slug)          someone opened it (not its own sender)

import { infoOf } from "@/engine/page/info";
import { upgrade } from "@/engine/page/format";
import type { Saved } from "@/engine/page/types";
import { createSupabase } from "@/lib/supabase/server";
import type { Kind } from "./projects";

// The most one draft may be (photos are inside it for now, made small:
// engine/utils/readFileAsDataURL.js). The database allows up to 10 MB.
export const MOST_BYTES = 9_000_000;

export type Listed = {
  id: string;
  kind: Kind;
  title: string;
  toName?: string;
  design: string; // its theme or template
  background?: string; // a gift's page colour (for a Plain one's cover)
  edited: string; // when, as an ISO time
  slug?: string; // once published
  publishedAt?: string;
  changed: boolean; // edited since it was published
  eventDay?: string; // an invitation's day, YYYY-MM-DD
  opens: number; // times its link was opened (by others)
  openedToday: number;
  lastOpened?: string; // ISO time
};

export type Loaded = { kind: Kind; saved: Saved; toName?: string; edited: number; slug?: string; changed: boolean };

export class ProjectError extends Error {}

// What goes in the table's other columns, worked out from the page.
function columnsOf(saved: Saved) {
  const info = infoOf(saved) as { title: string; eventDay?: string };
  return {
    title: info.title.slice(0, 120),
    event_date: info.eventDay ?? null,
    to_name: saved.kind === "gift" ? saved.opening?.name?.trim().slice(0, 60) || null : null,
  };
}

function check(saved: Saved) {
  if (saved?.kind !== "gift" && saved?.kind !== "invitation") throw new ProjectError("Not an invitation or a gift");
  if (JSON.stringify(saved).length > MOST_BYTES) throw new ProjectError("too big");
}

export async function listProjects(): Promise<Listed[]> {
  const supabase = await createSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("id, kind, title, to_name, updated_at, published_at, slug, event_date, theme:draft->>theme, template:draft->>template, background:draft->>background")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  const opens = await opensOf(supabase, data.filter((row) => row.published_at).map((row) => row.id));
  return data.map((row) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    toName: row.to_name ?? undefined,
    design: (row.kind === "gift" ? row.theme : row.template) ?? "plain",
    background: row.background ?? undefined,
    edited: row.updated_at,
    slug: row.slug ?? undefined,
    publishedAt: row.published_at ?? undefined,
    changed: Boolean(row.published_at && row.updated_at > row.published_at),
    eventDay: row.event_date ?? undefined,
    ...(opens.get(row.id) ?? { opens: 0, openedToday: 0 }),
  }));
}

// How often each published project was opened, today, and last.
async function opensOf(supabase: Awaited<ReturnType<typeof createSupabase>>, ids: string[]) {
  const counts = new Map<string, { opens: number; openedToday: number; lastOpened?: string }>();
  if (!ids.length) return counts;
  const { data, error } = await supabase.from("opens").select("project_id, opened_at").in("project_id", ids).order("opened_at", { ascending: false }).limit(5000);
  if (error) throw error;
  const today = Date.now() - 24 * 60 * 60 * 1000;
  for (const { project_id, opened_at } of data) {
    const one = counts.get(project_id) ?? { opens: 0, openedToday: 0, lastOpened: opened_at };
    one.opens += 1;
    if (Date.parse(opened_at) > today) one.openedToday += 1;
    counts.set(project_id, one);
  }
  return counts;
}

// null when there's no such project of yours.
export async function loadProject(id: string): Promise<Loaded | null> {
  const supabase = await createSupabase();
  const { data, error } = await supabase.from("projects").select("kind, draft, to_name, updated_at, slug, published_at").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    kind: data.kind,
    saved: upgrade(data.draft),
    toName: data.to_name ?? undefined,
    edited: Date.parse(data.updated_at),
    slug: data.slug ?? undefined,
    changed: Boolean(data.published_at && data.updated_at > data.published_at),
  };
}

export async function createProject(saved: Saved): Promise<string> {
  check(saved);
  const supabase = await createSupabase();
  const { data, error } = await supabase
    .from("projects")
    .insert({ kind: saved.kind, draft: saved, ...columnsOf(saved) })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function saveProject(id: string, saved: Saved): Promise<void> {
  check(saved);
  const supabase = await createSupabase();
  const { data, error } = await supabase
    .from("projects")
    .update({ draft: saved, ...columnsOf(saved) })
    .eq("id", id)
    .eq("kind", saved.kind) // (an invitation can't become a gift)
    .select("id");
  if (error) throw error;
  if (!data.length) throw new ProjectError("No such project");
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createSupabase();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// The first time it needs an activation code; after that it's free. Throws a
// ProjectError with words to show when the code is the problem.
export async function publishProject(id: string, code: string | null): Promise<string> {
  const supabase = await createSupabase();
  const { data, error } = await supabase.rpc("publish", { project: id, code: code || null });
  if (error) {
    if (error.hint === "code") throw new ProjectError(error.message.replace(/^./, (c) => c.toUpperCase()) + ".");
    throw error;
  }
  return data as string;
}

export type Published = { kind: Kind; saved: Saved };

// A published page by its link, or null. Anyone may open one, signed in or not.
export async function openPublished(slug: string): Promise<Published | null> {
  if (!/^[a-z0-9]{4,32}$/.test(slug)) return null;
  const supabase = await createSupabase();
  const { data, error } = await supabase.rpc("open_page", { slug });
  if (error) throw error;
  if (!data) return null;
  return { kind: data.kind, saved: upgrade(data.page) };
}

// Someone opened a published page: kept for its sender's Home ("Soni opened
// your gift"). Not when it's the sender's own (they can read their projects;
// nobody else can).
export async function noteOpened(slug: string): Promise<void> {
  if (!/^[a-z0-9]{4,32}$/.test(slug)) return;
  const supabase = await createSupabase();
  const { data: mine } = await supabase.from("projects").select("id").eq("slug", slug).maybeSingle();
  if (mine) return;
  const { error } = await supabase.rpc("note_open", { slug });
  if (error) throw error;
}
