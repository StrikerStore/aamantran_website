import type { TemplateSummary } from './api/types';
import { COLLECTIONS } from './collections';
import { shopAisles } from './content/shopTaxonomy';

/**
 * The shop menu: the doors the header offers, worked out from the catalogue.
 *
 * Occasions appeared in no header link at all — the whole navigation was three
 * knowledge pages and Help, so the only way into an aisle was to scroll the
 * homepage. This puts the aisles where a shopper looks for them.
 *
 * ONLY STOCKED AISLES. A menu is not a shelf: a "Coming soon" row in a dropdown
 * is a dead end with no room to explain itself, and a link to an aisle page that
 * does not exist yet is a 404. The homepage tiles are where an empty aisle says
 * so and offers to take the interest — the menu simply leaves it out until there
 * is something behind it.
 *
 * Traditions are always listed. Their pages are editorial and render whatever
 * the catalogue holds, including nothing, so they can never 404.
 */

export interface ShopMenuLink {
  href: string;
  label: string;
  /** Designs behind this link right now; null when the count is not known. */
  count: number | null;
}

export interface ShopMenu {
  occasions: ShopMenuLink[];
  traditions: ShopMenuLink[];
  /** "All invitations", with the catalogue size when it could be read. */
  all: ShopMenuLink;
}

/**
 * Short menu labels for the community collection pages. A slug missing here
 * (a new collection) falls back to the collection's own short label.
 */
export const TRADITION_LABELS: Record<string, string> = {
  'hindu-wedding-invitations': 'Hindu weddings',
  'muslim-wedding-invitations': 'Muslim weddings & Nikah',
  'sikh-wedding-invitations': 'Sikh weddings',
  'modern-wedding-invitations': 'Modern weddings',
};

function countIn(templates: readonly TemplateSummary[], community: string): number {
  return templates.filter((t) => t.community.trim().toLowerCase() === community).length;
}

export function shopMenu(templates: readonly TemplateSummary[], total: number | null): ShopMenu {
  const occasions = shopAisles(templates)
    .filter((entry) => entry.count > 0 && entry.href)
    .map((entry) => ({ href: entry.href as string, label: entry.aisle.label, count: entry.count }));

  const traditions = COLLECTIONS.map((collection) => ({
    href: `/collections/${collection.slug}`,
    label: TRADITION_LABELS[collection.slug] ?? collection.short,
    // A tradition with nothing in it still has a page worth reading, so it
    // stays in the menu — but it shows no count rather than a zero.
    count: countIn(templates, collection.community) || null,
  }));

  return {
    occasions,
    traditions,
    all: { href: '/templates', label: 'All invitations', count: total },
  };
}
