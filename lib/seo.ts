import type { Metadata } from 'next';

/**
 * Shared SEO constants + per-page metadata builder.
 * Next merges the `openGraph`/`twitter` objects shallowly (a page's object fully
 * replaces the layout's), so every page builds a complete object via this helper.
 */

export const SITE_URL = 'https://www.aamantran.online';
export const SITE_NAME = 'Aamantran';
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
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_IN',
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
