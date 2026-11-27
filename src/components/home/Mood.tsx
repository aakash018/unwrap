// The first card on Home, about what's happening (founder, 27 Nov 2026):
//   wedding – an invitation is live: a pulsing Live, its opens, days to go
//   opened  – a gift was opened lately: "Soni opened your gift"
//   sent    – a gift is out, not opened yet: waiting, warmly
//   day     – a special day is near: "Soni's birthday is in 9 days" → make something
//   start   – nothing's happening: three ready-made gifts and a push to make one
// Which one is worked out on the server (app/(site)/home/page.tsx).
//
// Laid out like the Claude Design canvas "Unwrap dashboard": the picture on
// the left, then a status line, the title, a sentence, a row of numbers and
// the buttons.
"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { ReadyMadeId, TemplateId, ThemeId } from "@/engine/page/types";
import { fromToday, longDate, today } from "@/lib/dates";
import { editUrl, previewUrl, shareUrl, type Gift, type Invitation } from "@/lib/projects";
import type { SpecialDay } from "@/lib/special-days";
import Cover from "./Cover";
import NewGift from "./NewGift";
import NewInvitation from "./NewInvitation";
import type { Opens } from "./YoursCard";
import { CARD, PRIMARY, SECONDARY } from "./styles";

export type MoodOf =
  | { kind: "wedding"; one: Invitation & Opens }
  | { kind: "opened"; one: Gift & Opens }
  | { kind: "sent"; one: Gift & Opens }
  | { kind: "day"; day: SpecialDay }
  | { kind: "start" };

// what to start from for each kind of day
const START_FOR = { birthday: "ready:birthday-garden", anniversary: "ready:anniversary-lake", day: "ready:love-sky" };

const AMBER = "text-[#9a5b12]"; // waiting
const LEAF = "text-leaf"; // live, opened

const capital = (words: string) => words.charAt(0).toUpperCase() + words.slice(1);
const ago = (iso: string) => capital(fromToday(today(Date.parse(iso)), today()));
const short = (day: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(Date.parse(`${day}T00:00:00Z`));
const shortIso = (iso: string) => short(today(Date.parse(iso)));
const times = (count: number) => `${count} ${count === 1 ? "time" : "times"}`;

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <rect x="5" y="5" width="9" height="9" rx="2" />
    <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" />
  </svg>
);

function CopyLink({ kind, slug }: { kind: "gift" | "invitation"; slug: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(new URL(shareUrl(kind, slug), window.location.origin).toString());
        setCopied(true);
      }}
      className={`${PRIMARY} gap-2`}
    >
      <CopyIcon />
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

