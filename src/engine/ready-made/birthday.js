// "A garden for you": a ready-made gift on the Birthday theme, for a friend,
// family, anyone. All of it can be changed, moved or removed once it's started.
//
// Down the page: a birthday hello under the jacarandas, butterflies in a gift
// box, three reasons, a year in photos, a letter, a song, a coupon to scratch,
// and a wish over the cake (its candles can be blown out: see
// themes/birthday.js). Three hidden messages lead to the easter eggs, each
// near where it's found: the bunting that spells their name and the bulbs that
// play a song (at the top), the dandelion wish (in the grass at the end), and
// the cake; finding them all, the garden plays the whole song.

const SOFT = '#5A4070';
const INK = '#3D2457';
const VIOLET = '#6B4AA8';

const LEFT = { align: 'left' };
const text = (words, mobile, tablet, desktop, color = SOFT) => ({ type: 'text', mobile, tablet, desktop, props: { text: words, align: 'center', color } });
const heading = (words, mobile, tablet, desktop) => ({ type: 'heading', mobile, tablet, desktop, props: { text: words, align: 'center', color: INK } });
const sticky = (front, back, color, mobile, tablet, desktop) => ({ type: 'sticky', mobile, tablet, desktop, props: { front, back, color } });
const secret = (message, mobile, tablet, desktop) => ({ type: 'secret', mobile, tablet, desktop, props: { message } });

