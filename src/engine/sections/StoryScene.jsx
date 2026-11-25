// StoryScene — one chapter of a scrolling story.
//
// The idea: scrolling moves a CAMERA through a scene, not the page past a
// picture. Each chapter is a stack of layers (sky, mountains, palace,
// lights…) and a number `p` that goes 0 → 1 as you scroll through it.
// Every layer decides how it looks at each `p`: how far it has moved, how
// big it is, how visible. Text appears and disappears at chosen moments.
//
// Two kinds of chapter:
//   pinned   – the scene stays on screen (CSS sticky) while you scroll
//              through `height` px; the scroll drives the camera instead.
//              `p` starts counting as soon as the chapter slides into view
//              (so it's already arriving while the last one leaves) and
//              reaches 1 when the pinned stretch ends.
//   flowing  – scrolls normally (long lists like the events). `p` = 0 when
//              its top enters the bottom of the screen, 1 when its bottom
//              leaves the top. Layers drift with parallax.
//
// Scene definition:
//   {
//     editAt: 0.6,            // the `p` shown while you edit its words
//     camera: (p) => px,      // optional: how far the camera has moved down;
//                             // <Reveal rate> text rides it (see below)
//     layers: [{
//       band: [top, bottom],  // the part of the scene it covers (scene px)
//       anchor: 'top' | 'center' | 'bottom',   // pinned only: which edge it
//                             // sticks to when the screen is taller/shorter
//       front: true,          // drawn over the text (lights, transitions)
//       paint(ctx, w, h),     // drawn ONCE, then only moved — cheap
//       live: (w, h) => ({ draw(ctx, t, dt, p), tap?(x, y), brush?(x, y, dx, dy) }),  // OR drawn every frame
//                             // tap = a tap/click; brush = a drag across it
//                             // (mouse held down, or a finger moving sideways)
//       brushable: true,      // its live part takes `brush`: on phones, a
//                             // sideways swipe brushes it instead of panning
//       fill: 'css background',   // OR just a coloured sheet (no canvas)
//       look: (p, t) => ({ x, y, scale, rotate, opacity, origin: [x, y] }),
//       depth: 0.4,           // if no `look`: simple parallax (0 = none)
//       resolution: 0.6,      // paint this layer less sharp (soft skies: saves memory)
//       blend: 'soft-light',  // CSS mix-blend-mode (film grain, light leaks)
//       centered: true,       // drawn in the 430 px story column, in the middle
//                             // of a wide screen (for objects placed at fixed
//                             // x, like the mandap). Otherwise a layer is as
//                             // wide as the screen and gets that width as `w`.
//       paper: false,         // a painted OBJECT (garland…): don't print it on
//                             // lokta paper like the scenery (see paper.js)
//       // A `fill` is NOT printed on paper unless it says so:
//       paper: 'left top',    // print this flat colour on the paper, the tile
//                             // starting at that edge (for hand-over fades)
//       mask: 'css gradient', // fade a fill in/out (with a CSS mask)
//     }],
//   }
//
// Text: wrap it in <Reveal> (below) to make it appear/disappear with `p`.
// Give it a `rate` and it moves with the scene's camera at its own speed
// (parallax for text).

import { createContext, useContext, useEffect, useRef } from 'react';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../config';
import { printOnPaper, printedColor } from './paper';

// How tall one screen of the viewer's device is, in page px. The preview
// provides it; the editor uses the design height.
export const StageContext = createContext(PAGE_HEIGHT);

// How WIDE the page is, in page px. On a phone it's the design width (430);
// on a tablet or computer the story's scenery fills the whole screen, so it's
// wider, and the words stay in a 430 px column in the middle. (The editor
// always uses 430.)
export const PageWidthContext = createContext(PAGE_WIDTH);

const MARGIN = 100; // extra canvas around each layer, so moving it never shows an edge
const TRAVEL = 120; // parallax: px a depth-1 layer drifts across a flowing chapter
const PAPER = 0.85; // how strongly the lokta paper shows in the painted scenery (0 … 1)

