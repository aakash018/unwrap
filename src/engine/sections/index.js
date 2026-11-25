// Sections — the chapters of a scrolling story. They stack down the page
// and each one hands over to the next: the courtyard pool's water becomes
// the next chapter's page, a curtain drops and the next chapter is drawn
// on it, a garland hides velvet turning into silk, night falls into the
// finale… (see StoryScene.jsx for how).
//
// They're blocks too (they live in page.blocks), with a few differences,
// set by `section: true`:
//   • always the full page width, at x = 0, never rotated
//   • stacked automatically from the top in their order (see stackSections)
//   • drawn behind every other element, so you can still drop a gift box,
//     a photo or a sticky note on top of any section
//   • `height(props)` says how tall it is
//
// To add a section: make a folder with a component built on StoryScene,
// then add it to SECTIONS below.

import { PAGE_WIDTH } from "../config";
import HeroSection, { HERO_HEIGHT } from "./hero/HeroSection";
import EventsSection, { eventsHeight } from "./events/EventsSection";
import CoupleSection, { COUPLE_HEIGHT } from "./couple/CoupleSection";
import DetailsSection, { detailsHeight } from "./details/DetailsSection";
import GardenHero, { GARDEN_HERO_HEIGHT } from "./garden/GardenHero";
import { GARDEN } from "./garden/defaults";

const common = {
  group: "section",
  section: true,
  resize: "reflow",
  editableText: true,
};

export const SECTIONS = {
  hero: {
    ...common,
    label: "Names, mandap & date",
    icon: "⌂",
    height: () => HERO_HEIGHT,
    defaults: {
      kicker: "शुभ विवाह",
      name1: "Soni",
      name2: "Aaku",
      // written on the pond at the end of the chapter
      invite:
        "Together with our families,\nwe invite you to celebrate our wedding",
      title: "Save the date",
      bs: "मंसिर १५, २०८३",
      ad: "TUESDAY, 1 DECEMBER 2026",
      note: "Come with an empty stomach and dancing shoes.",
    },
    Component: HeroSection,
  },
  // the garden (Christian) invite's opening; its other chapters are the
  // ones below with look: 'garden' (see garden/defaults.js)
  gardenHero: {
    ...common,
    label: "Names, garden & date",
    icon: "✿",
    height: () => GARDEN_HERO_HEIGHT,
    defaults: GARDEN.gardenHero,
    Component: GardenHero,
  },
  events: {
    ...common,
    label: "Events & venue",
    icon: "☷",
    height: eventsHeight,
    defaults: {
      kicker: "शुभ कार्यक्रम",
      title: "The celebrations",
      events: [
        // bs + when are what guests read (typed on the page); date + time
        // are for "Add to calendar" (set in the toolbar, Nepal time)
        {
          name: "Tilak",
          dev: "तिलक",
          bs: "मंसिर १२, शनिबार",
          when: "SAT 28 NOV · 11 AM",
          date: "2026-11-28",
          time: "11:00",
          where: "Sharma Niwas, Baneshwor",
        },
        {
          name: "Mehendi & Sangeet",
          dev: "मेहेन्दी",
          bs: "मंसिर १३, आइतबार",
          when: "SUN 29 NOV · 4 PM",
          date: "2026-11-29",
          time: "16:00",
          where: "Hotel Yak & Yeti, Durbar Marg",
        },
        {
          name: "Janti & Bibaha",
          dev: "विवाह",
          bs: "मंसिर १५, मंगलबार",
          when: "TUE 1 DEC · 9 AM",
          date: "2026-12-01",
          time: "09:00",
          where: "Patan Durbar Square",
        },
        {
          name: "Reception",
          dev: "भोज",
          bs: "मंसिर १५, मंगलबार",
          when: "TUE 1 DEC · 7 PM",
          date: "2026-12-01",
          time: "19:00",
          where: "Hotel Yak & Yeti, Durbar Marg",
        },
      ],
      venue: "Patan Durbar Square",
      address:
        "Mangal Bazar, Lalitpur 44700\nThe ceremony is in the courtyard of Mul Chowk.",
      mapQuery: "Patan Durbar Square, Lalitpur",
    },
    Component: EventsSection,
  },
  couple: {
    ...common,
    label: "The couple",
    icon: "♡",
    height: () => COUPLE_HEIGHT,
    defaults: {
      photo: "",
      photoAlt: "",
      kicker: "हाम्रो कथा",
      names: "Soni & Aaku",
      note: "We met over lemonade in Jhamsikhel and never stopped talking. Seven years later, we would love you there when we say yes in front of everyone.",
      // the countdown under the moon at the end of the chapter
      date: "2026-12-01",
      countdownNote: "until मंसिर १५ — we can’t wait to see you there",
    },
    Component: CoupleSection,
  },
  details: {
    ...common,
    label: "Things to know",
    icon: "ⓘ",
    height: detailsHeight,
    defaults: {
      kicker: "थाहा पाउनुहोस्",
      title: "Things to know",
      items: [
        {
          title: "Dress code",
          text: "Daura suruwal, saris and kurtas. Red and gold very welcome.",
        },
        {
          title: "Getting there",
          text: "Parking at Patan Dhoka. Taxis can drop you at Mangal Bazar.",
        },
        {
          title: "Gifts",
          text: "Your blessings are enough. If you insist, a dakshina envelope is perfect.",
        },
        { title: "RSVP", text: "Please let us know by 20 November." },
      ],
      rsvpLabel: "RSVP on WhatsApp",
      rsvpLink: "",
      signoff: "With love,\nthe Khanal & Khadka families",
      thanks: "धन्यवाद",
    },
    Component: DetailsSection,
  },
};

// Put the sections first (so they're drawn behind everything) and stack
// them from the top of the page in their order. Other elements keep their
// places.
export function stackSections(blocks, definitions) {
  const sections = blocks.filter((b) => definitions[b.type]?.section);
  if (!sections.length) return blocks;
  const others = blocks.filter((b) => !definitions[b.type]?.section);

  let y = 0;
  const stacked = sections.map((block) => {
    const { x, y: top, w, rotation } = block.frame;
    const placed = x === 0 && top === y && w === PAGE_WIDTH && rotation === 0;
    const result = placed
      ? block
      : { ...block, frame: { x: 0, y, w: PAGE_WIDTH, rotation: 0 } };
    y += definitions[block.type].height(block.props);
    return result;
  });
  return [...stacked, ...others];
}

// How tall all the sections are together.
export function sectionsHeight(blocks, definitions) {
  return blocks.reduce(
    (sum, b) =>
      definitions[b.type]?.section
        ? sum + definitions[b.type].height(b.props)
        : sum,
    0,
  );
}
