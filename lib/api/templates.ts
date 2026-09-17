import { apiGet, REVALIDATE, type QueryValue } from './client';
import { isRecord, list, num, numOrNull, str, strOrNull } from './parse';
import type {
  CatalogueStats,
  Review,
  ReviewsResponse,
  TemplateCapabilities,
  TemplateDetail,
  TemplateListQuery,
  TemplateListResponse,
  TemplateSummary,
} from './types';

/**
 * Catalogue, reviews and stats reads for server components. Each returns null
 * when the API cannot be reached or answers with an error, so the caller
 * decides what a missing section looks like.
 */

export function normalizeTemplateSummary(raw: unknown): TemplateSummary | null {
  if (!isRecord(raw) || typeof raw.slug !== 'string' || raw.slug === '') return null;
  const rating = numOrNull(raw.avgRating);
  return {
    id: str(raw.id),
    slug: raw.slug,
    name: str(raw.name),
    thumbnailUrl: strOrNull(raw.thumbnailUrl),
    desktopThumbnailUrl: strOrNull(raw.desktopThumbnailUrl),
    mobileThumbnailUrl: strOrNull(raw.mobileThumbnailUrl),
    community: str(raw.community),
    bestFor: list(raw.bestFor),
    languages: list(raw.languages),
    badge: strOrNull(raw.badge),
    shortDescription: strOrNull(raw.shortDescription),
    aboutExcerpt: strOrNull(raw.aboutExcerpt),
    highlights: list(raw.highlights),
    price: num(raw.price),
    originalPrice: numOrNull(raw.originalPrice),
    priceUsd: numOrNull(raw.priceUsd),
    originalPriceUsd: numOrNull(raw.originalPriceUsd),
    gstPercent: num(raw.gstPercent),
    buyerCount: num(raw.buyerCount),
    // 0 is how the database says "no reviews yet", not a zero-star rating.
    avgRating: rating !== null && rating > 0 ? rating : null,
    releasedAt: strOrNull(raw.releasedAt),
    // Only an explicit true shows the button, so an older backend hides it.
    tryWithNames: raw.tryWithNames === true,
  };
}

function stringArrayOrNull(value: unknown): string[] | null {
  return Array.isArray(value) ? list(value) : null;
}

export function normalizeCapabilities(raw: unknown): TemplateCapabilities | null {
  if (!isRecord(raw)) return null;
  return {
    people: Array.isArray(raw.people)
      ? raw.people
          .filter(isRecord)
          .map((p) => ({ label: str(p.label).trim(), photo: p.photo === true }))
          .filter((p) => p.label !== '')
      : null,
    ceremonyFields: stringArrayOrNull(raw.ceremonyFields),
    mediaSlots: Array.isArray(raw.mediaSlots)
      ? raw.mediaSlots
          .filter(isRecord)
          .map((s) => ({ label: str(s.label).trim(), type: str(s.type), multiple: s.multiple === true, max: numOrNull(s.max) }))
          .filter((s) => s.label !== '')
      : null,
    customFieldLabels: stringArrayOrNull(raw.customFieldLabels),
    languages: list(raw.languages),
    rsvp: typeof raw.rsvp === 'boolean' ? raw.rsvp : null,
    wishes: typeof raw.wishes === 'boolean' ? raw.wishes : null,
  };
}

export function normalizeTemplateDetail(raw: unknown): TemplateDetail | null {
  const summary = normalizeTemplateSummary(raw);
  if (!summary || !isRecord(raw)) return null;
  return {
    ...summary,
    style: strOrNull(raw.style),
    colourPalette: strOrNull(raw.colourPalette),
    animations: strOrNull(raw.animations),
    aboutText: strOrNull(raw.aboutText),
    reviewCount: num(raw.reviewCount),
    curatedReviewCount: num(raw.curatedReviewCount),
    capabilities: normalizeCapabilities(raw.capabilities),
  };
}

