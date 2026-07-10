'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'aamantran-cookie-consent'; // 'accepted' | 'declined'
const CHANGE_EVENT = 'aamantran:cookie-consent-change';

/** Re-open the banner (footer "Cookie Preferences"): clear the stored choice. */
export function openCookiePrefs() {
  localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function setChoice(value: 'accepted' | 'declined') {
  localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

function getSnapshot() {
  return localStorage.getItem(CONSENT_KEY); // 'accepted' | 'declined' | null
}

// On the server render nothing (declined-equivalent) to avoid hydration flicker.
function getServerSnapshot() {
  return 'server';
}

/** Load the Meta Pixel exactly once, only after explicit consent. */
function loadMetaPixel() {
  if (document.getElementById('meta-pixel-script')) return;
  const s = document.createElement('script');
  s.id = 'meta-pixel-script';
  s.src = '/meta-pixel.js';
  s.async = true;
  // meta-pixel.js only runs init; fire the first PageView ourselves
  // (PixelTracker handles subsequent route changes).
  s.onload = () => {
    (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq?.('track', 'PageView');
  };
  document.head.appendChild(s);
}

/**
 * DPDP/privacy-policy §14 consent gate for advertising cookies (Meta Pixel).
 * The pixel script is never injected unless the visitor accepts; declining is
 * remembered. "Cookie Preferences" in the footer re-opens this banner.
 */
export default function CookieConsent() {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (choice === 'accepted') loadMetaPixel();
  }, [choice]);

  if (choice !== null) return null; // 'server' | 'accepted' | 'declined' — no banner

  function decline() {
    setChoice('declined');
    // If the pixel was loaded from a previous acceptance, a reload drops it.
    if (document.getElementById('meta-pixel-script')) window.location.reload();
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        insetInline: 16,
        bottom: 16,
        zIndex: 1000,
        maxWidth: 560,
        marginInline: 'auto',
        background: '#fff',
        border: '1px solid #e8dccf',
        borderRadius: 14,
        boxShadow: '0 8px 32px rgba(110,31,46,0.18)',
        padding: '16px 18px',
        fontSize: '0.85rem',
        lineHeight: 1.55,
        color: '#5a3a3a',
      }}
    >
      <p style={{ margin: 0 }}>
        We use essential cookies to run the site, and — only with your permission — the Meta
        (Facebook) Pixel to measure our ads. See our{' '}
        <Link href="/privacy" style={{ color: '#6e1f2e', textDecoration: 'underline' }}>
          Privacy Policy
        </Link>
        .
      </p>
      <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setChoice('accepted')}
          style={{
            padding: '8px 22px',
            background: '#6e1f2e',
            color: '#fff',
            border: 'none',
            borderRadius: 24,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={decline}
          style={{
            padding: '8px 22px',
            background: 'transparent',
            color: '#6e1f2e',
            border: '1px solid #d9c4b2',
            borderRadius: 24,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
