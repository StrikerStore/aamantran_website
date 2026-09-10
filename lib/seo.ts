import type { Metadata } from 'next';
import { IS_INTL } from './storefront';

/**
 * Shared SEO constants + per-page metadata builder.
 * Next merges the `openGraph`/`twitter` objects shallowly (a page's object fully
 * replaces the layout's), so every page builds a complete object via this helper.
 */

/**
 * This deployment's own origin.
 *
 * Env-driven because the same codebase is deployed twice, and this value feeds
 * `metadataBase`, every canonical, the sitemap and all JSON-LD. Hardcoded, the
 * global build would canonicalise itself to aamantran.online and Google would
 * decline to index it as a separate site.
 *
 * Written as a literal `process.env.NEXT_PUBLIC_SITE_URL` reference on purpose:
 * Next inlines NEXT_PUBLIC_* by textual substitution at build time, so reading
 * it through a variable would yield undefined in the browser bundle.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aamantran.online'
).replace(/\/$/, '');
/**
 * The two storefront origins, needed as a PAIR on every build.
 *
 * SITE_URL is whichever one this deployment is; these two are both of them,
 * because hreflang has to name every variant including the one you are on.
 * Reciprocal or nothing: if the India build points at the global URL but the
 * global build does not point back, Google discards the annotation entirely.
 *
 * Env-overridable so a staging pair can point at itself instead of production.
 */
export const INDIA_SITE_URL = (
  process.env.NEXT_PUBLIC_INDIA_SITE_URL || 'https://www.aamantran.online'
).replace(/\/$/, '');
export const GLOBAL_SITE_URL = (
  process.env.NEXT_PUBLIC_GLOBAL_SITE_URL || 'https://www.aamantranglobal.com'
).replace(/\/$/, '');

/**
 * hreflang map for a path, for `alternates.languages`.
 *
 * The same content is served to both storefronts in the same language, differing
 * only in currency and region. That is exactly what hreflang is for: without it
 * two 98.6%-identical domains compete as duplicates and Google picks one. With
 * it they are regional variants of one site and the signals consolidate.
 *
 * x-default points at India: it is the older domain, the larger market, and the
 * sensible landing for a visitor Google cannot place.
 *
 * This SUPPLEMENTS the canonical, never replaces it - each page still
 * self-canonicalises to its own origin, or the global build would hand all its
 * authority to India and drop out of the index.
 */
export function alternateLanguages(path: string): Record<string, string> {
  const p = path.startsWith('/') ? path : `/${path}`;
  return {
    'en-IN':     `${INDIA_SITE_URL}${p}`,
    'en-US':     `${GLOBAL_SITE_URL}${p}`,
    'x-default': `${INDIA_SITE_URL}${p}`,
  };
}

export const SITE_NAME = 'Aamantran';
/** en_IN on the India storefront, en_US on the global one. */
export const OG_LOCALE = IS_INTL ? 'en_US' : 'en_IN';
export const SITE_TAGLINE = 'Beautiful Digital Wedding Invitations';
export const DEFAULT_OG_IMAGE = '/og';
export const CONTACT_EMAIL = 'aamantran@plexzuu.com';
export const WHATSAPP_NUMBER = '+91-91747-73644';

interface PageMetadataInput {
  /** Plain title — the root layout template appends “ — Aamantran”. */
  title: string;
  description: string;
  /** Route path starting with “/”, used for the canonical URL and og:url. */
  path: string;
  /** Absolute or site-relative OG image URL; defaults to the branded /og card. */
  ogImage?: string;
  noIndex?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const isDefaultImage = ogImage === DEFAULT_OG_IMAGE;
  const images = [
    {
      url: ogImage,
      ...(isDefaultImage ? { width: 1200, height: 630 } : {}),
      alt: `${title} — ${SITE_NAME}`,
    },
  ];
  return {
    title,
    description,
    alternates: { canonical: path, languages: alternateLanguages(path) },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: OG_LOCALE,
      url: path,
      title: `${title} — ${SITE_NAME}`,
      description,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
