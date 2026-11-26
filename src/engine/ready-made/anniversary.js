// "A lake for two": a ready-made gift on the Anniversary theme, for a partner.
// All of it can be changed, moved or removed once it's started.
//
// Down the page: a hello under the pergola's candles, a paper crane in a gift
// box (cranes stay together for life), three things I'd choose again, us in
// photos, a letter, our song, a promise for the year ahead, and the lake at
// the end, where every tap sets a lamp afloat (see themes/anniversary.js).
// Three hidden messages lead from one easter egg to the next; finding them all
// fills the lake with lamps.

const SOFT = '#E2D6BC';
const INK = '#F8EEDA';
const GOLD = '#E8C27A';
const TEAL = '#1F5560';

const LEFT = { align: 'left' };
const text = (words, mobile, tablet, desktop, color = SOFT) => ({ type: 'text', mobile, tablet, desktop, props: { text: words, align: 'center', color } });
const heading = (words, mobile, tablet, desktop) => ({ type: 'heading', mobile, tablet, desktop, props: { text: words, align: 'center', color: INK } });
const sticky = (front, back, color, mobile, tablet, desktop) => ({ type: 'sticky', mobile, tablet, desktop, props: { front, back, color } });
const secret = (message, mobile, tablet, desktop) => ({ type: 'secret', mobile, tablet, desktop, props: { message } });

// `to` and `from` are names; either may be missing. Each thing has its place on a
// phone (430 wide), a tablet (640) and a desktop (1200): [x, y, w, more].
export default function anniversary({ to, from }) {
  return [
    // ── hello: with the gift beside it, on a desktop ──
    text('वर्षगाँठको शुभकामना', [45, 352, 340], [120, 400, 400, { size: 20 }], [240, 336, 440, { size: 24, ...LEFT }], GOLD),
    heading(to ? `Happy anniversary, ${to}` : 'Happy anniversary', [15, 386, 400], [40, 438, 560, { size: 58 }], [236, 374, 450, { size: 76, ...LEFT }]),
    text('Another year of us.\nAnd somehow you still laugh at my jokes.', [35, 494, 360], [90, 540, 460, { size: 20 }], [240, 566, 440, { size: 22, ...LEFT }]),
    text('Psst: three little stars are hiding here.', [45, 600, 340], [100, 640, 440], [240, 676, 440, { size: 18, ...LEFT }]),

    // ── the gift box: a paper crane ──
    text('Open this one first.', [45, 704, 340], [44, 880, 230, { size: 22, ...LEFT }], [664, 232, 340, { size: 21 }]),
    { type: 'giftbox', mobile: [65, 810, 300], tablet: [276, 770, 340], desktop: [676, 190, 440], props: { present: 'crane', src: '', tag: to ? `for ${to}` : 'for you', ribbon: TEAL, petals: 'marigold' } },
    text('Cranes stay together for life.\nSo I folded you one.', [35, 1258, 360], [44, 946, 230, { size: 22, ...LEFT }], [676, 830, 440, { size: 21 }], INK),

    // ── three things I'd choose again ──
    heading('Things I’d choose again', [25, 1340, 380], [40, 1340, 560, { size: 54 }], [100, 1010, 1000, { size: 76 }]),
    sticky('The first time I saw you…', '…I knew I was in trouble. The good kind.', '#F2D27A', [28, 1424, 226, { rotation: -4 }], [40, 1452, 250, { rotation: -4 }], [50, 1180, 300, { rotation: -5 }]),
    sticky('Every ordinary Tuesday…', '…is better because it’s ours.', '#EBB5A6', [178, 1660, 226, { rotation: 3 }], [346, 1520, 250, { rotation: 3 }], [450, 1240, 300, { rotation: 2 }]),
    sticky('On my worst days…', '…your hand still feels like home.', '#B9D3CF', [30, 1904, 226, { rotation: -2 }], [130, 1782, 250, { rotation: -2 }], [850, 1170, 300, { rotation: -3 }]),

    // ── photos, with the letter beside them on a desktop ──
    heading('Us, so far', [25, 2230, 380], [30, 2150, 330, { size: 48 }], [40, 1730, 540, { size: 62 }]),
    {
      type: 'polaroids',
      mobile: [75, 2290, 280],
      tablet: [40, 2260, 310, { rotation: -2 }],
      desktop: [100, 1830, 420, { rotation: -3 }],
      props: {
        photos: [
          { id: 'one', src: '', caption: 'our first trip' },
          { id: 'two', src: '', caption: 'caught in the rain' },
          { id: 'three', src: '', caption: 'still us' },
        ],
      },
    },

    // ── the letter ──
    text('Read this when it’s quiet.', [45, 2680, 340], [330, 2576, 280, { size: 20 }], [660, 1800, 460, { size: 26 }]),
    {
      type: 'letter',
      mobile: [65, 2720, 300],
      tablet: [310, 2620, 310, { rotation: 2 }],
      desktop: [670, 1850, 440, { rotation: 2 }],
      props: {
        message: `${to || 'My love'},

Another year. I keep thinking it should feel ordinary by now, and it never does.

Thank you for the small things: the tea you make before I ask, the way you wait up, the way you say my name when you’re tired.

Thank you for the big things too. For staying when it was hard. For laughing at us when we got it wrong, and for trying again.

I don’t need a perfect year. I just want another one with you in it, and then another.

सधैं तिम्रो,
${from || 'me'}`,
        envelopeColor: '#CFE0DC',
        sealColor: '#8E1F2D',
      },
    },

    // ── a voice note (receivers don’t see it until something’s recorded) ──
    { type: 'voice', mobile: [70, 3070, 290, { rotation: -1 }], tablet: [376, 3220, 240, { rotation: 3 }], desktop: [120, 2680, 340, { rotation: -3 }], props: { src: '', label: 'our song, badly sung' } },

    // ── a promise for the year ahead ──
    heading('For the year ahead', [15, 3420, 400], [20, 3030, 350, { size: 40 }], [60, 2500, 540, { size: 60, ...LEFT }]),
    text('Valid until our next anniversary.', [45, 3478, 340], [30, 3092, 330], [62, 2578, 520, { size: 21, ...LEFT }]),
    {
      type: 'scratch',
      mobile: [55, 3520, 320],
      tablet: [30, 3160, 330, { rotation: -1 }],
      desktop: [630, 2480, 500, { rotation: 1 }],
      props: { hiddenText: 'One whole day.\nNo phones. Just us.', coverText: 'scratch me', resetKey: 0 },
    },

    // ── the lake ──
    heading('One lamp for every year', [25, 3890, 380], [40, 3620, 560, { size: 60 }], [100, 3140, 1000, { size: 92 }]),
    text(`Down there on the lake,\ntap the water and set them afloat.${from ? `\n\n— ${from}` : ''}`, [45, 3956, 340], [100, 3710, 440, { size: 20 }], [300, 3270, 600, { size: 24 }]),

    // ── hidden (the last one, on the water, is also where the page ends: so the
    // lake comes below all the rest) ──
    secret('You found one!\n\nNow swing the candles hanging up there.', [380, 300, 44], [570, 330, 44], [1010, 470, 48]),
    secret('Ten years from now, I’ll still pick you.\n\nAnd I’ll still lose the remote.', [380, 3180, 44], [590, 2080, 44], [18, 1620, 48]),
    secret('The last one’s on the lake: tap our boat.\n\nAnd find a quiet evening for us soon.', [118, 4636, 44], [180, 4436, 44], [380, 4060, 48]),
  ];
}
