import { Cormorant_Garamond, DM_Sans } from 'next/font/google';

/**
 * Site typefaces, self-hosted by next/font.
 *
 * These replace the fonts.googleapis.com <link> that used to sit in the root
 * layout. The files are downloaded at build time and served from this domain,
 * so a visitor's browser never contacts Google, and next/font's size-adjusted
 * fallback keeps text from jumping when the web font arrives.
 *
 * Weights and styles match what the old link requested, so every existing page
 * renders in the same faces:
 *   - Cormorant Garamond is a static font: 300–600, upright and italic.
 *     (The old link skipped italic 600; loading it too is the only difference.)
 *   - DM Sans is a variable font; `axes: ['opsz']` keeps the optical-size axis
 *     the old link asked for.
 *
 * Each font exposes a CSS variable. Legacy CSS reaches them through
 * --font-display and --font-body (globals.css); new code uses --font-heading and
 * --font-ui (styles/tokens.css). Never reference the family names directly:
 * next/font controls the generated @font-face names and their size-adjusted
 * fallbacks, and only these variables are guaranteed to track them.
 */
export const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

export const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-dm-sans',
});

/** Class names that define both font variables; applied to <html>. */
export const fontVariables = `${cormorant.variable} ${dmSans.variable}`;
