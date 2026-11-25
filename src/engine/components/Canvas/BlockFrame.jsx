// BlockFrame — one element on the page, placed freely.
//
// Positions the block at its frame { x, y, w, rotation }, and handles:
//   • press           → select it
//   • drag            → move it          (useFrameGestures)
//   • handles         → resize / rotate  (SelectionBox)
//   • double-click    → type into text blocks
//
// Two ways a block can respond to width changes (set in blocks/index.js):
//   resize: 'reflow' – content fills the new width (text re-wraps, photos grow)
//   resize: 'scale'  – the whole thing scales up/down, like a picture
//                      (used for the surprises, which are drawn at a fixed size)

import { useRef, useState } from 'react';
import { BLOCKS } from '../../blocks';
import { PAGE_WIDTH } from '../../config';
import { useFrameGestures } from './useFrameGestures';
import SelectionBox from './SelectionBox';

// pageWidth: on a wide page (Tablet / Desktop view) a section fills the
// whole width, and every other element keeps its place in the layout's column
// (`column` wide) in the middle.
export default function BlockFrame({ block, isSelected, zoom, dispatch, pageWidth = PAGE_WIDTH, column = PAGE_WIDTH }) {
  const def = BLOCKS[block.type];
  const { Component } = def;
  const { x, y, w, rotation } = block.frame;
  const left = def.section ? 0 : x + (pageWidth - column) / 2;
  const width = def.section ? pageWidth : w;

  const frameRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const isEditing = editing && isSelected;

  const gestures = useFrameGestures({
    block,
    zoom,
    minWidth: def.minWidth ?? 60,
    frameRef,
    dispatch,
  });

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation(); // don't let the canvas deselect it
    if (!isSelected) dispatch({ type: 'SELECT_BLOCK', id: block.id });

    // Parts that need the pointer for themselves (scratch card, text being typed)
    // are marked data-no-drag.
    if (e.target.closest('[data-no-drag]')) return;
    if (def.section) return; // sections stay in their place in the stack
    gestures.startMove(e);
  };

  const onDoubleClick = (e) => {
    if (!def.editableText) return;
    setEditing(true);
    if (def.section) {
      // put the cursor in the line that was double-clicked
      const { clientX, clientY } = e;
      requestAnimationFrame(() => {
        const line = document.elementFromPoint(clientX, clientY)?.closest('[contenteditable="true"]');
        line?.focus();
      });
    }
  };

  return (
    <div
      ref={frameRef}
      data-frame
      data-id={block.id}
      data-section={def.section ? '' : undefined}
      className={`group absolute ${def.section ? '' : 'touch-none'} ${isEditing || def.section ? '' : 'cursor-move'} ${isEditing ? '' : 'select-none'}`}
      style={{ left, top: y, width, transform: rotation ? `rotate(${rotation}deg)` : undefined }}
      onPointerDown={onPointerDown}
      onClickCapture={gestures.swallowClickAfterDrag}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={onDoubleClick}
      onBlur={(e) => {
        // finished typing once focus leaves this element
        if (!e.currentTarget.contains(e.relatedTarget)) setEditing(false);
      }}
    >
      <div style={def.resize === 'scale' ? { width: def.width, zoom: w / def.width } : undefined}>
        <Component
          props={block.props}
          isSelected={isSelected}
          isEditing={isEditing}
          onChange={(props) => dispatch({ type: 'UPDATE_BLOCK', id: block.id, props })}
        />
      </div>

      {isSelected ? (
        <SelectionBox
          label={def.label}
          rotation={rotation}
          zoom={zoom}
          onResize={gestures.startResize}
          onRotate={gestures.startRotate}
          handles={!def.section}
        />
      ) : (
        // faint outline on hover, so you can see what you're about to grab
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
          style={{ outline: `${1 / zoom}px solid rgba(180, 67, 47, 0.5)` }}
        />
      )}
    </div>
  );
}
