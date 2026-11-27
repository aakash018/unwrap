// /home: the signed-in home. Used once in a while (a gift for an occasion, a
// wedding once), so it isn't a grid of numbers: its top feels like what's
// happening (components/home/Mood.tsx), then the two ways to start, then
// yours as covers, then the special days coming up.

import type { Metadata } from "next";
import AccountMenu from "@/components/home/AccountMenu";
import ComingUp from "@/components/home/ComingUp";
import Mood, { type MoodOf } from "@/components/home/Mood";
import MoveDrafts from "@/components/home/MoveDrafts";
import { NotYetProvider } from "@/components/home/NotYet";
import StartBanners from "@/components/home/StartBanners";
import YoursCard, { type Opens } from "@/components/home/YoursCard";
import Logo from "@/components/Logo";
import type { TemplateId, ThemeId } from "@/engine/page/types";
import { today } from "@/lib/dates";
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
      <header>
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <AccountMenu user={user} />
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-5 pt-6 pb-20 sm:px-8">
        <h1 className="sr-only">Home</h1>
        <MoveDrafts owner={user.id} />
        <div className="flex flex-col gap-4">
          {name && <p className="text-soft">नमस्ते, {name}</p>}
          <Mood mood={mood} name={name} />
          <StartBanners name={name} />
        </div>

        <section aria-label="Yours">
          <h2 className="text-lg font-semibold tracking-tight">Yours</h2>
          {cards.length ? (
            <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 lg:grid-cols-5">
              {cards.map((one) => (
                <YoursCard key={one.id} one={one} />
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-soft">What you make shows up here.</p>
          )}
        </section>

        <ComingUp days={days} />
      </main>
    </NotYetProvider>
  );
}
