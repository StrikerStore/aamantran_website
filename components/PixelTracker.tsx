'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { getFbq, trackPixel } from '@/lib/metaPixel';

function firePageView() {
  if (trackPixel('PageView')) return;
  // The pixel is injected by the consent gate, which may not have run yet.
  // Retry briefly, then give up: consent was probably declined.
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (getFbq() ? trackPixel('PageView') : attempts >= 20) clearInterval(interval);
  }, 100);
}

export default function PixelTracker() {
  const pathname = usePathname();

  useEffect(() => {
    firePageView();
  }, [pathname]);

  return null;
}
