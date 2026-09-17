import type { TemplateSummary } from './api/types';
import { formatMoney, priceFor } from './storefront';

/**
 * The prices the shop actually sells at.
 *
 * A shop tells you its prices; it does not make you open every product page to
 * discover there are only two. This groups the live catalogue by price so the
 * homepage can say "eight designs at this price, six at that one" and be right
 * by construction: no figure is written down here, so none can go stale when a
 * price changes or a design ships.
 *
 * It returns nothing when the catalogue has more distinct prices than a
 * customer can hold in their head. At that point "our prices" is a range rather
 * than a choice, and a tier board would mislead — the caller shows the
 * "from ___" line instead.
 */

/** Above this many distinct prices, the shop has a range, not tiers. */
export const MAX_TIERS = 3;

export interface PriceTier {
  /** Minor units in this storefront's currency, so ties group exactly. */
  minor: number;
  /** Formatted price, e.g. "₹999". Never carries tax wording — callers add it. */
  label: string;
  /** Live designs at this price. */
  count: number;
}

export function priceTiers(templates: readonly TemplateSummary[], maxTiers = MAX_TIERS): PriceTier[] {
  const counts = new Map<number, number>();
  for (const template of templates) {
    const minor = priceFor(template);
    // A template with no price in this storefront's currency is not for sale here.
    if (minor == null) continue;
    counts.set(minor, (counts.get(minor) ?? 0) + 1);
  }

  if (counts.size === 0 || counts.size > maxTiers) return [];

  return [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([minor, count]) => ({ minor, label: formatMoney(minor), count }));
}