// `to` and `from` are names; either may be missing. Each thing has its place on a
// phone (430 wide), a tablet (640) and a desktop (1200): [x, y, w, more].
export default function birthday({ to, from }) {
  return [
    // ── hello: with the gift beside it, on a desktop ──
    text('शुभ जन्मदिन', [45, 322, 340], [120, 380, 400, { size: 20 }], [240, 262, 440, { size: 26, ...LEFT }], VIOLET),
    heading(to ? `Happy birthday, ${to}` : 'Happy birthday', [15, 354, 400], [40, 418, 560, { size: 60 }], [236, 306, 450, { size: 80, ...LEFT }]),
    text('The whole garden came out for you.\nStay a while. Touch everything.', [45, 462, 340], [100, 514, 440, { size: 20 }], [240, 490, 440, { size: 22, ...LEFT }]),
    text('Psst: three little stars are hiding here.', [45, 570, 340], [100, 616, 440], [240, 606, 440, { size: 18, ...LEFT }]),

    // ── the gift box ──
    text('Open this one first.', [45, 684, 340], [44, 860, 230, { size: 22, ...LEFT }], [664, 232, 340, { size: 21 }]),
    { type: 'giftbox', mobile: [65, 790, 300], tablet: [276, 750, 340], desktop: [676, 190, 440], props: { present: 'butterflies', src: '', tag: to ? `for ${to}` : 'for you', ribbon: VIOLET, petals: 'jacaranda' } },
    text('They’ve been waiting all morning.', [45, 1238, 340], [44, 926, 230, { size: 25, ...LEFT }], [696, 830, 400, { size: 21 }], INK),

    // ── three reasons ──
    heading('Better with you in it', [25, 1312, 380], [40, 1320, 560, { size: 54 }], [100, 1010, 1000, { size: 76 }]),
    sticky('You remember the small things…', '…my chiya, my worst day, the name of my first dog.', '#F2D27A', [28, 1384, 226, { rotation: -4 }], [40, 1432, 250, { rotation: -4 }], [50, 1180, 300, { rotation: -5 }]),
    sticky('You laugh before the joke…', '…and somehow that’s the joke.', '#EBB5A6', [178, 1620, 226, { rotation: 3 }], [346, 1500, 250, { rotation: 3 }], [450, 1240, 300, { rotation: 2 }]),
    sticky('You make people feel…', '…like they’re the one you were waiting for.', '#B9C9A6', [30, 1864, 226, { rotation: -2 }], [130, 1762, 250, { rotation: -2 }], [850, 1170, 300, { rotation: -3 }]),

    // ── photos, with the letter beside them on a desktop ──
    heading('A year of you', [25, 2190, 380], [30, 2130, 330, { size: 48 }], [40, 1730, 540, { size: 62 }]),
    {
      type: 'polaroids',
      mobile: [75, 2250, 280],
      tablet: [40, 2240, 310, { rotation: -2 }],
      desktop: [100, 1830, 420, { rotation: -3 }],
      props: {
        photos: [
          { id: 'one', src: '', caption: 'the day we got lost' },
          { id: 'two', src: '', caption: 'cake for breakfast' },
          { id: 'three', src: '', caption: 'your good side (both)' },
        ],
      },
    },

    // ── the letter ──
    text('Before the cake, read this.', [45, 2640, 340], [330, 2556, 280, { size: 20 }], [660, 1800, 460, { size: 26 }]),
    {
      type: 'letter',
      mobile: [65, 2680, 300],
      tablet: [310, 2600, 310, { rotation: 2 }],
      desktop: [670, 1850, 440, { rotation: 2 }],
      props: {
        message: `${to || 'Hey you'},

Happy birthday to my favourite person to celebrate.

Another whole year of you. I hope you know how much better a room gets when you walk into it. You never notice. We all do.

I hope this year is gentle with you. I hope the good news you’ve been waiting for finally turns up. I hope you sleep well, eat well, and say no to at least three things you never wanted to do.

I hope you laugh until you can’t breathe, at least once a week. I’ll do my best to help.

Thank you for being born. It really worked out for the rest of us.

तिम्रो दिन शुभ होस्,
${from || 'me'}`,
        envelopeColor: '#CDB9EA',
        sealColor: VIOLET,
      },
    },

    // ── a voice note (receivers don’t see it until something’s recorded) ──
    { type: 'voice', mobile: [70, 3030, 290, { rotation: -1 }], tablet: [376, 3200, 240, { rotation: 3 }], desktop: [120, 2680, 340, { rotation: -3 }], props: { src: '', label: 'me, singing. sorry.' } },

    // ── a coupon ──
    heading('Your birthday coupon', [15, 3380, 400], [20, 3010, 350, { size: 40 }], [60, 2500, 540, { size: 60, ...LEFT }]),
    text('Valid all year. Extensions possible.', [45, 3438, 340], [30, 3072, 330], [62, 2578, 520, { size: 21, ...LEFT }]),
    {
      type: 'scratch',
      mobile: [55, 3480, 320],
      tablet: [30, 3140, 330, { rotation: -1 }],
      desktop: [630, 2480, 500, { rotation: 1 }],
      props: { hiddenText: 'One yes.\nTo anything you ask.', coverText: 'scratch me', resetKey: 0 },
    },

    // ── a wish, over the cake ──
    heading('Now make a wish', [25, 3850, 380], [40, 3600, 560, { size: 64 }], [100, 3140, 1000, { size: 100 }]),
    text(`Down there, the candles are lit.\nTap the cake, and blow them out.${from ? `\n\n— ${from}` : ''}`, [45, 3916, 340], [100, 3690, 440, { size: 20 }], [300, 3270, 600, { size: 24 }]),

    // ── hidden (the last one, on the grass, is also where the page ends: so the
    // garden comes below all the rest) ──
    secret('You found one!\n\nTap a flag up there: it has something to tell you. Then tap the lights, one by one. They know a song.', [352, 268, 44], [560, 320, 44], [1010, 470, 48]),
    secret('You don’t look a day older. I checked.\n\nDown by the cake there’s a wish hiding in the grass. Find it, and blow.', [382, 3140, 44], [590, 2060, 44], [18, 1620, 48]),
    secret('The last one: blow out the candles. And save me a slice.', [192, 4596, 44], [300, 4396, 44], [576, 4020, 48]),
  ];
}
