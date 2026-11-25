// A link someone typed, made safe for guests to tap: only web addresses
// ("wa.me/977…" works too). Anything else gives nothing.

export function safeLink(typed) {
  const text = (typed ?? '').trim();
  if (!text) return undefined;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}
