// /home: the signed-in home, laid out like the Claude Design canvas "Unwrap
// dashboard" (white cards on a soft grey). Used once in a while (a gift for an
// occasion, a wedding once), so it isn't a wall of numbers: a greeting and
// the two ways to start, then on the left a card about what's happening
// (components/home/Mood.tsx) and yours as covers; on the right the special
// days coming up and "Start something new". On a phone the right side goes
// under.

import type { Metadata } from "next";
import AccountMenu from "@/components/home/AccountMenu";
import ComingUp from "@/components/home/ComingUp";
import Mood, { type MoodOf } from "@/components/home/Mood";
import MoveDrafts from "@/components/home/MoveDrafts";
import { NotYetProvider } from "@/components/home/NotYet";
import NewGift from "@/components/home/NewGift";
import NewInvitation from "@/components/home/NewInvitation";
import StartBanners from "@/components/home/StartBanners";
import { PRIMARY, SECONDARY } from "@/components/home/styles";
import Yours from "@/components/home/Yours";
import type { Opens } from "@/components/home/YoursCard";
import Logo from "@/components/Logo";
import type { TemplateId, ThemeId } from "@/engine/page/types";
import { today, weekdayDate } from "@/lib/dates";
import { listProjects, type Listed } from "@/lib/project-store";
import { statusOf, type Gift, type Invitation } from "@/lib/projects";
import { listSpecialDays, type SpecialDay } from "@/lib/special-days";
import { requireUser } from "@/lib/user";

export const metadata: Metadata = { title: "Home" };

const WEEK = 7 * 24 * 60 * 60 * 1000;
const SOON = 30; // days: a special day this close is the top of Home

// The first name, to sign gifts with (a name may be missing: it's the email then).
const firstName = (name: string) => (name.includes("@") ? "" : name.split(" ")[0]);

// A project from the database, as Home shows it.
function asCard(one: Listed, now: string): (Invitation | Gift) & Opens {
  const common = {
    id: one.id,
    title: one.title,
    status: statusOf(one, now),
    edited: today(Date.parse(one.edited)),
    slug: one.slug,
    changed: one.changed,
    opens: one.opens,
    openedToday: one.openedToday,
    lastOpened: one.lastOpened,
    publishedAt: one.publishedAt,
  };
  if (one.kind === "invitation") return { kind: "invitation", ...common, template: one.design as TemplateId, eventDay: one.eventDay };
  return { kind: "gift", ...common, theme: one.design as ThemeId, toName: one.toName, background: one.background };
}

// What the top of Home is about: a live wedding, then a gift opened (or sent)
// this week, then a special day near, else a gentle push to make something.
function moodOf(cards: ((Invitation | Gift) & Opens)[], published: Map<string, string | undefined>, days: SpecialDay[]): MoodOf {
  const now = Date.now();
  const wedding = cards.find((one): one is Invitation & Opens => one.kind === "invitation" && one.status === "live");
  if (wedding) return { kind: "wedding", one: wedding };
  const gifts = cards.filter((one): one is Gift & Opens => one.kind === "gift" && one.status === "live");
  const opened = gifts.filter((one) => one.lastOpened && now - Date.parse(one.lastOpened) < WEEK).sort((a, b) => Date.parse(b.lastOpened!) - Date.parse(a.lastOpened!))[0];
  if (opened) return { kind: "opened", one: opened };
  const sent = gifts.find((one) => !one.opens && now - Date.parse(published.get(one.id) ?? "0") < WEEK);
  if (sent) return { kind: "sent", one: sent };
  if (days[0] && days[0].inDays <= SOON) return { kind: "day", day: days[0] };
  return { kind: "start" };
}

export default async function HomePage() {
  const user = await requireUser("/home");
  const now = today();
  const [projects, days] = await Promise.all([listProjects(), listSpecialDays()]);
  const cards = projects.map((one) => asCard(one, now));
  const mood = moodOf(cards, new Map(projects.map((one) => [one.id, one.publishedAt])), days);
  const name = firstName(user.name);

  return (
    <NotYetProvider>
      <div className="min-h-dvh bg-canvas">
        <header className="border-b border-line/80 bg-white">
          <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
            <Logo />
            <AccountMenu user={user} />
          </div>
        </header>
        <main className="mx-auto flex max-w-[1200px] flex-col gap-7 px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
          <MoveDrafts owner={user.id} />
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm text-soft">{weekdayDate(now)}</p>
              <h1 className="mt-1.5 text-[28px] leading-tight font-semibold tracking-[-0.02em]">{name ? `नमस्ते, ${name}` : "नमस्ते"}</h1>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <NewInvitation className={SECONDARY}>Wedding invitation</NewInvitation>
              <NewGift name={name} className={`${PRIMARY} gap-2`}>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                New gift
              </NewGift>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-6">
            <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-6">
              <Mood mood={mood} name={name} />
              <Yours cards={cards} />
            </div>
            <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
              <ComingUp days={days} />
              <StartBanners name={name} />
            </aside>
          </div>
        </main>
      </div>
    </NotYetProvider>
  );
}
