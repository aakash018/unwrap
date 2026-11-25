// A box over the page, with a title and a close button. `open` is called by
// the button that shows it (see NewInvitation).
"use client";

import type { ReactNode, RefObject } from "react";
import Icon from "./Icon";
import { ROUND } from "./styles";

type Props = { ref: RefObject<HTMLDialogElement | null>; title: string; children: ReactNode };

export default function Dialog({ ref, title, children }: Props) {
  const close = () => ref.current?.close();
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClick={(event) => event.target === ref.current && close()} // pressed beside it
      className="m-auto w-[min(44rem,calc(100vw-2rem))] rounded-xl bg-white p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="flex items-center justify-between border-b border-line py-3 pr-3 pl-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button type="button" onClick={close} aria-label="Close" className={ROUND}>
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
