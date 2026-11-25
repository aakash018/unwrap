// The round painted pictures of the ceremonies (chapter 2): which ones
// there are, and which ceremony gets which.
//
// Two sets, one for each look of the wedding invite (props.look):
//   'hindu'  (the default) – pictures-hindu.js: thali, mehendi, mandap,
//                            lanterns, haldi, sangeet, jaimala, puja
//   'garden' (Christian)   – pictures-garden.js: chapel, rings, bouquet,
//                            cake, toast, candles
//
//   PICTURES[kind]            – any picture by name: { paint, live? }
//   PICTURE_NAMES[kind]       – its name in the toolbar's picker
//   picturesOf(look)          – the names of one look's pictures, in order
//   picturesFor(events, look) – the picture for every ceremony: the one
//                               picked in the toolbar (event.picture), or
//                               else a guess from its name — never one
//                               already used on the page

import { HINDU_PICTURES } from './pictures-hindu';
import { GARDEN_PICTURES } from './pictures-garden';

export const PICTURES = { ...HINDU_PICTURES, ...GARDEN_PICTURES };

export const PICTURE_NAMES = {
  thali: 'Tilak thali',
  mehendi: 'Mehendi',
  mandap: 'Mandap & fire',
  lanterns: 'Lanterns',
  haldi: 'Haldi',
  sangeet: 'Sangeet',
  jaimala: 'Jaimala',
  puja: 'Puja kalash',
  chapel: 'Chapel',
  rings: 'Rings',
  bouquet: 'Bouquet',
  cake: 'Wedding cake',
  toast: 'A toast',
  candles: 'Candles',
};

// For each look: the words in a ceremony's name that suggest a picture
// (checked in this order), and the order to hand out the rest.
const SETS = {
  hindu: {
    guesses: [
      ['mandap', /bibaha|biba|vivah|wedding|janti|lagan|phera|kanyadan/i],
      ['lanterns', /reception|party|bhoj|dinner|night|bidai|cocktail/i],
      ['mehendi', /mehe?n?di/i],
      ['haldi', /haldi|turmeric|besar/i],
      ['sangeet', /sangeet|sangit|dance|music|dj/i],
      ['jaimala', /jaimala|jaymala|varmala|swayambar|engag|sagai|ring/i],
      ['puja', /puja|pooja|ganesh|kalash|sagun|path|havan/i],
      ['thali', /tilak|tika|teeka/i],
    ],
    order: ['thali', 'mehendi', 'mandap', 'lanterns', 'haldi', 'sangeet', 'jaimala', 'puja'],
  },
  garden: {
    guesses: [
      ['chapel', /wedding|ceremony|service|church|vow|matrimony|आराधना|विवाह/i],
      ['toast', /reception|party|dinner|bhoj|भोज|celebrat|cocktail/i],
      ['rings', /engag|ring|magni|मगनी|sagai/i],
      ['cake', /cake|dessert|tea|brunch|lunch/i],
      ['bouquet', /bridal|shower|bouquet|garden|photo|bachelor/i],
      ['candles', /rehearsal|prayer|प्रार्थना|worship|candle|fellowship|vigil/i],
    ],
    order: ['chapel', 'toast', 'rings', 'bouquet', 'cake', 'candles'],
  },
};

const setOf = (look) => SETS[look] ?? SETS.hindu;

export const picturesOf = (look) => setOf(look).order;

export function picturesFor(events, look) {
  const { guesses, order } = setOf(look);
  const fits = (kind) => order.includes(kind);
  const guess = (event) => {
    const name = `${event.name || ''} ${event.dev || ''}`;
    return guesses.find(([, words]) => words.test(name))?.[0];
  };
  // the ones picked in the toolbar come first…
  const used = new Set(events.map((e) => e.picture).filter(fits));
  // …then every other ceremony gets its guess, or the next one not used yet
  // (with more ceremonies than pictures, a repeat is allowed: its guess, or by order)
  return events.map((event, i) => {
    if (fits(event.picture)) return event.picture;
    const kind = [guess(event), ...order].find((k) => k && !used.has(k)) ?? guess(event) ?? order[i % order.length];
    used.add(kind);
    return kind;
  });
}
