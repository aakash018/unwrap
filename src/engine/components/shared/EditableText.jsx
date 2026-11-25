// Text you can type into directly on the canvas — but only while `editable`
// (the element is double-clicked). Otherwise it's just text, so dragging
// it moves the element instead of selecting letters.
//
// Uses the browser's `contentEditable`. We write the text into the element
// ourselves (instead of as React children) so the cursor doesn't jump
// while typing.

import { useEffect, useRef } from 'react';

// Show the placeholder text when empty.
const BASE = 'outline-none empty:before:content-[attr(data-placeholder)] empty:before:opacity-35';

// The words as they were typed. (innerText gives them as they're SHOWN: for
// names set in capitals, "Rita" would come back as "RITA".)
function readText(el) {
  const before = el.style.textTransform;
  el.style.textTransform = 'none';
  const text = el.innerText;
  el.style.textTransform = before;
  return text;
}

export default function EditableText({
  as: Tag = 'div',
  value,
  onChange,
  placeholder,
  singleLine = false,
  editable = false,
  focusOnEdit = true, // sections have many fields: they let you click the one you want
  className = '',
  style,
}) {
  const ref = useRef(null);

  // Keep the element in sync when `value` changes from outside.
  useEffect(() => {
    if (ref.current && readText(ref.current) !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  // When editing starts, focus the text and put the cursor at the end.
  useEffect(() => {
    const el = ref.current;
    if (!editable || !el || !focusOnEdit) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }, [editable, focusOnEdit]);

  return (
    <Tag
      ref={ref}
      className={`${BASE} ${editable ? 'cursor-text' : ''} ${className}`}
      style={style}
      data-placeholder={placeholder}
      data-no-drag={editable ? '' : undefined}
      contentEditable={editable}
      suppressContentEditableWarning
      spellCheck={editable}
      onInput={(e) => onChange(readText(e.currentTarget))}
      onKeyDown={(e) => {
        // a heading is one line: Enter finishes editing
        if (singleLine && e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    />
  );
}
