'use client';

import Link from 'next/link';
import { CURRENCY, priceFor } from '@/lib/storefront';

interface Props {
  slug: string;
  demoUrl: string;
  price: number;
  /** Derived USD price in cents; null when there is no INR price to derive from. */
  priceUsd: number | null;
  name: string;
}

export default function TemplateCTA({ slug, demoUrl, price, priceUsd, name }: Props) {
  function handleBuyNow() {
    // Value and currency must agree, or international conversions are reported
    // at the rupee figure and every ad metric built on them is wrong.
    const minor = priceFor({ price, priceUsd });
    if (minor == null) return;

    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        value: minor / 100,
        currency: CURRENCY,
        content_ids: [slug],
        content_name: name,
        content_type: 'product',
      });
    }
  }

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
      <Link href={`/checkout/${slug}`} className="btn-primary" onClick={handleBuyNow}>
        Buy Now →
      </Link>
      <a href={demoUrl} className="btn-secondary">
        Live Demo
      </a>
    </div>
  );
}
