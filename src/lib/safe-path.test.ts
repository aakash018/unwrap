// Run with: npm test

import assert from "node:assert/strict";
import test from "node:test";
import { safePath } from "./safe-path.ts";

test("keeps pages of this site", () => {
  assert.equal(safePath("/gifts"), "/gifts");
  assert.equal(safePath("/gifts/12?tab=guests"), "/gifts/12?tab=guests");
});

test("never leads to another site", () => {
  const bad = [
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "/.//evil.com",
    "/x/..//evil.com",
    "javascript:alert(1)",
    "",
    undefined,
    ["/gifts", "//evil.com"],
  ];
  for (const path of bad) assert.equal(safePath(path), "/gifts", String(path));
});
