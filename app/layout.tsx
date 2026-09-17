import type { Metadata } from 'next';
import './styles/tokens.css';
import './styles/base.css';
import './styles/widgets.css';
import { fontVariables } from './fonts';
import SiteHeader from '@/components/shell/SiteHeader';
import SiteFooter from '@/components/shell/SiteFooter';
import WhatsAppButton from '@/components/WhatsAppButton';
import PixelTracker from '@/components/PixelTracker';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import CookieConsent from '@/components/CookieConsent';
import { HideOnCommerce } from '@/components/shell/HideOnCommerce';
import JsonLd from '@/components/JsonLd';
import { getInstagramHandle, getYouTubeHandle } from '@/lib/publicEnv';
import { CONTACT_EMAIL, DEFAULT_OG_IMAGE, OG_LOCALE, SITE_NAME, SITE_TAGLINE, SITE_URL, WHATSAPP_NUMBER } from '@/lib/seo';
import { IS_INTL } from '@/lib/storefront';
import { getStartingPrice } from '@/lib/startingPrice';

const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
const describe = (from: string) =>
  `Create stunning digital wedding invitations your guests will cherish. WhatsApp-ready, RSVP management, multi-event support. Starting at ${from}.`;

// Async because the "starting at" figure is read from the catalogue rather than
// hard-coded — a rupee amount baked into the root description would be wrong on
// the dollar storefront, and a hard-coded dollar one would go stale.
export async function generateMetadata(): Promise<Metadata> {
  const startingPrice = await getStartingPrice();
  const DEFAULT_DESCRIPTION = describe(startingPrice);
  return {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s — ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: OG_LOCALE,
    url: '/',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: DEFAULT_TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.ico', type: 'image/x-icon', sizes: 'any' },
    ],
    apple: [{ url: '/logo.png', sizes: '180x180', type: 'image/png' }],
  },
  };
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: IS_INTL
    ? 'Aamantran is a digital wedding invitation platform that lets couples create WhatsApp-ready invitation websites with live RSVP tracking, multi-event support, photo galleries and background music.'
    : 'Aamantran is a digital wedding invitation platform in India that lets couples create WhatsApp-ready invitation websites with live RSVP tracking, multi-event support, photo galleries and background music.',
  email: CONTACT_EMAIL,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    telephone: WHATSAPP_NUMBER,
    email: CONTACT_EMAIL,
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    `https://www.instagram.com/${getInstagramHandle()}`,
    `https://www.youtube.com/@${getYouTubeHandle()}`,
  ],
};

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <head>
        {/*
          Meta domain verification: intentionally absent. aamantran.online is still
          claimed by our previous (permanently suspended) business portfolio, so it
          cannot be verified under the current one. Verification only gates Aggregated
          Event Measurement — ads and the Pixel run fine without it. If the domain is
          ever released, or we move to a new root domain, re-add:
            <meta name="facebook-domain-verification" content="..." />
        */}
        {/* Favicons: explicit links so the tab icon is reliable (metadata + app/favicon.ico can be cached oddly in dev). */}
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* Fonts are self-hosted by next/font (app/fonts.ts): no request to Google from the browser. */}
      </head>
      <body>
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={webSiteJsonLd} />
        <PixelTracker />
        <AnalyticsTracker />
        {/* Checkout and onboarding draw their own minimal header and footer. */}
        <HideOnCommerce>
          <SiteHeader />
        </HideOnCommerce>
        {/* Skip-link target. A div, not <main>: several pages render their own <main>. */}
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <WhatsAppButton />
        <HideOnCommerce>
          <SiteFooter />
        </HideOnCommerce>
        {/* Meta Pixel loads only after consent — see privacy policy §14 */}
        <CookieConsent />
      </body>
    </html>
  );
}
