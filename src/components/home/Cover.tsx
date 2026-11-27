// The picture of a template, a theme or a ready-made gift. Its parent decides the size.
// Where there's no picture (the Plain theme), the page's own colour, with its
// title quietly in the middle (`background`, `label`).

import Image from "next/image";
import { COVERS } from "@/covers";
import type { ReadyMadeId, TemplateId, ThemeId } from "@/engine/page/types";

// a dark page colour gets light words on its cover
const isDark = (hex?: string) => {
  const n = parseInt(hex?.replace("#", "") ?? "", 16);
  if (!hex || Number.isNaN(n)) return false;
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 140;
};

type Props = { of: TemplateId | ThemeId | ReadyMadeId; sizes: string; background?: string; label?: string };

export default function Cover({ of, sizes, background, label }: Props) {
  const picture = COVERS[of];
  return (
    <span
      className="@container relative block aspect-5/7 w-full overflow-hidden rounded-md bg-[#fbf7f0] ring-1 ring-ink/8 ring-inset"
      style={!picture && background ? { background: `linear-gradient(150deg, rgba(255,255,255,0.45), rgba(255,255,255,0) 55%), ${background}` } : undefined}
    >
      {picture && <Image src={picture} alt="" fill sizes={sizes} placeholder="blur" className="object-cover" />}
      {!picture && label && (
        <span className={`absolute inset-0 grid place-items-center p-[12%] text-center leading-tight font-medium tracking-tight ${isDark(background) ? "text-white/85" : "text-ink/70"}`} style={{ fontSize: "clamp(11px, 9cqw, 22px)" }}>
          <span className="line-clamp-4">{label}</span>
        </span>
      )}
    </span>
  );
}
