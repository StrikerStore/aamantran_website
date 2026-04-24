'use client';

import { useEffect } from 'react';

interface Props {
  name: string;
  price: number;
  slug: string;
}

export default function PixelViewContent({ name, price, slug }: Props) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_name: name,
        content_ids: [slug],
        content_type: 'product',
        value: price / 100,
        currency: 'INR',
      });
    }
  }, []);

  return null;
}
