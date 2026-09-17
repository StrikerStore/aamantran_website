import { ACCESS, PLANNING_TOOLS } from './entitlements';

/**
 * The shop's own copy: what the homepage says as a shop rather than as a manual.
 *
 * The page this replaces was 60% explanation and 31% selling. Everything here is
 * deliberately short — a line a shopper reads while walking past a shelf — and
 * every line still has to be true, so the ones that state a number derive it
 * (PLANNING_TOOLS.length) or quote the entitlement that defines it rather than
 * repeating a figure by hand.
 *
 * The long-form versions of all of this still exist, on /how-it-works,
 * /features and /wedding-planning-tools. This file is the shop window; those
 * pages are the counter you go to when you want the detail.
 */

export interface ShopStep {
  id: string;
  title: string;
  /** One line. If it needs a second sentence, it belongs on /how-it-works. */
  text: string;
}

/**
 * Four steps, because a shopper deciding whether to buy needs the shape of the
 * thing, not the itinerary. The full six-step sequence — including creating
 * your account and the private preview — is PURCHASE_STEPS, on /how-it-works.
 */
export const SHOP_STEPS: readonly ShopStep[] = [
  { id: 'choose', title: 'Choose a design', text: 'Open its live demo, or try it with your own names first.' },
  { id: 'pay', title: 'Pay once', text: 'One payment, no subscription, full total shown before you pay.' },
  { id: 'build', title: 'Fill it in yourself', text: 'Names, ceremonies, venues, photos and music, in a guided builder.' },
  { id: 'share', title: 'Share one link', text: 'Send it on WhatsApp and watch the RSVPs arrive.' },
];

export interface ProofTile {
  id: string;
  title: string;
  text: string;
  href: string;
}

/**
 * Four things a buyer is really asking about, each a tile rather than a demo.
 *
 * This replaces the two full-screen interactive demos that used to sit on the
 * homepage and take about 1,800px between them. The demos were not deleted —
 * they moved to /features and /wedding-planning-tools, where somebody who wants
 * to poke at them has already said so by clicking through.
 */
export const PROOF_TILES: readonly ProofTile[] = [
  {
    id: 'rsvp',
    title: 'RSVP for each ceremony',
    text: "Guests tick the ceremonies they'll attend and you see a headcount for each, on the designs that support it.",
    href: '/features',
  },
  {
    id: 'guests',
    title: 'Guest list, exportable',
    text: 'One list for the whole event, exported as CSV for your caterer or venue.',
    href: '/features',
  },
  {
    id: 'planning',
    title: `${PLANNING_TOOLS.length} planning tools`,
    text: 'Budget, tasks, vendors, timeline and more, in your dashboard from the day you buy.',
    href: '/wedding-planning-tools',
  },
  {
    id: 'partial',
    title: 'A second, shorter link',
    text: 'For guests invited to the reception but not the wedding. Included in the price.',
    href: '/features',
  },
];

/** The reassurance line under the hero buttons. Three short promises, all enforced. */
export const HERO_REASSURANCE: readonly string[] = [
  'One payment, no subscription',
  ACCESS.short,
  'Guests need no app',
];
