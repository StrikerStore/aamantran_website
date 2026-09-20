/**
 * Public env helpers for the marketing site.
 * Set NEXT_PUBLIC_* on Railway; production fallbacks match aamantran.online layout.
 */
import { IS_INTL } from './storefront';

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
 * Meta (Facebook) Pixel ID — one per storefront.
 *
 * The two sites are separate ad accounts with separate audiences, so they must
 * not report into the same pixel: a dollar Purchase landing in the India pixel
 * corrupts that account's optimisation and its reported revenue, and neither
 * side's numbers can be untangled afterwards.
 *
 * The default is keyed on STOREFRONT rather than being a single constant for
 * the same reason the Instagram handle below is careful: a build that does not
 * set the env var must still be right. A single fallback was invisible on
 * aamantran.online, which sets the var, and silently wrong on the global build,
 * which would have fired India's pixel on every page.
 *
 * NEXT_PUBLIC_META_PIXEL_ID still overrides, per deployment, so a pixel can be
 * swapped when an ad account moves without touching this file.
 */
// A ternary on the build-time flag, not a lookup table keyed by storefront: a
// table is read at runtime, so both ids survive minification and each site
// ships the other's pixel as dead weight. This folds to one string literal, and
// the id a build does not use is not in it at all.
const PROD_META_PIXEL_ID = IS_INTL ? '1403963484478935' : '1106272148422147';

export function getMetaPixelId(): string {
  // `||`, not `??`: an env var set but left empty must fall back to this
  // storefront's own pixel, never to nothing and never to the other site's.
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
  // Same treatment as the Instagram handle above: `||` so an env var set but
  // left empty still falls back, and a pasted "@name" or full channel URL is
  // tolerated. The old default was a misspelt channel that did not exist.
  const raw = process.env.NEXT_PUBLIC_YOUTUBE_HANDLE?.trim() || '';
  const handle = raw
    .replace(/^https?:\/\/(www\.)?youtube\.com\/?/i, '')
    .replace(/^@/, '')
    .replace(/[/?#].*$/, '');
  return handle || 'aamantran_online-h2t';
}
