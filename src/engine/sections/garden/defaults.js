// The words the garden (Christian) wedding invite starts with — one set
// per chapter. templates/index.js loads them over each chapter's usual
// defaults, and `look: 'garden'` switches the shared chapters (events,
// couple, things to know) to the garden's colours, pictures and flowers.
// Placeholders: replace freely.

export const GARDEN = {
  gardenHero: {
    kicker: "शुभ विवाह",
    name1: "Soni",
    name2: "Aaku",
    // written on the stone path at the end of the chapter
    invite:
      "With joyful hearts and our families,\nwe invite you to our wedding",
    title: "Save the date",
    bs: "मंसिर १५, २०८३",
    ad: "TUESDAY, 1 DECEMBER 2026",
    note: "A garden, the people we love, and a very long dinner.",
  },
  events: {
    look: "garden",
    kicker: "शुभ कार्यक्रम",
    title: "The celebrations",
    events: [
      {
        name: "Engagement",
        dev: "मगनी",
        bs: "मंसिर ८, मंगलबार",
        when: "TUE 24 NOV · 5 PM",
        date: "2026-11-24",
        time: "17:00",
        where: "Khanal Niwas, Baneshwor",
      },
      {
        name: "Prayer & fellowship",
        dev: "प्रार्थना सभा",
        bs: "मंसिर १४, सोमबार",
        when: "MON 30 NOV · 6 PM",
        date: "2026-11-30",
        time: "18:00",
        where: "Gyaneshwor Church",
      },
      {
        name: "Wedding service",
        dev: "विवाह आराधना",
        bs: "मंसिर १५, मंगलबार",
        when: "TUE 1 DEC · 11 AM",
        date: "2026-12-01",
        time: "11:00",
        where: "The Garden, Godawari",
      },
      {
        name: "Reception",
        dev: "प्रीतिभोज",
        bs: "मंसिर १५, मंगलबार",
        when: "TUE 1 DEC · 6 PM",
        date: "2026-12-01",
        time: "18:00",
        where: "The Garden, Godawari",
      },
    ],
    venue: "The Garden, Godawari",
    address: "Godawari, Lalitpur\nThe service is on the main lawn.",
    mapQuery: "Godawari, Lalitpur",
  },
  couple: {
    look: "garden",
    kicker: "हाम्रो कथा",
    names: "Soni & Aaku",
    note: "We met at a youth camp in Pokhara and have been praying, laughing and arguing about music ever since. We would love you there when we make our vows.",
    date: "2026-12-01",
    countdownNote: "until मंसिर १५ — we can’t wait to see you there",
  },
  details: {
    look: "garden",
    kicker: "थाहा पाउनुहोस्",
    title: "Things to know",
    items: [
      {
        title: "Dress code",
        text: "Garden formal. Soft colours welcome — and shoes that like grass.",
      },
      {
        title: "Getting there",
        text: "A shuttle leaves Patan Dhoka at 10 AM and returns after dinner.",
      },
      { title: "Gifts", text: "Your prayers and presence are gift enough." },
      { title: "RSVP", text: "Please let us know by 20 November." },
    ],
    signoff: "With love and gratitude,\nthe Khanal & Khadka families",
    thanks: "धन्यवाद",
  },
};
