// /g/… : a gift, as the person it's for opens it. Only samples for now.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Open from "@/components/open/Open";
import { DEMO_GIFTS, findDemo } from "@/lib/demos";
import { linkPreview } from "@/lib/link-preview";

export async function generateMetadata({ params }: PageProps<"/g/[slug]">): Promise<Metadata> {
  const demo = findDemo(DEMO_GIFTS, (await params).slug);
  return demo ? linkPreview(demo) : {};
}

export default async function OpenPage({ params }: PageProps<"/g/[slug]">) {
  const demo = findDemo(DEMO_GIFTS, (await params).slug);
  if (!demo) notFound();
  return <Open demo={demo} />;
}
