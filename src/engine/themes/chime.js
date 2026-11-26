// A soft music-box chime, made by the browser (Web Audio): no sound files.
// Used by the Birthday theme's bulbs, which play "Happy Birthday" (a tune
// in the public domain) one note per tap, and all of it in its finale.
//
//   chime(i)        – plays the song's note number i (it goes round)
//   playSong(start) – plays the whole song; start(i, delay) is called for each
//                     note, so the bulbs can light up in time
//   SONG.length     – how many notes the song has
//
// Sound only ever starts from a tap (browsers allow nothing else), and it's
// quiet: the gift may be opened on a bus.

const NOTE = { C4: 261.63, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };

// [note, beats]: "Happy birthday to you" ×2, "…dear [name]", "…to you"
export const SONG = [
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
  ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3],
].map(([name, beats]) => ({ name, beats, freq: NOTE[name] }));

const BEAT = 0.5; // seconds
const LOUD = 0.16; // of full volume

let audio = null;
function context() {
  if (typeof window === 'undefined') return null;
  const Context = window.AudioContext ?? window.webkitAudioContext;
  if (!Context) return null;
  audio ??= new Context();
  if (audio.state === 'suspended') audio.resume();
  return audio;
}

// One struck note: a bright start that rings away, with a few overtones like
// a small metal comb.
function strike(ctx, freq, at, loud = 1) {
  const out = ctx.createGain();
  out.gain.setValueAtTime(0, at);
  out.gain.linearRampToValueAtTime(LOUD * loud, at + 0.006);
  out.gain.exponentialRampToValueAtTime(0.0008, at + 1.8);
  out.connect(ctx.destination);
  for (const [times, level, fade] of [[1, 1, 1.8], [2, 0.32, 0.9], [3.01, 0.1, 0.5], [4.2, 0.06, 0.3]]) {
    const tone = ctx.createOscillator();
    const gain = ctx.createGain();
    tone.type = 'sine';
    tone.frequency.value = freq * times;
    gain.gain.setValueAtTime(level, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + fade);
    tone.connect(gain).connect(out);
    tone.start(at);
    tone.stop(at + fade + 0.05);
  }
}

export function chime(i) {
  const ctx = context();
  if (ctx) strike(ctx, SONG[i % SONG.length].freq, ctx.currentTime + 0.01);
}

export function playSong(start) {
  const ctx = context();
  let delay = 0.15;
  SONG.forEach((note, i) => {
    if (ctx) strike(ctx, note.freq, ctx.currentTime + delay, 0.85);
    start?.(i, delay);
    delay += note.beats * BEAT;
  });
  return delay; // how long it lasts
}
