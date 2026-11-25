// /gifts/…/edit : making a gift (private).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Edit from "@/components/editor/Edit";
import { today } from "@/lib/dates";
import { editUrl, isProjectId } from "@/lib/projects";
import { sampleGifts } from "@/lib/samples";
import { requireUser } from "@/lib/user";

export const metadata: Metadata = { title: "Edit" };

export default async function EditPage({ params }: PageProps<"/gifts/[id]/edit">) {
  const { id } = await params;
  if (!isProjectId(id)) notFound();

  const user = await requireUser(editUrl("gift", id));
  const sample = sampleGifts(today()).find((one) => one.id === id) ?? null;
  return <Edit owner={user.id} kind="gift" id={id} sample={sample} />;
}
