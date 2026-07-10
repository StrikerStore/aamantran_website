'use client';

import { openCookiePrefs } from './CookieConsent';

/** Footer link that re-opens the cookie consent banner (privacy policy §14). */
export default function CookiePrefsLink() {
  return (
    <a
      href="#cookie-preferences"
      onClick={(e) => {
        e.preventDefault();
        openCookiePrefs();
      }}
    >
      Cookie Preferences
    </a>
  );
}
