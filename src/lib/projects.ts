// The two things people make here:
//   an invitation – from a template, for an event with many guests
//   a gift        – from a theme, made freely, for one person (or started from
//                   a ready-made one, and changed)

import type { ReadyMadeId, TemplateId, ThemeId } from "@/engine/page/types";

export type Kind = "invitation" | "gift";

export const TEMPLATES: { id: TemplateId; name: string; note: string }[] = [
  { id: "hindu-wedding", name: "Hindu Wedding", note: "A mandap under sky lanterns" },
  { id: "garden-wedding", name: "Garden Wedding", note: "A Christian ceremony at golden hour" },
];

export const THEMES: { id: ThemeId; name: string }[] = [
  { id: "love", name: "Love" },
  { id: "marigold", name: "Marigold" },
  { id: "birthday", name: "Birthday" },
  { id: "anniversary", name: "Anniversary" },
  { id: "plain", name: "Plain" },
];

export const READY_MADE: { id: ReadyMadeId; name: string; note: string }[] = [
  { id: "love-sky", name: "A sky for you", note: "Love. Roses to unwrap, notes, photos, a letter, your voice, a promise to scratch off, and three hidden messages." },
  { id: "birthday-garden", name: "A garden for you", note: "Birthday. Butterflies to let out, notes, photos, a letter, your singing, a coupon to scratch off, and candles to blow out." },
  { id: "anniversary-lake", name: "A lake for two", note: "Anniversary. A paper crane to unwrap, notes, photos of you two, a letter, your song, a promise for the year ahead, and lamps to set afloat." },
];

export const templateName = (id: TemplateId) => TEMPLATES.find((template) => template.id === id)?.name ?? id;
export const themeName = (id: ThemeId) => THEMES.find((theme) => theme.id === id)?.name ?? id;

// draft = not sent yet · live = people can open it · past = its day is over
export type Status = "draft" | "live" | "past";

type Project = {
  id: string;
  title: string;
  status: Status;
  edited: string; // a day
  sample?: boolean; // made up, not yours
};

export type Invitation = Project & {
  kind: "invitation";
  template: TemplateId;
  eventDay?: string;
  guests?: { invited: number; replied: number; coming: number };
};

export type Gift = Project & {
  kind: "gift";
  theme: ThemeId;
  toName?: string;
};

// Ids are only ever letters, digits and dashes.
export const isProjectId = (id: string) => /^[A-Za-z0-9-]{1,64}$/.test(id);

export const editUrl = (kind: Kind, id: string) => `/${kind}s/${id}/edit`;
export const previewUrl = (kind: Kind, id: string) => `/${kind}s/${id}/preview`;
