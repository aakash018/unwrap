// Text inside a section: plain text normally, typeable while the section is
// being edited (double-click the section, then click the line to change).
//
//   const text = sectionText(props, onChange, isEditing);
//   text('name1', 'font-display text-[72px]', { singleLine: true })
//
//   const item = listText(props, onChange, isEditing, 'events');
//   item(0, 'name', 'font-display text-[26px]')

import EditableText from '../../components/shared/EditableText';

export function sectionText(props, onChange, isEditing) {
  return (key, className, { as = 'div', singleLine = false, placeholder = '' } = {}) => (
    <EditableText
      as={as}
      value={props[key] ?? ''}
      onChange={(value) => onChange({ [key]: value })}
      editable={isEditing}
      focusOnEdit={false}
      singleLine={singleLine}
      placeholder={placeholder}
      className={className}
    />
  );
}

// The same, for one field of one item in a list (events, things to know…).
export function listText(props, onChange, isEditing, listKey) {
  return (index, field, className, { as = 'div', singleLine = true } = {}) => (
    <EditableText
      as={as}
      value={props[listKey][index][field] ?? ''}
      onChange={(value) =>
        onChange({
          [listKey]: props[listKey].map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        })
      }
      editable={isEditing}
      focusOnEdit={false}
      singleLine={singleLine}
      className={className}
    />
  );
}
