// useZoom — Figma-style zoom for the canvas.
//
// The page itself can't be moved, but you can zoom it:
//   • Starts at "Fit screen" (one whole phone screen in view), and keeps fitting
//     when the window is resized — until you zoom by hand.
//   • Pinch on trackpad, or Ctrl/⌘ + scroll   → zoom around the cursor
//   • Ctrl/⌘ + =  /  Ctrl/⌘ + -               → zoom in / out
//   • Ctrl/⌘ + 0                              → back to 100%
//   • Buttons in <ZoomControls />             → in, out, fit width, fit screen
//     ("fit screen" = one whole laptop screen of the page in view)
// Normal scrolling still moves up/down through the page.
//
// We use the CSS `zoom` property on the page (not transform: scale), so the
// browser lays it out at the zoomed size and scrollbars just work.
//
// `size` = { width, height } of the page's design screen, in page px (it
// changes with the Mobile · Tablet · Desktop switch); "fit" uses it.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../config';

export const PADDING = 64; // empty space around the page (matches p-16 in Canvas)

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3, 4];

const clamp = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

export function useZoom(size = { width: PAGE_WIDTH, height: PAGE_HEIGHT }) {
  const sizeRef = useRef(size); // the latest size, readable inside listeners
  sizeRef.current = size;
  const viewportRef = useRef(null); // the scrollable area around the page
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1); // same value, readable inside event listeners
  const pending = useRef(null); // how to fix the scroll position after a zoom
  const fitMode = useRef('screen'); // 'width' | 'screen' | null (= zoomed by hand)

  // Change zoom. `point` (inside the viewport) stays still on screen.
  // Leave `point` out to zoom around the centre; pass 'top' to jump to the top.
  const applyZoom = useCallback((next, point) => {
    const el = viewportRef.current;
    const from = zoomRef.current;
    const to = clamp(next);
    if (!el || Math.abs(to - from) < 0.0001) return;

    pending.current =
      point === 'top'
        ? { top: true }
        : {
            x: point?.x ?? el.clientWidth / 2,
            y: point?.y ?? el.clientHeight / 2,
            left: el.scrollLeft,
            top: el.scrollTop,
            ratio: to / from,
          };

    zoomRef.current = to;
    setZoom(to);
  }, []);

  // Zooming by hand stops the automatic fitting.
  const zoomTo = useCallback(
    (next, point) => {
      fitMode.current = null;
      applyZoom(next, point);
    },
    [applyZoom],
  );

  // After React re-renders at the new zoom, move the scroll so the
  // point under the cursor hasn't jumped.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    const p = pending.current;
    if (!el || !p) return;
    pending.current = null;

    if (p.top === true) {
      el.scrollTo(0, 0);
      return;
    }
    el.scrollLeft = (p.left + p.x - PADDING) * p.ratio + PADDING - p.x;
    el.scrollTop = (p.top + p.y - PADDING) * p.ratio + PADDING - p.y;
  }, [zoom]);

  const zoomIn = useCallback(
    () => zoomTo(STEPS.find((s) => s > zoomRef.current + 0.001) ?? MAX_ZOOM),
    [zoomTo],
  );

  const zoomOut = useCallback(
    () => zoomTo([...STEPS].reverse().find((s) => s < zoomRef.current - 0.001) ?? MIN_ZOOM),
    [zoomTo],
  );

  // Work out the zoom that fits, without changing anything.
  const fitZoom = (mode) => {
    const el = viewportRef.current;
    const byWidth = (el.clientWidth - PADDING * 2) / sizeRef.current.width;
    if (mode === 'width') return byWidth;
    const byHeight = (el.clientHeight - PADDING * 2) / sizeRef.current.height;
    return Math.min(byWidth, byHeight);
  };

  // Page width fills the canvas.
  const fitWidth = useCallback(() => {
    fitMode.current = 'width';
    applyZoom(fitZoom('width'), 'top');
  }, [applyZoom]);

  // One whole screen (PAGE_HEIGHT) of the page fits in view.
  const fitScreen = useCallback(() => {
    fitMode.current = 'screen';
    applyZoom(fitZoom('screen'), 'top');
  }, [applyZoom]);

  // Start at Fit screen, and keep fitting while the window is resized
  // (only if the user hasn't zoomed by hand since).
  useLayoutEffect(() => {
    const el = viewportRef.current;
    applyZoom(fitZoom('screen'), 'top');

    const observer = new ResizeObserver(() => {
      if (fitMode.current) applyZoom(fitZoom(fitMode.current));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [applyZoom]);

  // A different device was chosen: fit its screen again.
  useEffect(() => {
    if (!viewportRef.current) return;
    fitMode.current = fitMode.current ?? 'screen';
    applyZoom(fitZoom(fitMode.current), 'top');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  // Pinch / Ctrl+scroll / ⌘+scroll → zoom around the cursor.
  useEffect(() => {
    const el = viewportRef.current;

    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return; // plain scroll = move through the page
      e.preventDefault(); // stop the browser zooming the whole tab

      const rect = el.getBoundingClientRect();
      const delta = Math.max(-50, Math.min(50, e.deltaY)); // tame big mouse-wheel jumps
      zoomTo(zoomRef.current * Math.exp(-delta * 0.01), {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomTo]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e) => {
      if (!e.metaKey && !e.ctrlKey) return;
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        zoomTo(1);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomIn, zoomOut, zoomTo]);

  return { viewportRef, zoom, zoomTo, zoomIn, zoomOut, fitWidth, fitScreen };
}
