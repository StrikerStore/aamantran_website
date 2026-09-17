import type { TemplateSummary } from './api/types';
import { OCCASION_PAGES, type OccasionPage } from './content/occasionPages';
import { templateMatchesOccasion } from './occasions';

/**
 * Whether an occasion deserves a page of its own, decided from the live
 * catalogue rather than from a list someone maintains by hand.
 *
 * Two ways a page fails to earn its place:
 *
 * - Too few designs. A page with one or two designs is thin for a visitor and
 *   for search, and it sends people to a near-empty grid.
 * - Too much of the catalogue. If an occasion covers most of what is for sale,
 *   its page is a copy of /templates with a different heading. Near-duplicate
 *   landing pages are discounted by search engines and confuse visitors who
 *   land on both. This is why there is no wedding page while wedding designs
 *   are most of the shop: /templates already is that page.
 *
 * Both thresholds are deliberately here, in one place, rather than inlined.
 */

export const MIN_DESIGNS_FOR_PAGE = 3;
export const MAX_CATALOGUE_SHARE = 0.6;

export type PageVerdictReason = 'ok' | 'empty-catalogue' | 'too-few-designs' | 'covers-most-of-catalogue';

export interface PageVerdict {
  publish: boolean;
  matching: number;
  total: number;
  reason: PageVerdictReason;
}

export function occasionPageBySlug(slug: string): OccasionPage | undefined {
  return OCCASION_PAGES.find((page) => page.slug === slug);
}

/** Every candidate slug, for route generation. Not every one is published. */
export function occasionPageSlugs(): string[] {
  return OCCASION_PAGES.map((page) => page.slug);
}

/**
 * The designs that belong on an occasion page.
 *
 * Alias-aware (lib/occasions.ts), so "Housewarming" typed as one word still
 * lands on the griha pravesh page. That is why the page filters the catalogue
 * itself instead of asking the API for a "contains" match.
 */
export function templatesForOccasion(templates: readonly TemplateSummary[], page: OccasionPage): TemplateSummary[] {
  return templates.filter((template) =>
    page.occasionKeys.some((key) => templateMatchesOccasion({ bestFor: template.bestFor.join(',') }, key)));
}

export function occasionPageVerdict(matching: number, total: number): PageVerdict {
  const verdict = (publish: boolean, reason: PageVerdictReason): PageVerdict => ({ publish, matching, total, reason });
  if (total <= 0) return verdict(false, 'empty-catalogue');
  if (matching < MIN_DESIGNS_FOR_PAGE) return verdict(false, 'too-few-designs');
  if (matching / total > MAX_CATALOGUE_SHARE) return verdict(false, 'covers-most-of-catalogue');
  return verdict(true, 'ok');
}

export interface PublishedOccasionPage {
  page: OccasionPage;
  templates: TemplateSummary[];
}

/** The occasion pages the current catalogue supports, in content order. */
export function publishedOccasionPages(templates: readonly TemplateSummary[]): PublishedOccasionPage[] {
  return OCCASION_PAGES
    .map((page) => ({ page, templates: templatesForOccasion(templates, page) }))
    .filter(({ templates: matching }) => occasionPageVerdict(matching.length, templates.length).publish);
}
