// Home's two lists: invitations and gifts. What you've made is kept in this
// browser for now (lib/drafts.ts), and shown with the samples.
"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { infoOf } from "@/engine/page/info";
import { today } from "@/lib/dates";
import { deleteDraft, listDrafts, type Draft } from "@/lib/drafts";
import type { Gift, Invitation } from "@/lib/projects";
import GiftRow from "./GiftRow";
import InvitationRow from "./InvitationRow";
import NewGift from "./NewGift";
import NewInvitation from "./NewInvitation";

// Drafts as they're listed. An edited sample stays what it was (live, ended…),
// with its new words.
function asInvitation({ id, saved, edited }: Draft, samples: Invitation[]): Invitation | null {
  if (saved.kind !== "invitation") return null;
  const sample = samples.find((one) => one.id === id);
  const now = { ...infoOf(saved), template: saved.template, edited: today(edited) };
  return sample ? { ...sample, title: now.title, edited: now.edited } : { kind: "invitation", id, status: "draft", ...now };
}

function asGift({ id, saved, toName, edited }: Draft, samples: Gift[]): Gift | null {
  if (saved.kind !== "gift") return null;
  const sample = samples.find((one) => one.id === id);
  const now = { title: infoOf(saved).title, theme: saved.theme, edited: today(edited) };
  return sample ? { ...sample, ...now } : { kind: "gift", id, status: "draft", toName, ...now };
}

// Yours first, then the samples (the edited ones in place of themselves).
function withSamples<T extends { id: string }>(made: T[], samples: T[]): T[] {
  const isSample = (one: T) => samples.some(({ id }) => id === one.id);
  return [...made.filter((one) => !isSample(one)), ...samples.map((one) => made.find(({ id }) => id === one.id) ?? one)];
}

const exists = <T,>(one: T | null): one is T => one !== null;

type Props = { owner: string; name: string; invitations: Invitation[]; gifts: Gift[]; now: string };

export default function Lists({ owner, name, invitations: sampleInvitations, gifts: sampleGifts, now }: Props) {
  const [drafts, setDrafts] = useState<Draft[] | null>(null); // null: not read yet
  const read = useCallback(async () => setDrafts(await listDrafts(owner).catch(() => [])), [owner]);

  // read them now, and again when coming back from the editor
  useEffect(() => {
    const again = () => document.visibilityState === "visible" && read();
    again();
    document.addEventListener("visibilitychange", again);
    window.addEventListener("pageshow", again);
    return () => {
      document.removeEventListener("visibilitychange", again);
      window.removeEventListener("pageshow", again);
    };
  }, [read]);

  const made = drafts ?? [];
  const invitations = withSamples(made.map((one) => asInvitation(one, sampleInvitations)).filter(exists), sampleInvitations);
  const gifts = withSamples(made.map((one) => asGift(one, sampleGifts)).filter(exists), sampleGifts);

  const remove = async ({ id, title }: { id: string; title: string }) => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    await deleteDraft(owner, id);
    read();
  };

  return (
    <>
      <List title="Invitations" button={<NewInvitation owner={owner} />} none={drafts ? "No invitations yet. Choose a template to start one." : ""}>
        {invitations.map((one) => (
          <InvitationRow key={one.id} invitation={one} now={now} onDelete={() => remove(one)} />
        ))}
      </List>
      <List title="Gifts" button={<NewGift owner={owner} name={name} />} none={drafts ? "No gifts yet. Choose a theme and make something for someone." : ""}>
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
