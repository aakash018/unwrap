// A sheet of paper over the whole screen, for reading something: the letter,
// a hidden message. Press beside it, the cross or Escape to put it away.
//   onClose – called then
//   small   – a little slip instead of a letter

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const stop = (e) => e.stopPropagation(); // (the editor must not take this as dragging the element)

export default function Reader({ label, small = false, onClose, children }) {
  const button = useRef(null);

  useEffect(() => {
    const before = document.activeElement;
    button.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      before?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[100] flex animate-fade items-center justify-center overflow-y-auto overscroll-contain bg-[#120812]/75 p-5"
      onPointerDown={stop}
      onDoubleClick={stop}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        onClick={stop}
        className={`relative max-h-[86dvh] w-full animate-unfold overflow-y-auto overscroll-contain bg-sheet text-cocoa shadow-paper ${
          small ? 'max-w-[330px] rounded-[3px] px-7 py-8 text-center' : 'max-w-[460px] rounded-[3px] px-8 pt-12 pb-10'
        }`}
      >
        <button
          ref={button}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`z-10 grid size-11 place-items-center ${small ? 'absolute top-1 right-1' : 'sticky top-0 float-right -mt-9 -mr-6'} rounded-full text-[22px] leading-none text-cocoa/50 outline-none hover:text-cocoa focus-visible:ring-2 focus-visible:ring-accent/50`}
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
