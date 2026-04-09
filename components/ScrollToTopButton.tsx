'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTopButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const hideOnRoute =
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/onboarding');

  useEffect(() => {
    if (hideOnRoute) return;
    const onScroll = () => setVisible(window.scrollY > 280);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hideOnRoute]);

  if (hideOnRoute) return null;

  return (
    <button
      type="button"
      className={`scroll-top-btn${visible ? ' visible' : ''}`}
      aria-label="Move to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}
