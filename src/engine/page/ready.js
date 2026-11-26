// What a gift is still getting ready, while its loader is showing (Loader.jsx):
// the theme painting its pictures, each gift box fetching its films… The loader
// opens once everything here is done.
//
//   holdOpen(promise)     – one more thing to wait for (it may fail: then it's
//                           simply not waited for any more)
//   markMounted()         – the page is on the screen, and has said what it's
//                           waiting for
//   watchReady(listener)  – listener({ mounted, total, done }) now and after
//                           every change; returns a way to stop
//   keepQuiet(until)      – the loader's bow is drawing until then (a time
//                           from performance.now()): heavy work should wait
//   whenQuiet()           – a promise that resolves once it's done (at once
//                           where there's no loader: the editor, invitations)
//
// (The bow's drawing is an animation the browser can only run between other
// work: a picture being painted meanwhile makes it stutter. The loader stays
// 4 s anyway, so the painting waits until the bow is drawn.)

let mounted = false;
let total = 0;
let done = 0;
const listeners = new Set();

const tell = () => listeners.forEach((listener) => listener({ mounted, total, done }));

export function holdOpen(task) {
  total += 1;
  tell();
  Promise.resolve(task)
    .catch(() => {})
    .finally(() => {
      done += 1;
      tell();
    });
}

export function markMounted() {
  if (mounted) return;
  mounted = true;
  tell();
}

let quietUntil = 0;

export function keepQuiet(until) {
  quietUntil = Math.max(quietUntil, until);
}

export function whenQuiet() {
  const wait = quietUntil - performance.now();
  return wait > 0 ? new Promise((resolve) => setTimeout(resolve, wait)) : Promise.resolve();
}

export function watchReady(listener) {
  listeners.add(listener);
  listener({ mounted, total, done });
  return () => listeners.delete(listener);
}
