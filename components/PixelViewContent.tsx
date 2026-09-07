'use client';

import { useEffect } from 'react';
import { track } from '@/lib/track';
import { CURRENCY, priceFor } from '@/lib/storefront';

interface Props {
  name: string;
  price: number;
  /** Derived USD price in cents; null when there is no INR price to derive from. */
  priceUsd: number | null;
  slug: string;
}

export default function PixelViewContent({ name, price, priceUsd, slug }: Props) {
  useEffect(() => {
    // The value and currency must describe the same money. Reporting an
    // international visitor's interest as an INR amount would misstate ad
    // performance -- and at a 3x markup, badly.
    const minor = priceFor({ price, priceUsd });
    if (minor == null) return;
    const currency = CURRENCY;
    const value = minor / 100;

    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_name: name,
        content_ids: [slug],
        content_type: 'product',
        value,
        currency,
      });
    }
    track('view_template', { slug, value, currency });
  }, []);

  return null;
}
