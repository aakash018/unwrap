// /i/… : an invitation, as its guests open it. Only samples for now.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Open from "@/components/open/Open";
import { DEMO_INVITATIONS, findDemo } from "@/lib/demos";
import { linkPreview } from "@/lib/link-preview";

export async function generateMetadata({ params }: PageProps<"/i/[slug]">): Promise<Metadata> {
  const demo = findDemo(DEMO_INVITATIONS, (await params).slug);
  return demo ? linkPreview(demo) : {};
}

export default async function OpenPage({ params }: PageProps<"/i/[slug]">) {
  const demo = findDemo(DEMO_INVITATIONS, (await params).slug);
  if (!demo) notFound();
  return <Open demo={demo} />;
}
