// A small still picture of a theme, for the picker.
// It runs the real scene for a moment (so ropes have settled and petals are
// scattered), then draws the first screen of the page once.

import { useEffect, useRef } from 'react';
import { World } from './physics';
import { THEMES } from './index';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../config';

const THUMB_WIDTH = 110; // CSS px
const SHOWN_HEIGHT = Math.min(PAGE_HEIGHT, Math.round(PAGE_WIDTH * 1.1)); // the top of the first screen

export default function ThemeThumbnail({ themeId, color }) {
  const canvasRef = useRef(null);
  const theme = THEMES[themeId];
  const scale = THUMB_WIDTH / PAGE_WIDTH;
  const thumbHeight = Math.round(SHOWN_HEIGHT * scale);

  useEffect(() => {
    if (!theme.createScene) return;
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(THUMB_WIDTH * dpr);
    canvas.height = Math.round(thumbHeight * dpr);

    const H = Math.max(PAGE_HEIGHT, theme.minHeight ?? 0); // the page's shortest height for this theme
    const world = new World(PAGE_WIDTH, H);
    const scene = theme.createScene(world, { calm: false });
    for (let i = 0; i < 150; i++) {
      scene.update?.(world.time, 1 / 60);
      world.step(1 / 60);
    }

    const ctx = canvas.getContext('2d');
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    for (const layer of theme.layers ?? []) {
      ctx.save();
      layer.paint(ctx, { x0: 0, x1: PAGE_WIDTH, y0: 0, y1: H }, PAGE_WIDTH, H, PAGE_HEIGHT);
      ctx.restore();
    }
    scene.backdrop?.(ctx, PAGE_WIDTH, H);
    scene.draw(ctx, world.time);
  }, [theme, scale, thumbHeight]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-md"
      style={{ height: thumbHeight, background: theme.background ?? color }}
    >
      {theme.createScene && <canvas ref={canvasRef} className="absolute inset-0 size-full" />}
    </div>
  );
}
