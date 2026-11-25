// An invitation or gift as people who get the link see it, fitted to their
// screen: <Viewer saved={saved} />.
//
// Its scenery fills the window. What's placed on it:
//   • an invitation – phone-first: a 430px column in the middle
//   • a gift        – in the layout for this window: phone, tablet or desktop
//                     (layouts.js), a column in the middle of the page
// Resizing the window re-fits it.
'use client';

import { useEffect, useMemo, useState } from 'react';
import GiftPage from './GiftPage';
import { enableSmoothScroll } from './smoothScroll';
import { LAYOUTS, layoutFor, shownIn, zoomFor } from './layouts';
import { THEMES } from '../themes';
import { toPage } from './saved';

// The visible size of the window (without any scrollbar). With `keepHeight`, a
// phone's address bar sliding away changes nothing: a gift's balloons and
// lanterns would start over each time.
function useWindowSize(keepHeight) {
  const read = () => ({ width: document.documentElement.clientWidth, height: window.innerHeight });
  const [size, setSize] = useState(read);
  useEffect(() => {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    const update = () => {
      const next = read();
      setSize((prev) => keepHeight && touch && prev.width === next.width ? prev : (prev.width === next.width && prev.height === next.height ? prev : next));
    };
    window.addEventListener('resize', update);
    // a scrollbar appearing/disappearing changes the width too
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    return () => {
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, [keepHeight]);
  return size;
}

export default function Viewer({ saved }) {
  const isGift = saved.kind === 'gift';
  const { width, height } = useWindowSize(isGift);

  // the page glides when scrolled with a mouse wheel or trackpad
  useEffect(() => enableSmoothScroll(), []);

  const layout = isGift ? layoutFor(width) : 'mobile';
  const page = useMemo(() => {
    const whole = toPage(saved);
    return isGift ? { ...whole, blocks: shownIn(whole.blocks, layout) } : whole;
  }, [saved, isGift, layout]);

  // Fill the window's width; or, if it's wider than the layout, size the page by
  // the window's height instead (never smaller than designed).
  const column = LAYOUTS[layout].width;
  const zoom = zoomFor(layout, width, height);
  const screenHeight = Math.floor(height / zoom); // one window, in page px
  const pageWidth = Math.max(column, Math.ceil(width / zoom - 0.01)); // whole px (a hair too wide is clipped)

  return (
    <main
      className="min-h-screen overflow-x-clip" // clip, not hidden: hidden would break the pinned story sections
      style={{ background: THEMES[page.theme]?.background ?? page.background }}
    >
      <GiftPage page={page} zoom={zoom} screenHeight={screenHeight} width={pageWidth} column={column} />
    </main>
  );
}
