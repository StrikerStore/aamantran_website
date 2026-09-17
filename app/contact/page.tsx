import type { Metadata } from 'next';
import { SUPPORT, SUPPORT_RESPONSE_TIME } from '@/lib/content/claims';
import { buildPageMetadata } from '@/lib/seo';
import ContactClient from './ContactClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Aamantran',
  description:
    `Get in touch with Aamantran — WhatsApp ${SUPPORT.whatsappLabel} (fastest) or email ${SUPPORT.email}. ${SUPPORT.hours}, ${SUPPORT_RESPONSE_TIME.value}. Wedding this week? Say so and we will prioritise your questions.`,
  path: '/contact',
});

export default function ContactPage() {
  return <ContactClient />;
}
