import type { TemplateSummary } from './api/types';
import { OCCASION_PAGES, type OccasionPage } from './content/occasionPages';
import { templateMatchesOccasion } from './occasions';

/**
 * Whether an occasion has a page, and whether that page is worth indexing —
 * decided from the live catalogue rather than a list someone maintains by hand.
 *
 * These are two different questions, and the shop needs them answered
 * separately:
 *
 * - A customer shopping for an anniversary should find the anniversary aisle
 *   the moment there is one design in it. Hiding a stocked aisle is a shop with
 *   a locked door.
 * - Google should not be offered a page with two designs on it, or a page that
 *   is a near-copy of /templates.
 *
 * The rule this replaces answered only the second question, and answered it in
 * a way that fought the shop: it hid any occasion under three designs (so the
 * two anniversary designs were unreachable) and any occasion over 60% of the
 * catalogue (so a ninth wedding design would have deleted the wedding aisle).
 */

/** Below this, a page exists but is not offered to search engines. */
export const MIN_DESIGNS_TO_INDEX = 3;
/**
 * Above this share of the whole catalogue, an occasion page is effectively
 * /templates with a different heading, so it keeps its page for shoppers but
 * points search engines at the canonical one.
 */
export const MAX_INDEXABLE_SHARE = 0.85;

/** none = 404; noindex = real page, kept out of search; index = fully published. */
export type PageStatus = 'none' | 'noindex' | 'index';

export type PageStatusReason = 'ok' | 'no-designs' | 'too-few-designs' | 'covers-most-of-catalogue';

export interface PageVerdict {
  status: PageStatus;
  matching: number;
  total: number;
  reason: PageStatusReason;
}

export function occasionPageBySlug(slug: string): OccasionPage | undefined {
  return OCCASION_PAGES.find((page) => page.slug === slug);
}

/** Every candidate slug, for route generation. Not every one resolves to a page. */
export function occasionPageSlugs(): string[] {
  return OCCASION_PAGES.map((page) => page.slug);
}

/**
 * The designs that belong on an occasion page.
 *
 * Alias-aware (lib/occasions.ts), so "Housewarming" typed as one word still
 * lands on the griha pravesh page. That is why the page filters the catalogue
 * itself instead of asking the API for a "contains" match, which would also
 * return "First Birthday" designs for "Birthday".
 */
export function templatesForOccasion(templates: readonly TemplateSummary[], page: OccasionPage): TemplateSummary[] {
  return templates.filter((template) =>
    page.occasionKeys.some((key) => templateMatchesOccasion({ bestFor: template.bestFor.join(',') }, key)));
}

export function occasionPageVerdict(matching: number, total: number): PageVerdict {
  const verdict = (status: PageStatus, reason: PageStatusReason): PageVerdict => ({ status, matching, total, reason });
  // No designs — including the case where the catalogue could not be read at
  // all, where inventing a page would send visitors to an empty grid.
  if (matching <= 0 || total <= 0) return verdict('none', 'no-designs');
  if (matching < MIN_DESIGNS_TO_INDEX) return verdict('noindex', 'too-few-designs');
  if (matching / total > MAX_INDEXABLE_SHARE) return verdict('noindex', 'covers-most-of-catalogue');
  return verdict('index', 'ok');
}

export interface PublishedOccasionPage {
  page: OccasionPage;
  templates: TemplateSummary[];
  verdict: PageVerdict;
}

function evaluate(templates: readonly TemplateSummary[]): PublishedOccasionPage[] {
  return OCCASION_PAGES.map((page) => {
    const matching = templatesForOccasion(templates, page);
    return { page, templates: matching, verdict: occasionPageVerdict(matching.length, templates.length) };
  });
}

/**
 * Occasion pages that exist for shoppers — anything with at least one design.
 * Use this for links, tiles and menus.
 */
export function occasionPagesInShop(templates: readonly TemplateSummary[]): PublishedOccasionPage[] {
  return evaluate(templates).filter(({ verdict }) => verdict.status !== 'none');
}

/**
 * Occasion pages worth offering to search engines. Use this for the sitemap and
 * anywhere that speaks to crawlers rather than customers.
 */
export function indexableOccasionPages(templates: readonly TemplateSummary[]): PublishedOccasionPage[] {
  return evaluate(templates).filter(({ verdict }) => verdict.status === 'index');
}
