// How the editor hands the page to its Preview tab: a live line between tabs
// of this site (BroadcastChannel), one for each thing being made. The editor sends the
// page after every change; the preview draws it again.
// (A preview opened later, or refreshed, first loads the saved draft. Each page
// comes with when it was last changed: one from an old editor tab, from before
// that draft was saved, is passed over.)

const lineFor = (id) => (typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(`unwrap-preview-${id}`));

// ── Editor side ──────────────────────────────────────────────────────────────

export function sendPage(id, saved, at) {
  const line = lineFor(id);
  line?.postMessage({ type: 'page', saved, at });
  line?.close();
}

// When a preview tab opens and says hello, answer with the latest page (`get`
// gives { saved, at }).
export function answerPreviews(id, get) {
  const line = lineFor(id);
  if (!line) return () => {};
  line.onmessage = (e) => {
    if (e.data?.type === 'hello') line.postMessage({ type: 'page', ...get() });
  };
  return () => line.close();
}

// ── Preview side ─────────────────────────────────────────────────────────────

// Calls `onSaved(saved)` now (if an editor is open) and whenever it changes.
// `since` = when the draft that's shown was saved.
export function followEditor(id, since, onSaved) {
  const line = lineFor(id);
  if (!line) return () => {};
  line.onmessage = (e) => {
    if (e.data?.type === 'page' && e.data.at > since) onSaved(e.data.saved);
  };
  line.postMessage({ type: 'hello' });
  return () => line.close();
}
