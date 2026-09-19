import { COLLECTIONS } from '@/lib/collections';
import { getCoupleDashboardUrl } from '@/lib/publicEnv';
import { TRADITION_LABELS } from '@/lib/shopMenu';

/**
 * Site navigation — one definition shared by the header, the mobile menu, the
 * footer and the 404 page, so the four can never disagree.
 */

export interface NavLink {
  href: string;
  label: string;
}

/**
 * The footer's invitation column: the full catalogue, then each collection page.
 *
 * The header's menu is no longer built from this. It is the shop menu now
 * (lib/shopMenu.ts), counted from the live catalogue so it can list the aisles
 * in stock — something a static list cannot do. The footer stays static because
 * it is a site map: every page that exists, whether or not it has stock today.
 */
export const INVITATION_LINKS: NavLink[] = [
  { href: '/templates', label: 'All invitations' },
  ...COLLECTIONS.map((collection) => ({
    href: `/collections/${collection.slug}`,
    label: TRADITION_LABELS[collection.slug] ?? collection.heading,
  })),
];

/**
 * Primary links. These pointed at homepage sections until the pages existed;
 * now each has its own, and Pricing has joined them.
 */
export const PRIMARY_LINKS: NavLink[] = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/features', label: "What's included" },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'Help' },
];

/**
 * Where couples who already bought an invitation manage it. Kept prominent in
 * the header and footer: for existing customers this is the main reason to
 * visit the website at all.
 */
export const DASHBOARD_URL = getCoupleDashboardUrl();

/** Published support details, defined with the site's other claims. */
export { SUPPORT } from '@/lib/content/claims';
