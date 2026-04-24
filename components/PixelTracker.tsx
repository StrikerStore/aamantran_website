'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

function firePageView() {
  if (typeof window === 'undefined') return;
  if ((window as any).fbq) {
    (window as any).fbq('track', 'PageView');
    return;
  }
  // fbq not ready yet — retry until it is
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if ((window as any).fbq) {
      (window as any).fbq('track', 'PageView');
      clearInterval(interval);
    } else if (attempts >= 20) {
      clearInterval(interval);
    }
  }, 100);
}

export default function PixelTracker() {
  const pathname = usePathname();

  useEffect(() => {
    firePageView();
  }, [pathname]);

  return null;
}
