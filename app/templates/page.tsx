import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import TemplatesClient from './TemplatesClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Wedding Invitation Templates — Digital Designs from ₹999',
  description:
    'Browse hand-crafted digital wedding invitation templates for Hindu, Muslim, Sikh and Christian weddings. WhatsApp-ready, with RSVP tracking, photo galleries and music — from ₹999, one-time payment.',
  path: '/templates',
});

export default function TemplatesPage() {
  return <TemplatesClient />;
}
