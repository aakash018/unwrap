// What's saved, for TypeScript (see format.js).

export type TemplateId = "hindu-wedding" | "garden-wedding";
export type ThemeId = "love" | "marigold" | "birthday" | "anniversary" | "plain";

// A gift with its surprises already in place, to start from (engine/ready-made).
export type ReadyMadeId = "love-sky" | "birthday-garden" | "anniversary-lake";

export type Chapter = { id: string; type: string; props: Record<string, unknown> };
// (size and align: for words, in that layout)
export type Frame = { x: number; y: number; w: number; rotation: number; size?: number; align?: string };
export type Element = Chapter & { frame: Frame; frames?: { tablet?: Frame; desktop?: Frame } };

export type SavedInvitation = { format: number; kind: "invitation"; template: TemplateId; chapters: Chapter[] };
// opening: who it's for and the words above their name, on its loader (page/Loader.jsx)
export type Opening = { name?: string; words?: string };
export type SavedGift = { format: number; kind: "gift"; theme: ThemeId; background: string; opening?: Opening; elements: Element[] };
export type Saved = SavedInvitation | SavedGift;
