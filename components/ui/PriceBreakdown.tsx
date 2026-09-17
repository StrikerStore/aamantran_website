import { IS_INTL, formatMoney, originalPriceFor, priceFor } from '@/lib/storefront';
import { computePriceBreakdown } from '@/lib/priceMath';
import { cx } from '@/lib/cx';
import styles from './PriceBreakdown.module.css';

/**
 * A template's price with its tax, in this deployment's currency.
 *
 * India:          ₹1,999 + ₹359.82 GST · ₹2,358.82 total
 * International:  $29.99   (zero-rated, so no tax line)
 *
 * Builds on lib/storefront (which currency) and lib/priceMath (the backend's
 * exact arithmetic), so the figure always matches checkout. Like <Price>, it
 * renders nothing when this storefront's own price is missing rather than
 * quoting the other currency.
 */
export function PriceBreakdown({
  price,
  priceUsd,
  originalPrice,
  originalPriceUsd,
  gstPercent,
  layout = 'inline',
  className,
}: {
  price: number;
  priceUsd?: number | null;
  originalPrice?: number | null;
  originalPriceUsd?: number | null;
  gstPercent?: number | null;
  layout?: 'inline' | 'stacked';
  className?: string;
}) {
  const base = priceFor({ price, priceUsd });
  if (base == null) return null;

  const b = computePriceBreakdown({ base, gstPercent, intl: IS_INTL });
  const original = originalPriceFor({ originalPrice, originalPriceUsd });
  const was =
    original != null && original > b.base ? (
      <s className={styles.was}>
        <span className="visually-hidden">Original price </span>
        {formatMoney(original)}
      </s>
    ) : null;

  if (layout === 'stacked') {
    return (
      <span className={cx(styles.stacked, className)}>
        {was}
        {was && ' '}
        {/* Stacked lines are separate grid items, so give screen readers the
            words and spaces a sighted visitor infers from the layout. */}
        <span className={styles.stackedTotal}>
          {formatMoney(b.total)}
          {b.gst > 0 && <span className="visually-hidden"> total,</span>}
        </span>
        {b.gst > 0 && (
          <>
            {' '}
            <span className={styles.stackedDetail}>
              {formatMoney(b.base)} + {formatMoney(b.gst)} GST ({b.gstPercent}%)
            </span>
          </>
        )}
      </span>
    );
  }

  return (
    <span className={cx(styles.inline, className)}>
      {was}
      {was && ' '}
      <span className={styles.base}>{formatMoney(b.base)}</span>
      {b.gst > 0 && (
        <>
          {' '}
          <span className={styles.detail}>+ {formatMoney(b.gst)} GST</span>{' '}
          <span className={styles.detail}>· {formatMoney(b.total)} total</span>
        </>
      )}
    </span>
  );
}
