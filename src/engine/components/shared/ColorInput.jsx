// A colour swatch that opens the browser's colour picker.
// onChange receives the hex string directly, e.g. '#ff8800'.
export default function ColorInput({ value, onChange }) {
  return (
    <input
      type="color"
      className="h-7 w-9 cursor-pointer rounded-md border border-line bg-white p-0.5"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
