'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { track } from '@/lib/track';

/** Fires a first-party pageview on every route change (mirrors PixelTracker). */
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track('pageview');
  }, [pathname]);

  return null;
}
