import type { TemplateSummary } from './api/types';
import { GALLERY_COMMUNITIES } from './gallerySearch';
import type { Aisle } from './content/shopTaxonomy';

/**
 * Sub-aisles: narrowing an occasion by tradition.
 *
 * In a shop the wedding aisle has a Hindu shelf, a Muslim shelf and so on, and
 * a customer picks one without leaving the aisle. Here that is a query
 * parameter — `/wedding-invitations?tradition=hindu` — and not a route, because
 * a route would be a fourth address for the same designs after `/templates`,
 * the aisle page and `/collections/hindu-wedding-invitations`. A filtered view
 * is `noindex` with a canonical back to the aisle, the same rule `/templates`
 * already applies to its own filters.
 *
 * WHICH SHELVES EXIST IS NOT A SETTING. The options come from the designs
 * actually in the aisle, so picking one can never land on an empty page, and a
 * shelf appears the day a design for it ships.
 */

export interface SubAisle {
  /** A community value from GALLERY_COMMUNITIES — the URL value too. */
  value: string;
  label: string;
  count: number;
}

/** The community a URL asks for, or null when it is unknown or not stocked here. */
export function parseTradition(raw: string | string[] | undefined, options: readonly SubAisle[]): string | null {
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase() ?? '';
  return options.some((option) => option.value === value) ? value : null;
}

/**
 * The traditions stocked in this aisle, in the site's usual community order.
 *
 * Returns nothing when the aisle is not narrowed by tradition (an anniversary
 * is an anniversary) or when there is only one, because a filter offering a
 * single choice filters nothing.
 */
export function subAisles(templates: readonly TemplateSummary[], aisle: Aisle | undefined): SubAisle[] {
  if (!aisle || aisle.subCategory !== 'tradition') return [];

  const counts = new Map<string, number>();
  for (const template of templates) {
    const community = template.community.trim().toLowerCase();
    if (community) counts.set(community, (counts.get(community) ?? 0) + 1);
  }

  const options = GALLERY_COMMUNITIES
    .filter((community) => counts.has(community.value))
    .map((community) => ({ value: community.value, label: community.label, count: counts.get(community.value) ?? 0 }));

  return options.length > 1 ? options : [];
}

export function templatesInSubAisle(templates: readonly TemplateSummary[], tradition: string | null): TemplateSummary[] {
  if (!tradition) return [...templates];
  return templates.filter((template) => template.community.trim().toLowerCase() === tradition);
}

/** The label a chosen tradition reads as, for the heading and the summary. */
export function traditionLabel(options: readonly SubAisle[], tradition: string | null): string | null {
  return options.find((option) => option.value === tradition)?.label ?? null;
}
