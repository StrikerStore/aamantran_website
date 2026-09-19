import { formatMoney, originalPriceFor, priceFor } from '@/lib/storefront';
import { cx } from '@/lib/cx';
import styles from './PriceBreakdown.module.css';

/**
 * An invite's price, in this deployment's currency.
 *
 *   ~~₹5,999~~ ₹2,999
 *
 * The price of the invite and nothing else. Tax is added at checkout and shown
 * there in full, line by line, before anyone pays — that is the one place the
 * sum is worked out, so it is the one place it is shown.
 *
 * Renders nothing when this storefront's own price is missing rather than
 * quoting the other currency.
 */
export function PriceBreakdown({
  price,
  priceUsd,
  originalPrice,
  originalPriceUsd,
  layout = 'inline',
  className,
}: {
  price: number;
  priceUsd?: number | null;
  originalPrice?: number | null;
  originalPriceUsd?: number | null;
  layout?: 'inline' | 'stacked';
  className?: string;
}) {
  const base = priceFor({ price, priceUsd });
  if (base == null) return null;

  const original = originalPriceFor({ originalPrice, originalPriceUsd });
  const was =
    original != null && original > base ? (
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
        <span className={styles.stackedTotal}>{formatMoney(base)}</span>
      </span>
    );
  }

  return (
    <span className={cx(styles.inline, className)}>
      {was}
      {was && ' '}
      <span className={styles.base}>{formatMoney(base)}</span>
    </span>
  );
}
