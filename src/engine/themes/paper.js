// A faint paper grain laid over every theme, so backgrounds feel like
// card stock instead of flat screen colour. (An SVG noise pattern, tiled.)
export const PAPER =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E` +
  `%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E` +
  `%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .25 0 0 0 0 .18 0 0 0 .07 0'/%3E%3C/filter%3E` +
  `%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E") 0 0 / 180px 180px`;
