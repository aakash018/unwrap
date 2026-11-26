// The title, text and picture shown when a link is sent in Messenger or Viber.

import type { Metadata } from "next";
import { infoOf } from "@/engine/page/info";
import type { Saved } from "@/engine/page/types";
import { weekdayDate } from "./dates";

type Preview = { title: string; description: string; template?: string; theme?: string };

export function linkPreview({ title, description, template, theme }: Preview): Metadata {
  const image = { url: `/share/${template ?? theme}.jpg`, width: 1200, height: 630 };
  return {
    title,
    description,
    openGraph: { type: "website", title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

// For a published invitation or gift: worked out from what's in it.
export function previewOf(saved: Saved): Preview {
  if (saved.kind === "gift") {
    const name = saved.opening?.name?.trim();
    return { title: name ? `A gift for ${name}` : "A gift for you", description: "Open it when you have a quiet minute.", theme: saved.theme };
  }
  const { title, eventDay } = infoOf(saved) as { title: string; eventDay?: string };
  const married = title.includes("&") ? `${title} are getting married` : title;
  return { title: married, description: eventDay ? weekdayDate(eventDay) : "You're invited.", template: saved.template };
}
