// Where to send someone after signing in. Only pages of this site are
// allowed, so a link like /login?next=https://evil.com can't send people
// somewhere else.

const HOME = "/gifts";
const BASE = "http://unwrap.invalid"; // only used to read the path

export function safePath(path: unknown): string {
  if (typeof path !== "string" || !path.startsWith("/")) return HOME;
  try {
    const url = new URL(path, BASE);
    // "//evil.com" also means another site, and "/.//evil.com" turns into it
    if (url.origin !== BASE || url.pathname.startsWith("//")) return HOME;
    return url.pathname + url.search;
  } catch {
    return HOME;
  }
}
