// One element on the page as the RECEIVER sees it: placed at its frame
// (x, y, width, rotation), fully interactive, but with no editing at all —
// no selection outline, no handles, no typing.
//
// The editor's version of this is components/Canvas/BlockFrame.jsx.

import { BLOCKS } from '../blocks';
import { PAGE_WIDTH } from '../config';

const noop = () => {};

// On a wide page (see GiftPage) a section fills the whole width, and every other
// element keeps its place in the layout's column (`column` wide) in the middle.
export default function BlockView({ block, pageWidth = PAGE_WIDTH, column = PAGE_WIDTH }) {
  const def = BLOCKS[block.type];
  if (!def) return null; // a block type this version doesn't know
  const { Component } = def;
  const { x, y, w, rotation } = block.frame;
  const left = def.section ? 0 : x + (pageWidth - column) / 2;
  const width = def.section ? pageWidth : w;

  return (
    <div
      data-frame
      data-section={def.section ? '' : undefined}
      className="absolute"
      style={{ left, top: y, width, transform: rotation ? `rotate(${rotation}deg)` : undefined }}
    >
      {/* 'scale' blocks are drawn at their natural size, then zoomed to fit the width */}
      <div style={def.resize === 'scale' ? { width: def.width, zoom: w / def.width } : undefined}>
        <Component props={block.props} isSelected={false} isEditing={false} preview onChange={noop} />
      </div>
    </div>
  );
}
