// Small handwritten hint under a surprise block, e.g. "tap to open".
// Its colour comes from the page theme (--gift-hint, set in Canvas.jsx),
// so it stays readable on dark backgrounds too.
export default function Hint({ children }) {
  return <span className="font-hand text-[15px] text-[color:var(--gift-hint,#6b645c)]">{children}</span>;
}
