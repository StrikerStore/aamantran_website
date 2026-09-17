import type { TemplateSummary } from '../api/types';
import { templateMatchesOccasion } from '../occasions';

/**
 * The shop floor plan: the aisles a customer browses, in the order they appear.
 *
 * This is the one place aisles are defined. Three occasion vocabularies already
 * exist in this project — the admin's stored `bestFor` terms, the curated
 * shopping keys in lib/occasions.ts, and the wedding-only ceremony list the
 * try-it demo uses — and none of them is a shop layout. This file is, and it
 * builds on lib/occasions.ts rather than repeating its spellings: matching stays
 * alias-aware there, so "Housewarming" typed as one word still finds its aisle.
 *
 * AN AISLE IS NOT A CEREMONY. Haldi, Mehendi, Sangeet, Reception and Nikah are
 * parts of a wedding, not things anyone shops for separately. They belong on the
 * card as what a design covers, and as a filter inside the wedding aisle — never
 * as an aisle of their own, which would split one event across five doors.
 *
 * AN AISLE CAN BE EMPTY. The shop shows every aisle it intends to stock; the
 * ones with nothing in them say so and offer to take the customer's interest.
 * That is honest, and the interest is the evidence for what to design next. It
 * is also why `count` is computed from the live catalogue on every render
 * instead of being written down here.
 */

export type SubCategoryAxis = 'tradition' | null;

export interface Aisle {
  /** Stable id: used in URLs, CSS and analytics. Never reword this. */
  key: string;
  /** What the tile reads. */
  label: string;
  /** Keys from lib/occasions.ts whose designs belong in this aisle. */
  occasionKeys: string[];
  /**
   * The landing page for this aisle, when editorial content exists for it in
   * lib/content/occasionPages.ts. Null means the aisle can still appear as a
   * tile — it just has nowhere of its own to send people yet.
   */
  pageSlug: string | null;
  /** One line under the tile. Says what the aisle covers, not how good it is. */
  blurb: string;
  /** How this aisle is narrowed once a customer is inside it. */
  subCategory: SubCategoryAxis;
}

export const AISLES: readonly Aisle[] = [
  {
    key: 'wedding',
    label: 'Wedding',
    occasionKeys: ['wedding'],
    pageSlug: 'wedding-invitations',
    blurb: 'Every ceremony on one link, from haldi to reception.',
    subCategory: 'tradition',
  },
  {
    key: 'engagement',
    label: 'Engagement',
    occasionKeys: ['engagement'],
    pageSlug: 'engagement-invitations',
    blurb: 'Roka, sagai and engagement parties.',
    subCategory: 'tradition',
  },
  {
    key: 'anniversary',
    label: 'Anniversary',
    occasionKeys: ['anniversary'],
    pageSlug: 'anniversary-invitations',
    blurb: 'Milestones worth gathering everyone for.',
    subCategory: null,
  },
  {
    key: 'baby-shower',
    label: 'Baby Shower',
    occasionKeys: ['baby-shower'],
    pageSlug: null,
    blurb: 'Godh bharai and baby showers.',
    subCategory: null,
  },
  {
    key: 'naming-ceremony',
    label: 'Naming Ceremony',
    occasionKeys: ['naming-ceremony'],
    pageSlug: null,
    blurb: 'Naamkaran and cradle ceremonies.',
    subCategory: null,
  },
  {
    key: 'griha-pravesh',
    label: 'Griha Pravesh',
    // One aisle, two stored spellings: a housewarming and a griha pravesh are
    // the same errand for someone shopping.
    occasionKeys: ['griha-pravesh', 'house-warming'],
    pageSlug: 'griha-pravesh-invitations',
    blurb: 'Housewarmings and griha pravesh poojas.',
    subCategory: null,
  },
  {
    key: 'birthday',
    label: 'Birthday',
    occasionKeys: ['birthday'],
    pageSlug: 'birthday-invitations',
    blurb: 'First birthdays through to the big ones.',
    subCategory: null,
  },
  {
    key: 'retirement',
    label: 'Retirement',
    occasionKeys: ['retirement'],
    pageSlug: null,
    blurb: 'Farewells and retirement parties.',
    subCategory: null,
  },
];

export const AISLE_BY_KEY: ReadonlyMap<string, Aisle> = new Map(AISLES.map((aisle) => [aisle.key, aisle]));

/** The aisle a landing-page slug belongs to, or undefined. */
export function aisleForPageSlug(slug: string): Aisle | undefined {
  return AISLES.find((aisle) => aisle.pageSlug === slug);
}

/** Does this design belong in this aisle? Alias-aware, via lib/occasions.ts. */
export function templateInAisle(template: Pick<TemplateSummary, 'bestFor'>, aisle: Aisle): boolean {
  const bestFor = template.bestFor.join(',');
  return aisle.occasionKeys.some((key) => templateMatchesOccasion({ bestFor }, key));
}

export function templatesInAisle(templates: readonly TemplateSummary[], aisle: Aisle): TemplateSummary[] {
  return templates.filter((template) => templateInAisle(template, aisle));
}

export interface AisleState {
  aisle: Aisle;
  /** Designs in stock for this aisle right now. */
  count: number;
  /** Where the tile leads: its own page, the filtered shop, or nowhere yet. */
  href: string | null;
}

/**
 * Every aisle with its live count, in shop order.
 *
 * Counted from the catalogue the page already has rather than from
 * /api/templates/stats: that endpoint reports raw stored terms (so "House
 * Warming" and "Housewarming" are two different keys), it cannot apply aliases,
 * and it is not deployed on every backend this site talks to.
 *
 * An aisle with stock but no landing page still gets a destination — the shop
 * floor, filtered — so a stocked aisle is never a dead end.
 */
export function shopAisles(templates: readonly TemplateSummary[]): AisleState[] {
  return AISLES.map((aisle) => {
    const count = templatesInAisle(templates, aisle).length;
    const href = count === 0
      ? null
      : aisle.pageSlug
        ? `/${aisle.pageSlug}`
        : `/templates?occasion=${encodeURIComponent(aisle.occasionKeys[0])}`;
    return { aisle, count, href };
  });
}

/** The prefilled WhatsApp message for an aisle that has nothing in it yet. */
export function comingSoonMessage(aisle: Aisle): string {
  return `Hi Aamantran — do you have ${aisle.label.toLowerCase()} invitations?`;
}
