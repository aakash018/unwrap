// The frame around an invitation or gift that people open from its link: the
// engine's fonts and styles.

import type { Metadata, Viewport } from "next";
import "@/engine/index.css";
import { engineFonts } from "@/lib/engine-fonts";
import { readEnv } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  const site = readEnv()?.siteUrl;
  return {
    metadataBase: site ? new URL(site) : undefined, // the picture in link previews needs a full address
    robots: { index: false, follow: false }, // links are private: keep them out of search
  };
}

export const viewport: Viewport = { themeColor: "#565a80", viewportFit: "cover" };

export default function OpenLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={engineFonts}>
      <body>{children}</body>
    </html>
  );
}
