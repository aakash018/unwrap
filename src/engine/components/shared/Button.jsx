// Small panel button, Figma-sized (28 px tall, 12 px text).
//   <Button>Up</Button>
//   <Button variant="danger">Delete</Button>
//
// `buttonClasses()` is exported too, for things that should LOOK like a
// button but aren't one (e.g. a <label> that opens a file picker).

const VARIANTS = {
  default: 'text-ink',
  danger: 'text-red-700',
};

export function buttonClasses(variant = 'default') {
  return [
    'inline-flex h-7 items-center justify-center gap-1 rounded-md border border-line bg-white px-2.5 text-[12px]',
    'hover:bg-stone-50',
    'disabled:cursor-default disabled:opacity-40 disabled:hover:bg-white',
    VARIANTS[variant],
  ].join(' ');
}

export default function Button({ variant = 'default', className = '', ...rest }) {
  return <button className={`${buttonClasses(variant)} ${className}`} {...rest} />;
}
