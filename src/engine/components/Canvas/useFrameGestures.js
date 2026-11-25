// useFrameGestures — move, resize and rotate one element with the mouse/finger.
//
// An element's position lives in `block.frame`:
//   { x, y, w, rotation }   (page pixels, degrees)
// Height is never stored: it follows from the content (text wraps, photos
// keep their shape, surprises scale), so we only ever change the width.
//
// All mouse movement is in *screen* pixels, so we divide by the canvas
// zoom to turn it into *page* pixels.

import { useRef } from 'react';

const DRAG_THRESHOLD = 4; // screen px a press must travel before it counts as a drag

// Follow the pointer until it's released.
function trackPointer(onMove, onEnd) {
  const move = (e) => onMove(e);
  const end = (e) => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
    onEnd?.(e);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
}

export function useFrameGestures({ block, zoom, minWidth, frameRef, dispatch }) {
  const justDragged = useRef(false);

  const updateFrame = (frame) => dispatch({ type: 'UPDATE_FRAME', id: block.id, frame });

  // ── Move: press anywhere on the element and drag ─────────────────────────
  const startMove = (e) => {
    justDragged.current = false;
    const start = { x: e.clientX, y: e.clientY, frame: block.frame };
    let dragging = false;

    trackPointer(
      (ev) => {
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
        if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return; // still just a click
        // the element stops at the column's edge while the pointer goes on: keep
        // the drag (and the click after it) on the element
        if (!dragging) frameRef.current?.setPointerCapture(ev.pointerId);
        dragging = true;
        updateFrame({
          x: Math.round(start.frame.x + dx / zoom),
          y: Math.round(start.frame.y + dy / zoom),
        });
      },
      () => {
        justDragged.current = dragging;
      },
    );
  };

  // After a drag, the browser still fires a "click". Swallow it so a drag
  // doesn't also open the letter / shuffle the photos / etc.
  const swallowClickAfterDrag = (e) => {
    if (!justDragged.current) return;
    justDragged.current = false;
    e.stopPropagation();
    e.preventDefault();
  };

  // ── Resize: drag a left or right handle ─────────────────────────────────
  // The opposite side stays where it is, even when the element is rotated.
  const startResize = (e, side) => {
    e.stopPropagation();
    e.preventDefault();

    const { x, y, w, rotation } = block.frame;
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const start = { x: e.clientX, y: e.clientY };

    trackPointer((ev) => {
      const dx = (ev.clientX - start.x) / zoom;
      const dy = (ev.clientY - start.y) / zoom;
      const along = dx * cos + dy * sin; // movement along the element's own width

      const newW = Math.max(minWidth, side === 'right' ? w + along : w - along);
      const half = (newW - w) / 2;

      // Shift x/y so the opposite edge doesn't move (maths for a box that
      // rotates around its centre).
      updateFrame(
        side === 'right'
          ? { w: Math.round(newW), x: x + half * (cos - 1), y: y + half * sin }
          : { w: Math.round(newW), x: x - half * (cos + 1), y: y - half * sin },
      );
    });
  };

  // ── Rotate: drag the round handle ───────────────────────────────────────
  // Hold Shift to snap to 15° steps. Near 0°/90°/180° it snaps gently.
  const startRotate = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const rect = frameRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angleOf = (ev) => (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI;

    const startAngle = angleOf(e);
    const startRotation = block.frame.rotation;

    trackPointer((ev) => {
      let r = startRotation + angleOf(ev) - startAngle;
      r = ((((r + 180) % 360) + 360) % 360) - 180; // keep between -180 and 180

      const nearestRight = Math.round(r / 90) * 90;
      if (ev.shiftKey) r = Math.round(r / 15) * 15;
      else if (Math.abs(r - nearestRight) < 3) r = nearestRight;

      updateFrame({ rotation: Math.round(r) });
    });
  };

  return { startMove, startResize, startRotate, swallowClickAfterDrag };
}
