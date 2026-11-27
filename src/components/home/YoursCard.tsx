// One of yours on Home: its cover (the theme's or template's picture), its
// title, and one line of how it is ("Opened · 2 Nov", "Draft", "Live · 1 Dec").
// The picture opens it; the ··· menu has Edit, Preview, Publish, Share link
// and Delete (Publish.tsx is the box for publishing and its link).
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { removeProject } from "@/app/projects/actions";
import { fromToday, longDate, today } from "@/lib/dates";
import { editUrl, previewUrl, type Gift, type Invitation } from "@/lib/projects";
import Cover from "./Cover";
import Icon from "./Icon";
import Menu, { MENU_ITEM } from "./Menu";
import Publish from "./Publish";

export type Opens = { opens: number; openedToday: number; lastOpened?: string };

// "2 Nov", "today", "yesterday"
const shortDay = (iso: string) => {
  const day = today(Date.parse(iso));
  const ago = fromToday(day, today());
  return Math.abs(Date.parse(iso) - Date.now()) < 2 * 86400000 ? ago : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(Date.parse(iso));
};

function statusOf(one: (Gift | Invitation) & Opens): { words: string; live: boolean } {
  if (one.status === "draft") return { words: one.edited === today() ? "Draft · edited today" : "Draft", live: false };
  if (one.kind === "invitation") {
    if (one.status === "past") return { words: "Ended", live: false };
    return { words: one.eventDay ? `Live · ${longDate(one.eventDay).replace(/ \d{4}$/, "")}` : "Live", live: true };
  }
  return one.lastOpened ? { words: `Opened · ${shortDay(one.lastOpened)}`, live: true } : { words: "Sent · not opened yet", live: false };
}

export default function YoursCard({ one }: { one: (Gift | Invitation) & Opens }) {
  const router = useRouter();
  const publishBox = useRef<HTMLDialogElement>(null);
  const { kind, id, title, slug, changed } = one;
  const past = one.status === "past";
  const status = statusOf(one);

  const remove = async () => {
    const live = one.status === "live" ? " Its link will stop working." : "";
    if (!window.confirm(`Delete "${title}"?${live} This can't be undone.`)) return;
    const done = await removeProject(id).catch(() => ({ ok: false, problem: "That didn't work. Check your connection." }) as const);
    if (!done.ok) window.alert(done.problem);
    router.refresh();
  };

  return (
    <li className="group relative">
      <Link href={past ? previewUrl(kind, id) : editUrl(kind, id)} prefetch={false} className="block rounded-md transition-transform group-hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
        <Cover of={kind === "gift" ? one.theme : one.template} sizes="12rem" background={one.kind === "gift" ? one.background : undefined} label={title} />
      </Link>
      <div className="mt-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium">{title}</p>
          <p className={`text-sm ${status.live ? "text-leaf" : "text-soft"}`}>{status.words}</p>
        </div>
        <Menu label={`More for ${title}`} button={<Icon name="more" />} buttonClass="-mr-2 grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-soft hover:bg-ink/5 hover:text-ink">
          {!past && (
            <Link href={editUrl(kind, id)} prefetch={false} className={MENU_ITEM}>
              Edit
            </Link>
          )}
          <Link href={previewUrl(kind, id)} prefetch={false} target="_blank" className={MENU_ITEM}>
            Preview
          </Link>
          {(!slug || (changed && !past)) && (
            <button type="button" onClick={() => publishBox.current?.showModal()} className={MENU_ITEM}>
              {slug ? "Publish changes" : "Publish"}
            </button>
          )}
          {slug && (
            <button type="button" onClick={() => publishBox.current?.showModal()} className={MENU_ITEM}>
              Share link
            </button>
          )}
          <button type="button" onClick={remove} className={`${MENU_ITEM} text-wine`}>
            Delete
          </button>
        </Menu>
      </div>
      <Publish ref={publishBox} kind={kind} id={id} title={title} slug={slug} changed={changed} person={one.kind === "gift" ? one.toName : undefined} />
    </li>
  );
}
