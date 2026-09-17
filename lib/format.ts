import { IS_INTL } from './storefront';

/**
 * Text and date formatting for storefront copy. Money lives in
 * lib/storefront.ts (formatMoney) and lib/priceMath.ts, not here.
 */

export const DISPLAY_LOCALE = IS_INTL ? 'en-US' : 'en-IN';

export function collapseWhitespace(text: string | null | undefined): string {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

export function countWords(text: string | null | undefined): number {
  const clean = collapseWhitespace(text);
  return clean ? clean.split(' ').length : 0;
}

/** At most `maxWords` words, ending in an ellipsis when anything was cut. */
export function truncateWords(text: string | null | undefined, maxWords: number): string {
  const words = collapseWhitespace(text).split(' ').filter(Boolean);
  if (words.length <= maxWords) return words.join(' ');
  return words.slice(0, Math.max(0, maxWords)).join(' ').replace(/[\s,;:.–—-]+$/u, '') + '…';
}

/**
 * A comma-separated field (bestFor, languages, highlights, tags) as a list:
 * trimmed, blanks dropped, repeats removed ignoring case, first spelling kept.
 */
export function parseList(value: string | null | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of String(value ?? '').split(',')) {
    const item = part.trim();
    const key = item.toLowerCase();
    if (!item || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/**
 * "15 September 2026" (India) or "September 15, 2026" (global). Formatted in
 * UTC so server and browser render identical text, and because ceremony dates
 * are stored as UTC dates. Empty string for a missing or invalid date.
 */
export function formatDate(
  value: string | number | Date | null | undefined,
  { locale = DISPLAY_LOCALE, month = 'long' }: { locale?: string; month?: 'long' | 'short' } = {},
): string {
  if (value === null || value === undefined || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, { day: 'numeric', month, year: 'numeric', timeZone: 'UTC' });
}

/** "1 ceremony", "3 ceremonies". */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count.toLocaleString(DISPLAY_LOCALE)} ${count === 1 ? singular : plural}`;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English', english: 'English',
  hi: 'हिन्दी', hindi: 'हिन्दी',
  gu: 'ગુજરાતી', gujarati: 'ગુજરાતી',
  mr: 'मराठी', marathi: 'मराठी',
  pa: 'ਪੰਜਾਬੀ', punjabi: 'ਪੰਜਾਬੀ',
  bn: 'বাংলা', bengali: 'বাংলা',
  ta: 'தமிழ்', tamil: 'தமிழ்',
  te: 'తెలుగు', telugu: 'తెలుగు',
  kn: 'ಕನ್ನಡ', kannada: 'ಕನ್ನಡ',
  ml: 'മലയാളം', malayalam: 'മലയാളം',
  ur: 'اردو', urdu: 'اردو',
};

/** A language code or name in its own script, e.g. "hi" → "हिन्दी". Unknown values pass through. */
export function languageLabel(language: string): string {
  const key = language.trim().toLowerCase();
  return LANGUAGE_LABELS[key] ?? language.trim();
}
