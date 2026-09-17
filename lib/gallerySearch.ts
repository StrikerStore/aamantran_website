import { parsePriceBand } from './galleryPrice';
import { OCCASION_BY_KEY } from './occasions';
import type { GallerySort, TemplateListQuery } from './api/types';

/**
 * The gallery's state lives in its URL, so every filtered view is linkable,
 * survives Back, and renders on the server. This module is the one mapping
 * between that URL, the gallery state and the backend list query.
 *
 * Bad input is ignored rather than rejected, matching the backend: a stale or
 * hand-edited link should still show a catalogue.
 *
 * Price is the one filter whose options are not listed here: its bands come from
 * the live catalogue (lib/galleryPrice.ts), so this module only parses the shape
 * of the value and hands the bounds to the backend.
 */

export const GALLERY_PAGE_SIZE = 24;
export const GALLERY_QUERY_MAX_LENGTH = 60;
/** Today's gallery sorts newest first; kept so existing links keep their order. */
export const DEFAULT_GALLERY_SORT: GallerySort = 'new';

export const GALLERY_SORTS: { value: GallerySort; label: string }[] = [
  { value: 'new', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

/** MIRRORS COMMUNITY_VALUES in aamantran_backend/src/lib/constants.js. */
export const GALLERY_COMMUNITIES: { value: string; label: string }[] = [
  { value: 'hindu', label: 'Hindu' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'sikh', label: 'Sikh' },
  { value: 'christian', label: 'Christian' },
  { value: 'jain', label: 'Jain' },
  { value: 'parsi', label: 'Parsi' },
  { value: 'universal', label: 'Modern & universal' },
];

export interface GalleryState {
  q: string;
  /** A key from lib/occasions.ts, or null for every occasion. */
  occasion: string | null;
  community: string | null;
  /** A band key from lib/galleryPrice.ts ("99900" or "99900-299900"), or null. */
  price: string | null;
  sort: GallerySort;
  page: number;
}

export const DEFAULT_GALLERY_STATE: GalleryState = {
  q: '',
  occasion: null,
  community: null,
  price: null,
  sort: DEFAULT_GALLERY_SORT,
  page: 1,
};

export type RawSearchParams = URLSearchParams | Record<string, string | string[] | undefined>;

function first(raw: RawSearchParams, key: string): string {
  if (raw instanceof URLSearchParams) return raw.get(key) ?? '';
  const value = raw[key];
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

const SORT_VALUES = new Set<string>(GALLERY_SORTS.map((s) => s.value));
const COMMUNITY_VALUES = new Set(GALLERY_COMMUNITIES.map((c) => c.value));

export function parseGallerySearch(raw: RawSearchParams): GalleryState {
  const q = first(raw, 'q').replace(/\s+/g, ' ').trim().slice(0, GALLERY_QUERY_MAX_LENGTH);
  const occasion = first(raw, 'occasion').trim().toLowerCase();
  const community = first(raw, 'community').trim().toLowerCase();
  const price = first(raw, 'price').trim();
  const sort = first(raw, 'sort').trim();
  const page = /^\d{1,5}$/.test(first(raw, 'page').trim()) ? Number(first(raw, 'page').trim()) : 1;
  return {
    q,
    occasion: OCCASION_BY_KEY.has(occasion) ? occasion : null,
    community: COMMUNITY_VALUES.has(community) ? community : null,
    price: parsePriceBand(price) ? price : null,
    sort: SORT_VALUES.has(sort) ? (sort as GallerySort) : DEFAULT_GALLERY_SORT,
    page: page >= 1 ? page : 1,
  };
}

/** The backend list query for a gallery state. */
export function galleryQuery(state: GalleryState, pageSize = GALLERY_PAGE_SIZE): TemplateListQuery {
  return {
    q: state.q || undefined,
    // The backend matches bestFor with "contains" on the label, so an occasion
    // tagged only under an alias spelling is not found here; lib/occasions.ts
    // aliases apply to client-side matching only.
    eventType: state.occasion ? OCCASION_BY_KEY.get(state.occasion)?.label : undefined,
    community: state.community ?? undefined,
    ...(parsePriceBand(state.price ?? '') ?? {}),
    sort: state.sort,
    limit: pageSize,
    page: state.page,
  };
}

/** Canonical URL parameters: fixed order, defaults left out. */
export function gallerySearchParams(state: GalleryState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.occasion) params.set('occasion', state.occasion);
  if (state.community) params.set('community', state.community);
  if (state.price) params.set('price', state.price);
  if (state.sort !== DEFAULT_GALLERY_SORT) params.set('sort', state.sort);
  if (state.page > 1) params.set('page', String(state.page));
  return params;
}

export function galleryHref(state: GalleryState, path = '/templates'): string {
  const qs = gallerySearchParams(state).toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * A new state after a change. Changing what is shown returns to page 1, since
 * the old page number may not exist in the new results.
 */
export function withGalleryChange(state: GalleryState, patch: Partial<GalleryState>): GalleryState {
  const next = { ...state, ...patch };
  const filtersChanged =
    next.q !== state.q ||
    next.occasion !== state.occasion ||
    next.community !== state.community ||
    next.price !== state.price ||
    next.sort !== state.sort;
  return filtersChanged && patch.page === undefined ? { ...next, page: 1 } : next;
}

/** True for searched, filtered or re-sorted views, which are noindex with a canonical of /templates. */
export function isFilteredGallery(state: GalleryState): boolean {
  return Boolean(state.q || state.occasion || state.community || state.price || state.sort !== DEFAULT_GALLERY_SORT);
}

export function totalPages(total: number, pageSize = GALLERY_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
}

export type PageItem = number | 'gap';

/**
 * Page numbers to show: the first, the last, and the current page with one
 * either side. A skipped run becomes a gap, except a single page, which is
 * cheaper to show than an ellipsis standing in for it.
 */
export function paginationItems(current: number, total: number): PageItem[] {
  if (total <= 1) return [1];
  const page = Math.min(Math.max(1, current), total);
  const pages = [...new Set([1, page - 1, page, page + 1, total])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const items: PageItem[] = [];
  pages.forEach((p, i) => {
    const previous = pages[i - 1];
    if (previous !== undefined) {
      if (p - previous === 2) items.push(previous + 1);
      else if (p - previous > 2) items.push('gap');
    }
    items.push(p);
  });
  return items;
}
