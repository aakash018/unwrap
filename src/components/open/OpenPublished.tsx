// A published invitation or gift, as people open it from its link (the page
// itself comes from the database: lib/project-store.ts). Like the demos
// (Open.tsx): a gift opens behind its loader; an invitation shows its first
// words until the engine and its fonts have loaded.
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { noteOpen } from "@/app/projects/actions";
import Loader from "@/engine/page/Loader";
import type { Saved } from "@/engine/page/types";
import Opening from "./Opening";

const noted = new Set<string>(); // (once a page load, even where React runs effects twice)

const Viewer = dynamic(() => import("@/engine/page/Viewer"), { ssr: false });

// behind an invitation's first words, by template
const COLORS = { "garden-wedding": "#565a80", "hindu-wedding": "#101540" };

export default function OpenPublished({ saved, lines, slug }: { saved: Saved; lines: string[]; slug: string }) {
  const isGift = saved.kind === "gift";
  // it's been opened (once a visit; the sender's Home shows it)
  useEffect(() => {
    if (noted.has(slug)) return;
    noted.add(slug);
    noteOpen(slug);
  }, [slug]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // a gift: its code starts downloading now (its loader builds it once the bow is drawn)
    if (isGift) {
      import("@/engine/page/Viewer");
      return;
    }
    let gone = false;
    const fonts = Promise.race([document.fonts.ready, new Promise((done) => setTimeout(done, 3000))]);
    Promise.all([import("@/engine/page/Viewer"), fonts]).then(() => !gone && setReady(true));
    return () => {
      gone = true;
    };
  }, [isGift]);

  if (saved.kind === "gift") {
    return (
      <Loader theme={saved.theme} name={saved.opening?.name} words={saved.opening?.words}>
        <Viewer saved={saved} />
      </Loader>
    );
  }
  if (!ready) return <Opening lines={lines} color={COLORS[saved.template] ?? "#565a80"} />;
  return <Viewer saved={saved} />;
}
