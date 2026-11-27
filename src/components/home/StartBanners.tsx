// "Start something new" in Home's side column: two rows, a small picture
// each, opening the same boxes as the buttons at the top (NewGift.tsx,
// NewInvitation.tsx).
"use client";

import Image from "next/image";
import { COVERS } from "@/covers";
import NewGift from "./NewGift";
import NewInvitation from "./NewInvitation";
import { CARD } from "./styles";

const ROW =
  "group flex w-full cursor-pointer items-center gap-3 rounded-[10px] p-2 text-left transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine";

function Picture({ of }: { of: "love-sky" | "hindu-wedding" }) {
  const picture = COVERS[of];
  return <span className="relative block h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-hover">{picture && <Image src={picture} alt="" fill sizes="44px" className="object-cover" />}</span>;
}

const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className="ml-auto shrink-0 text-soft/70 transition-transform group-hover:translate-x-0.5 group-hover:text-ink">
    <path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function StartBanners({ name }: { name: string }) {
  return (
    <section aria-label="Start something new" className={`${CARD} px-5 pt-5 pb-3`}>
      <h2 className="text-base font-semibold tracking-[-0.01em]">Start something new</h2>
      <div className="-mx-2 mt-3 flex flex-col">
        <NewGift name={name} className={ROW}>
          <Picture of="love-sky" />
          <span className="min-w-0">
            <span className="block text-sm font-medium">A gift</span>
            <span className="block text-[13px] text-soft">Birthday, anniversary, love, Bhai Tika</span>
          </span>
          <Chevron />
        </NewGift>
        <NewInvitation className={ROW}>
          <Picture of="hindu-wedding" />
          <span className="min-w-0">
            <span className="block text-sm font-medium">A wedding invitation</span>
            <span className="block text-[13px] text-soft">RSVP and both calendars</span>
          </span>
          <Chevron />
        </NewInvitation>
      </div>
    </section>
  );
}
