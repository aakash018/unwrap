// A colour swatch that opens our own colour picker (the browser's own one
// can't be styled: founder, 27 Nov 2026, "make it more pretty"): a square to
// drag in for how light and how strong, a hue slider, the colour as a hex
// code to type, and the eyedropper where the browser has one.
//   <ColorInput value="#ff8800" onChange={(hex) => …} />
//   round  – a circle, next to other round swatches: a rainbow disc with a +
//            (any colour); once `custom` (not one of the swatches), that colour
//            in a rainbow ring, marked as the one chosen
// onChange receives the hex string directly, e.g. '#ff8800'.
import { useEffect, useRef, useState } from 'react';

// ── Colours as hue (0–360), saturation and value (0–1) ───────────────────────

function toHsv(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

function toHex({ h, s, v }) {
  const f = (k) => {
    const x = (k + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(x, 4 - x, 1));
  };
  return '#' + [f(5), f(3), f(1)].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('');
}

const isHex = (text) => /^#?[0-9a-f]{6}$/i.test(text.trim());
const clamp = (x) => Math.min(1, Math.max(0, x));

// Follow the pointer while it's held down inside `box`: onMove(x, y), each 0–1.
function useDrag(onMove) {
  return (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const at = (ev) => onMove(clamp((ev.clientX - box.left) / box.width), clamp((ev.clientY - box.top) / box.height));
    at(e);
    const move = (ev) => at(ev);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
}

const WIDTH = 232; // the picker's width, px

const RAINBOW = 'conic-gradient(from 0deg, #f87171, #fbbf24, #a3e635, #34d399, #38bdf8, #a78bfa, #f472b6, #f87171)';

export default function ColorInput({ value, onChange, round = false, custom = true }) {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState({ left: 0, top: 0 });
  const [hsv, setHsv] = useState(() => toHsv(value || '#ffffff'));
  const [typed, setTyped] = useState(null); // the hex box while it's being typed in
  const trigger = useRef(null);
  const card = useRef(null);

  // a new value from outside (another swatch was clicked): follow it
  useEffect(() => {
    if (toHex(hsv) !== value?.toLowerCase()) setHsv(toHsv(value || '#ffffff'));
    // (only when the value changes, not when our own hsv does)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // closes when you press outside it, or Escape
  useEffect(() => {
    if (!open) return undefined;
    const onPress = (e) => !card.current?.contains(e.target) && !trigger.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPress);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPress);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const show = () => {
    // under the swatch, its right edge lined up with the swatch's; above it if there's no room below
    const r = trigger.current.getBoundingClientRect();
    const below = r.bottom + 8;
    setPlace({ left: Math.max(8, Math.min(window.innerWidth - WIDTH - 8, r.right - WIDTH)), top: below + 270 > window.innerHeight ? Math.max(8, r.top - 278) : below });
    setOpen(!open);
  };

  const set = (next) => {
    setHsv(next);
    setTyped(null);
    onChange(toHex(next));
  };
  const dragSquare = useDrag((x, y) => set({ ...hsv, s: x, v: 1 - y }));
  const dragHue = useDrag((x) => set({ ...hsv, h: Math.min(359.9, x * 360) }));
  const hex = toHex(hsv);
  const pure = toHex({ h: hsv.h, s: 1, v: 1 });

  const pickFromScreen = async () => {
    try {
      const { sRGBHex } = await new window.EyeDropper().open();
      set(toHsv(sRGBHex));
    } catch {
      // (closed without picking)
    }
  };

  return (
    <>
      {round ? (
        <button
          ref={trigger}
          type="button"
          onClick={show}
          title="Any colour"
          aria-label="Choose any colour"
          aria-expanded={open}
          aria-pressed={custom}
          className={`grid size-6 shrink-0 place-items-center rounded-full ${custom ? 'p-[2.5px] outline-2 outline-offset-1 outline-accent' : ''}`}
          style={{ background: RAINBOW }}
        >
          {custom ? (
            <span className="block size-full rounded-full ring-2 ring-white" style={{ background: value }} />
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
              <path d="M6 2v8M2 6h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      ) : (
        <button ref={trigger} type="button" onClick={show} aria-label="Choose a colour" aria-expanded={open} className="h-7 w-9 shrink-0 rounded-md p-[3px] ring-1 ring-line hover:ring-ink-soft">
          <span className="block size-full rounded-[4px] ring-1 ring-black/10" style={{ background: value }} />
        </button>
      )}

      {open && (
        <div
          ref={card}
          role="dialog"
          aria-label="Colour"
          className="fixed z-50 flex flex-col gap-3 rounded-xl bg-white p-3 shadow-[0_12px_40px_-8px_rgba(30,27,24,0.28),0_0_0_1px_rgba(30,27,24,0.06)]"
          style={{ left: place.left, top: place.top, width: WIDTH }}
        >
          {/* how strong (left → right) and how light (bottom → top) */}
          <div
            onPointerDown={dragSquare}
            className="relative h-36 cursor-crosshair touch-none rounded-lg"
            style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${pure})` }}
          >
            <span
              className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_2px_#fff,0_1px_4px_rgba(0,0,0,0.4)]"
              style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hex }}
            />
          </div>

          {/* the hue */}
          <div
            onPointerDown={dragHue}
            className="relative h-3 cursor-pointer touch-none rounded-full"
            style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
          >
            <span
              className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_2px_#fff,0_1px_4px_rgba(0,0,0,0.4)]"
              style={{ left: `${(hsv.h / 360) * 100}%`, background: pure }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="size-7 shrink-0 rounded-md ring-1 ring-black/10" style={{ background: hex }} />
            <input
              value={typed ?? hex.toUpperCase()}
              onChange={(e) => {
                setTyped(e.target.value);
                if (isHex(e.target.value)) {
                  const next = toHsv(e.target.value.trim().replace(/^#?/, '#'));
                  setHsv(next);
                  onChange(toHex(next));
                }
              }}
              onBlur={() => setTyped(null)}
              spellCheck={false}
              aria-label="Hex code"
              className="h-7 min-w-0 flex-1 rounded-md bg-stone-100 px-2 font-mono text-[12px] tracking-wide uppercase outline-none focus:bg-white focus:ring-1 focus:ring-accent"
            />
            {typeof window !== 'undefined' && 'EyeDropper' in window && (
              <button type="button" onClick={pickFromScreen} title="Pick a colour from the screen" aria-label="Pick a colour from the screen" className="grid size-7 shrink-0 place-items-center rounded-md text-ink-soft hover:bg-stone-100 hover:text-ink">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M10.5 2.5l3 3-1.5 1.5-3-3zM9 4l3 3-6.2 6.2H2.8v-3z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
