import { OCCASIONS, OCCASION_BY_KEY } from './occasions';
import { DEFAULT_GALLERY_SORT, GALLERY_COMMUNITIES, GALLERY_SORTS, type GalleryState } from './gallerySearch';

/**
 * Which filter choices the gallery offers, worked out from the live catalogue
 * so a choice never leads to an empty page.
 */

export interface FacetOption {
  value: string;
  label: string;
}

interface FacetSource {
  bestFor: readonly string[];
  community: string;
}

/**
 * Occasions and communities that have at least one design, in display order.
 *
 * An occasion is offered only when the backend's own filter would find it: the
 * list endpoint matches `eventType` as a case-insensitive "contains" on the
 * stored bestFor text, so the same test is applied here rather than the alias
 * matching in lib/occasions.ts.
 */
export function galleryFacets(templates: readonly FacetSource[]): { occasions: FacetOption[]; communities: FacetOption[] } {
  const bestForTexts = templates.map((t) => t.bestFor.join(', ').toLowerCase());
  const communities = new Set(templates.map((t) => t.community.trim().toLowerCase()));
  return {
    occasions: OCCASIONS
      .filter((o) => bestForTexts.some((text) => text.includes(o.label.toLowerCase())))
      .map((o) => ({ value: o.key, label: o.label })),
    communities: GALLERY_COMMUNITIES.filter((c) => communities.has(c.value)),
  };
}

/**
 * `options`, plus the selected value if it is missing (a shared link to a
 * filter that has since emptied), so the control still shows what is applied.
 */
export function withSelected(options: readonly FacetOption[], selected: string | null, all: readonly FacetOption[]): FacetOption[] {
  if (!selected || options.some((o) => o.value === selected)) return [...options];
  const present = new Set([...options.map((o) => o.value), selected]);
  return all.filter((o) => present.has(o.value));
}

/** Human labels for what is applied, e.g. ['"royal"', 'Wedding', 'Hindu']. */
export function activeFilterLabels(state: GalleryState): string[] {
  const labels: string[] = [];
  if (state.q) labels.push(`“${state.q}”`);
  if (state.occasion) labels.push(OCCASION_BY_KEY.get(state.occasion)?.label ?? state.occasion);
  if (state.community) labels.push(GALLERY_COMMUNITIES.find((c) => c.value === state.community)?.label ?? state.community);
  if (state.sort !== DEFAULT_GALLERY_SORT) labels.push(GALLERY_SORTS.find((s) => s.value === state.sort)?.label ?? state.sort);
  return labels;
}
