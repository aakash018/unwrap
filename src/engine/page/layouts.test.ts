// The automatic wide layouts of a gift.

import assert from "node:assert/strict";
import test from "node:test";
import { arrange, LAYOUTS, layoutFor, phoneHeight, placesIn, shownIn, zoomFor } from "./layouts.js";

const block = (id: string, type: string, x: number, y: number, w: number, more = {}) => ({ id, type, frame: { x, y, w, rotation: 0 }, props: { text: "Some words" }, ...more });
const gift = [
  block("hello", "heading", 25, 300, 380),
  block("caption", "text", 45, 700, 340),
  block("box", "giftbox", 65, 760, 300),
  block("note", "sticky", 30, 1300, 226),
  block("letter", "letter", 65, 1700, 300),
  block("bye", "heading", 25, 2300, 380),
  block("star", "secret", 380, 1500, 44),
];

test("each window gets its layout, and is filled by it", () => {
  assert.deepEqual([390, 599, 820, 1023, 1440].map(layoutFor), ["mobile", "mobile", "tablet", "tablet", "desktop"]);
  assert.equal(zoomFor("desktop", 1440, 900), 1);
  assert.ok(Math.abs(zoomFor("desktop", 1024, 768) * 1200 - 1024) < 1); // a narrow one is scaled to fit
});

test("a wide layout uses its width, keeps the order, and stays inside", () => {
  for (const layout of ["tablet", "desktop"] as const) {
    const places = arrange(gift, layout);
    assert.equal(places.size, gift.length);
    for (const { x, w } of places.values()) assert.ok(x >= 0 && x + w <= LAYOUTS[layout].width, `${layout}: ${x} + ${w}`);
    assert.ok(places.get("hello").y < places.get("box").y);
    assert.ok(places.get("box").y < places.get("bye").y);
    assert.notEqual(places.get("box").x, places.get("note").x); // not all in the middle
    assert.equal(places.get("box").y - places.get("caption").y, 60); // the caption stays with its box
  }
  // only its own title goes with the first thing: the hello stays where it was
  const hello = [block("hi", "heading", 25, 388, 380), block("words", "text", 45, 462, 340), block("psst", "text", 45, 590, 340), block("caption", "text", 45, 684, 340), block("box", "giftbox", 65, 790, 300)];
  const greeted = arrange(hello, "desktop");
  assert.equal(greeted.get("hi").y, 388);
  assert.equal(greeted.get("hi").x, 410); // across the middle
  assert.ok(greeted.get("caption").x < 300);
  const desktop = arrange(gift, "desktop");
  const boxes = ["box", "note", "letter"].map((id) => desktop.get(id));
  assert.ok(boxes[0].x < 600 && boxes[1].x > 600); // two columns
});

test("the sender's own places win, and something added later fits in among them", () => {
  const own = gift.map((one) => ({ ...one, frames: { desktop: { ...one.frame, x: 700, y: one.frame.y * 2 } } }));
  const added = block("new", "text", 45, 1500, 340);
  const places = placesIn([...own, added], "desktop");
  assert.equal(places.get("box").x, 700);
  assert.equal(places.get("new").y, 3000);
  assert.equal(phoneHeight(own, "desktop", 3400), 1700);
  assert.equal(placesIn(own, "mobile").get("box").x, 65); // the phone's is untouched
});

test("words have a size and an alignment in each layout", () => {
  const words = { ...block("t", "text", 45, 100, 340), frames: { desktop: { x: 60, y: 90, w: 500, rotation: 0, size: 30, align: "left" } } };
  assert.equal(shownIn([words], "mobile")[0].props.size, 17);
  assert.deepEqual([shownIn([words], "desktop")[0].props.size, shownIn([words], "desktop")[0].props.align], [30, "left"]);
});
