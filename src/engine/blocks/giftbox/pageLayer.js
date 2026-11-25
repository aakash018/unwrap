// A see-through sheet over the whole page, for presents that leave their box
// (the butterflies, the crane). `anchor` = something inside the box.
//
//   layer.el         – the sheet: put things in it, in page px
//   layer.width()    – the page's width
//   layer.view()     – { top, height } of the part on screen
//   layer.toPage(x, y)     – a place on screen → on the page
//   layer.rectOf(element)  – where something is, on the page
//   layer.remove()   – fades it away

export function pageLayer(anchor) {
  const page = anchor.closest('[data-page]');
  if (!page) return null;
  const scroller = page.closest('[data-scroller]'); // the editor's canvas
  const el = document.createElement('div');
  Object.assign(el.style, { position: 'absolute', inset: '0', zIndex: '60', overflow: 'clip', pointerEvents: 'none', transition: 'opacity 600ms' });
  page.append(el);

  const width = () => parseFloat(page.style.width);
  // page px for each px on screen (the page is zoomed)
  const scale = (rect) => width() / rect.width;

  return {
    el,
    page,
    width,
    view() {
      const rect = page.getBoundingClientRect();
      const k = scale(rect);
      const seen = scroller?.getBoundingClientRect() ?? { top: 0, height: window.innerHeight };
      return { top: (seen.top - rect.top) * k, height: seen.height * k };
    },
    toPage(x, y) {
      const rect = page.getBoundingClientRect();
      return [(x - rect.left) * scale(rect), (y - rect.top) * scale(rect)];
    },
    rectOf(element) {
      const rect = page.getBoundingClientRect();
      const k = scale(rect);
      const { left, top, width: w, height: h } = element.getBoundingClientRect();
      return { x: (left - rect.left) * k, y: (top - rect.top) * k, w: w * k, h: h * k };
    },
    remove() {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 650);
    },
  };
}

export const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
