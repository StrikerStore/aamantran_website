import { getTemplates } from './api/templates';
import type { TemplateListResponse } from './api/types';
import { bandByKey, type PriceBand } from './galleryPrice';
import { GALLERY_PAGE_SIZE, galleryQuery, type GalleryState } from './gallerySearch';

/**
 * The designs a gallery view shows, with the price band applied whatever the
 * backend does about it.
 *
 * WHY THIS EXISTS. `/api/templates` takes `minPrice`/`maxPrice`, and the backend
 * in this repository honours them — but the backend deployed in front of the
 * live site today does not: asked for `minPrice=200000` against a catalogue of
 * eight designs at ₹999 and six at ₹2,999, it returns all fourteen. A filter
 * that changes the URL and the summary while changing nothing on the shelf is
 * worse than no filter, so this checks the answer it got and, when the bounds
 * were ignored, applies the band itself.
 *
 * The fallback fetches the whole filtered catalogue in one request and pages it
 * here, which is exact only while that fits in one request. That is why the
 * caller must only offer price bands when the catalogue fits — see
 * `priceFilterIsSafe`.
 */

/** `/api/templates` accepts limit 1–100. */
export const CATALOGUE_FETCH_LIMIT = 100;

/**
 * Whether a price band can be applied exactly.
 *
 * Above one request's worth of designs the local fallback could not see the
 * whole shelf, and a count taken from part of it would be a lie. The caller
 * offers no bands at that size, and ignores one asked for in the URL.
 */
export function priceFilterIsSafe(catalogueTotal: number): boolean {
  return catalogueTotal > 0 && catalogueTotal <= CATALOGUE_FETCH_LIMIT;
}

function withinBand(price: number, band: PriceBand): boolean {
  return price >= band.minPrice && price <= band.maxPrice;
}

export interface GalleryResults {
  response: TemplateListResponse | null;
  /** True when the band had to be applied here because the backend ignored it. */
  appliedLocally: boolean;
}

export async function galleryResults(state: GalleryState, bands: readonly PriceBand[]): Promise<GalleryResults> {
  const response = await getTemplates(galleryQuery(state));
  const band = bandByKey(bands, state.price);
  if (!response || !band) return { response, appliedLocally: false };

  // The backend applied the bounds: every design it returned is in the band.
  if (response.templates.every((t) => withinBand(t.price, band))) {
    return { response, appliedLocally: false };
  }

  // It did not. Take the same view unpaginated and do it here.
  const all = await getTemplates({ ...galleryQuery(state), limit: CATALOGUE_FETCH_LIMIT, page: 1 });
  if (!all) return { response, appliedLocally: false };

  const matching = all.templates.filter((t) => withinBand(t.price, band));
  const start = (state.page - 1) * GALLERY_PAGE_SIZE;
  return {
    response: {
      templates: matching.slice(start, start + GALLERY_PAGE_SIZE),
      total: matching.length,
      page: state.page,
      limit: GALLERY_PAGE_SIZE,
    },
    appliedLocally: true,
  };
}
