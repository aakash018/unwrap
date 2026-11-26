// What the browser asks the server to do with invitations and gifts: start
// one, save it, delete it, publish it. Each checks who is signed in; the
// database then only lets them reach their own (lib/project-store.ts).
"use server";

import type { Saved } from "@/engine/page/types";
import { createProject, deleteProject, ProjectError, publishProject, saveProject } from "@/lib/project-store";
import { isProjectId, shareUrl, type Kind } from "@/lib/projects";
import { getUser } from "@/lib/user";

// What an action gives back: what was asked for, or words to show.
type Result<T> = ({ ok: true } & T) | { ok: false; problem: string };

const SIGNED_OUT = { ok: false, problem: "You're signed out. Sign in again, then try once more." } as const;

// Words for what went wrong (the details stay in the server's log).
function problemOf(problem: unknown, what: string): { ok: false; problem: string } {
  if (problem instanceof ProjectError) {
    if (problem.message === "too big") return { ok: false, problem: "It's too big to save: take out a photo or two." };
    if (problem.message.endsWith(".")) return { ok: false, problem: problem.message };
  }
  console.error(`${what} failed:`, problem);
  return { ok: false, problem: "That didn't work. Please try again." };
}

export async function startProject(saved: Saved): Promise<Result<{ id: string }>> {
  if (!(await getUser())) return SIGNED_OUT;
  try {
    return { ok: true, id: await createProject(saved) };
  } catch (problem) {
    return problemOf(problem, "Starting a project");
  }
}

export async function saveDraft(id: string, saved: Saved): Promise<Result<object>> {
  if (!isProjectId(id)) return { ok: false, problem: "No such project." };
  if (!(await getUser())) return SIGNED_OUT;
  try {
    await saveProject(id, saved);
    return { ok: true };
  } catch (problem) {
    return problemOf(problem, "Saving a draft");
  }
}

export async function removeProject(id: string): Promise<Result<object>> {
  if (!isProjectId(id)) return { ok: false, problem: "No such project." };
  if (!(await getUser())) return SIGNED_OUT;
  try {
    await deleteProject(id);
    return { ok: true };
  } catch (problem) {
    return problemOf(problem, "Deleting a project");
  }
}

// `code` only the first time. Gives back the link to share.
export async function publish(id: string, kind: Kind, code: string): Promise<Result<{ url: string }>> {
  if (!isProjectId(id)) return { ok: false, problem: "No such project." };
  if (!(await getUser())) return SIGNED_OUT;
  try {
    const slug = await publishProject(id, code.trim() || null);
    return { ok: true, url: shareUrl(kind, slug) };
  } catch (problem) {
    return problemOf(problem, "Publishing");
  }
}
