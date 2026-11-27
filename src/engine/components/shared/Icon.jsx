// Small line icons for the panels (16 × 16, drawn in the current text colour).
//   <Icon name="trash" />
const PATHS = {
  chevron: 'M6 4l4 4-4 4',
  up: 'M8 13V3M4 7l4-4 4 4',
  down: 'M8 3v10M4 9l4 4 4-4',
  trash: 'M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5',
  external: 'M9 3h4v4M13 3L7.5 8.5M11 9.5V13H3V5h3.5',
  eye: 'M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8s-2.4 4.5-6.5 4.5S1.5 8 1.5 8zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  cursor: 'M4 2.5l8.5 5-3.8 1 2.3 4-1.6.9-2.3-4L4.5 12z', // the Try it tool
  play: 'M5 3.2v9.6L12.6 8z', // Preview
  // the left rail's tabs (components/Toolbar)
  home: 'M2.5 7.5L8 3l5.5 4.5M4 6.5V13h8V6.5',
  layers: 'M8 2.5L2 5.8l6 3.3 6-3.3zM2 8.6l6 3.3 6-3.3M2 11.3l6 3.2 6-3.2',
  gift: 'M2.5 6h11v2.7h-11zM3.5 8.7V13.5h9V8.7M8 6v7.5M8 6S5.3 5.6 5 4.3C4.8 3.2 6.2 2.6 7 3.6 7.6 4.4 8 6 8 6zm0 0s2.7-.4 3-1.7c.2-1.1-1.2-1.7-2-.7C8.4 4.4 8 6 8 6z',
  basics: 'M2.5 3.5h6M5.5 3.5v7M9.5 9h4v4h-4z',
  chapters: 'M6 4h7.5M6 8h7.5M6 12h7.5M2.8 4h.4M2.8 8h.4M2.8 12h.4',
  theme: 'M8 2.5a5.5 5.5 0 1 0 0 11c.9 0 1.3-.7 1-1.4-.3-.9.3-1.6 1.2-1.6h1.3a2.5 2.5 0 0 0 2.5-2.5C14 5 11.3 2.5 8 2.5zM5 7.6h.2M6.8 5h.2M9.8 5.1h.2',
  info: 'M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM8 7.3v3.7M8 5h.01',
  hand: 'M6 8V3.2a1 1 0 0 1 2 0V7.5M8 7V2.6a1 1 0 0 1 2 0V7.5M10 7.2V3.8a1 1 0 0 1 2 0V9.5c0 2.6-1.8 4.5-4.2 4.5-1.7 0-2.6-.8-3.6-2.2L2.6 9.4a1 1 0 0 1 1.6-1.1L6 10', // the Move tool
};

export default function Icon({ name, size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}
