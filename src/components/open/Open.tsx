// The invitation or gift itself. It's drawn in the browser, so it's loaded
// after the page. Meanwhile people see:
//   • a gift       – its loader (engine/page/Loader.jsx), which stays until
//                    everything in the gift is ready, so nothing stutters
//   • an invitation – its first words (Opening)
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Demo } from "@/lib/demos";
import Loader from "@/engine/page/Loader";
import Opening from "./Opening";

const DemoView = dynamic(() => import("@/engine/Demo"), { ssr: false });

export default function Open({ demo }: { demo: Demo }) {
  const { template, theme, readyMadeId, names, toName, fromName, color } = demo;
  // an invitation: keep the first words until the engine and its fonts have loaded
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // a gift: its code starts downloading now (its loader builds it once the bow is drawn)
    if (!template) {
      import("@/engine/Demo");
      return;
    }
    let gone = false;
    const fonts = Promise.race([document.fonts.ready, new Promise((done) => setTimeout(done, 3000))]);
    Promise.all([import("@/engine/Demo"), fonts]).then(() => !gone && setReady(true));
    return () => {
      gone = true;
    };
  }, [template]);

  const view = <DemoView template={template} theme={theme} readyMadeId={readyMadeId} names={names} toName={toName} fromName={fromName} />;
  if (!template) {
    return (
      <Loader theme={theme} name={toName}>
        {view}
      </Loader>
    );
  }
  if (!ready) return <Opening lines={names ?? [`For ${toName ?? "you"}`]} color={color} />;
  return view;
}
