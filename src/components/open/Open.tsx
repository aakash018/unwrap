// The invitation or gift itself. It's drawn in the browser, so it's loaded
// after the page: people see the first words (Opening) until it's ready.
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Demo } from "@/lib/demos";
import Opening from "./Opening";

const DemoView = dynamic(() => import("@/engine/Demo"), { ssr: false });

export default function Open({ demo }: { demo: Demo }) {
  const { template, theme, readyMadeId, names, toName, fromName, color } = demo;
  // keep the first words until the engine and its fonts have loaded
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let gone = false;
    const fonts = Promise.race([document.fonts.ready, new Promise((done) => setTimeout(done, 3000))]);
    Promise.all([import("@/engine/Demo"), fonts]).then(() => !gone && setReady(true));
    return () => {
      gone = true;
    };
  }, []);

  if (!ready) return <Opening lines={names ?? [`For ${toName ?? "you"}`]} color={color} />;
  return <DemoView template={template} theme={theme} readyMadeId={readyMadeId} names={names} toName={toName} fromName={fromName} />;
}
