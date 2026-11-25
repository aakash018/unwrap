// Blessings (आशीर्वाद) — the little "post box" between the blessing form
// and the lantern sky in the finale (chapter 4).
//
// A guest writes a blessing and their name; the form calls sendBlessing(),
// and the finale's lantern layer (which called listenForBlessings) sends a
// lantern up carrying it.
//
// For now blessings live only on the guest's screen. Keeping them for the
// couple (a keepsake, a soft RSVP) needs the backend, which isn't built yet.

let listener = null;

// Send a blessing up: { name, text }.
export function sendBlessing(blessing) {
  listener?.(blessing);
}

// The lantern sky listens (only one at a time: the last one to ask).
export function listenForBlessings(fn) {
  listener = fn;
}
