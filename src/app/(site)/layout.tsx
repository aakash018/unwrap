// The frame around the site's pages: fonts and the site's name. (Gifts have
// their own: app/(invite)/layout.tsx.)

import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Unwrap", template: "%s · Unwrap" },
  description: "Invitations and gifts you open from one link.",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
