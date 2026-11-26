// Pictures of every template, theme and ready-made gift, from the engine's own scenes.

import type { StaticImageData } from "next/image";
import type { ReadyMadeId, TemplateId, ThemeId } from "@/engine/page/types";
import anniversary from "./anniversary.jpg";
import birthday from "./birthday.jpg";
import anniversaryLake from "./anniversary-lake.jpg";
import birthdayGarden from "./birthday-garden.jpg";
import gardenWedding from "./garden-wedding.jpg";
import hinduWedding from "./hindu-wedding.jpg";
import love from "./love.jpg";
import loveSky from "./love-sky.jpg";
import marigold from "./marigold.jpg";

// (the plain theme has no picture)
export const COVERS: Record<TemplateId | ThemeId | ReadyMadeId, StaticImageData | null> = {
  "hindu-wedding": hinduWedding,
  "garden-wedding": gardenWedding,
  love,
  marigold,
  birthday,
  anniversary,
  plain: null,
  "love-sky": loveSky,
  "birthday-garden": birthdayGarden,
  "anniversary-lake": anniversaryLake,
};
