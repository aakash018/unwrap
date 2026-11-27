// The two ways to start, as short banners: a gift, or a wedding invitation.
// (They open the same boxes as before: NewGift.tsx, NewInvitation.tsx.)
"use client";

import Image from "next/image";
import { COVERS } from "@/covers";
import NewGift from "./NewGift";
import NewInvitation from "./NewInvitation";

const BANNER =
  "group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-line p-2.5 pr-4 text-left transition-colors hover:border-ink/25 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine";

function Picture({ of }: { of: "love-sky" | "hindu-wedding" }) {
  const picture = COVERS[of];
  return (
    <span className="relative block h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-hover">
      {picture && <Image src={picture} alt="" fill sizes="5rem" className="object-cover transition-transform duration-300 group-hover:scale-105" />}
    </span>
  );
}

export default function StartBanners({ name }: { name: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <NewGift name={name} className={BANNER}>
        <Picture of="love-sky" />
        <span>
          <span className="block font-medium">New gift</span>
          <span className="block text-sm text-soft">Birthday, anniversary, love…</span>
        </span>
      </NewGift>
      <NewInvitation className={BANNER}>
        <Picture of="hindu-wedding" />
        <span>
          <span className="block font-medium">New wedding invitation</span>
          <span className="block text-sm text-soft">RSVP and both calendars</span>
        </span>
      </NewInvitation>
    </div>
  );
}
