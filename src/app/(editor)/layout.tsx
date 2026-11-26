// The frame around making an invitation or gift: the engine's fonts and styles.

import type { Metadata } from "next";
import "@/engine/index.css";
import { engineFonts } from "@/lib/engine-fonts";
import PageProgress from "@/components/PageProgress";

export const metadata: Metadata = {
  title: { default: "Unwrap", template: "%s · Unwrap" },
  robots: { index: false, follow: false },
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={engineFonts}>
      <body>
        <PageProgress />
        {children}
      </body>
    </html>
  );
}
