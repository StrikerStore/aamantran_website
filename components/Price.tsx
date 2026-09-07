import { formatMoney, priceFor } from '@/lib/storefront';

/**
 * A template's price in this deployment's currency.
 *
 * Takes both figures and picks one, because the catalogue API returns both on
 * every row — one cached response then serves either storefront. There is no
 * runtime switch here: which currency wins was decided when the site was built.
 *
 * Renders nothing when the storefront's own figure is missing. Falling back to
 * the other currency would print a rupee amount behind a dollar sign, off by
 * roughly fifty times.
 */
export default function Price({
  inr,
  usd,
  className,
}: {
  inr: number;
  usd?: number | null;
  className?: string;
}) {
  const minor = priceFor({ price: inr, priceUsd: usd });
  if (minor == null) return null;
  return <span className={className}>{formatMoney(minor)}</span>;
}
