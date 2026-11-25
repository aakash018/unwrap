// Big title text. Double-click it on the canvas to type.
import EditableText from '../../components/shared/EditableText';

export default function HeadingBlock({ props, onChange, isEditing }) {
  return (
    <EditableText
      as="h1"
      className="font-display leading-[1.02] tracking-[-0.5px]"
      value={props.text}
      placeholder="Heading"
      singleLine
      editable={isEditing}
      style={{ textAlign: props.align, color: props.color, fontSize: props.size }}
      onChange={(text) => onChange({ text })}
    />
  );
}
