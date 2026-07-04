import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import './extra.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import StickyBar from '@/components/StickyBar';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import WhatsAppButton from '@/components/WhatsAppButton';
import PixelTracker from '@/components/PixelTracker';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import JsonLd from '@/components/JsonLd';
import { getInstagramHandle, getYouTubeHandle } from '@/lib/publicEnv';
import { CONTACT_EMAIL, DEFAULT_OG_IMAGE, SITE_NAME, SITE_TAGLINE, SITE_URL, WHATSAPP_NUMBER } from '@/lib/seo';

const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
const DEFAULT_DESCRIPTION =
  'Create stunning digital wedding invitations your guests will cherish. WhatsApp-ready, RSVP management, multi-event support. Starting at ₹999.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s — ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    'Aamantran is a digital wedding invitation platform in India that lets couples create WhatsApp-ready invitation websites with live RSVP tracking, multi-event support, photo galleries and background music — starting at ₹999.',
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
    <html lang="en">
      <head>
        <meta name="facebook-domain-verification" content="m8thmetutgvygnesnqx172k5kcka64" />
        {/* Favicons: explicit links so the tab icon is reliable (metadata + app/favicon.ico can be cached oddly in dev). */}
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={webSiteJsonLd} />
        <PixelTracker />
        <AnalyticsTracker />
        <Nav />
        {children}
        <StickyBar />
        <ScrollToTopButton />
        <WhatsAppButton />
        <Footer />
        <Script src="/meta-pixel.js" strategy="beforeInteractive" />
        <noscript>
          <img height="1" width="1" style={{display:'none'}}
            src="https://www.facebook.com/tr?id=1508326357602212&ev=PageView&noscript=1"
          />
        </noscript>
      </body>
    </html>
  );
}
