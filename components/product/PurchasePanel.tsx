'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TryDemoButton } from '@/components/try-demo/TryDemoButton';
import { PriceBreakdown } from '@/components/ui/PriceBreakdown';
import { getOffers } from '@/lib/api/checkout';
import type { OfferCoupon } from '@/lib/api/types';
import { bestOffer } from '@/lib/offers';
import { ACCESS, SELF_BUILD } from '@/lib/content/entitlements';
import { TRY_DEMO } from '@/lib/content/tryDemo';
import { getFbq } from '@/lib/metaPixel';
import { CURRENCY, priceFor } from '@/lib/storefront';
import styles from './PurchasePanel.module.css';

/**
 * Price, what the price covers, and the way to buy.
 *
 * One offer, at most: the biggest discount this buyer can use right now, from
 * the checkout API so it can never be one checkout will not honour. Every offer,
 * with whether it applies, is listed at checkout — a stack of discounts here
 * only asks the buyer to work out which one is theirs. A failed or slow offers
 * call leaves the panel exactly as it is: nothing here depends on it.
 */
export function PurchasePanel({
  slug,
  name,
  price,
  priceUsd,
  originalPrice,
  originalPriceUsd,
  tryWithNames = false,
}: {
  slug: string;
  name: string;
  price: number;
  priceUsd: number | null;
  originalPrice: number | null;
  originalPriceUsd: number | null;
  /** Shows "Try it with your names"; the page must also render TryDemoSheet. */
  tryWithNames?: boolean;
}) {
  const [offers, setOffers] = useState<OfferCoupon[]>([]);
  const offer = bestOffer(offers);

  useEffect(() => {
    const controller = new AbortController();
    getOffers(slug, undefined, controller.signal).then(setOffers).catch(() => setOffers([]));
    return () => controller.abort();
  }, [slug]);

  function handleBuy() {
    // Value and currency must describe the same money, or international
    // conversions are reported at the rupee figure.
    const minor = priceFor({ price, priceUsd });
    if (minor == null) return;
    const fbq = getFbq();
    fbq?.('track', 'AddToCart', {
      value: minor / 100,
      currency: CURRENCY,
      content_ids: [slug],
      content_name: name,
      content_type: 'product',
    });
  }

  return (
    <div className={styles.panel} id="purchase-panel">
      <div className={styles.head}>
        <PriceBreakdown
          price={price}
          priceUsd={priceUsd}
          originalPrice={originalPrice}
          originalPriceUsd={originalPriceUsd}
          layout="stacked"
          className={styles.price}
        />
        <p className={styles.once}>One payment. No subscription, no renewal.</p>
      </div>

      {offer && (
        <p className={styles.offer} aria-label="Offer">
          <span className={styles.offerLabel}>
            {offer.label} with code <strong className={styles.offerCode}>{offer.code}</strong>
          </span>
          <span className={styles.offerNote}>
            Enter it at checkout, where every running offer is listed.
          </span>
        </p>
      )}

      <div className={styles.actions}>
        <Link href={`/checkout/${slug}`} className={styles.buy} onClick={handleBuy}>
          Buy this invite
        </Link>

        {tryWithNames && (
          <TryDemoButton source="purchase-panel" fullWidth className={styles.tryInPanel}>
            {TRY_DEMO.cta}
            <span className={styles.free}> · free</span>
          </TryDemoButton>
        )}
      </div>

      {/* The terms of the purchase, not the pitch for it: below the button, and quieter. */}
      <ul className={styles.facts}>
        <li>
          <strong>You build it yourself.</strong> {SELF_BUILD.long}
        </li>
        <li>
          <strong>{ACCESS.short}.</strong> {ACCESS.long}
        </li>
        <li>
          <strong>Digital only.</strong> You get an invitation to share as a link. Nothing is printed or posted.
        </li>
      </ul>
    </div>
  );
}
