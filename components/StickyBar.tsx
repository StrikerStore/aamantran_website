'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StickyBar() {
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
      <p>Beautiful digital invitations <strong>starting at ₹999</strong></p>
      <Link href="/templates" className="btn-sticky">Browse templates →</Link>
    </div>
  );
}
