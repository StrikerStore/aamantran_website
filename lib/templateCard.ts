import type { TemplateSummary } from './api/types';
import { truncateWords } from './format';
import { OCCASION_BY_KEY, occasionKeyFor } from './occasions';
import { getPublicApiUrl } from './publicEnv';
import { STOREFRONT } from './storefront';

/**
 * What a template card says, kept out of the component so the rules are
 * testable and shared by every place that lists designs.
 */

export const CARD_DESCRIPTION_WORDS = 25;
export const CARD_MAX_OCCASIONS = 3;
export const CARD_MAX_HIGHLIGHTS = 3;

/**
 * Occasion labels for the card, from the curated list only, so ceremony terms
 * such as Haldi or Reception never appear as separate occasions.
 */
export function cardOccasionLabels(bestFor: readonly string[], max = CARD_MAX_OCCASIONS): string[] {
  const keys: string[] = [];
  for (const term of bestFor) {
    const key = occasionKeyFor(term);
    if (key && !keys.includes(key)) keys.push(key);
  }
  return keys.slice(0, max).map((key) => OCCASION_BY_KEY.get(key)?.label ?? key);
}

/** The admin's short description, else the start of the about text, capped at 25 words. */
export function cardDescription(template: Pick<TemplateSummary, 'shortDescription' | 'aboutExcerpt'>): string | null {
  const text = template.shortDescription ?? template.aboutExcerpt;
  const clipped = truncateWords(text, CARD_DESCRIPTION_WORDS);
  return clipped || null;
}

export function cardHighlights(highlights: readonly string[], max = CARD_MAX_HIGHLIGHTS): string[] {
  return highlights.slice(0, max);
}

/**
 * Below this many buyers the number is noise rather than evidence: "1 couple
 * chose this" tells a shopper nothing they can use, and reads as a warning it
 * was never meant to be. The card says nothing instead — it never says zero, and
 * it never rounds one up.
 */
export const CARD_MIN_BUYERS = 5;

/**
 * The rating to show on a card, or null.
 *
 * `avgRating` is the average of genuine customer reviews and is null when there
 * are none, so there is nothing here to qualify — but the card has no review
 * count to show beside it, which is why the accessible name says where the
 * number comes from.
 */
export function cardRating(template: Pick<TemplateSummary, 'avgRating'>): string | null {
  const rating = template.avgRating;
  if (typeof rating !== 'number' || !Number.isFinite(rating) || rating <= 0) return null;
  return rating.toFixed(1);
}

/** How many couples bought this design, when that number means anything yet. */
export function cardBuyers(template: Pick<TemplateSummary, 'buyerCount'>, min = CARD_MIN_BUYERS): number | null {
  const count = template.buyerCount;
  return Number.isFinite(count) && count >= min ? count : null;
}

/**
 * Whether this design sits at the catalogue's lowest price.
 *
 * `lowest` comes from lib/galleryPrice.ts and is null when every design costs
 * the same, because then the chip would be on all of them and mean nothing.
 */
export function isLowestPrice(template: Pick<TemplateSummary, 'price'>, lowest: number | null): boolean {
  return lowest != null && template.price === lowest;
}

/** The watermarked live demo, priced for this storefront (same URL the product page uses). */
export function templateDemoUrl(slug: string): string {
  return `${getPublicApiUrl()}/demo/${encodeURIComponent(slug)}?storefront=${STOREFRONT}`;
}

export function templateArtAlt(name: string): string {
  return `Preview of the ${name} invitation design`;
}