export function normalizeReview(raw: unknown): Review | null {
  if (!isRecord(raw)) return null;
  const template = isRecord(raw.template) && typeof raw.template.slug === 'string'
    ? { name: str(raw.template.name), slug: raw.template.slug }
    : null;
  return {
    id: str(raw.id),
    rating: Math.min(5, Math.max(0, num(raw.rating))),
    reviewText: strOrNull(raw.reviewText),
    coupleNames: strOrNull(raw.coupleNames),
    location: strOrNull(raw.location),
    createdAt: strOrNull(raw.createdAt),
    couplePhotoUrl: strOrNull(raw.couplePhotoUrl),
    // isAdminCreated is the pre-provenance field; either marks a team-written review.
    source: raw.source === 'curated' || raw.isAdminCreated === true ? 'curated' : 'customer',
    template,
  };
}

export function normalizeReviewsResponse(raw: unknown): ReviewsResponse | null {
  if (!isRecord(raw) || !Array.isArray(raw.reviews)) return null;
  const reviews = raw.reviews.map(normalizeReview).filter((r): r is Review => r !== null);
  return {
    reviews,
    avgRating: num(raw.avgRating),
    totalCount: num(raw.totalCount),
    curatedCount: num(raw.curatedCount, reviews.filter((r) => r.source === 'curated').length),
  };
}

export function normalizeCatalogueStats(raw: unknown): CatalogueStats | null {
  if (!isRecord(raw)) return null;
  const occasions: Record<string, number> = {};
  if (isRecord(raw.occasions)) {
    for (const [term, count] of Object.entries(raw.occasions)) {
      const n = num(count);
      if (term.trim() && n > 0) occasions[term] = n;
    }
  }
  const lowest = isRecord(raw.lowest)
    ? { price: num(raw.lowest.price), gstPercent: num(raw.lowest.gstPercent), total: num(raw.lowest.total) }
    : null;
  return { total: num(raw.total), lowest, occasions };
}

/** Backend query parameters for a list request; unset values are omitted. */
export function templateListParams(query: TemplateListQuery = {}): Record<string, QueryValue> {
  return {
    q: query.q?.trim() || undefined,
    community: query.community,
    eventType: query.eventType,
    exclude: query.exclude,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    sort: query.sort,
    limit: query.limit,
    page: query.page,
  };
}

export async function getTemplates(query: TemplateListQuery = {}): Promise<TemplateListResponse | null> {
  const data = await apiGet<unknown>('/api/templates', templateListParams(query), { revalidate: REVALIDATE.list });
  if (!isRecord(data) || !Array.isArray(data.templates)) return null;
  const templates = data.templates
    .map(normalizeTemplateSummary)
    .filter((t): t is TemplateSummary => t !== null);
  return {
    templates,
    total: num(data.total, templates.length),
    page: num(data.page, query.page ?? 1),
    limit: num(data.limit, query.limit ?? templates.length),
  };
}

/**
 * One template. `capabilities` adds what the design supports; only the product
 * page should ask, because it costs the backend a storage read.
 */
export async function getTemplate(
  slug: string,
  { capabilities = false }: { capabilities?: boolean } = {},
): Promise<TemplateDetail | null> {
  if (!slug) return null;
  const data = await apiGet<unknown>(
    `/api/templates/${encodeURIComponent(slug)}`,
    capabilities ? { include: 'capabilities' } : undefined,
    { revalidate: REVALIDATE.detail },
  );
  return normalizeTemplateDetail(data);
}

export async function getTemplateReviews(slug: string, limit = 50): Promise<ReviewsResponse | null> {
  if (!slug) return null;
  const data = await apiGet<unknown>(
    `/api/templates/${encodeURIComponent(slug)}/reviews`,
    { limit },
    { revalidate: REVALIDATE.reviews },
  );
  return normalizeReviewsResponse(data);
}

export async function getFeaturedReviews(limit = 50): Promise<ReviewsResponse | null> {
  const data = await apiGet<unknown>('/api/reviews/featured', { limit }, { revalidate: REVALIDATE.reviews });
  return normalizeReviewsResponse(data);
}

export async function getCatalogueStats(): Promise<CatalogueStats | null> {
  const data = await apiGet<unknown>('/api/templates/stats', undefined, { revalidate: REVALIDATE.stats });
  return normalizeCatalogueStats(data);
}

/** Alternatives for a product page. Supplementary, so a failure is simply none. */
export async function getRelatedTemplates(community: string, excludeSlug: string, limit = 6): Promise<TemplateSummary[]> {
  const result = await getTemplates({ community: community || undefined, exclude: excludeSlug, limit, sort: 'popular' });
  return result?.templates ?? [];
}