// "● Sent · not opened yet", with the dot pulsing when it's live
function Status({ tone, pulse, children }: { tone: string; pulse?: boolean; children: ReactNode }) {
  return (
    <p className={`flex items-center gap-2 text-[13px] font-medium ${tone}`}>
      <span className="relative flex size-2">
        {pulse && <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-50" />}
        <span className="relative inline-flex size-2 rounded-full bg-current" />
      </span>
      {children}
    </p>
  );
}

// The numbers row: two or three cells side by side.
function Numbers({ cells }: { cells: [string, string][] }) {
  return (
    <dl className="mt-5 grid overflow-hidden rounded-xl border border-line/80" style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}>
      {cells.map(([label, value], i) => (
        <div key={label} className={`px-4 py-3 ${i ? "border-l border-line/80" : ""}`}>
          <dt className="text-xs text-soft">{label}</dt>
          <dd className="mt-1 truncate text-lg font-semibold tracking-[-0.01em]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

type Art = { of: TemplateId | ThemeId | ReadyMadeId; background?: string; label?: string };

function Card({ art, status, title, words, numbers, actions }: { art: Art; status: ReactNode; title: string; words: ReactNode; numbers?: [string, string][]; actions: ReactNode }) {
  return (
    <section aria-label={title} className={`${CARD} flex flex-col gap-6 p-5 sm:flex-row sm:gap-7 sm:p-6`}>
      <div className="w-28 shrink-0 self-start overflow-hidden rounded-[10px] shadow-[0_10px_24px_-14px_rgba(23,24,26,0.4)] sm:w-[150px]">
        <Cover of={art.of} sizes="150px" background={art.background} label={art.label} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {status}
        <h2 className="mt-2.5 text-[22px] leading-tight font-semibold tracking-[-0.015em]">{title}</h2>
        <div className="mt-1.5 max-w-[52ch] text-[15px] leading-relaxed text-soft">{words}</div>
        {numbers && <Numbers cells={numbers} />}
        <div className="mt-auto flex flex-wrap gap-2.5 pt-5">{actions}</div>
      </div>
    </section>
  );
}

function GiftButtons({ one }: { one: (Gift | Invitation) & Opens }) {
  return (
    <>
      {one.slug && <CopyLink kind={one.kind} slug={one.slug} />}
      <Link href={editUrl(one.kind, one.id)} prefetch={false} className={SECONDARY}>
        Edit
      </Link>
      <Link href={previewUrl(one.kind, one.id)} prefetch={false} target="_blank" className={SECONDARY}>
        Preview
      </Link>
    </>
  );
}

function dayTitle(day: SpecialDay) {
  const what = day.kind === "birthday" ? `${day.person}'s birthday` : day.kind === "anniversary" ? `Your anniversary with ${day.person}` : day.label || `A special day with ${day.person}`;
  return `${what} ${day.inDays === 0 ? "is today" : day.inDays === 1 ? "is tomorrow" : `is in ${day.inDays} days`}`;
}

export default function Mood({ mood, name }: { mood: MoodOf; name: string }) {
  if (mood.kind === "wedding") {
    const { one } = mood;
    return (
      <Card
        art={{ of: one.template }}
        status={
          <Status tone={LEAF} pulse>
            Live{one.eventDay ? ` · ${longDate(one.eventDay).replace(/ \d{4}$/, "")}` : ""}
          </Status>
        }
        title={one.title}
        words={one.opens ? "People are opening it. Keep sending the link to guests who haven't seen it." : "Nobody has opened it yet. Send the link to your guests."}
        numbers={[["Opens", String(one.opens)], ["Today", String(one.openedToday)], ...(one.eventDay ? ([["Wedding", fromToday(one.eventDay, today())]] as [string, string][]) : [])]}
        actions={<GiftButtons one={one} />}
      />
    );
  }

  if (mood.kind === "opened") {
    const { one } = mood;
    return (
      <Card
        art={{ of: one.theme, background: one.background, label: one.title }}
        status={<Status tone={LEAF}>Opened · {fromToday(today(Date.parse(one.lastOpened!)), today())}</Status>}
        title={one.toName ? `${one.toName} opened your gift` : "Your gift was opened"}
        words={one.opens > 1 ? `Opened ${times(one.opens)} so far. That was a lovely thing to do.` : "That was a lovely thing to do."}
        numbers={[...(one.publishedAt ? ([["Sent", shortIso(one.publishedAt)]] as [string, string][]) : []), ["Opened", times(one.opens)], ["Last opened", ago(one.lastOpened!)]]}
        actions={
          <>
            <GiftButtons one={one} />
            <NewGift name={name} className={SECONDARY}>
              Make another
            </NewGift>
          </>
        }
      />
    );
  }

  if (mood.kind === "sent") {
    const { one } = mood;
    return (
      <Card
        art={{ of: one.theme, background: one.background, label: one.title }}
        status={<Status tone={AMBER}>Sent · not opened yet</Status>}
        title={one.title}
        words={<>It&apos;s waiting for {one.toName || "them"}. You&apos;ll see here the moment it&apos;s opened.</>}
        numbers={[...(one.publishedAt ? ([["Sent", shortIso(one.publishedAt)]] as [string, string][]) : []), ["Opened", "Not yet"], ...(one.toName ? ([["For", one.toName]] as [string, string][]) : [])]}
        actions={<GiftButtons one={one} />}
      />
    );
  }

  if (mood.kind === "day") {
    const { day } = mood;
    const extra = day.turns ? (day.kind === "birthday" ? `${day.person} turns ${day.turns}. ` : day.kind === "anniversary" ? `${times(day.turns).replace("time", "year")} together. ` : "") : "";
    return (
      <Card
        art={{ of: START_FOR[day.kind].replace("ready:", "") as ReadyMadeId }}
        status={<Status tone="text-[#7a2232]">Coming up · {short(day.next)}</Status>}
        title={dayTitle(day)}
        words={<>{extra}Make something they&apos;ll keep.</>}
        actions={
          <NewGift name={name} className={PRIMARY} preset={{ to: day.person, start: START_FOR[day.kind] }}>
            Make something for {day.person}
          </NewGift>
        }
      />
    );
  }

  return (
    <section aria-label="Who deserves a little surprise?" className={`${CARD} flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:gap-7 sm:p-6`}>
      <div aria-hidden className="grid w-full max-w-[332px] shrink-0 grid-cols-3 gap-2.5">
        {(["birthday-garden", "love-sky", "anniversary-lake"] as const).map((of) => (
          <div key={of} className="overflow-hidden rounded-[10px]">
            <Cover of={of} sizes="104px" />
          </div>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-soft">Nothing out right now</p>
        <h2 className="mt-2 text-[22px] leading-tight font-semibold tracking-[-0.015em]">Who deserves a little surprise?</h2>
        <p className="mt-1.5 max-w-[46ch] text-[15px] leading-relaxed text-soft">Start from a ready-made gift and make it yours in about ten minutes. They keep it forever.</p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <NewGift name={name} className={PRIMARY}>
            Make a gift
          </NewGift>
          <NewInvitation className={SECONDARY}>Wedding invitation</NewInvitation>
        </div>
      </div>
    </section>
  );
}
