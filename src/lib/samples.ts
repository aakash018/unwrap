// Made-up invitations and gifts, to design with. They go away once real ones
// are saved in the database.

import { addDays } from "./dates";
import type { Gift, Invitation } from "./projects";

export function sampleInvitations(now: string): Invitation[] {
  return [
    {
      kind: "invitation",
      id: "soni-aaku",
      title: "Soni & Aaku",
      template: "garden-wedding",
      status: "live",
      edited: addDays(now, -2),
      eventDay: addDays(now, 7),
      guests: { invited: 220, replied: 148, coming: 121 },
      sample: true,
    },
    {
      kind: "invitation",
      id: "rita-bikash",
      title: "Rita & Bikash",
      template: "hindu-wedding",
      status: "draft",
      edited: now,
      eventDay: addDays(now, 64),
      sample: true,
    },
    {
      kind: "invitation",
      id: "anita-prakash",
      title: "Anita & Prakash",
      template: "hindu-wedding",
      status: "past",
      edited: addDays(now, -190),
      eventDay: addDays(now, -184),
      guests: { invited: 340, replied: 309, coming: 268 },
      sample: true,
    },
  ];
}

export function sampleGifts(now: string): Gift[] {
  return [
    { kind: "gift", id: "for-maya", title: "For Maya", theme: "love", toName: "Maya", status: "draft", edited: addDays(now, -9), sample: true },
  ];
}
