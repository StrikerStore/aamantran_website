'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TryDemoButton } from '@/components/try-demo/TryDemoButton';
import { PriceBreakdown } from '@/components/ui/PriceBreakdown';
import { getOffers } from '@/lib/api/checkout';
import type { OfferCoupon } from '@/lib/api/types';
import { ACCESS, SELF_BUILD } from '@/lib/content/entitlements';
import { TRY_DEMO } from '@/lib/content/tryDemo';
import { getFbq } from '@/lib/metaPixel';
import { CURRENCY, priceFor } from '@/lib/storefront';
import styles from './PurchasePanel.module.css';

/**
 * Price, what the price covers, and the way to buy.
 *
 * Offers come from the checkout API so the strip can never promise a discount
 * checkout will not honour, and an offer that has not been unlocked says what
 * unlocks it instead of being hidden. A failed or slow offers call leaves the
 * panel exactly as it is: nothing here depends on it.
 */
export function PurchasePanel({
  slug,
  name,
  price,
  priceUsd,
  originalPrice,
  originalPriceUsd,
  gstPercent,
  tryWithNames = false,
}: {
  slug: string;
  name: string;
  price: number;
  priceUsd: number | null;
  originalPrice: number | null;
  originalPriceUsd: number | null;
  gstPercent: number;
  /** Shows "Try it with your names"; the page must also render TryDemoSheet. */
  tryWithNames?: boolean;
}) {
  const [offers, setOffers] = useState<OfferCoupon[]>([]);

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
      <PriceBreakdown
        price={price}
        priceUsd={priceUsd}
        originalPrice={originalPrice}
        originalPriceUsd={originalPriceUsd}
        gstPercent={gstPercent}
        layout="stacked"
        className={styles.price}
      />
      <p className={styles.once}>One payment. No subscription, no renewal.</p>

      {offers.length > 0 && (
        <ul className={styles.offers} aria-label="Offers">
          {offers.map((offer) => (
            <li key={offer.code} className={offer.eligible ? styles.offer : styles.offerLocked}>
              <span className={styles.offerLabel}>{offer.label}</span>
              {!offer.eligible && offer.unlockMessage && <span className={styles.offerNote}>{offer.unlockMessage}</span>}
            </li>
          ))}
          <li className={styles.offerNote}>Apply your code at checkout.</li>
        </ul>
      )}

      <Link href={`/checkout/${slug}`} className={styles.buy} onClick={handleBuy}>
        Buy this design
      </Link>

      {tryWithNames && (
        <TryDemoButton source="purchase-panel" fullWidth>
          {TRY_DEMO.cta}
          <span className={styles.free}> · free</span>
        </TryDemoButton>
      )}

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
