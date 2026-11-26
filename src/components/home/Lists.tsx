// Home's two lists: invitations and gifts, as the server read them from the
// database (app/(site)/home/page.tsx). Deleting one reads them again.
"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { removeProject } from "@/app/projects/actions";
import type { Gift, Invitation } from "@/lib/projects";
import GiftRow from "./GiftRow";
import InvitationRow from "./InvitationRow";
import NewGift from "./NewGift";
import NewInvitation from "./NewInvitation";

type Props = { name: string; invitations: Invitation[]; gifts: Gift[]; now: string };

export default function Lists({ name, invitations, gifts, now }: Props) {
  const router = useRouter();

  const remove = async ({ id, title, status }: { id: string; title: string; status: string }) => {
    const live = status === "live" ? " Its link will stop working." : "";
    if (!window.confirm(`Delete "${title}"?${live} This can't be undone.`)) return;
    const done = await removeProject(id).catch(() => ({ ok: false, problem: "That didn't work. Check your connection." }) as const);
    if (!done.ok) window.alert(done.problem);
    router.refresh();
  };

  return (
    <>
      <List title="Invitations" button={<NewInvitation />} none="No invitations yet. Choose a template to start one.">
        {invitations.map((one) => (
          <InvitationRow key={one.id} invitation={one} now={now} onDelete={() => remove(one)} />
        ))}
      </List>
      <List title="Gifts" button={<NewGift name={name} />} none="No gifts yet. Choose a theme and make something for someone.">
        {gifts.map((one) => (
          <GiftRow key={one.id} gift={one} now={now} onDelete={() => remove(one)} />
        ))}
      </List>
    </>
  );
}

// `none` is said when the list is empty.
function List({ title, button, none, children }: { title: string; button: ReactNode; none: string; children: ReactNode[] }) {
  return (
    <section aria-label={title} className="mb-16">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {button}
      </div>
      {children.length > 0 ? <ul className="mt-3">{children}</ul> : <p className="mt-6 text-soft">{none}</p>}
    </section>
  );
}
