// The fine gold arch that frames the invitation on the pond (chapter 1).
//
// Two thin gold lines in the shape of a cusped arch, with a small finial on
// top. It's an SVG sized to the viewer's ACTUAL screen (StageContext), so
// it always sits in the middle with the same space above and below — on a
// tall phone or a short laptop window alike.
//
//   at    – [from, to] values of the chapter's `p` while it fades in
//   round – a plain round-topped arch with a small cross on top (the garden
//           invite) instead of the cusped one

import { useContext } from 'react';
import { Reveal, StageContext } from '../StoryScene';
import { PAGE_WIDTH } from '../../config';

const WIDTH = 340; // the arch's width (page px)
const SHOULDER = 0.16; // where the sides start curving in: this share of the arch's height below the point
const FINIAL = 30; // room above the point for the little finial

export default function GoldArch({ at, round = false }) {
  const H = useContext(StageContext); // the screen's height, in page px
  const gap = Math.max(24, H * 0.06); // the same space above and below
  const top = gap + FINIAL; // the point of the arch
  const bottom = H - gap;
  const cx = PAGE_WIDTH / 2;

  // The outline, `inset` px inside the outer line. Three lobes up each side.
  const roundOutline = (inset) => {
    const L = cx - WIDTH / 2 + inset;
    const R = cx + WIDTH / 2 - inset;
    const r = (R - L) / 2;
    const spring = top + inset + r; // where the sides start curving
    return `M ${L} ${bottom - inset} L ${L} ${spring} A ${r} ${r} 0 0 1 ${R} ${spring} L ${R} ${bottom - inset} Z`;
  };
  const outline = (inset) => {
    if (round) return roundOutline(inset);
    const L = cx - WIDTH / 2 + inset;
    const R = cx + WIDTH / 2 - inset;
    const apex = top + inset;
    const shoulder = top + (bottom - top) * SHOULDER;
    const point = (side, k) => {
      const a = (k / 3) * (Math.PI / 2);
      const x = side + (cx - side) * Math.sin(a);
      return [x, shoulder - (shoulder - apex) * (1 - Math.cos(a))];
    };
    let d = `M ${L} ${bottom - inset} L ${L} ${shoulder}`;
    for (let k = 0; k < 3; k++) {
      const [x0, y0] = point(L, k);
      const [x1, y1] = point(L, k + 1);
      d += ` Q ${(x0 + x1) / 2 - 8} ${(y0 + y1) / 2 - 10} ${x1} ${y1}`;
    }
    for (let k = 3; k > 0; k--) {
      const [x0, y0] = point(L, k);
      const [x1, y1] = point(L, k - 1);
      // mirror the left side onto the right
      d += ` Q ${2 * cx - ((x0 + x1) / 2 - 8)} ${(y0 + y1) / 2 - 10} ${2 * cx - x1} ${y1}`;
    }
    return `${d} L ${R} ${bottom - inset} Z`;
  };

  return (
    <Reveal at={at} rise={0} className="pointer-events-none absolute inset-0">
      <svg width={PAGE_WIDTH} height={H} viewBox={`0 0 ${PAGE_WIDTH} ${H}`} className="block">
        <defs>
          <linearGradient id="arch-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7E5F28" />
            <stop offset="0.2" stopColor="#E6CB85" />
            <stop offset="0.4" stopColor="#A9843D" />
            <stop offset="0.6" stopColor="#F6E7B0" />
            <stop offset="0.8" stopColor="#94702F" />
            <stop offset="1" stopColor="#D8B96E" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#arch-gold)">
          <path d={outline(0)} strokeWidth="1.5" />
          <path d={outline(9)} strokeWidth="0.6" />
        </g>
        {/* the finial on the point: a small cross, or a bud */}
        {round ? (
          <path d={`M ${cx - 0.8} ${top - 26} h 1.6 v 6 h 5 v 1.6 h -5 v 13 h -1.6 v -13 h -5 v -1.6 h 5 Z`} fill="url(#arch-gold)" />
        ) : (
          <>
        <path d={`M ${cx} ${top - 22} Q ${cx + 7} ${top - 8} ${cx} ${top - 2} Q ${cx - 7} ${top - 8} ${cx} ${top - 22} Z`} fill="url(#arch-gold)" />
        <circle cx={cx} cy={top - 27} r="2.4" fill="url(#arch-gold)" />
          </>
        )}
      </svg>
    </Reveal>
  );
}
