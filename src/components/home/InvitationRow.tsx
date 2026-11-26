// An invitation on Home: when it is, and when it was last edited.

import { fromToday, longDate } from "@/lib/dates";
import { templateName, type Invitation, type Status } from "@/lib/projects";
import Row from "./Row";

// (publishing and its link are in Row; the guest list and taking it offline aren't built yet)
const NOT_YET: Record<Status, [string, string][]> = {
  draft: [],
  live: [
    ["Guests", "The guest list"],
    ["Take offline", "Taking it offline"],
  ],
  past: [["Guests", "The guest list"]],
};

type Props = { invitation: Invitation; now: string; onDelete: () => void };

export default function InvitationRow({ invitation, now, onDelete }: Props) {
  const { id, title, template, status, eventDay, edited, slug, changed } = invitation;
  const when = eventDay ? `${longDate(eventDay)}${status === "past" ? "" : `, ${fromToday(eventDay, now)}`}` : "No date yet";

  return (
    <Row
      kind="invitation"
      id={id}
      cover={template}
      title={title}
      design={templateName(template)}
      about={when}
      status={status}
      slug={slug}
      changed={changed}
      notYet={NOT_YET[status]}
      onDelete={onDelete}
      facts={<span className="text-soft">Edited {fromToday(edited, now)}</span>}
    />
  );
}
