'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <div className="nav-inner">
        <Link href="/" className="logo">
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="logo-img"
            priority
          />
          <span className="logo-name">Aamantran</span>
        </Link>
        <div className="nav-right">
          <ul className="nav-links">
            <li><Link href="/#features">Features</Link></li>
            <li><Link href="/templates">Templates</Link></li>
            <li><Link href="/#how">How it works</Link></li>
            <li><Link href="/#reviews">Reviews</Link></li>
          </ul>
          <Link href="/templates" className="btn-nav">Browse Templates</Link>
          <button
            className="hamburger"
            aria-label="Open menu"
            onClick={() => setMenuOpen(o => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <Link href="/" className="mobile-menu-brand" onClick={() => setMenuOpen(false)}>
          <Image src="/logo.png" alt="" width={36} height={36} className="logo-img" />
          <span className="logo-name">Aamantran</span>
        </Link>
        <Link href="/#features" onClick={() => setMenuOpen(false)}>Features</Link>
        <Link href="/templates" onClick={() => setMenuOpen(false)}>Templates</Link>
        <Link href="/#how" onClick={() => setMenuOpen(false)}>How it works</Link>
        <Link href="/#reviews" onClick={() => setMenuOpen(false)}>Reviews</Link>
        <Link href="/templates" className="mob-cta" onClick={() => setMenuOpen(false)}>Browse Templates</Link>
      </div>
    </nav>
  );
}
