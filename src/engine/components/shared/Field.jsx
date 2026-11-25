// A labelled row in a panel: small grey label on top, control underneath.
export default function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-ink-soft">{label}</span>
      {children}
    </div>
  );
}
