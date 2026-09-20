import { formatMoney, originalPriceFor, priceFor } from '@/lib/storefront';
import { cx } from '@/lib/cx';
import styles from './PriceBreakdown.module.css';

/**
 * An invite's price, in this deployment's currency.
 *
 *   ₹999  ~~₹1,699~~  41% off
 *
 * The price of the invite and nothing else. Tax is added at checkout and shown
 * there in full, line by line, before anyone pays — that is the one place the
 * sum is worked out, so it is the one place it is shown.
 *
 * The price comes first and largest, because it is the number being decided on;
 * what it was, and how much of a cut that is, are the same fact said twice and
 * sit beside it at supporting size. The saving is only shown when it rounds to
 * at least one per cent — "0% off" beside a struck price reads as a mistake.
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
  const cut = original != null && original > base;
  const percent = cut ? Math.round(((original - base) / original) * 100) : 0;

  const was = cut ? (
    <s className={styles.was}>
      <span className="visually-hidden">Was </span>
      {formatMoney(original)}
    </s>
  ) : null;

  if (layout === 'stacked') {
    return (
      <span className={cx(styles.stacked, className)}>
        <span className={styles.stackedTotal}>{formatMoney(base)}</span>
        {was}
        {percent >= 1 && <span className={styles.save}>{percent}% off</span>}
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
