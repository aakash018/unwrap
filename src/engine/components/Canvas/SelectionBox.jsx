// The outline + handles drawn around the selected element:
//
//   [Letter · 12°]
//   ■─────────────■
//   ▮             ▮      ■ corners and ▮ sides → resize (width)
//   ■─────────────■
//          │
//          ◯             ◯ → rotate
//
// It sits inside the element, so it rotates with it. Every size is divided
// by the zoom, so handles look the same size on screen at any zoom.

const ACCENT = '#B4432F';

// `handles = false` → just the outline and name (for sections, which can't
// be moved, resized or rotated).
export default function SelectionBox({ label, rotation, zoom, onResize, onRotate, handles = true }) {
  const px = (n) => n / zoom; // screen pixels → page pixels
  const H = px(10); // handle size

  const handleStyle = {
    width: H,
    height: H,
    border: `${px(1.5)}px solid ${ACCENT}`,
    borderRadius: px(2),
  };

  // [position, which side it resizes, cursor]
  const corners = [
    [{ left: -H / 2, top: -H / 2 }, 'left', 'nwse-resize'],
    [{ right: -H / 2, top: -H / 2 }, 'right', 'nesw-resize'],
    [{ left: -H / 2, bottom: -H / 2 }, 'left', 'nesw-resize'],
    [{ right: -H / 2, bottom: -H / 2 }, 'right', 'nwse-resize'],
  ];

  return (
    <div className="pointer-events-none absolute inset-0" style={{ outline: `${px(1.5)}px solid ${ACCENT}` }}>
      {/* name tag — part of the element, so you can also drag by it */}
      <span
        className={`absolute font-sans font-semibold whitespace-nowrap text-white ${handles ? 'pointer-events-auto cursor-move' : ''}`}
        style={{
          top: handles ? px(-24) : px(8),
          left: handles ? 0 : px(8),
          fontSize: px(11),
          padding: `${px(2)}px ${px(7)}px`,
          borderRadius: px(4),
          background: ACCENT,
        }}
      >
        {label}
        {rotation !== 0 && ` · ${rotation}°`}
      </span>

      {handles && (
        <>
      {/* corner handles */}
      {corners.map(([pos, side, cursor], i) => (
        <span
          key={i}
          className="pointer-events-auto absolute bg-white"
          style={{ ...handleStyle, ...pos, cursor }}
          onPointerDown={(e) => onResize(e, side)}
        />
      ))}

      {/* side handles (taller pills) */}
      {['left', 'right'].map((side) => (
        <span
          key={side}
          className="pointer-events-auto absolute top-1/2 bg-white"
          style={{
            ...handleStyle,
            width: px(6),
            height: px(20),
            marginTop: px(-10),
            [side]: px(-3),
            cursor: 'ew-resize',
          }}
          onPointerDown={(e) => onResize(e, side)}
        />
      ))}

      {/* rotate handle, hanging below the element */}
      <span
        className="absolute left-1/2"
        style={{ top: '100%', width: px(1.5), height: px(20), marginLeft: px(-0.75), background: ACCENT }}
      />
      <span
        className="pointer-events-auto absolute left-1/2 flex items-center justify-center rounded-full bg-white"
        style={{
          top: `calc(100% + ${px(20)}px)`,
          width: px(18),
          height: px(18),
          marginLeft: px(-9),
          border: `${px(1.5)}px solid ${ACCENT}`,
          color: ACCENT,
          fontSize: px(11),
          cursor: 'grab',
        }}
        onPointerDown={onRotate}
        title="Rotate (hold Shift to snap)"
      >
        ↻
      </span>
        </>
      )}
    </div>
  );
}
