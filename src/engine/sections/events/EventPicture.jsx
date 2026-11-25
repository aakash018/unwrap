// One ceremony's round picture (chapter 2), with a spray of flowers
// spilling over its edge.
//
// The picture is painted once (pictures.js), printed on lokta paper like
// the rest of the scenery, and cut into a circle with a fine gold ring
// round it. Its moving part (a diyo's flame, the sacred fire, rising
// lanterns) is drawn every frame, but only while it's on screen. The
// flowers (flowers.js) sit on their own canvas, half over the picture, and
// stir slowly as if in a breeze.
//
//   kind  – which picture ('thali', 'mehendi', 'mandap', 'lanterns')
//   size  – its width in page px
//   side  – 'left': flowers at the bottom left; 'right': at the top right
//   look  – the invite's look: 'garden' gives roses instead of champa

import { useEffect, useRef } from 'react';
import { printOnPaper } from '../paper';
import { PICTURES } from './pictures';
import { flowerSpray } from './flowers';

const PAPER = 0.85; // same as the scenery (StoryScene.jsx)
const SPRAY = { width: 190, height: 170 };

// A canvas `width × height` page px, sharp on this screen.
function sharpCanvas(canvas, width, height) {
  const scale = Math.min(2.5, window.devicePixelRatio || 1) * 1.25; // a little extra for the page's zoom
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  return scale;
}

export default function EventPicture({ kind, size, side = 'left', look }) {
  const pictureRef = useRef(null);
  const sprayRef = useRef(null);

  // the picture: painted once, then its live part every frame while visible
  useEffect(() => {
    const canvas = pictureRef.current;
    const picture = PICTURES[kind] ?? PICTURES.thali;
    const scale = sharpCanvas(canvas, size, size);

    const still = document.createElement('canvas');
    still.width = canvas.width;
    still.height = canvas.height;
    const s = still.getContext('2d');
    s.scale(scale, scale);
    s.__s = scale; // (for the cut-paper shadows, see art.js)
    picture.paint(s, size);
    printOnPaper(still, scale, PAPER);

    const ctx = canvas.getContext('2d');
    const live = picture.live?.(size);
    const draw = (t, dt) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(still, 0, 0);
      ctx.scale(scale, scale);
      ctx.__s = scale;
      live?.(ctx, t, dt);
    };
    draw(0, 0);

    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!live || calm) return;
    let frame = 0;
    let last = 0;
    const tick = (now) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      draw(now / 1000, dt);
      frame = requestAnimationFrame(tick);
    };
    const watch = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    watch.observe(canvas);
    return () => {
      watch.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [kind, size]);

  // the flowers: drawn once
  useEffect(() => {
    const canvas = sprayRef.current;
    const scale = sharpCanvas(canvas, SPRAY.width, SPRAY.height);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    flowerSpray(ctx, SPRAY.width, SPRAY.height, kind.length * 7, look);
  }, [kind, look]);

  const left = side === 'left';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* a fine gold ring just outside the picture */}
      <div className="pointer-events-none absolute -inset-[7px] rounded-full border border-[#C99A4B]/50" />
      <canvas
        ref={pictureRef}
        className="size-full rounded-full shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]"
        style={{ width: size, height: size }}
        aria-hidden
      />
      <canvas
        ref={sprayRef}
        className="pointer-events-none absolute motion-safe:animate-breeze"
        style={{
          width: SPRAY.width,
          height: SPRAY.height,
          ...(left ? { left: -62, bottom: -40 } : { right: -30, top: -62 }),
          scale: left ? undefined : '-1 1', // the right-hand spray is the same one, mirrored
          transformOrigin: left ? '30% 72%' : '70% 72%', // it stirs around its stems
        }}
        aria-hidden
      />
    </div>
  );
}
