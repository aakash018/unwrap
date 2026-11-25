// The title, text and picture shown when a link is sent in Messenger or Viber.

import type { Metadata } from "next";
import type { Demo } from "./demos";

export function linkPreview({ title, description, template, theme }: Demo): Metadata {
  const image = { url: `/share/${template ?? theme}.jpg`, width: 1200, height: 630 };
  return {
    title,
    description,
    openGraph: { type: "website", title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}
