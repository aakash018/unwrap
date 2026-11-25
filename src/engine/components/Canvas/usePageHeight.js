// usePageHeight — how tall the page needs to be.
//
// At least one screen (PAGE_HEIGHT); otherwise the lowest element's bottom edge plus
// some spare room, so you can always drag things further down.
// Elements report changes in size (e.g. a photo loading) via ResizeObserver.

import { useLayoutEffect, useState } from 'react';
import { PAGE_HEIGHT, PAGE_BOTTOM_ROOM } from '../../config';

// Options:
//   room – spare space below the lowest element (less is needed when just viewing)
//   min  – never shorter than this (one screen)
//   step – grow in steps of this many px (1 = exact)
//   sectionRoom – spare space below the last full-width section
//                 (0 for receivers: the invite simply ends there)
export function usePageHeight(
  pageRef,
  blocks,
  zoom,
  { room = PAGE_BOTTOM_ROOM, min = PAGE_HEIGHT, step = 160, sectionRoom = 160 } = {},
) {
  const [contentBottom, setContentBottom] = useState(0);
  const [sectionBottom, setSectionBottom] = useState(0);

  useLayoutEffect(() => {
    const page = pageRef.current;
    const frames = page.querySelectorAll('[data-frame]');

    const measure = () => {
      // getBoundingClientRect is in screen pixels (zoom and rotation included),
      // so divide by zoom to get page pixels.
      const pageTop = page.getBoundingClientRect().top;
      let bottom = 0;
      let sections = 0;
      frames.forEach((el) => {
        const elBottom = (el.getBoundingClientRect().bottom - pageTop) / zoom;
        if (el.hasAttribute('data-section')) sections = Math.max(sections, elBottom);
        else bottom = Math.max(bottom, elBottom);
      });
      setContentBottom(bottom);
      setSectionBottom(sections);
    };

    measure();
    const observer = new ResizeObserver(measure);
    frames.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pageRef, blocks, zoom]);

  // Grow in steps of 160px rather than pixel by pixel, so dragging an element
  // near the bottom doesn't make the theme repaint its backdrop constantly.
  const needed = Math.ceil((contentBottom + room) / step) * step;
  const sections = sectionBottom ? Math.round(sectionBottom + sectionRoom) : 0;
  return Math.max(min, needed, sections);
}
