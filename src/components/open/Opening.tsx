// What people see first, while the pictures load: the couple's names, or who
// the gift is for, on the colour of its background.

type Props = { lines: string[]; color: string };

export default function Opening({ lines, color }: Props) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6" style={{ background: color }}>
      <p className="text-center font-caps text-5xl leading-tight font-medium tracking-[0.08em] text-[#f3d79c] uppercase">
        {lines.map((line, i) => (
          <span key={line} className="block">
            {i > 0 && <span className="block text-2xl lowercase italic">&amp;</span>}
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}
