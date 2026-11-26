// /home: the signed-in home, with your invitations and your gifts (read from
// the database: lib/project-store.ts).

import type { Metadata } from "next";
import AccountMenu from "@/components/home/AccountMenu";
import Lists from "@/components/home/Lists";
import MoveDrafts from "@/components/home/MoveDrafts";
import { NotYetProvider } from "@/components/home/NotYet";
import Logo from "@/components/Logo";
import type { TemplateId, ThemeId } from "@/engine/page/types";
import { today } from "@/lib/dates";
import { listProjects, type Listed } from "@/lib/project-store";
import { statusOf, type Gift, type Invitation } from "@/lib/projects";
import { requireUser } from "@/lib/user";

export const metadata: Metadata = { title: "Home" };

// The first name, to sign gifts with (a name may be missing: it's the email then).
const firstName = (name: string) => (name.includes("@") ? "" : name.split(" ")[0]);

// A project from the database, as Home lists it.
function asRow(one: Listed, now: string): Invitation | Gift {
  const common = { id: one.id, title: one.title, status: statusOf(one, now), edited: today(Date.parse(one.edited)), slug: one.slug, changed: one.changed };
  if (one.kind === "invitation") return { kind: "invitation", ...common, template: one.design as TemplateId, eventDay: one.eventDay };
  return { kind: "gift", ...common, theme: one.design as ThemeId, toName: one.toName };
}

export default async function HomePage() {
  const user = await requireUser("/home");
  const now = today();
  const rows = (await listProjects()).map((one) => asRow(one, now));

  return (
    <NotYetProvider>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <AccountMenu user={user} />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 pt-12 pb-16 sm:px-8">
        <h1 className="sr-only">Home</h1>
        <MoveDrafts owner={user.id} />
        <Lists
          name={firstName(user.name)}
          invitations={rows.filter((one): one is Invitation => one.kind === "invitation")}
          gifts={rows.filter((one): one is Gift => one.kind === "gift")}
          now={now}
        />
      </main>
    </NotYetProvider>
  );
}
