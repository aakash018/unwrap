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

export function watchReady(listener) {
  listeners.add(listener);
  listener({ mounted, total, done });
  return () => listeners.delete(listener);
}
