// Looks shared by Home's buttons.

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine";
const BASE = `inline-flex h-10 cursor-pointer items-center justify-center rounded-lg px-4 text-[15px] font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`;

export const PRIMARY = `${BASE} bg-ink text-white hover:bg-ink/85`;
export const SECONDARY = `${BASE} border border-line bg-white hover:bg-hover`;
export const ROUND = `grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg text-soft transition-colors hover:bg-ink/5 hover:text-ink ${FOCUS}`;
export const INPUT = `h-11 w-full rounded-lg border border-line bg-white px-3 text-[15px] placeholder:text-soft/70 ${FOCUS}`;
