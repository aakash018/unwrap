// Middle area: a Figma-like canvas holding the gift page.
//
//   <main>                         ← fills the space right of the toolbar
//     <div viewport>               ← scrolls (up/down, and sideways when zoomed in)
//       <div page style=zoom>      ← the gift page, exactly as the receiver sees it
//         <ThemeLayer/>            ← the theme's moving decorations, behind everything
//         <BlockFrame/> …          ← each element, placed freely (x, y, width, rotation)
//     <ZoomControls />             ← floats on top, doesn't scroll
//     <DeviceSwitch />             ← Mobile · Tablet · Desktop
//
// Clicking empty canvas space deselects the current element.
//
// Mobile · Tablet · Desktop: the page fills the width of bigger screens — its
// scenery (an invitation's chapters, a gift's theme) is as wide as the device,
// and everything else stands in a column in the middle, exactly as the
// Preview shows it. An invitation's column is always the phone's; a gift has a
// layout for each device (page/layouts.js), with its own column. On a wide gift,
// two dashed lines show it while an element is selected: what's inside them is
// on screen in narrower windows too.

import { useEffect, useRef, useState } from 'react';
import BlockFrame from './BlockFrame';
import ZoomControls from './ZoomControls';
import DeviceSwitch from './DeviceSwitch';
import { useZoom } from './useZoom';
import { usePageHeight } from './usePageHeight';
import { useEditorKeys } from './useEditorKeys';
import { deviceScreen } from '../../config';
import ThemeLayer from '../../themes/ThemeLayer';
import { THEMES } from '../../themes';
import { LAYOUTS } from '../../page/layouts';
import { StageContext, PageWidthContext } from '../../sections/StoryScene';

export default function Canvas({ page, dispatch, apiRef, device, onDevice }) {
  const screen = deviceScreen(device);
  const column = LAYOUTS[page.layout].width;
  const pageWidth = screen.width;
  const side = (pageWidth - column) / 2; // where the column starts

  const zoomApi = useZoom({ width: pageWidth, height: screen.screenHeight });
  const { zoom, viewportRef } = zoomApi;

  // How tall a pinned chapter's stage is here: one device screen — or, when
  // the canvas shows more of the page than that (zoomed out), all of what
  // it shows. Otherwise the chapter's plain colour shows as a block under
  // the stage while it's pinned (the Preview never has this: there the
  // stage is exactly the window). Rounded up in 100 px steps, so zooming
  // doesn't repaint the scenery on every step.
  const [viewHeight, setViewHeight] = useState(0);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() => setViewHeight(el.clientHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewportRef]);
  const stageHeight = Math.max(screen.screenHeight, Math.ceil(viewHeight / zoom / 100) * 100);
  const pageRef = useRef(null);
  const theme = THEMES[page.theme] ?? THEMES.plain;
  // (a theme with a top and a bottom scene needs room for both: minHeight)
  const pageHeight = usePageHeight(pageRef, page.blocks, zoom, { min: Math.max(screen.screenHeight, theme.minHeight ?? 0) });
  useEditorKeys(page, dispatch);

  // Let the toolbar ask "where is the middle of what I'm looking at?",
  // so new elements appear in view (like Figma).
  useEffect(() => {
    apiRef.current = {
      visibleCenter() {
        const view = viewportRef.current.getBoundingClientRect();
        const pg = pageRef.current.getBoundingClientRect();
        const x = (view.left + view.width / 2 - pg.left) / zoom - side; // in the column's px
        const y = (view.top + view.height / 2 - pg.top) / zoom;
        return { x: Math.min(column, Math.max(0, x)), y: Math.max(0, y) };
      },
    };
  }, [apiRef, viewportRef, zoom, side, column]);

  return (
    <main className="relative overflow-hidden bg-backdrop">
      <div
        ref={viewportRef}
        data-scroller // story sections measure their scroll progress against this
        className="h-full overflow-auto"
        onClick={() => dispatch({ type: 'SELECT_BLOCK', id: null })}
      >
        {/* min-w-max lets the area grow sideways when the page is zoomed wider than the screen */}
        <div className="flex min-h-full min-w-max items-start justify-center px-16 pt-16 pb-28">
          {/* the page: sharp corners, hairline edge */}
          <div
            ref={pageRef}
            data-page
            className="relative shadow-[0_0_0_1px_rgba(30,27,24,0.08),0_2px_10px_rgba(30,27,24,0.06)]"
            style={{
              width: pageWidth,
              height: pageHeight,
              background: theme.background ?? page.background,
              '--gift-hint': theme.inkSoft, // hint colour for the surprises
              zoom,
            }}
          >
            <ThemeLayer themeId={page.theme} width={pageWidth} height={pageHeight} zoom={zoom} screenHeight={screen.screenHeight} name={page.opening?.name} />

            {page.blocks.length === 0 && (
              <div
                className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-sm leading-relaxed"
                style={{ color: theme.inkSoft }}
              >
                Your gift page is empty.
                <br />
                Add something from the left to begin.
              </div>
            )}

            {/* the layout's column, on a wider page */}
            {page.kind === 'gift' && side > 0 && page.selectedId && (
              <div
                className="pointer-events-none absolute inset-y-0 border-x border-dashed opacity-40"
                style={{ left: side, width: column, borderColor: theme.inkSoft }}
              />
            )}

            {/* array order = layer order: later blocks sit on top. Story
                sections fill this device's width and pin to its screen. */}
            <StageContext.Provider value={stageHeight}>
              <PageWidthContext.Provider value={pageWidth}>
                {page.blocks.map((block) => (
                  <BlockFrame
                    key={block.id}
                    block={block}
                    isSelected={block.id === page.selectedId}
                    zoom={zoom}
                    dispatch={dispatch}
                    pageWidth={pageWidth}
                    column={column}
                  />
                ))}
              </PageWidthContext.Provider>
            </StageContext.Provider>
          </div>
        </div>
      </div>

      <DeviceSwitch device={device} onChange={onDevice} onArrange={page.blocks.some(({ frames }) => frames?.[page.layout]) ? () => dispatch({ type: 'ARRANGE', layout: page.layout }) : null} />
      <ZoomControls {...zoomApi} />
    </main>
  );
}
