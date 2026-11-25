// One line in a list on Home: a small picture, a title, a few facts, and a
// menu. The whole line opens it.

import Link from "next/link";
import type { ReactNode } from "react";
import type { TemplateId, ThemeId } from "@/engine/page/types";
import { editUrl, previewUrl, type Kind, type Status } from "@/lib/projects";
import Cover from "./Cover";
import Icon from "./Icon";
import Menu, { MENU_ITEM } from "./Menu";
import NotYetButton from "./NotYetButton";
import { ROUND } from "./styles";

const STATUS: Record<Status, { name: string; dot: string }> = {
  live: { name: "Live", dot: "bg-leaf" },
  draft: { name: "Draft", dot: "border border-soft" },
  past: { name: "Ended", dot: "bg-soft/40" },
};

type Props = {
  kind: Kind;
  id: string;
  cover: TemplateId | ThemeId;
  title: string;
  design?: string; // its template, under the title (phones have no room for it)
  about: string; // after that
  facts: ReactNode; // in the middle, on wide screens
  status: Status;
  sample?: boolean;
  notYet: [string, string][]; // [what the menu says, what isn't ready yet]
  onDelete: () => void;
};

export default function Row({ kind, id, cover, title, design, about, facts, status, sample, notYet, onDelete }: Props) {
  const past = status === "past";
  const statusLine = (
    <>
      <span aria-hidden="true" className={`size-2 rounded-full ${STATUS[status].dot}`} />
      {STATUS[status].name}
    </>
  );

  return (
    <li className="relative -mx-3 flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-hover sm:gap-5">
      <span className="w-12 shrink-0">
        <Cover of={cover} sizes="3rem" />
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="flex items-baseline gap-2 font-semibold">
          <Link
            href={past ? previewUrl(kind, id) : editUrl(kind, id)}
            prefetch={false}
            className="truncate after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-wine"
          >
            {title}
          </Link>
          {sample && <span className="shrink-0 text-xs font-normal text-soft">Sample</span>}
        </h3>
        <p className="mt-0.5 text-sm text-soft">
          {design && <span className="max-sm:hidden">{design} · </span>}
          {about}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-sm text-soft sm:hidden">{statusLine}</p>
      </div>

      <div className="hidden w-52 shrink-0 text-sm md:block">{facts}</div>

      <p className="hidden w-16 shrink-0 items-center gap-2 text-sm text-soft sm:flex">{statusLine}</p>

      <div className="relative z-10">
        <Menu label={`More for ${title}`} button={<Icon name="more" />} buttonClass={ROUND}>
          {!past && (
            <Link href={editUrl(kind, id)} prefetch={false} className={MENU_ITEM}>
              Edit
            </Link>
          )}
          <Link href={previewUrl(kind, id)} prefetch={false} target="_blank" className={MENU_ITEM}>
            Preview
          </Link>
          {notYet.map(([name, what]) => (
            <NotYetButton key={name} what={what} className={MENU_ITEM}>
              {name}
            </NotYetButton>
          ))}
          {!sample && (
            <button type="button" onClick={onDelete} className={`${MENU_ITEM} text-wine`}>
              Delete
            </button>
          )}
        </Menu>
      </div>
    </li>
  );
}
