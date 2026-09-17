import { COLLECTIONS } from '@/lib/collections';
import { getCoupleDashboardUrl } from '@/lib/publicEnv';

/**
 * Site navigation — one definition shared by the header, the mobile menu, the
 * footer and the 404 page, so the four can never disagree.
 */

export interface NavLink {
  href: string;
  label: string;
}

/**
 * Short menu labels for the community collection pages. A slug missing here
 * (a new collection) still appears, labelled with its page heading.
 */
const COLLECTION_LABELS: Record<string, string> = {
  'hindu-wedding-invitations': 'Hindu weddings',
  'muslim-wedding-invitations': 'Muslim weddings & Nikah',
  'sikh-wedding-invitations': 'Sikh weddings',
  'modern-wedding-invitations': 'Modern weddings',
};

/** The "Invitations" menu: the full catalogue, then each existing collection page. */
export const INVITATION_LINKS: NavLink[] = [
  { href: '/templates', label: 'All invitations' },
  ...COLLECTIONS.map((collection) => ({
    href: `/collections/${collection.slug}`,
    label: COLLECTION_LABELS[collection.slug] ?? collection.heading,
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
