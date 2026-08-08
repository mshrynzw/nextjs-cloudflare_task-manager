import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Playwright (and local tooling) to hit the app via 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1"],
  // Playwright e2e can set NEXT_DIST_DIR=.next-e2e to avoid clashing with `next dev`.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