export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
// 0 before `a`, 1 after `b`, a smooth S-curve between
export const smooth = (a, b, v) => {
  const x = clamp((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};

// Text that appears (and optionally disappears) as the story plays.
//   at   – [start, end] of `p` while it fades/rises in
//   out  – [start, end] of `p` while it fades/rises out (optional)
//   rise – px it travels while appearing
//   grow – how much bigger it gets while leaving (0.2 = 20%)
//   self – appear when IT scrolls into view (for flowing chapters)
//   wipe – uncover it from the bottom up instead of fading
//   rate – how fast it moves up with the scene's camera (1 = as fast as the
//          temple, 1.3 = faster, as if nearer)
export function Reveal({ as: Tag = 'div', at = [0, 0.1], out, rise = 24, grow = 0, self = false, wipe = false, rate = 0, className = '', style, children, ...rest }) {
  return (
    <Tag
      {...rest}
      data-reveal={[...at, ...(out ?? [9, 9])].join(',')}
      data-rise={rise}
      data-grow={grow}
      data-rate={rate || undefined}
      data-self={self ? '' : undefined}
      data-wipe={wipe ? '' : undefined}
      className={className}
      style={{ opacity: 0, ...style }}
    >
      {children}
    </Tag>
  );
}

// The scrolling element the page lives in: the editor's canvas, or the window.
const scrollerOf = (el) => el.closest('[data-scroller]');
const pageOf = (el) => el.closest('[data-page]');

// `start` / `edge` (pinned only) = the colours the chapter starts and ends
// on. They're painted under the stage, so the hairline where two chapters
// meet never shows a seam.
// `over` = text or elements to show ABOVE even the front layers (e.g. words
// written on a night sky that has just covered everything).
export default function StoryScene({ height, scene, background, start, edge, pinned = false, editing = false, paintKey = '', children, over }) {
  const screen = useContext(StageContext);
  const W = useContext(PageWidthContext); // the page's width (page px)
  const side = (W - PAGE_WIDTH) / 2; // where the 430 px story column starts
  // a layer's own width, and how far it's shifted to sit in the middle
  const widthOf = (layer) => (layer.centered ? PAGE_WIDTH : W);
  const shiftOf = (layer) => (layer.centered ? side : 0);
  const stageHeight = pinned ? screen : height;
  const designHeight = pinned ? PAGE_HEIGHT : height; // the coordinates layers are drawn in

  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const layerRefs = useRef([]);
  const canvasRefs = useRef([]);
  const editingRef = useRef(editing);
  editingRef.current = editing;

  const layers = scene.layers;

  // Where a layer's box sits inside the stage.
  const placeOf = (layer) => {
    const [top, bottom] = layer.band ?? [0, designHeight];
    const anchor = pinned ? layer.anchor ?? 'center' : 'top';
    const shift = anchor === 'bottom' ? stageHeight - designHeight : anchor === 'center' ? (stageHeight - designHeight) / 2 : 0;
    return { boxTop: top - MARGIN, top: top - MARGIN + shift, height: bottom - top + MARGIN * 2 };
  };

  // ── Paint the still layers once (again if size or content changes) ──────
  // Painting a big scene all at once freezes the page for a moment (the
  // garden opening took ~220 ms on a laptop, more on a phone), so it's done
  // a few layers per frame, ~8 ms at a time: the layers on screen first,
  // then the rest. A layer keeps its old picture until its turn comes.
  const onStageRef = useRef([]);
  useEffect(() => {
    let frame = 0;
    const timer = setTimeout(() => {
      const sharpness = canvasScale(rootRef.current, W);
      const shown = onStageRef.current;
      const queue = layers
        .map((layer, i) => i)
        .filter((i) => layers[i].paint && canvasRefs.current[i])
        .sort((a, b) => (shown[b] ? 1 : 0) - (shown[a] ? 1 : 0)); // on screen first
      const paintOne = (i) => {
        const layer = layers[i];
        const canvas = canvasRefs.current[i];
        if (!canvas) return;
        const scale = sharpness * (layer.resolution ?? 1);
        const { boxTop, height: h } = placeOf(layer);
        canvas.width = Math.round(W * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(scale, 0, 0, scale, 0, -boxTop * scale); // draw in scene coordinates
        ctx.__s = scale;
        ctx.translate(shiftOf(layer), 0);
        layer.paint(ctx, widthOf(layer), designHeight);
        // scenery is printed on lokta paper; objects opt out with `paper: false`
        if (layer.paper !== false) printOnPaper(canvas, scale, PAPER);
      };
      const step = () => {
        const start = performance.now();
        do paintOne(queue.shift());
        while (queue.length && performance.now() - start < 8);
        if (queue.length) frame = requestAnimationFrame(step);
      };
      if (queue.length) step();
    }, 60);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, stageHeight, paintKey, W]);

  // ── Every frame while on screen: work out `p`, move everything ───────────
  const liveRef = useRef([]);
  useEffect(() => {
    const root = rootRef.current;
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    liveRef.current = layers.map((layer) => (layer.live ? layer.live(widthOf(layer), designHeight) : null));

    let visible = false;
    let frame = 0;
    let last = performance.now();
    let time = 0;

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;

      // ── read (all measuring first, so the browser lays out only once) ──
      const scroller = scrollerOf(root);
      const viewTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const viewHeight = scroller ? scroller.clientHeight : window.innerHeight;
      const rect = root.getBoundingClientRect();
      const k = rect.width / W; // page px → screen px

      let p;
      if (editingRef.current || (calm && pinned)) p = scene.editAt ?? 0;
      else if (pinned) {
        // scroll available before pinning: one screen, less near the top of the page
        const page = pageOf(root);
        const entry = clamp(rect.top - (page ? page.getBoundingClientRect().top : rect.top), 0, viewHeight);
        p = clamp((viewTop + entry - rect.top) / (rect.height - stageHeight * k + entry));
      }
      else p = clamp((viewTop + viewHeight - rect.top) / (viewHeight + rect.height));

      const reveals = [...root.querySelectorAll('[data-reveal]')];
      const selfRects = reveals.map((el) => (el.hasAttribute('data-self') ? el.getBoundingClientRect() : null));

      // where the scene's camera is (text with a `rate` rides it)
      const cam = scene.camera && !editingRef.current ? scene.camera(p) : 0;

      // ── write ──
      // (and note which layers are on the stage at all: live ones that
      // aren't are skipped below, which saves a lot on long pinned scenes)
      const onStage = [];
      layers.forEach((layer, i) => {
        const el = layerRefs.current[i];
        if (!el) return;
        const look = layer.look ? layer.look(p, calm ? 0 : time) : { y: pinned ? 0 : (p - 0.5) * 2 * TRAVEL * (layer.depth ?? 0) };
        const { x = 0, y = 0, scale = 1, rotate = 0, opacity = 1, origin } = look;
        if (origin) {
          const { boxTop } = placeOf(layer);
          el.style.transformOrigin = `${origin[0] + side}px ${origin[1] - boxTop}px`; // (origins are given in the story column's px)
        }
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(4)}) rotate(${rotate.toFixed(2)}deg)`;
        el.style.opacity = opacity.toFixed(3);
        el.style.visibility = opacity < 0.005 ? 'hidden' : 'visible';
        const { top, height: h } = placeOf(layer);
        onStage[i] = opacity >= 0.005 && (!pinned || scale !== 1 || rotate !== 0 || (top + y + h > -40 && top + y < stageHeight + 40));
      });
      onStageRef.current = onStage;

      reveals.forEach((el, i) => {
        if (editingRef.current) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.clipPath = 'none';
          return;
        }
        const [a, b, c, d] = el.dataset.reveal.split(',').map(Number);
        let shown;
        let gone = 0;
        const r = selfRects[i];
        if (r) shown = smooth(0, 1, (viewTop + viewHeight - r.top) / (viewHeight * 0.3));
        else {
          shown = smooth(a, b, p);
          gone = smooth(c, d, p);
        }
        const rise = calm ? 0 : Number(el.dataset.rise);
        const grow = Number(el.dataset.grow);
        if (el.hasAttribute('data-wipe')) {
          el.style.opacity = String(1 - gone);
          el.style.clipPath = `inset(${((1 - shown) * 100).toFixed(1)}% 0 0 0)`;
        } else {
          el.style.opacity = (shown * (1 - gone)).toFixed(3);
        }
        const rate = Number(el.dataset.rate ?? 0);
        const ty = (1 - shown) * rise - gone * rise * 1.5 - cam * rate;
        el.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0) scale(${(1 + gone * grow).toFixed(3)})`;
      });

      // things drawn every frame (stars, lanterns, flames, petals)
      const sharpness = canvasScale(root, W);
      layers.forEach((layer, i) => {
        const live = liveRef.current[i];
        const canvas = canvasRefs.current[i];
        if (!live || !canvas || !onStage[i]) return;
        const scale = sharpness * (layer.resolution ?? 1);
        const { boxTop, height: h } = placeOf(layer);
        const w = Math.round(W * scale);
        const hh = Math.round(h * scale);
        if (canvas.width !== w || canvas.height !== hh) {
          canvas.width = w;
          canvas.height = hh;
        }
        const ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, w, hh);
        ctx.setTransform(scale, 0, 0, scale, shiftOf(layer) * scale, -boxTop * scale);
        live.draw(ctx, calm ? 0 : time, calm ? 0 : dt, p);
      });

      frame = visible ? requestAnimationFrame(tick) : 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    });
    observer.observe(root);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      frame = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, stageHeight, W]);

  // A tap on the scene (not on text/buttons) goes to the live layers,
  // e.g. to release a sky lantern.
  // Where the pointer was last (scene px), to tell how far a drag moved.
  const lastPointer = useRef(null);
  const brushable = layers.some((layer) => layer.brushable);

  // A drag across the scene (mouse held down, or a finger) goes to the live
  // layers that can be brushed, e.g. to brush through the tall grass.
  const onPointerMove = (e) => {
    if (e.pointerType === 'mouse' && e.buttons === 0) {
      lastPointer.current = null;
      return;
    }
    const stage = stageRef.current.getBoundingClientRect();
    const k = stage.width / W;
    const sx = (e.clientX - stage.left) / k;
    const sy = (e.clientY - stage.top) / k;
    const last = lastPointer.current;
    lastPointer.current = [sx, sy];
    if (!last) return;
    layers.forEach((layer, i) => {
      const live = liveRef.current[i];
      if (!live?.brush) return;
      const { top, boxTop } = placeOf(layer);
      live.brush(sx - shiftOf(layer), sy - top + boxTop, sx - last[0], sy - last[1]);
    });
  };

  const onPointerDown = (e) => {
    const box = stageRef.current.getBoundingClientRect();
    lastPointer.current = [(e.clientX - box.left) / (box.width / W), (e.clientY - box.top) / (box.width / W)];
    const stage = stageRef.current.getBoundingClientRect();
    const k = stage.width / W;
    layers.forEach((layer, i) => {
      const live = liveRef.current[i];
      if (!live?.tap) return;
      const { top, boxTop } = placeOf(layer);
      // screen point → this layer's scene coordinates
      live.tap((e.clientX - stage.left) / k - shiftOf(layer), (e.clientY - stage.top) / k - top + boxTop);
    });
  };

  const renderLayer = (layer, i) => {
    const { top, height: h } = placeOf(layer);
    const box = layer.fill
      ? {
          inset: -2, // a hair bigger than the stage: no seam at its edges
          background: layer.paper ? printedColor(layer.fill, PAPER, layer.paper) : layer.fill,
          backgroundBlendMode: layer.paper ? 'soft-light' : undefined,
          maskImage: layer.mask,
          WebkitMaskImage: layer.mask,
        }
      : { left: 0, right: 0, top, height: h };
    return (
      <div key={i} ref={(el) => (layerRefs.current[i] = el)} className="pointer-events-none absolute will-change-transform" style={{ ...box, mixBlendMode: layer.blend }}>
        {!layer.fill && <canvas ref={(el) => (canvasRefs.current[i] = el)} className="block size-full" />}
      </div>
    );
  };

  const stage = (
    <div
      ref={stageRef}
      className={pinned ? 'sticky top-0 w-full overflow-clip' : 'absolute inset-0 overflow-clip'}
      style={{ height: stageHeight, background: pinned ? background : undefined, touchAction: brushable ? 'pan-y' : undefined }}
      onPointerDown={onPointerDown}
      onPointerMove={brushable ? onPointerMove : undefined}
      onPointerUp={() => (lastPointer.current = null)}
      onPointerCancel={() => (lastPointer.current = null)}
    >
      {layers.map((layer, i) => (layer.front ? null : renderLayer(layer, i)))}
      {/* the words and other elements: in the story column, in the middle */}
      <div className="absolute inset-y-0" style={{ left: side, width: PAGE_WIDTH }}>{children}</div>
      {layers.map((layer, i) => (layer.front ? renderLayer(layer, i) : null))}
      {over && <div className="pointer-events-none absolute inset-y-0" style={{ left: side, width: PAGE_WIDTH }}>{over}</div>}
    </div>
  );

  return (
    <div ref={rootRef} className="relative w-full overflow-clip" style={{ height, background: pinned ? `linear-gradient(${start ?? edge} 50%, ${edge ?? start} 50%)` : background }}>
      {stage}
    </div>
  );
}

// How sharp to paint canvases: the page's on-screen size × the screen's
// pixel density, capped so phones don't run out of memory.
function canvasScale(root, pageWidth) {
  const shown = root.getBoundingClientRect().width / pageWidth;
  return Math.min(2, Math.max(0.5, shown * (window.devicePixelRatio || 1)));
}
