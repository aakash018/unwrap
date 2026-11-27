// /gifts/…/edit : making a gift (private).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Edit from "@/components/editor/Edit";
import { loadProject } from "@/lib/project-store";
import { editUrl, isProjectId } from "@/lib/projects";
import { requireUser } from "@/lib/user";

export const metadata: Metadata = { title: "Edit" };

export default async function EditPage({ params }: PageProps<"/gifts/[id]/edit">) {
  const { id } = await params;
  if (!isProjectId(id)) notFound();

  await requireUser(editUrl("gift", id));
  const project = await loadProject(id); // (only ever one of yours)
  if (project?.kind !== "gift") notFound();
  return <Edit kind="gift" id={id} saved={project.saved} slug={project.slug} changed={project.changed} />;
}
