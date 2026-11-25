// A small drawing in place of a photo that hasn't been added yet: three of
// them, in turn.

const SCENES = [
  // two on a hill at sunset
  <g key="a">
    <rect width="150" height="140" fill="#F7C79B" />
    <rect width="150" height="140" fill="url(#dusk)" />
    <circle cx="84" cy="72" r="20" fill="#FFF0CF" />
    <path d="M0 86 L30 62 L52 80 L88 52 L120 78 L150 64 V140 H0 Z" fill="#B58AA0" />
    <path d="M0 104 C40 88 100 92 150 108 V140 H0 Z" fill="#4A3A52" />
    <g fill="#2B2033">
      <path d="M62 104 q0 -15 6 -16 q6 1 6 16 Z" /><circle cx="68" cy="84" r="4.4" />
      <path d="M74 104 q0 -13 6 -14 q6 1 6 14 Z" /><circle cx="79" cy="86" r="4.2" />
    </g>
  </g>,
  // two cups of tea by the rain
  <g key="b">
    <rect width="150" height="140" fill="#8FA6B4" />
    <rect x="18" y="10" width="114" height="78" fill="#B9CBD3" />
    <path d="M75 10 V88 M18 48 H132" stroke="#6C5A4C" strokeWidth="4" />
    <path d="M30 18 v12 M50 30 v14 M92 20 v12 M112 34 v14 M40 62 v12 M98 60 v14 M120 64 v10" stroke="#E6F0F3" strokeWidth="1.6" strokeLinecap="round" />
    <rect y="96" width="150" height="44" fill="#7A533A" />
    <rect y="94" width="150" height="5" fill="#93694B" />
    {[48, 96].map((x) => (
      <g key={x}>
        <path d={`M${x - 13} 92 h26 l-3 22 q-10 5 -20 0 Z`} fill="#F4E6D2" />
        <ellipse cx={x} cy="92" rx="13" ry="3.4" fill="#A0623A" />
        <path d={`M${x - 4} 84 q-5 -8 0 -14 q5 -7 0 -13 M${x + 5} 84 q-4 -7 0 -12`} stroke="#F4F6F6" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.8" />
      </g>
    ))}
  </g>,
  // a lit window under the moon
  <g key="c">
    <rect width="150" height="140" fill="#2B2148" />
    <circle cx="112" cy="32" r="14" fill="#F8E7D0" />
    <circle cx="105" cy="28" r="13" fill="#2B2148" />
    {[[20, 22], [46, 14], [70, 34], [88, 12], [32, 52], [132, 66]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.2" fill="#FFF0D2" />)}
    <path d="M18 78 L75 50 L132 78 L126 82 H24 Z" fill="#6A3040" />
    <rect x="28" y="80" width="94" height="60" fill="#4A2638" />
    <rect x="58" y="90" width="34" height="50" fill="#F2B75E" />
    <path d="M75 90 V140 M58 112 H92" stroke="#4A2638" strokeWidth="3" />
    <g fill="#5A2B36"><circle cx="70" cy="120" r="5" /><path d="M63 140 q0 -15 7 -15 q7 0 7 15 Z" /><circle cx="82" cy="121" r="4.6" /><path d="M75 140 q0 -14 7 -14 q7 0 7 14 Z" /></g>
  </g>,
];

export default function SamplePhoto({ which }) {
  return (
    <svg viewBox="0 0 150 140" preserveAspectRatio="xMidYMid slice" className="block h-[180px] w-full" aria-hidden="true">
      <defs>
        <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A6FA8" />
          <stop offset="0.7" stopColor="#F2A98C" stopOpacity="0" />
        </linearGradient>
      </defs>
      {SCENES[which % SCENES.length]}
    </svg>
  );
}

export const SAMPLES = SCENES.length;
