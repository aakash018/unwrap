// Everything you've made, as covers in a white card, with All · Gifts ·
// Invitations to narrow it down (the tabs only show when you have both).
"use client";

import { useState } from "react";
import type { Gift, Invitation } from "@/lib/projects";
import YoursCard, { type Opens } from "./YoursCard";
import { CARD } from "./styles";

type One = (Gift | Invitation) & Opens;
const TABS = [
  ["all", "All"],
  ["gift", "Gifts"],
  ["invitation", "Invitations"],
] as const;

export default function Yours({ cards }: { cards: One[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("all");
  const both = cards.some((one) => one.kind === "gift") && cards.some((one) => one.kind === "invitation");
  const shown = tab === "all" ? cards : cards.filter((one) => one.kind === tab);

  return (
    <section aria-label="Yours" className={`${CARD} px-5 pt-5 pb-6 sm:px-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-[-0.01em]">
          Yours {cards.length > 0 && <span className="ml-1 font-medium text-soft">{cards.length}</span>}
        </h2>
        {both && (
          <div className="flex gap-0.5 rounded-[10px] bg-canvas p-[3px]">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-pressed={tab === id}
                className={`h-[30px] cursor-pointer rounded-lg px-3 text-[13px] font-medium transition-colors ${tab === id ? "bg-white text-ink shadow-[0_1px_2px_rgba(23,24,26,0.08),0_0_0_1px_rgba(23,24,26,0.04)]" : "text-soft hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      {cards.length ? (
        <ul className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-x-4 gap-y-6">
          {shown.map((one) => (
            <YoursCard key={one.id} one={one} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[15px] text-soft">What you make shows up here.</p>
      )}
    </section>
  );
}
