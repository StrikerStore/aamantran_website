import type { OfferCoupon } from './api/types';

/**
 * Which offers to show, and in what order.
 *
 * The invite page shows one: the biggest discount this buyer can actually use.
 * Checkout shows all of them, the usable ones first, so the offer a buyer can
 * take is never below one they cannot.
 *
 * "Can actually use" is the server's `eligible` flag, judged against this
 * storefront and this order. An offer that is locked for a single invite (a
 * minimum spend no one invite reaches) is never the one the invite page
 * advertises: that would be promising a discount checkout then refuses.
 */

/** Usable first; then the bigger saving; then by code, so the order never shuffles. */
export function rankOffers(offers: readonly OfferCoupon[]): OfferCoupon[] {
  return [...offers].sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    if (b.discountAmount !== a.discountAmount) return b.discountAmount - a.discountAmount;
    if (b.discountPercent !== a.discountPercent) return b.discountPercent - a.discountPercent;
    return a.code.localeCompare(b.code);
  });
}

/** The single biggest discount this buyer can use, or null when none applies. */
export function bestOffer(offers: readonly OfferCoupon[]): OfferCoupon | null {
  const top = rankOffers(offers)[0];
  return top && top.eligible ? top : null;
}
