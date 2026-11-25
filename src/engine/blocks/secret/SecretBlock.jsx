// Hidden message — a tiny star, easy to miss. Tap it and a slip of paper with
// a few words comes up. When every star on the page has been found, the theme
// celebrates (see `celebrate` in themes/ThemeLayer.jsx).
//
// In the editor a dashed ring shows where it is.

import { useCallback, useRef, useState } from 'react';
import Reader from '../shared/Reader';

export default function SecretBlock({ props, preview }) {
  const star = useRef(null);
  const [found, setFound] = useState(false);
  const [open, setOpen] = useState(null); // { at, of } while it's being read
  const celebrate = useRef(false);

  const onFind = () => {
    const all = [...(star.current.closest('[data-page]') ?? document).querySelectorAll('[data-secret]')];
    const at = all.filter((one) => one !== star.current && one.dataset.secret === 'found').length + 1;
    celebrate.current = !found && at === all.length; // that was the last one
    setFound(true);
    setOpen({ at, of: all.length });
  };

  const onClose = useCallback(() => {
    setOpen(null);
    if (!celebrate.current) return;
    celebrate.current = false;
    window.dispatchEvent(new Event('unwrap:celebrate'));
  }, []);

  return (
    <div className="grid place-items-center">
      <button
        ref={star}
        type="button"
        data-secret={found ? 'found' : 'hidden'}
        onClick={onFind}
        aria-label={found ? 'Read the hidden message again' : 'A little star'}
        className={`relative grid size-11 place-items-center rounded-full ${preview ? '' : 'outline-1 outline-offset-[-6px] outline-[#E8B54A]/70 outline-dashed'}`}
      >
        <span className="absolute size-7 rounded-full bg-[radial-gradient(circle,rgba(255,222,150,0.75),rgba(255,210,130,0)_70%)]" />
        <svg viewBox="-12 -12 24 24" className={`relative ${found ? 'size-5' : 'size-3.5 animate-twinkle'}`} aria-hidden="true">
          <path d="M0 -11 C1 -3 3 -1 11 0 C3 1 1 3 0 11 C-1 3 -3 1 -11 0 C-3 -1 -1 -3 0 -11 Z" fill={found ? '#F3C567' : '#FFEFC4'} stroke="#C9923A" strokeWidth={found ? 0.8 : 0.5} />
        </svg>
      </button>

      {open && (
        <Reader label="A hidden message" small onClose={onClose}>
          <svg viewBox="-12 -12 24 24" className="mx-auto mb-3 size-6" aria-hidden="true">
            <path d="M0 -11 C1 -3 3 -1 11 0 C3 1 1 3 0 11 C-1 3 -3 1 -11 0 C-3 -1 -1 -3 0 -11 Z" fill="#E3AE4C" />
          </svg>
          <p className="font-hand text-[20px] leading-snug whitespace-pre-wrap">{props.message}</p>
          {open.of > 1 && (
            <p className="mt-5 text-[13px] text-cocoa/60">{open.at === open.of ? 'You found them all. Look up.' : `${open.at} of ${open.of} found`}</p>
          )}
        </Reader>
      )}
    </div>
  );
}
