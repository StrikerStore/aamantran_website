'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * `startingPrice` is passed in rather than fetched here: this is a client
 * component, and the figure is already resolved server-side for the page
 * metadata, so re-fetching it in the browser would be a second round trip for a
 * value that is effectively static.
 */
export default function StickyBar({ startingPrice }: { startingPrice: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const heroH = document.getElementById('hero')?.offsetHeight ?? 600;
      setVisible(window.scrollY > heroH * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`sticky-bar${visible ? ' visible' : ''}`} id="sticky-bar">
      <p>Beautiful digital invitations <strong>starting at {startingPrice}</strong></p>
      <Link href="/templates" className="btn-sticky">Browse templates →</Link>
    </div>
  );
}
