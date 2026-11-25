import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
