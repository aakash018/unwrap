// A paragraph of message text. Double-click to type; Enter makes a new line.
// Text wraps to the element's width, so resizing it re-flows the lines.
import EditableText from '../../components/shared/EditableText';

export default function TextBlock({ props, onChange, isEditing }) {
  return (
    <EditableText
      as="p"
      // whitespace-pre-wrap keeps the line breaks the sender typed
      className="leading-relaxed whitespace-pre-wrap"
      value={props.text}
      placeholder="Write something…"
      editable={isEditing}
      style={{ textAlign: props.align, color: props.color, fontSize: props.size }}
      onChange={(text) => onChange({ text })}
    />
  );
}
