// /i/… : an invitation, as its guests open it. A few built-in demos (lib/demos.ts),
// and everything published (lib/project-store.ts).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Open from "@/components/open/Open";
import OpenPublished from "@/components/open/OpenPublished";
import { infoOf } from "@/engine/page/info";
import { DEMO_INVITATIONS, findDemo } from "@/lib/demos";
import { linkPreview, previewOf } from "@/lib/link-preview";
import { openPublished } from "@/lib/project-store";

// (read once a visit, for both the page and its link preview)
const published = cache(async (slug: string) => {
  const found = await openPublished(slug);
  return found?.kind === "invitation" ? found.saved : null;
});

export async function generateMetadata({ params }: PageProps<"/i/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const demo = findDemo(DEMO_INVITATIONS, slug);
  if (demo) return linkPreview(demo);
  const saved = await published(slug);
  return saved ? linkPreview(previewOf(saved)) : {};
}

export default async function OpenPage({ params }: PageProps<"/i/[slug]">) {
  const { slug } = await params;
  const demo = findDemo(DEMO_INVITATIONS, slug);
  if (demo) return <Open demo={demo} />;
  const saved = await published(slug);
  if (!saved) notFound();
  return <OpenPublished saved={saved} lines={infoOf(saved).title.split(" & ")} />;
}
