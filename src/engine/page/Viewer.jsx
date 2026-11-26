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
import { markMounted } from './ready';

// The visible size of the window (without any scrollbar). On a phone the
// height is the screen's full height (with the address bar slid away), and
// it stays put while the width does: the bar sliding in and out as you scroll
// must change nothing. (It used to make a wedding's opening repaint all its
// pictures each time: the page lurched, and its background colour showed.)
function fullHeight() {
  // 100lvh: the viewport as tall as it gets, with the browser's bars hidden
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;height:100lvh;width:0;visibility:hidden;pointer-events:none';
  document.body.append(probe);
  const tall = probe.offsetHeight;
  probe.remove();
  return Math.max(tall || 0, window.innerHeight);
}

function useWindowSize() {
  const [size, setSize] = useState(() => {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    return { width: document.documentElement.clientWidth, height: touch ? fullHeight() : window.innerHeight };
  });
  useEffect(() => {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    const update = () => {
      const width = document.documentElement.clientWidth;
      setSize((prev) => {
        if (touch) return prev.width === width ? prev : { width, height: fullHeight() }; // (turned round)
        const height = window.innerHeight;
        return prev.width === width && prev.height === height ? prev : { width, height };
      });
    };
    window.addEventListener('resize', update);
    // a scrollbar appearing/disappearing changes the width too
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    return () => {
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, []);
  return size;
}

export default function Viewer({ saved }) {
  const isGift = saved.kind === 'gift';
  const { width, height } = useWindowSize();

  // the page glides when scrolled with a mouse wheel or trackpad
  useEffect(() => enableSmoothScroll(), []);

  // everything on the page has now said what it's still getting ready (ready.js)
  useEffect(() => markMounted(), []);

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
