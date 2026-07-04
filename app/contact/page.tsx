import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import ContactClient from './ContactClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Us',
  description:
    'Get in touch with Aamantran — WhatsApp +91 91747 73644 (fastest) or email aamantran@plexzuu.com. Mon–Sat, 9 AM–9 PM IST, replies within 2–4 hours. Urgent wedding? We prioritise same-day setups.',
  path: '/contact',
});

export default function ContactPage() {
  return <ContactClient />;
}
