import type { Metadata } from 'next';
import './globals.css';
import './extra.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import StickyBar from '@/components/StickyBar';
import ScrollToTopButton from '@/components/ScrollToTopButton';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.aamantran.online'),
  title: 'Aamantran — Beautiful Digital Wedding Invitations',
  description:
    'Create stunning digital wedding invitations your guests will cherish. WhatsApp-ready, RSVP management, multi-event support. Starting at ₹999.',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.ico', type: 'image/x-icon', sizes: 'any' },
    ],
    apple: [{ url: '/logo.png', sizes: '180x180', type: 'image/png' }],
  },
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
        <Nav />
        {children}
        <StickyBar />
        <ScrollToTopButton />
        <Footer />
      </body>
    </html>
  );
}
