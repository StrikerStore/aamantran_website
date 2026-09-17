'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Notice } from '@/components/ui/Notice';
import { LinkButton } from '@/components/ui/Button';
import { readCheckoutDraft } from '@/lib/checkoutDraft';
import { paymentFailedReturnKey } from '@/lib/checkout';
import { trackOnce } from '@/lib/track';
import styles from './PaymentFailedRedirect.module.css';

/**
 * Catches a buyer whose payment failed and who landed here rather than on the
 * design's checkout.
 *
 * The backend sends a definite failure straight back to `/checkout/<slug>`; the
 * homepage is the fallback for when it cannot tell which design was being
 * bought. In that case the draft saved in this browser usually can, so the
 * buyer is sent back to their own filled-in checkout instead of being dropped
 * at the top of the site with nothing to go on.
 *
 * With no draft (another device, another tab, storage cleared) it says what
 * happened and offers the way back, rather than pretending nothing did.
 */

/** The draft cannot change while this page is open, so there is nothing to subscribe to. */
const noSubscription = () => () => {};

/**
 * sessionStorage read as an external store rather than in an effect: the server
 * snapshot is null, which is what the server renders, and the real value
 * arrives on the first client render without a hydration mismatch.
 */
function useDraftSlug(enabled: boolean): string | null {
  return useSyncExternalStore(
    noSubscription,
    () => (enabled ? readCheckoutDraft()?.templateSlug ?? null : null),
    () => null,
  );
}

export function PaymentFailedRedirect() {
  const router = useRouter();
  const params = useSearchParams();
  const failed = params.get('payment') === 'failed';
  const reason = params.get('reason');
  const draftSlug = useDraftSlug(failed);
  const reported = useRef(false);

  useEffect(() => {
    if (!failed) return;
    if (!reported.current) {
      reported.current = true;
      // Same key as checkout's own, so bouncing home and back to checkout counts once.
      trackOnce(paymentFailedReturnKey(reason), 'payment_failed_return', { recovered: Boolean(draftSlug), ...(reason ? { reason } : {}) });
    }
    if (draftSlug) {
      const query = new URLSearchParams({ payment: 'failed', ...(reason ? { reason } : {}) });
      router.replace(`/checkout/${encodeURIComponent(draftSlug)}?${query.toString()}`);
    }
  }, [failed, draftSlug, reason, router]);

  // Nothing to say when the visitor did not arrive from a failed payment, and
  // nothing worth showing in the instant before the redirect lands.
  if (!failed || draftSlug) return null;

  return (
    <div className={styles.wrap}>
      <Notice
        tone="warning"
        title="Your payment did not go through"
        live="polite"
        action={
          <LinkButton href="/templates" variant="secondary" size="sm">
            Choose your design again
          </LinkButton>
        }
      >
        Nothing was charged. Open the design you wanted and try again — your card is not held in the meantime.
      </Notice>
    </div>
  );
}
