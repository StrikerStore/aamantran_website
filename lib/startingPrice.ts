import { getPublicApiUrl } from './publicEnv';
import { CURRENCY, formatMoney, priceFor } from './storefront';

/**
 * "Starting at ___" — the cheapest live template, in this storefront's currency.
 *
 * Marketing copy used to hard-code "₹999" in nine places, including the page
 * <title>, the Organization JSON-LD and the social-share image. On the dollar
 * site every one of those was simply wrong, and a hard-coded dollar figure would
 * just go stale the first time the rate moved or a cheaper template shipped.
 * Deriving it means the claim can never disagree with the catalogue.
 *
 * Cached for an hour: this feeds mostly-static pages and metadata, and the
 * cheapest price changes far more slowly than anything else on them.
 */

/**
 * Shown if the catalogue cannot be reached. Deliberately a formatted string per
 * currency rather than a number — a metadata build must never fail or render
 * "Starting at undefined" because of one flaky fetch.
 */
const FALLBACK: Record<string, string> = {
  INR: '₹999',
  USD: '$19.99',
};

interface MinimalTemplate {
  price: number;
  priceUsd?: number | null;
}

/** The cheapest live template's price, formatted. Never throws. */
export async function getStartingPrice(): Promise<string> {
  try {
    const API = getPublicApiUrl();
    const res = await fetch(`${API}/api/templates?limit=1&sort=price-asc`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK[CURRENCY];

    const data = await res.json();
    const cheapest: MinimalTemplate | undefined = (data?.templates ?? [])[0];
    if (!cheapest) return FALLBACK[CURRENCY];

    // Sorted by INR, which orders USD identically unless per-template
    // multipliers differ — close enough for a "starting at" claim, and the
    // figure shown is always a real price for a real template.
    const minor = priceFor(cheapest);
    if (minor == null) return FALLBACK[CURRENCY];

    return formatMoney(minor);
  } catch {
    return FALLBACK[CURRENCY];
  }
}
