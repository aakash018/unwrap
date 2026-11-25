// Multi-line text box for the panels. onChange receives the text directly.
import { INPUT_CLASSES } from './TextInput';

export default function TextArea({ value, onChange, rows = 4, ...rest }) {
  return (
    <textarea
      className={`${INPUT_CLASSES} h-auto resize-y py-1.5 leading-relaxed`}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}
