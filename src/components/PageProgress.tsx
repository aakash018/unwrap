// A thin line across the top of the window while the next page loads.
//
// It starts by itself when a link to another page here is clicked, or when a
// form marked data-progress is sent (signing in or out). Code that moves to
// another page itself (router.push) calls startProgress() first. It finishes
// when the new page is on the screen. Quick pages never show it: it waits a
// moment before it appears.
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SHOW_AFTER = 150; // ms: quicker than this, no line at all
const GIVE_UP = 12_000; // ms: something went wrong, or nothing happened
const CREEP = [0.5, 0.64, 0.74, 0.81, 0.86, 0.9, 0.92]; // after a quick first stretch: slower and slower

type State = "idle" | "waiting" | "loading" | "done";

const listeners = new Set<() => void>();

/** Show the line now: we're going to another page. */
export function startProgress() {
  listeners.forEach((start) => start());
}

// a click that will open another page here, in this tab
function leavesForPage(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!link || link.target === "_blank" || link.hasAttribute("download")) return false;
  const to = new URL(link.href, location.href);
  return to.origin === location.origin && (to.pathname !== location.pathname || to.search !== location.search);
}

// The line's timings, kept apart from React: start(), arrived().
function lineOf(setState: (state: State) => void, setWidth: (width: number) => void) {
  let state: State = "idle";
  let timers: ReturnType<typeof setTimeout>[] = [];
  const go = (next: State) => {
    state = next;
    setState(next);
  };
  const clear = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  const later = (ms: number, action: () => void) => timers.push(setTimeout(action, ms));
  return {
    clear,
    start() {
      clear();
      go("waiting");
      setWidth(0);
      later(SHOW_AFTER, () => {
        go("loading");
        setWidth(0.28);
        CREEP.forEach((to, i) => later(500 + i * 650, () => setWidth(to)));
      });
      later(GIVE_UP, () => go("idle"));
    },
    // the new page is here: fill the line, then let it fade
    arrived() {
      if (state === "idle") return;
      clear();
      if (state === "waiting") return go("idle"); // it was quick: nothing to show
      setWidth(1);
      go("done");
      later(450, () => go("idle"));
    },
  };
}

export default function PageProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<State>("idle");
  const [width, setWidth] = useState(0);
  const [line] = useState(() => lineOf(setState, setWidth));

  useEffect(() => {
    listeners.add(line.start);
    const onClick = (event: MouseEvent) => leavesForPage(event) && line.start();
    const onSubmit = (event: SubmitEvent) => (event.target as Element).hasAttribute("data-progress") && line.start();
    document.addEventListener("click", onClick, true); // (first: Next.js's links stop the click)
    document.addEventListener("submit", onSubmit);
    return () => {
      listeners.delete(line.start);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit);
      line.clear();
    };
  }, [line]);

  useEffect(() => line.arrived(), [line, pathname]);

  if (state === "idle" || state === "waiting") return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px]">
      <div
        className="h-full origin-left bg-ink"
        style={{
          transform: `scaleX(${width})`,
          opacity: state === "done" ? 0 : 1,
          transition: state === "done" ? "transform 200ms ease-out, opacity 250ms ease 200ms" : "transform 600ms cubic-bezier(0.2, 0.7, 0.3, 1)",
        }}
      />
    </div>
  );
}
