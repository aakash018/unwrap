// /gifts/…/preview : a gift as people will see it, while it's being made
// (private). With ?framed it's just the gift, for the phone and tablet frames.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Preview from "@/components/editor/Preview";
import { loadProject } from "@/lib/project-store";
import { isProjectId, previewUrl } from "@/lib/projects";
import { requireUser } from "@/lib/user";

export const metadata: Metadata = { title: "Preview" };

export default async function PreviewPage({ params, searchParams }: PageProps<"/gifts/[id]/preview">) {
  const { id } = await params;
  if (!isProjectId(id)) notFound();
  const { framed } = await searchParams;

  await requireUser(previewUrl("gift", id));
  const project = await loadProject(id);
  if (project?.kind !== "gift") notFound();
  return <Preview kind="gift" id={id} saved={project.saved} toName={project.toName} edited={project.edited} framed={framed !== undefined} />;
}
