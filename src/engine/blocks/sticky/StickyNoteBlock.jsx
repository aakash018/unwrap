// Sticky note — one note with a surprise on the back.
//
//   tap           → flip it over
//   double-click  → write on the side that's showing (right on the note)
//
// To write the back: tap to flip, then double-click.

import { useEffect, useRef, useState } from 'react';
import EditableText from '../../components/shared/EditableText';
import Hint from '../shared/Hint';

const FLIP_DELAY = 220; // ms — wait a moment so a double-click doesn't also flip

export default function StickyNoteBlock({ props, onChange, isEditing }) {
  const [flipped, setFlipped] = useState(false);
  const flipTimer = useRef(null);
  const showing = flipped ? 'back' : 'front';

  // A double-click starts editing → cancel the flip its first click scheduled.
  useEffect(() => {
    if (isEditing) clearTimeout(flipTimer.current);
  }, [isEditing]);

  const onClick = (e) => {
    if (isEditing || e.detail > 1) return; // typing, or the 2nd click of a double-click
    clearTimeout(flipTimer.current);
    flipTimer.current = setTimeout(() => setFlipped((f) => !f), FLIP_DELAY);
  };

  // One face of the note. Only the face that's showing can be typed into.
  const face = (side, extraClasses, textClasses, placeholder) => (
    <div
      className={`absolute inset-0 flex rounded-[3px] p-5 shadow-paper backface-hidden ${extraClasses}`}
      style={{ background: props.color }}
    >
      <EditableText
        className={`w-full font-hand leading-snug whitespace-pre-wrap text-cocoa ${textClasses}`}
        value={props[side]}
        placeholder={placeholder}
        editable={isEditing && showing === side}
        onChange={(text) => onChange({ [side]: text })}
      />
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* a div, not a <button>: buttons can't hold editable text */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Sticky note, ${showing} side. Press Enter to flip.`}
        className="size-[220px] perspective-[900px]"
        onClick={onClick}
        onKeyDown={(e) => {
          if (!isEditing && e.key === 'Enter') setFlipped((f) => !f);
        }}
      >
        <div
          className={`relative size-full transition-transform duration-500 transform-3d ${
            flipped ? 'rotate-y-180' : ''
          }`}
        >
          {face('front', 'items-start', 'text-left text-[21px]', 'write something…')}
          {face('back', 'rotate-y-180 items-center brightness-95', 'text-center text-[23px] font-bold', 'the surprise…')}
        </div>
      </div>

      <Hint>{isEditing ? 'writing… click away when done' : `tap to flip · ${showing}`}</Hint>
    </div>
  );
}
