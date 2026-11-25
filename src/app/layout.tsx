// The frame around every page: fonts and the site's name.

import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const instrument = Instrument_Serif({ variable: "--font-instrument", weight: "400", subsets: ["latin"] });
const tiro = Tiro_Devanagari_Hindi({ variable: "--font-tiro", weight: "400", subsets: ["devanagari"] });

export const metadata: Metadata = {
  title: { default: "Unwrap", template: "%s · Unwrap" },
  description: "Invitations and gifts you open from one link.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrument.variable} ${tiro.variable} antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
