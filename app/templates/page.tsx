import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { getStartingPrice } from '@/lib/startingPrice';
import TemplatesClient from './TemplatesClient';

// Async so the price in the <title> and description is the real cheapest
// template in this storefront's currency, not a baked-in rupee figure.
export async function generateMetadata(): Promise<Metadata> {
  const from = await getStartingPrice();
  return buildPageMetadata({
    title: `Wedding Invitation Templates — Digital Designs from ${from}`,
    description:
      `Browse hand-crafted digital wedding invitation templates for Hindu, Muslim, Sikh and Christian weddings. WhatsApp-ready, with RSVP tracking, photo galleries and music — from ${from}, one-time payment.`,
    path: '/templates',
  });
}

export default function TemplatesPage() {
  return <TemplatesClient />;
}
