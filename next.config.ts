import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

// Sent with every page, to make it harder to misuse.
const securityHeaders = [
  // other sites can't show our pages inside theirs (to trick people into clicking)
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // other sites only learn our address, not which page people came from
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // always use https (browsers ignore this on http://localhost)
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

// This computer's own addresses on the network, so `npm run dev` also works
// from a phone on the same Wi-Fi. (Read once: restart after changing network.)
const ownAddresses = Object.values(networkInterfaces())
  .flatMap((list) => list ?? [])
  .filter(({ family, internal }) => family === "IPv4" && !internal)
  .map(({ address }) => address);

const nextConfig: NextConfig = {
  allowedDevOrigins: ownAddresses,
  poweredByHeader: false,
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  // Tailwind CSS, compiled by Turbopack
  turbopack: {
    root: import.meta.dirname, // this folder (not a package-lock.json further up)
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
