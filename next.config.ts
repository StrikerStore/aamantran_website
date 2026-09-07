import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Build directory, overridable per process.
   *
   * This one codebase is deployed twice — India and international — and the
   * natural way to test a pricing change is to run both side by side. Two
   * `next dev` processes in the same folder fight over `.next`, so each can be
   * given its own:
   *
   *   NEXT_DIST_DIR=.next-in   next dev -p 3001   # NEXT_PUBLIC_STOREFRONT=IN
   *   NEXT_DIST_DIR=.next-intl next dev -p 3002   # NEXT_PUBLIC_STOREFRONT=INTL
   *
   * Unset — which is the case on Railway and in CI — it is exactly `.next`, so
   * production builds are unaffected.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
