// /home: the signed-in home, with your invitations and your gifts. (With
// made-up ones too: see samples.ts. /home?sample=empty shows it without.)

import type { Metadata } from "next";
import AccountMenu from "@/components/home/AccountMenu";
import Lists from "@/components/home/Lists";
import { NotYetProvider } from "@/components/home/NotYet";
import Logo from "@/components/Logo";
import { today } from "@/lib/dates";
import { sampleGifts, sampleInvitations } from "@/lib/samples";
import { requireUser } from "@/lib/user";

export const metadata: Metadata = { title: "Home" };

// The first name, to sign gifts with (a name may be missing: it's the email then).
const firstName = (name: string) => (name.includes("@") ? "" : name.split(" ")[0]);

export default async function HomePage({ searchParams }: PageProps<"/home">) {
  const user = await requireUser("/home");
  const { sample } = await searchParams;
  const now = today();
  const samples = sample !== "empty";

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
        <Lists
          owner={user.id}
          name={firstName(user.name)}
          invitations={samples ? sampleInvitations(now) : []}
          gifts={samples ? sampleGifts(now) : []}
          now={now}
        />
        <p className="text-sm text-soft">What you make is kept in this browser for now.</p>
      </main>
    </NotYetProvider>
  );
}
