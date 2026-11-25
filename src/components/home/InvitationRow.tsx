// An invitation on Home: when it is, and how many have replied.

import { fromToday, longDate } from "@/lib/dates";
import { templateName, type Invitation, type Status } from "@/lib/projects";
import Row from "./Row";

const NOT_YET: Record<Status, [string, string][]> = {
  draft: [["Publish", "Publishing"]],
  live: [
    ["Guests", "The guest list"],
    ["Copy link", "Copying the link"],
    ["Take offline", "Taking it offline"],
  ],
  past: [["Guests", "The guest list"]],
};

type Props = { invitation: Invitation; now: string; onDelete: () => void };

export default function InvitationRow({ invitation, now, onDelete }: Props) {
  const { id, title, template, status, eventDay, guests, edited, sample } = invitation;
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
      sample={sample}
      notYet={NOT_YET[status]}
      onDelete={onDelete}
      facts={
        guests ? (
          <>
            {guests.replied} of {guests.invited} replied
            <span className="block text-soft">{guests.coming} coming</span>
          </>
        ) : (
          <span className="text-soft">Edited {fromToday(edited, now)}</span>
        )
      }
    />
  );
}
