// A new id for a block. (crypto.randomUUID only exists on https pages and on
// localhost, not when trying a page from a phone over Wi-Fi.)

export function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
