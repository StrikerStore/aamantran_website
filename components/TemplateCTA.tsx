'use client';

import Link from 'next/link';

interface Props {
  slug: string;
  demoUrl: string;
  price: number;
  name: string;
}

export default function TemplateCTA({ slug, demoUrl, price, name }: Props) {
  function handleBuyNow() {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        value: price / 100,
        currency: 'INR',
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
