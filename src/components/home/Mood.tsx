// The top of Home, which feels like what's happening (founder, 27 Nov 2026):
//   wedding – an invitation is live: lively (the countdown, how many opened it)
//   opened  – a gift was opened lately: sweet ("Soni opened your gift")
//   sent    – a gift is out, not opened yet: waiting, warmly
//   day     – a special day is near: "Soni's birthday is in 9 days" → make something
//   start   – nothing's happening: a gentle push to make something
// Which one is worked out on the server (app/(site)/home/page.tsx).
"use client";

import Link from "next/link";
import { useState } from "react";
import { fromToday, longDate, today } from "@/lib/dates";
import { editUrl, shareUrl, type Gift, type Invitation } from "@/lib/projects";
import type { SpecialDay } from "@/lib/special-days";
import Cover from "./Cover";
import NewGift from "./NewGift";
import type { Opens } from "./YoursCard";
import { PRIMARY, SECONDARY } from "./styles";

export type MoodOf =
  | { kind: "wedding"; one: Invitation & Opens }
  | { kind: "opened"; one: Gift & Opens }
  | { kind: "sent"; one: Gift & Opens }
  | { kind: "day"; day: SpecialDay }
  | { kind: "start" };

// what to start from for each kind of day
const START_FOR = { birthday: "ready:birthday-garden", anniversary: "ready:anniversary-lake", day: "ready:love-sky" };

const when = (iso: string) => {
  const day = today(Date.parse(iso));
  const words = fromToday(day, today());
  return words.charAt(0).toUpperCase() + words.slice(1);
};

function CopyLink({ kind, slug }: { kind: "gift" | "invitation"; slug: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(new URL(shareUrl(kind, slug), window.location.origin).toString());
        setCopied(true);
      }}
      className={SECONDARY}
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

function dayTitle(day: SpecialDay) {
  const what = day.kind === "birthday" ? `${day.person}'s birthday` : day.kind === "anniversary" ? `Your anniversary with ${day.person}` : day.label || `A special day with ${day.person}`;
  const soon = day.inDays === 0 ? "is today" : day.inDays === 1 ? "is tomorrow" : `is in ${day.inDays} days`;
  return `${what} ${soon}`;
}

function daySubtitle(day: SpecialDay) {
  const date = longDate(day.next).replace(/ \d{4}$/, "");
  if (day.turns && day.kind === "birthday") return `${date}. ${day.person} turns ${day.turns}.`;
  if (day.turns && day.kind === "anniversary") return `${date}. ${day.turns} ${day.turns === 1 ? "year" : "years"} together.`;
  return `${date}.`;
}

export default function Mood({ mood, name }: { mood: MoodOf; name: string }) {
  if (mood.kind === "wedding") {
    const { one } = mood;
    return (
      <section aria-label="Your wedding invitation" className="flex flex-col gap-6 rounded-2xl bg-[#f1f6f3] p-6 sm:flex-row sm:items-center sm:p-7">
        <div className="w-28 shrink-0">
          <Cover of={one.template} sizes="7rem" />
        </div>
        <div className="flex-1">
          <p className="flex items-center gap-2 text-sm text-leaf">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-leaf/60" />
              <span className="relative inline-flex size-2 rounded-full bg-leaf" />
            </span>
            Live
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">{one.title}</h2>
          {one.eventDay && (
            <p className="text-soft">
              {longDate(one.eventDay)} · {fromToday(one.eventDay, today())}
            </p>
          )}
          <p className="mt-4 text-[15px]">
            {one.opens ? (
              <>
                Opened {one.opens} {one.opens === 1 ? "time" : "times"}
                {one.openedToday ? <span className="text-leaf"> · {one.openedToday} today</span> : null}
              </>
            ) : (
              "Nobody has opened it yet. Send the link to your guests."
            )}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {one.slug && <CopyLink kind="invitation" slug={one.slug} />}
            <Link href={editUrl("invitation", one.id)} prefetch={false} className={SECONDARY}>
              Edit
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (mood.kind === "opened" || mood.kind === "sent") {
    const { one } = mood;
    const who = one.toName || "they";
    return (
      <section aria-label="Your gift" className="flex items-center gap-6 rounded-2xl bg-[#faf1ee] p-6 sm:p-7">
        <div className="w-20 shrink-0">
          <Cover of={one.theme} sizes="5rem" background={one.background} />
        </div>
        <div className="flex-1">
          {mood.kind === "opened" ? (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">{one.toName ? `${one.toName} opened your gift` : "Your gift was opened"}</h2>
              <p className="mt-1 text-soft">
                {when(one.lastOpened!)}
                {one.opens > 1 ? `, and ${one.opens - 1} more ${one.opens === 2 ? "time" : "times"} since` : ""}.
              </p>
              <p className="mt-3 text-[15px] italic">That was a lovely thing to do.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">{one.toName ? `Sent to ${one.toName}` : "Your gift is out"}</h2>
              <p className="mt-1 text-soft">Not opened yet. It&apos;s waiting for {who === "they" ? "them" : who}.</p>
            </>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {mood.kind === "sent" && one.slug && <CopyLink kind="gift" slug={one.slug} />}
            <NewGift name={name} className={SECONDARY}>
              Make another
            </NewGift>
          </div>
        </div>
      </section>
    );
  }

  if (mood.kind === "day") {
    const { day } = mood;
    return (
      <section aria-label="Coming up" className="rounded-2xl bg-[#fbf6ec] p-6 sm:p-7">
        <h2 className="text-2xl font-semibold tracking-tight">{dayTitle(day)}</h2>
        <p className="mt-1 text-soft">{daySubtitle(day)} Make something they&apos;ll keep.</p>
        <div className="mt-5">
          <NewGift name={name} className={PRIMARY} preset={{ to: day.person, start: START_FOR[day.kind] }}>
            Make something for {day.person}
          </NewGift>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Make something" className="rounded-2xl bg-hover p-6 sm:p-7">
      <h2 className="text-2xl font-semibold tracking-tight">Who deserves a little surprise this week?</h2>
      <p className="mt-1 text-soft">A gift takes about ten minutes. They keep it forever.</p>
    </section>
  );
}
