// Sample links, to try the engine with until real ones are published:
// invitations at /i/…, gifts at /g/…

import type { ReadyMadeId, TemplateId, ThemeId } from "@/engine/page/types";

export type Demo = {
  template?: TemplateId;
  theme?: ThemeId;
  readyMadeId?: ReadyMadeId;
  names?: [string, string]; // an invitation's
  toName?: string; // a gift's
  fromName?: string;
  title: string; // shown in the browser tab and in link previews
  description: string;
  color: string; // behind the first words while it loads
};

export const DEMO_INVITATIONS: Record<string, Demo> = {
  demo: {
    template: "garden-wedding",
    names: ["Soni", "Aaku"],
    title: "Soni & Aaku are getting married",
    description: "Tuesday, 1 December 2026 · The Garden, Godawari",
    color: "#565a80",
  },
  "demo-hindu": {
    template: "hindu-wedding",
    names: ["Soni", "Aaku"],
    title: "Soni & Aaku are getting married",
    description: "Tuesday, 1 December 2026 · Patan Durbar Square",
    color: "#101540",
  },
};

export const DEMO_GIFTS: Record<string, Demo> = {
  demo: { theme: "love", readyMadeId: "love-sky", toName: "Maya", fromName: "Aaku", title: "A gift for Maya", description: "Open it when you have a quiet minute.", color: "#24123a" },
  anniversary: { theme: "anniversary", readyMadeId: "anniversary-lake", toName: "Soni", fromName: "Aaku", title: "Happy anniversary, Soni", description: "Another year of us. There’s a lake waiting.", color: "#14394a" },
  birthday: { theme: "birthday", readyMadeId: "birthday-garden", toName: "Maya", fromName: "Aaku", title: "Happy birthday, Maya", description: "Someone made you a garden.", color: "#3d2457" },
};

export const findDemo = (demos: Record<string, Demo>, slug: string) => (Object.hasOwn(demos, slug) ? demos[slug] : null);
