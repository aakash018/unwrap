// /invitations/…/edit : making an invitation (private).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Edit from "@/components/editor/Edit";
import { loadProject } from "@/lib/project-store";
import { editUrl, isProjectId } from "@/lib/projects";
import { requireUser } from "@/lib/user";

export const metadata: Metadata = { title: "Edit" };

export default async function EditPage({ params }: PageProps<"/invitations/[id]/edit">) {
  const { id } = await params;
  if (!isProjectId(id)) notFound();

  await requireUser(editUrl("invitation", id));
  const project = await loadProject(id); // (only ever one of yours)
  if (project?.kind !== "invitation") notFound();
  return <Edit kind="invitation" id={id} saved={project.saved} slug={project.slug} changed={project.changed} />;
}
