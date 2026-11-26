// One-line text box for the panels (Figma style: a soft grey fill that
// gets a border on hover and focus). onChange receives the text directly.
export const INPUT_CLASSES =
  'h-7 w-full rounded-md border border-transparent bg-stone-100 px-2 text-[12px] outline-none hover:border-line focus:border-accent focus:bg-white';

export default function TextInput({ value, onChange, className = '', ...rest }) {
  return (
    <input
      type="text"
      className={`${INPUT_CLASSES} ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}
