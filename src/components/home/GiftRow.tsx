// A gift on Home: who it's for, and its theme.

import { fromToday } from "@/lib/dates";
import { themeName, type Gift, type Status } from "@/lib/projects";
import Row from "./Row";

// (publishing and its link are in Row; taking it offline isn't built yet)
const NOT_YET: Record<Status, [string, string][]> = {
  draft: [],
  live: [["Take offline", "Taking it offline"]],
  past: [],
};

type Props = { gift: Gift; now: string; onDelete: () => void };

export default function GiftRow({ gift, now, onDelete }: Props) {
  const { id, title, theme, toName, status, edited, slug, changed } = gift;
  return (
    <Row
      kind="gift"
      id={id}
      cover={theme}
      title={title}
      about={[toName && `To ${toName}`, themeName(theme)].filter(Boolean).join(" · ")}
      status={status}
      slug={slug}
      changed={changed}
      notYet={NOT_YET[status]}
      onDelete={onDelete}
      facts={<span className="text-soft">Edited {fromToday(edited, now)}</span>}
    />
  );
}
