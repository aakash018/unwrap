// ThemeLayer — everything behind the gift page's elements.
//
// Four stacked canvases, back to front:
//
//   1–3. PARALLAX layers (temples, roses, the moon…) — painted ONCE, then the
//        browser slides them with a CSS transform as the pointer moves or the
//        page scrolls. Far layers move least. Sliding is done by the graphics
//        card, so it costs almost nothing per frame.
//   4.   BACKDROP — the printed ornaments (foil frame, mandalas…). Painted once.
//   5.   PHYSICS — balloons, garlands, petals… redrawn 60 times a second.
//        Only this one does real work each frame. It's only as tall as the
//        screen (and a little more), and slides down the page as you scroll.
//
// Touching the physics canvas (anywhere no element covers):
//   • press on a balloon / flower / light   → grab it, drag, let go to fling
//   • tap empty space                       → the theme's little burst
//   • swipe up or down                      → scrolls the page, as usual
//   • just move the pointer                 → petals and confetti get blown aside
//
// When every hidden message on the page has been found (blocks/secret), the
// theme celebrates: scene.celebrate(), or a few of its little bursts.

import { useEffect, useRef, useState } from 'react';
import { World } from './physics';
import { THEMES } from './index';
import { prepareFast } from './draw';
import { PAGE_HEIGHT } from '../config';

const STEP = 1 / 60; // physics runs at a fixed 60 steps per second
const MAX_PIXELS = 8_000_000; // cap canvas sizes so long pages stay fast
const MAX_LIVE = 3_000_000; // …and the one redrawn every frame even more
// Phones have far less graphics memory: all the still pictures together get
// about a quarter of a computer's (founder, 26 Nov 2026: on long pages the
// background never showed, and the page froze).
const PHONE_BACKDROP = 3_500_000;
const PHONE_LAYERS = 4_500_000; // shared by all the parallax layers
const PHONE_LIVE = 1_800_000;
const onPhone = () => window.matchMedia?.('(pointer: coarse)').matches ?? false;
const EDGE = 100; // how far the physics canvas reaches above and below the screen (page px)

// Parallax: how far the nearest layer moves (page px) when the pointer goes
// from the centre to the edge of the screen, and how much slower than the
// page the farthest layer scrolls (0.2 = it scrolls at 80% speed).
const POINTER_SHIFT = 26;
const SCROLL_SHIFT = 0.2;
const LAYER_MARGIN = 40; // extra paint around each layer, so sliding never shows an edge

// A breeze that comes and goes (px/s²).
const breeze = (t) => 38 * Math.sin(t * 0.45) + 20 * Math.sin(t * 1.3 + 2) + 8 * Math.sin(t * 2.9);

// Canvas pixels per page pixel: sharp at this zoom, but never huge.
const resolution = (zoom, width, height, cap = 2, most = MAX_PIXELS) =>
  Math.min(zoom * (window.devicePixelRatio || 1), cap, Math.sqrt(most / (width * height)));

// `width` once it has stopped changing (a window being resized).
function useSettled(width) {
  const [settled, setSettled] = useState(width);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(width), 200);
    return () => clearTimeout(timer);
  }, [width]);
  return settled;
}

