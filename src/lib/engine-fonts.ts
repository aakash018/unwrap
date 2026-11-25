// The fonts the engine uses.

import { Cormorant_Garamond, DM_Sans, Instrument_Serif, Kalam, Tiro_Devanagari_Hindi } from "next/font/google";

// The engine asks for these fonts by their own names (also in its drawings),
// so loading them here is enough.
const instrument = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--f1" });
const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--f2",
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--f3" });
const tiro = Tiro_Devanagari_Hindi({ weight: "400", subsets: ["devanagari"], variable: "--f4" });
const kalam = Kalam({ weight: ["400", "700"], subsets: ["latin"], variable: "--f5", preload: false });
export const engineFonts = [instrument, cormorant, dmSans, tiro, kalam].map((font) => font.variable).join(" ");

