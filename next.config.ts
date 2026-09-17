import type { NextConfig } from "next";
// Shared with components/ui/RemoteImage, so the optimiser allowlist and the
// component's `unoptimized` decision can never disagree.
import { optimizableOrigins } from "./lib/imageHosts";

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

  /**
   * Hosts next/image may optimise. Everything else is refused.
   *
   * Template thumbnails and review photos come from the public media bucket;
   * older uploads are served relative to the API. Both origins are read from
   * the environment so a staging deployment can point elsewhere. Origins and
   * defaults live in lib/imageHosts.ts.
   *
   * Local development: Next 16 refuses to optimise images from localhost /
   * private IPs, so components must render those with `unoptimized`.
   */
  images: {
    remotePatterns: optimizableOrigins().map((origin) => new URL(`${origin}/**`)),
  },

  /**
   * Friendly aliases. Only routes whose destination already exists are listed:
   * a redirect to a page that has not been built yet would just be a 404.
   * Further aliases (/how, /reviews, /planning-tools) ship with the pages they
   * point to.
   */
  async redirects() {
    return [
      // The FAQ is the help centre; /help is the address people guess.
      { source: "/help", destination: "/faq", permanent: true },
      // Short forms of the written pages, for links typed from memory.
      { source: "/how", destination: "/how-it-works", permanent: true },
      { source: "/planning-tools", destination: "/wedding-planning-tools", permanent: true },
      { source: "/reviews", destination: "/stories", permanent: true },
    ];
  },
};

export default nextConfig;
