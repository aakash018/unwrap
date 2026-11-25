// The picture of a template, a theme or a ready-made gift. Its parent decides the size.

import Image from "next/image";
import { COVERS } from "@/covers";
import type { ReadyMadeId, TemplateId, ThemeId } from "@/engine/page/types";

export default function Cover({ of, sizes }: { of: TemplateId | ThemeId | ReadyMadeId; sizes: string }) {
  const picture = COVERS[of];
  return (
    <span className="relative block aspect-5/7 w-full overflow-hidden rounded-md bg-[#fbf7f0] ring-1 ring-ink/8 ring-inset">
      {picture && <Image src={picture} alt="" fill sizes={sizes} placeholder="blur" className="object-cover" />}
    </span>
  );
}
