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

/** The watermarked live demo, priced for this storefront (same URL the product page uses). */
export function templateDemoUrl(slug: string): string {
  return `${getPublicApiUrl()}/demo/${encodeURIComponent(slug)}?storefront=${STOREFRONT}`;
}

export function templateArtAlt(name: string): string {
  return `Preview of the ${name} invitation design`;
}
