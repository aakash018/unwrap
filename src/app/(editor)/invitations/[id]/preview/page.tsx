// /invitations/…/preview : an invitation as people will see it, while it's being made
// (private). With ?framed it's just the invitation, for the phone and tablet frames.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Preview from "@/components/editor/Preview";
import { today } from "@/lib/dates";
import { isProjectId, previewUrl } from "@/lib/projects";
import { sampleInvitations } from "@/lib/samples";
import { requireUser } from "@/lib/user";

export const metadata: Metadata = { title: "Preview" };

export default async function PreviewPage({ params, searchParams }: PageProps<"/invitations/[id]/preview">) {
  const { id } = await params;
  if (!isProjectId(id)) notFound();
  const { framed } = await searchParams;

  const user = await requireUser(previewUrl("invitation", id));
  const sample = sampleInvitations(today()).find((one) => one.id === id) ?? null;
  return <Preview owner={user.id} kind="invitation" id={id} sample={sample} framed={framed !== undefined} />;
}