// `screenHeight` = how tall one screen is (page px). In the editor that's the
// design screen (800); in the preview it's the viewer's real window, so
// decorations meant for the first screen land on it.
export default function ThemeLayer({ themeId, width, height, zoom = 1, screenHeight = PAGE_HEIGHT }) {
  const theme = THEMES[themeId];
  const animated = Boolean(theme?.createScene);
  const layerCount = theme?.layers?.length ?? 0;
  const extra = Math.round(height * SCROLL_SHIFT); // room for layers to slide while scrolling

  const boxRef = useRef(null); // the whole page
  const canvasRef = useRef(null); // physics
  const backdropRef = useRef(null);
  const layerRefs = useRef([]);
  const sim = useRef(null); // { world, scene } while running
  const zoomRef = useRef(zoom);
  const held = useRef(null); // the point being dragged, if any
  const justHeld = useRef(false); // …and whether the last press was on one
  const sceneWidth = useSettled(width); // the scene is laid out again for it
  const look = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 }); // pointer, -1..1, eased

  // ── Keep the running scene up to date with the page's size ──────────────
  useEffect(() => {
    zoomRef.current = zoom;
    if (sim.current) {
      sim.current.world.width = width;
      sim.current.world.height = height;
    }
  }, [width, height, zoom, themeId]);

  // ── Paint the still pictures: backdrop + parallax layers ────────────────
  // Waits a moment after the last change (page growing, zooming) and paints
  // once, instead of repainting on every step. One picture at a time, each in
  // its own turn, so taps and scrolling get through in between (on a phone,
  // painting them all at once froze the page).
  useEffect(() => {
    if (!animated) return;
    let timer = setTimeout(() => paintStills(), 120);
    return () => clearTimeout(timer);

    function paintStills() {
      const world = new World(width, height); // a throwaway, just to call backdrop()
      const scene = theme.createScene(world, { calm: true, screen: screenHeight });
      const phone = onPhone();
      const steps = [];

      const backdrop = backdropRef.current;
      if (backdrop && scene.backdrop) {
        steps.push(() => {
          const s = resolution(zoom, width, height, 2, phone ? PHONE_BACKDROP : MAX_PIXELS);
          backdrop.width = Math.round(width * s);
          backdrop.height = Math.round(height * s);
          const ctx = backdrop.getContext('2d');
          ctx.scale(s, s);
          scene.backdrop(ctx, width, height);
        });
      }

      // Layers are faint and soft: a modest resolution is plenty.
      const lw = width + LAYER_MARGIN * 2;
      const lh = height + extra + LAYER_MARGIN * 2;
      const ls = resolution(zoom, lw, lh, 1.5, phone ? PHONE_LAYERS / Math.max(1, layerCount) : MAX_PIXELS);
      (theme.layers ?? []).forEach((layer, i) => {
        steps.push(() => {
          const canvas = layerRefs.current[i];
          if (!canvas) return;
          canvas.width = Math.round(lw * ls);
          canvas.height = Math.round(lh * ls);
          const ctx = canvas.getContext('2d');
          ctx.scale(ls, ls);
          ctx.translate(LAYER_MARGIN, LAYER_MARGIN + extra); // page (0, 0) inside the picture
          const area = { x0: -LAYER_MARGIN, x1: width + LAYER_MARGIN, y0: -LAYER_MARGIN - extra, y1: height + LAYER_MARGIN };
          layer.paint(ctx, area, width, height, screenHeight);
        });
      });

      const next = () => {
        steps.shift()?.();
        if (steps.length) timer = setTimeout(next, 16);
      };
      next();
    }
    // zoom only changes sharpness; repaint when it settles noticeably
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, width, height, screenHeight, Math.round(zoom * 4)]);

  // ── Follow the pointer anywhere on screen, for parallax ─────────────────
  useEffect(() => {
    const onMove = (e) => {
      look.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      look.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // ── Run the theme ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!animated) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const phone = onPhone();

    const world = new World(width, height);
    const scene = theme.createScene(world, { calm, screen: screenHeight });
    sim.current = { world, scene };

    // let ropes settle before the first frame, so nothing visibly "drops in"
    for (let i = 0; i < 120; i++) world.step(STEP);

    let frame;
    let last = performance.now();
    let pending = 0;

    const tick = (now) => {
      pending += Math.min(0.1, (now - last) / 1000);
      last = now;
      while (pending >= STEP) {
        world.wind = calm ? 0 : breeze(world.time);
        scene.update?.(world.time, STEP);
        world.step(STEP);
        pending -= STEP;
      }

      // Which part of the page is on screen (page px)?
      const rect = boxRef.current.getBoundingClientRect();
      const perPx = world.height / rect.height;
      const viewTop = -rect.top * perPx;
      const visible = window.innerHeight * perPx;
      const view = { y0: viewTop - 80, y1: viewTop + visible + 80 };

      scene.view = { top: viewTop, height: visible };

      // The physics canvas covers just that part (resized only if it must be).
      const tall = Math.min(world.height, Math.ceil(visible) + EDGE * 2);
      const top = Math.round(Math.max(0, Math.min(world.height - tall, viewTop - EDGE)));
      const s = resolution(zoomRef.current, world.width, tall, 2, phone ? PHONE_LIVE : MAX_LIVE);
      const [pw, ph] = [Math.round(world.width * s), Math.round(tall * s)];
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
        canvas.style.height = `${tall}px`;
      }
      canvas.style.transform = `translateY(${top}px)`;

      // Slide the parallax layers (CSS only — no repainting).
      const v = look.current;
      if (!calm) {
        v.x += (v.targetX - v.x) * 0.05; // ease, so the layers glide
        v.y += (v.targetY - v.y) * 0.05;
      }
      const scrolled = calm ? 0 : Math.max(0, viewTop);
      (theme.layers ?? []).forEach((layer, i) => {
        const el = layerRefs.current[i];
        if (!el) return;
        const dx = -v.x * POINTER_SHIFT * layer.depth;
        const dy = -v.y * POINTER_SHIFT * 0.6 * layer.depth + scrolled * SCROLL_SHIFT * (1 - layer.depth);
        el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });

      // Draw the moving things.
      ctx.setTransform(s, 0, 0, s, 0, -top * s);
      ctx.clearRect(0, top, world.width, tall);
      prepareFast(ctx, s, view, top);
      scene.draw(ctx, world.time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      sim.current = null;
      held.current = null;
    };
    // height changes are handled by the size effect, without a rebuild
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, screenHeight, sceneWidth]);

  // Screen position → page position (works at any zoom).
  const toPage = (e) => {
    const rect = boxRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * width,
      y: ((e.clientY - rect.top) / rect.height) * height,
    };
  };

  // A finger on something you can grab drags it, instead of scrolling the page.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const onTouchStart = (e) => held.current && e.preventDefault();
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    return () => canvas.removeEventListener('touchstart', onTouchStart);
  }, [animated]);

  useEffect(() => {
    const onCelebrate = () => {
      const { world, scene } = sim.current ?? {};
      if (!scene?.view) return;
      if (scene.celebrate) return scene.celebrate();
      const { top, height: tall } = scene.view;
      for (let i = 0; i < 7; i++) {
        setTimeout(() => scene.burst?.(world.width * (0.15 + 0.7 * Math.random()), top + tall * (0.15 + 0.6 * Math.random())), i * 260);
      }
    };
    window.addEventListener('unwrap:celebrate', onCelebrate);
    return () => window.removeEventListener('unwrap:celebrate', onCelebrate);
  }, []);

  if (!animated) return null;

  const onPointerDown = (e) => {
    const s = sim.current;
    if (!s || e.button !== 0) return;
    const { x, y } = toPage(e);
    const point = s.world.pick(x, y);
    justHeld.current = Boolean(point);
    if (point) {
      e.preventDefault();
      s.world.grab(point);
      held.current = point;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.style.cursor = 'grabbing';
    }
  };

  const onClick = (e) => {
    if (justHeld.current) return;
    const { x, y } = toPage(e);
    sim.current?.scene.burst?.(x, y);
  };

  const onPointerMove = (e) => {
    const s = sim.current;
    if (!s) return;
    const { x, y } = toPage(e);
    if (held.current) {
      s.world.drag(held.current, x, y);
    } else {
      s.world.blow(x, y);
      e.currentTarget.style.cursor = s.world.pick(x, y) ? 'grab' : '';
    }
  };

  const onPointerUp = (e) => {
    if (!held.current) return;
    sim.current?.world.release(held.current);
    held.current = null;
    e.currentTarget.style.cursor = 'grab';
  };

  return (
    <div ref={boxRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: layerCount }, (_, i) => (
        <canvas
          key={`${themeId}-${i}`}
          ref={(el) => (layerRefs.current[i] = el)}
          className="pointer-events-none absolute will-change-transform"
          style={{
            left: -LAYER_MARGIN,
            top: -LAYER_MARGIN - extra,
            width: width + LAYER_MARGIN * 2,
            height: height + extra + LAYER_MARGIN * 2,
          }}
        />
      ))}
      <canvas key={`${themeId}-backdrop`} ref={backdropRef} className="pointer-events-none absolute inset-0 size-full" />
      <canvas
        ref={canvasRef}
        className="absolute inset-x-0 top-0 block h-0 w-full touch-pan-y will-change-transform"
        onPointerDown={onPointerDown}
        onClick={onClick}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  );
}
