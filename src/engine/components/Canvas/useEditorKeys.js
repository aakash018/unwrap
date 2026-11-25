// useEditorKeys — keyboard shortcuts for the selected element.
//
//   Delete / Backspace   remove it
//   Arrow keys           nudge 1px   (hold Shift for 10px)
//   Escape               deselect (or stop typing)
//
// Ignored while you're typing in a text box or editing text on the page.

import { useEffect } from 'react';

const ARROWS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export function useEditorKeys(page, dispatch) {
  useEffect(() => {
    const onKey = (e) => {
      const target = e.target;
      const typing =
        target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

      if (typing) {
        if (e.key === 'Escape') target.blur();
        return;
      }

      const block = page.blocks.find((b) => b.id === page.selectedId);
      if (!block) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        dispatch({ type: 'REMOVE_BLOCK', id: block.id });
      } else if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_BLOCK', id: null });
      } else if (ARROWS[e.key]) {
        e.preventDefault(); // don't scroll the canvas
        const [dx, dy] = ARROWS[e.key];
        const step = e.shiftKey ? 10 : 1;
        dispatch({
          type: 'UPDATE_FRAME',
          id: block.id,
          frame: { x: block.frame.x + dx * step, y: block.frame.y + dy * step },
        });
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [page, dispatch]);
}
