// "A sky for you": a ready-made gift on the Love theme. All of it can be
// changed, moved or removed once it's started.
//
// Down the page: a quiet hello under the moon, roses in a gift box, three things I never
// say enough, some photos, a letter, a voice note, a promise to scratch off, and
// a last line over the rooftops. Three hidden messages lead from one easter egg
// to the next (see themes/love.js).

const SOFT = '#E0C5B6';
const CREAM = '#F6E8DC';
const CRIMSON = '#8F1D33';

const LEFT = { align: 'left' };
const text = (words, mobile, tablet, desktop, color = SOFT) => ({ type: 'text', mobile, tablet, desktop, props: { text: words, align: 'center', color } });
const heading = (words, mobile, tablet, desktop) => ({ type: 'heading', mobile, tablet, desktop, props: { text: words, align: 'center', color: CREAM } });
const sticky = (front, back, color, mobile, tablet, desktop) => ({ type: 'sticky', mobile, tablet, desktop, props: { front, back, color } });
const secret = (message, mobile, tablet, desktop) => ({ type: 'secret', mobile, tablet, desktop, props: { message } });

// `to` and `from` are names; either may be missing. Each thing has its place on a
// phone (430 wide), a tablet (640) and a desktop (1200): [x, y, w, more].
export default function love({ to, from }) {
  const you = to || 'you';
  const dear = to || 'my love';
  return [
    // ── hello: beside the moon, on a desktop ──
    text('मायाको कोसेली', [45, 352, 340], [120, 352, 400, { size: 19 }], [195, 268, 480, { size: 24, ...LEFT }]),
    heading(`For ${you}`, [25, 388, 380], [40, 392, 560, { size: 66 }], [191, 312, 560, { size: 104, ...LEFT }]),
    text('I couldn’t bring you the sky,\nso I made you a small one.\nTake your time. Touch everything.', [45, 462, 340], [100, 490, 440, { size: 20 }], [195, 446, 520, { size: 23, ...LEFT }]),
    text('Psst: three little stars are hidden in here.', [45, 590, 340], [100, 630, 440], [195, 610, 520, { size: 18, ...LEFT }]),

    // ── the gift box ──
    text('First, a little something.', [45, 684, 340], [44, 860, 230, { size: 21, ...LEFT }], [90, 1130, 480, { size: 26, ...LEFT }]),
    { type: 'giftbox', mobile: [65, 790, 300], tablet: [276, 750, 340], desktop: [640, 880, 470], props: { present: 'roses', src: '', tag: `for ${you}`, ribbon: CRIMSON, petals: 'rose' } },
    text('तिमी भए पुग्छ\nYou are enough. You always were.', [45, 1238, 340], [44, 930, 230, { size: 25, ...LEFT }], [90, 1196, 560, { size: 32, ...LEFT }], CREAM),

    // ── three notes ──
    heading('Things I never say enough', [25, 1306, 380], [40, 1320, 560, { size: 54 }], [100, 1690, 1000, { size: 72 }]),
    sticky('I love the way you laugh…', '…halfway through your own joke, before you get to the end.', '#EBB5A6', [28, 1386, 226, { rotation: -4 }], [40, 1432, 250, { rotation: -4 }], [50, 1850, 300, { rotation: -5 }]),
    sticky('You make ordinary days…', '…the ones I want back.', '#F2D27A', [178, 1622, 226, { rotation: 3 }], [346, 1500, 250, { rotation: 3 }], [450, 1910, 300, { rotation: 2 }]),
    sticky('When I’m having a bad day…', '…I think of you, and it gets smaller.', '#BCD0DE', [30, 1866, 226, { rotation: -2 }], [130, 1762, 250, { rotation: -2 }], [850, 1840, 300, { rotation: -3 }]),

    // ── photos, with the letter beside them on a desktop ──
    heading('Days I’d live twice', [25, 2180, 380], [30, 2130, 330, { size: 46 }], [40, 2400, 540, { size: 60 }]),
    {
      type: 'polaroids',
      mobile: [75, 2240, 280],
      tablet: [40, 2240, 310, { rotation: -2 }],
      desktop: [100, 2500, 420, { rotation: -3 }],
      props: {
        photos: [
          { id: 'one', src: '', caption: 'the day it all began' },
          { id: 'two', src: '', caption: 'tea, rain, and you' },
          { id: 'three', src: '', caption: 'home is where you are' },
        ],
      },
    },

    // ── the letter ──
    text('Now the part I’m shy about.', [45, 2640, 340], [330, 2556, 280, { size: 20 }], [660, 2470, 460, { size: 26 }]),
    {
      type: 'letter',
      mobile: [65, 2680, 300],
      tablet: [310, 2600, 310, { rotation: 2 }],
      desktop: [670, 2520, 440, { rotation: 2 }],
      props: {
        message: `${dear},

I’m not always good at saying things out loud, so I’m writing them down, where I can’t get nervous and change the subject.

You are my favourite part of every day. Not only the big days. The small ones: your messages when I’m in the middle of something, the way you say my name, how you always save me the last momo and pretend you were full.

Before you, I thought love would be loud. It turns out it’s quiet. It’s someone asking if you’ve eaten. It’s wanting to tell one person everything first.

Thank you for being patient with me. Thank you for choosing me on the days I was hard to choose. I see it, even when I don’t say it.

I don’t know everything that’s coming. But I know who I want beside me when it does.

सधैँ तिम्रो,
${from || 'me'}`,
        envelopeColor: '#E7B9AC',
        sealColor: CRIMSON,
      },
    },

    // ── a voice note (receivers don’t see it until something’s recorded) ──
    { type: 'voice', mobile: [70, 3030, 290, { rotation: -1 }], tablet: [376, 3200, 240, { rotation: 3 }], desktop: [120, 3300, 340, { rotation: -3 }], props: { src: '', label: 'press play when you miss me' } },

    // ── a promise ──
    heading('A promise, hidden', [25, 3380, 380], [30, 3010, 330, { size: 46 }], [60, 3130, 540, { size: 60, ...LEFT }]),
    text('Use it whenever you like. It doesn’t expire.', [45, 3438, 340], [30, 3072, 330], [62, 3206, 520, { size: 21, ...LEFT }]),
    {
      type: 'scratch',
      mobile: [55, 3480, 320],
      tablet: [30, 3140, 330, { rotation: -1 }],
      desktop: [630, 3110, 500, { rotation: 1 }],
      props: { hiddenText: 'One whole day, just us.\nNo phones. Momo included.', coverText: 'scratch me', resetKey: 0 },
    },

    // ── good night, over the rooftops ──
    heading('Same sky, always', [25, 3860, 380], [40, 3620, 560, { size: 66 }], [100, 3800, 1000, { size: 100 }]),
    text(`Wherever you are tonight, look up.\nI’m looking at the same moon.${from ? `\n\n— ${from}` : ''}`, [45, 3926, 340], [100, 3710, 440, { size: 20 }], [300, 3930, 600, { size: 24 }]),
    // at the very end, so the rooftops come below all the rest
    text('शुभ रात्री', [45, 4550, 340], [150, 4350, 340, { size: 20 }], [430, 4600, 340, { size: 22 }], CREAM),

    // ── hidden ──
    secret('You found one!\n\nNow tap the moon. Three times. Go on.', [352, 176, 44], [560, 170, 44], [1140, 640, 48]),
    secret('I’d find you in every life.\n\nEven the one where we’re both cats.', [382, 3140, 44], [590, 2060, 44], [18, 2320, 48]),
    secret('A secret: when you reach the rooftops at the very end, tap them.\n\nThat’s how my heart feels when you text first.', [366, 3790, 44], [570, 3040, 44], [1120, 3660, 48]),
  ];
}
