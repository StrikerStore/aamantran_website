/**
 * Public env helpers for the marketing site.
 * Set NEXT_PUBLIC_* on Railway; production fallbacks match aamantran.online layout.
 */

const PROD_API = 'https://api.aamantran.online';
const PROD_APP = 'https://app.aamantran.online';

export function getPublicApiUrl(): string {
  const v = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (v) return v.replace(/\/$/, '');
  return process.env.NODE_ENV === 'production' ? PROD_API : 'http://localhost:4000';
}

export function getCoupleDashboardUrl(): string {
  const v = process.env.NEXT_PUBLIC_COUPLE_DASHBOARD_URL?.trim();
  if (v) return v.replace(/\/$/, '');
  return process.env.NODE_ENV === 'production' ? PROD_APP : 'http://localhost:3001';
}

/**
 * Meta (Facebook) Pixel ID. Set NEXT_PUBLIC_META_PIXEL_ID on Railway so the
 * pixel can be swapped without a code change (e.g. when moving ad accounts).
 * Returns '' when unconfigured — CookieConsent then skips loading the pixel
 * entirely rather than initialising a dead ID.
 */
const PROD_META_PIXEL_ID = '1106272148422147';

export function getMetaPixelId(): string {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || PROD_META_PIXEL_ID;
}

/**
 * The fallback here is load-bearing, not decoration.
 *
 * It previously read `aamantran_4u`, an account that has since been disabled.
 * aamantran.online never showed it because Railway sets the env var — which is
 * precisely why it went unnoticed until a second deployment ran without one.
 * A wrong default is invisible on every environment that overrides it and wrong
 * on every environment that does not.
 *
 * This value also lands in the Organization JSON-LD `sameAs` (app/layout.tsx),
 * i.e. what search engines are told is the official account, so a stale handle
 * costs more than a dead footer icon.
 */
export function getInstagramHandle(): string {
  // `||`, not `??`: an env var set but left empty must fall back too, or every
  // Instagram link on the site becomes instagram.com/ with no account. The
  // handle is also tolerated as "@name" or a full profile URL, since that is
  // how it tends to get pasted into a host's settings.
  const raw = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE?.trim() || '';
  const handle = raw
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/[/?#].*$/, '');
  return handle || 'aamantran_online';
}

export function getYouTubeHandle(): string {
  return process.env.NEXT_PUBLIC_YOUTUBE_HANDLE?.trim() ?? 'aamatran_4u';
}
