// The gift page exactly as the receiver gets it: the theme (paper, physics,
// parallax) and every element, live and playable. Used by the Preview tab,
// and later by the real gift link.
//
//   zoom          – scales the 430px-wide page to fill the screen's width
//   screenHeight  – one screen of the viewer's device, in page px. The page is
//                   never shorter than this, and the theme places its
//                   decorations on it (balloons, temples, the first screen…).
//   width         – the page's width in page px: the design width (430) on a
//                   phone, as wide as the screen on a tablet or computer. Its
//                   scenery (chapters, or the theme) fills it.
//   column        – how wide the layout is (layouts.js): everything else is
//                   placed in it, in the middle of the page.

import { useRef } from 'react';
import { StageContext, PageWidthContext } from '../sections/StoryScene';
import BlockView from './BlockView';
import ThemeLayer from '../themes/ThemeLayer';
import { THEMES } from '../themes';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../config';
import { usePageHeight } from '../components/Canvas/usePageHeight';

export default function GiftPage({ page, zoom = 1, screenHeight = PAGE_HEIGHT, width = PAGE_WIDTH, column = PAGE_WIDTH }) {
  const pageRef = useRef(null);
  // exactly one screen tall, or taller if the elements go further down
  const theme = THEMES[page.theme] ?? THEMES.plain;
  // (a theme with a top and a bottom scene needs room for both: minHeight)
  const height = usePageHeight(pageRef, page.blocks, zoom, { room: 80, min: Math.max(screenHeight, theme.minHeight ?? 0), step: 1, sectionRoom: 0 });

  return (
    <div
      ref={pageRef}
      data-page
      className="relative overflow-clip" // 'clip', not 'hidden': lets story sections pin (sticky)
      style={{
        width,
        height,
        background: theme.background ?? page.background,
        '--gift-hint': theme.inkSoft, // hint colour for the surprises
        zoom,
      }}
    >
      <ThemeLayer
        themeId={page.theme}
        width={width}
        height={height}
        zoom={zoom}
        screenHeight={screenHeight}
      />
      {/* story sections pin to one screen of this device, and fill its width */}
      <StageContext.Provider value={screenHeight}>
        <PageWidthContext.Provider value={width}>
          {page.blocks.map((block) => (
            <BlockView key={block.id} block={block} pageWidth={width} column={column} />
          ))}
        </PageWidthContext.Provider>
      </StageContext.Provider>
    </div>
  );
}
