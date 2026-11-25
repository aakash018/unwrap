// A small menu that opens under a button. It closes when you press outside
// it, press Escape, or choose something.
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const WIDTH = 216; // the menu's width, in px

type Props = {
  label: string; // what the button opens, for screen readers
  button: ReactNode;
  buttonClass: string;
  children: ReactNode;
};

export default function Menu({ label, button, buttonClass, children }: Props) {
  const [open, setOpen] = useState(false);
  const [toRight, setToRight] = useState(false); // opens rightwards near the left edge
  const boxRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPress = (event: PointerEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPress);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPress);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={boxRef}
      className="relative"
      // moving on with the Tab key closes it too
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(event) => {
          setToRight(event.currentTarget.getBoundingClientRect().right < WIDTH + 12);
          setOpen(!open);
        }}
        className={buttonClass}
      >
        {button}
      </button>
      {open && (
        <div
          onClick={(event) => {
            // (a form's button must stay until the form has been sent)
            if (!(event.target as Element).closest("form")) setOpen(false);
          }}
          style={{ width: WIDTH }}
          className={`absolute top-full z-20 mt-2 ${toRight ? "left-0" : "right-0"} rounded-xl border border-line bg-white p-1.5 shadow-xl shadow-ink/10`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// One line in a menu.
export const MENU_ITEM =
  "flex h-10 w-full cursor-pointer items-center rounded-lg px-3 text-left text-[15px] hover:bg-ink/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-wine";
