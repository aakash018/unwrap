// Page size, in CSS pixels — designed PHONE-FIRST (a large phone, 430 × 932),
// because guests open the link on their phones. On laptops the preview shows
// it as a centred column. The page is at least one screen tall, and grows
// taller as elements and sections are added.
export const PAGE_WIDTH = 430;
export const PAGE_HEIGHT = 932;

// Extra empty space kept below the lowest element, so there's always room
// to drag things further down.
export const PAGE_BOTTOM_ROOM = 240;

// The devices a page can be viewed on, in the editor's Mobile · Tablet · Desktop switch. Width × height in screen px.
export const DEVICES = {
  mobile: { label: 'Mobile', width: 430, height: 932 },
  tablet: { label: 'Tablet', width: 820, height: 1180 },
  desktop: { label: 'Desktop', width: 1440, height: 900 },
};

// How a page fits a device — the same rule the Preview uses: the
// page's height fits the screen (never smaller than designed), and its
// scenery fills the width. Returns, in page px:
//   width        – how wide the page is (430 on a phone, wider on bigger screens)
//   screenHeight – how tall one screen is (pinned chapters fill it)
// (A gift's own rule, zoomFor in page/layouts.js, gives the same for these.)
export function deviceScreen(id) {
  const d = DEVICES[id] ?? DEVICES.mobile;
  const zoom = Math.min(d.width / PAGE_WIDTH, Math.max(1, d.height / PAGE_HEIGHT));
  return { width: d.width / zoom, screenHeight: d.height / zoom };
}
