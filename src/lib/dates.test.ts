// Run with: npm test

import assert from "node:assert/strict";
import test from "node:test";
import { addDays, daysBetween, fromToday, longDate } from "./dates.ts";

test("counts days", () => {
  assert.equal(addDays("2026-11-28", 5), "2026-12-03");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(daysBetween("2026-11-24", "2026-12-01"), 7);
  assert.equal(daysBetween("2026-12-01", "2026-11-24"), -7);
});

test("says days in words", () => {
  assert.equal(longDate("2026-12-01"), "1 December 2026");
  assert.equal(fromToday("2026-11-24", "2026-11-24"), "today");
  assert.equal(fromToday("2026-11-25", "2026-11-24"), "tomorrow");
  assert.equal(fromToday("2026-12-01", "2026-11-24"), "in 7 days");
  assert.equal(fromToday("2026-11-20", "2026-11-24"), "4 days ago");
});
