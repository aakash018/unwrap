// A box over the page: a title (and a line under it, `note`), a close button,
// then what's in it. `open` is called by the button that shows it (see
// NewInvitation). `wide` for the gift box, which has more to choose from.
// DialogFooter is the grey strip at the bottom (it stays there while a tall
// box scrolls): a quiet line on the left, Cancel and the main button on the
// right (designed on the Claude Design canvas "Unwrap dashboard", 27 Nov 2026).
"use client";

import type { ReactNode, RefObject } from "react";
import Icon from "./Icon";
import { ROUND, SECONDARY } from "./styles";

type Props = { ref: RefObject<HTMLDialogElement | null>; title: string; note?: string; wide?: boolean; children: ReactNode };

export default function Dialog({ ref, title, note, wide, children }: Props) {
  const close = () => ref.current?.close();
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClick={(event) => event.target === ref.current && close()} // pressed beside it
      className={`m-auto ${wide ? "w-[min(44rem,calc(100vw-2rem))]" : "w-[min(37.5rem,calc(100vw-2rem))]"} overflow-y-auto overscroll-contain rounded-[18px] bg-white p-0 text-ink shadow-[0_24px_60px_-20px_rgba(23,24,26,0.45)] backdrop:bg-ink/40`}
    >
      <div className="flex justify-between gap-4 pt-6 pr-5 pl-6 sm:pl-7">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.015em]">{title}</h2>
          {note && <p className="mt-1.5 text-sm text-soft">{note}</p>}
        </div>
        <button type="button" onClick={close} aria-label="Close" className={`${ROUND} -mt-1.5`}>
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function DialogFooter({ note, problem, children }: { note?: string; problem?: string; children: ReactNode }) {
  return (
    <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-line/80 bg-[#fafafa] px-6 py-4 sm:px-7">
      {problem ? (
        <p role="alert" className="text-[13px] text-wine">
          {problem}
        </p>
      ) : (
        <p className="text-[13px] text-soft">{note}</p>
      )}
      <div className="ml-auto flex gap-2.5">
        <button type="button" onClick={(event) => event.currentTarget.closest("dialog")?.close()} className={SECONDARY}>
          Cancel
        </button>
        {children}
      </div>
    </div>
  );
}
