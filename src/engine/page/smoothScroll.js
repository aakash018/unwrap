// Smooth scrolling for the receiver's page (the Preview), hand-written:
// a mouse wheel or trackpad no longer jumps the page in steps — each turn
// of the wheel sets where the page should go, and the page glides there,
// easing out. The story's scroll animations (camera tilts, pinned chapters)
// follow it, so they glide too.
//
//   enableSmoothScroll()  – turn it on for this window; returns a function
//                           that turns it off again
//
// Left alone, on purpose:
//   - phones and tablets (touch already scrolls smoothly, with momentum)
//   - people who asked their device for less motion (prefers-reduced-motion)
//   - pinch-zoom on a trackpad (ctrl + wheel), and sideways scrolling
//   - wheels over something that scrolls by itself (a list inside the page)
//   - the keyboard and the scrollbar: they scroll as usual, and the glide
//     picks up from wherever they leave the page

const EASE = 9; // how quickly the page catches up (higher = snappier)

export function enableSmoothScroll(win = window) {
  const touch = win.matchMedia?.('(pointer: coarse)').matches;
  const calm = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (touch || calm) return () => {};

  const doc = win.document;
  let target = win.scrollY; // where the page is heading
  let current = win.scrollY; // where it is now (fractional, for smoothness)
  let frame = 0;
  let last = 0;

  const maxScroll = () => doc.documentElement.scrollHeight - win.innerHeight;

  // does something under the pointer scroll by itself, in this direction?
  const scrollsItself = (el, dy) => {
    for (; el && el !== doc.body && el !== doc.documentElement; el = el.parentElement) {
      const { overflowY } = win.getComputedStyle(el);
      if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        if (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight) return true;
      }
    }
    return false;
  };

  const glide = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 1 / 60);
    last = now;
    // something else moved the page mid-glide (a key, the scrollbar): let it
    if (Math.abs(win.scrollY - Math.round(current)) > 2) {
      current = target = win.scrollY;
      frame = 0;
      return;
    }
    // ease towards the target the same way at any frame rate
    current += (target - current) * (1 - Math.exp(-EASE * dt));
    if (Math.abs(target - current) < 0.5) current = target;
    win.scrollTo(0, current);
    frame = current === target ? 0 : win.requestAnimationFrame(glide);
  };

  const onWheel = (e) => {
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // pinch-zoom, sideways
    if (scrollsItself(e.target, e.deltaY)) return;
    e.preventDefault();
    // wheel steps come in pixels, lines or pages
    const step = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? win.innerHeight : 1;
    if (!frame) current = target = win.scrollY; // start from wherever the page is
    target = Math.max(0, Math.min(maxScroll(), target + e.deltaY * step));
    if (!frame) {
      last = performance.now();
      frame = win.requestAnimationFrame(glide);
    }
  };

  // the keyboard, the scrollbar or a link moved the page: follow it
  const onScroll = () => {
    if (!frame) current = target = win.scrollY;
  };

  win.addEventListener('wheel', onWheel, { passive: false });
  win.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    win.removeEventListener('wheel', onWheel);
    win.removeEventListener('scroll', onScroll);
    win.cancelAnimationFrame(frame);
  };
}
