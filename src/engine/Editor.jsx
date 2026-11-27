// Editor = the whole editor screen.
//
//   ┌──────────┬──────────────────────────┬────────────┐
//   │ Toolbar  │          Canvas          │ Inspector  │
//   │ (left:   │  (the gift page, scrolls)│ (right:    │
//   │  add)    │                          │  settings) │
//   └──────────┴──────────────────────────┴────────────┘
//
// Laid out like Figma: add things on the left, change the selected thing
// on the right.
//
// All page data lives in ONE place (`page`), managed by pageReducer.
// Toolbar and Canvas both read `page` and send changes with `dispatch`.
// Every change is also sent to the Preview tab, if one is open.
//
// An INVITATION is made of its template's chapters: you fill them in, and may
// reorder or remove them. A GIFT is made freely: a theme, and elements.
//
// It doesn't load or save anything itself. Whoever shows it gives it:
//   saved      – what to start with (page/format.js)
//   onChange   – called with it after every change
//   previewUrl – the address of its preview
//   channel    – a name shared with that preview (its id)
//   onHome     – called to leave the editor
//   status     – a word for the header: 'Saved', 'Saving…'
//   publish    – { label, onClick } for the header's Publish button (optional)
'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Toolbar from './components/Toolbar/Toolbar';
import Canvas from './components/Canvas/Canvas';
import Inspector, { showsInspector } from './components/Inspector/Inspector';
import { pageReducer, openPage } from './state/pageReducer';
import { toSaved } from './page/saved';
import Actions from './components/Actions';
import { sendPage, answerPreviews } from './preview/channel';
import { BLOCKS } from './blocks';
import { shownIn } from './page/layouts';
import { DEVICES } from './config';

const DEVICE = 'unwrap-editor-device'; // remembers the last choice
function savedDevice() {
  try {
    const id = localStorage.getItem(DEVICE);
    return DEVICES[id] ? id : 'mobile';
  } catch {
    return 'mobile';
  }
}

export default function Editor({ saved, onChange, previewUrl, channel, onHome, status, publish }) {
  const [page, change] = useReducer(pageReducer, saved, openPage);

  // Mobile · Tablet · Desktop. A gift has a layout for each: what's moved is
  // moved in that one, and everything below sees the elements as placed there.
  const [device, setDevice] = useState(savedDevice);
  const chooseDevice = (id) => {
    setDevice(id);
    try {
      localStorage.setItem(DEVICE, id);
    } catch {
      // private mode: just don't remember it
    }
  };
  const layout = page.kind === 'gift' ? device : 'mobile';

  // Removing a chapter loses its words, so ask first.
  const { blocks } = page;
  const shown = useMemo(() => (page.kind === 'gift' ? { ...page, layout, blocks: shownIn(page.blocks, layout) } : { ...page, layout }), [page, layout]);
  const dispatch = useCallback(
    (action) => {
      if (action.type === 'REMOVE_BLOCK') {
        const def = BLOCKS[blocks.find(({ id }) => id === action.id)?.type];
        if (def?.section && !window.confirm(`Remove "${def.label}"? Its words will be lost.`)) return;
      }
      change(action.type === 'UPDATE_FRAME' || action.type === 'ADD_BLOCK' ? { layout, ...action } : action);
    },
    [blocks, layout],
  );

  // The canvas fills this in, so we can ask it where the user is looking.
  const canvasApi = useRef(null);

  // Tell whoever shows us about every change (selecting isn't a change).
  const latest = useRef(saved);
  const { kind, template, theme, background, opening } = page;
  const told = useRef(false);
  const changedAt = useRef(0); // when
  useEffect(() => {
    latest.current = toSaved({ kind, template, theme, background, opening, blocks });
    if (told.current) {
      changedAt.current = Date.now();
      onChange(latest.current);
    }
    told.current = true; // (the first time, nothing has changed yet)
    // Keep the Preview tab up to date: a moment after each change, not on
    // every pixel of a drag.
    const timer = setTimeout(() => sendPage(channel, latest.current, changedAt.current), 150);
    return () => clearTimeout(timer);
  }, [kind, template, theme, background, opening, blocks, onChange, channel]);

  // …and answer a newly opened preview at once.
  useEffect(() => answerPreviews(channel, () => ({ saved: latest.current, at: changedAt.current })), [channel]);

  // New elements appear in the middle of the visible part of the page.
  const addBlock = (blockType) =>
    dispatch({ type: 'ADD_BLOCK', blockType, at: canvasApi.current?.visibleCenter() });

  // Open (or switch to) the Preview tab.
  const openPreview = () => window.open(previewUrl, `unwrap-preview-${channel}`);

  // saved · ▶ preview · Publish: in the right panel's header, or over the
  // canvas when there's no right panel
  const actions = <Actions status={status} onPreview={openPreview} publish={publish} />;
  const [leftTab, setLeftTab] = useState(null); // the left rail's open tab (null: its first)
  const panel = showsInspector(page);

  return (
    // (the right panel only shows when there's something in it)
    <div className={`grid h-screen overflow-hidden ${panel ? 'grid-cols-[304px_1fr_248px]' : 'grid-cols-[304px_1fr]'}`}>
      <Toolbar page={shown} dispatch={dispatch} onAdd={addBlock} onHome={onHome} open={leftTab} onOpen={setLeftTab} />
      <Canvas page={shown} dispatch={dispatch} apiRef={canvasApi} device={device} onDevice={chooseDevice} actions={panel ? null : actions} />
      {panel && <Inspector page={shown} dispatch={dispatch} actions={actions} onShowThemes={() => setLeftTab('theme')} />}
    </div>
  );
}
