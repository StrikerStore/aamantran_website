import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Checkout',
  description: 'Complete your Aamantran digital invitation purchase securely.',
  path: '/checkout',
  noIndex: true,
});

export default function CheckoutPage() {
  return <CheckoutClient />;
}
