import type { ReadyMadeId, SavedGift, SavedInvitation, TemplateId, ThemeId } from "../page/types";

export function startInvitation(template: TemplateId, names?: string[]): SavedInvitation;

type Names = { toName?: string; fromName?: string };
export function startGift(from: ({ theme: ThemeId } | { readyMadeId: ReadyMadeId }) & Names): SavedGift;
