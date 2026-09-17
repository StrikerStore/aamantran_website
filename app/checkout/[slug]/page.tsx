import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTemplate } from '@/lib/api/templates';
import { buildPageMetadata } from '@/lib/seo';
import { CheckoutClient } from './CheckoutClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Checkout',
  description: 'Complete your Aamantran digital invitation purchase securely.',
  path: '/checkout',
  noIndex: true,
});

type Props = { params: Promise<{ slug: string }> };

/**
 * Checkout for one design.
 *
 * The design is loaded here, on the server, so the page arrives with its name,
 * picture and price instead of a loading line, and a design that does not exist
 * (or is no longer on sale) is a real 404. The price shown first is only a first
 * paint: the page asks the server for the exact figures straight away, and the
 * order is always charged at what the server computes.
 */
export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template) notFound();

  return (
    <CheckoutClient
      template={{
        slug: template.slug,
        name: template.name,
        price: template.price,
        priceUsd: template.priceUsd,
        originalPrice: template.originalPrice,
        originalPriceUsd: template.originalPriceUsd,
        gstPercent: template.gstPercent,
        image: template.desktopThumbnailUrl ?? template.thumbnailUrl ?? template.mobileThumbnailUrl,
      }}
    />
  );
}
