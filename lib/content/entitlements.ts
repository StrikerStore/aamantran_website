import { SETUP_TIME } from './claims';

/**
 * What a purchase includes and the terms that come with it, written once and
 * checked against the code that enforces them. When a rule changes in the
 * backend or dashboard, change it here too.
 */

export { FORBIDDEN_CLAIMS } from './forbiddenClaims';

/**
 * Sources:
 * - computeEventExpiryFromFunctions and syncEventExpiry in
 *   aamantran_backend/src/controllers/userDashboard.controller.js
 *   (last ceremony + 6 months, recomputed when ceremonies change)
 * - aamantran_backend/src/services/dataRetention.service.js
 *   (warning at day 88, deletion from day 90 and at least 48 hours after it)
 */
export const ACCESS = {
  liveMonthsAfterLastCeremony: 6,
  guestDataDeletedDaysAfterExpiry: 90,
  deletionWarningDaysBefore: 2,
  short: 'Live until 6 months after your last ceremony',
  long: 'Your invitation stays live until 6 months after the date of your last ceremony. If you move a ceremony date, that end date moves with it.',
  dataRetention:
    "Guest lists, RSVPs and wishes are deleted 90 days after your invitation's live period ends. We email you about two days before, so you can export your guest list and RSVPs first.",
} as const;

/** Source: namesAreFrozen checks in userDashboard.controller.js and GenerateInvitation.jsx. */
export const NAME_FREEZE = {
  short: 'Names lock once you confirm them',
  long: "You confirm the names on your invitation at the first step of the builder, and they lock after that so they can't be changed by accident. Optional names, such as extended family, can still be edited. If a confirmed name needs correcting, raise a support ticket from your dashboard.",
} as const;

/** Source: createPartial in publishEvent, userDashboard.controller.js. */
export const PARTIAL_INVITE = {
  short: 'A second link for selected ceremonies, included',
  long: "When you publish, you can also create a second link that shows only the ceremonies you choose, for guests invited to the reception but not the wedding, say. It's included in the price, and you set it up yourself in the Preview & Publish step.",
} as const;

/** Said plainly at every buying step: the customer builds the invitation. */
export const SELF_BUILD = {
  short: `You build it yourself. Our guided builder takes most couples ${SETUP_TIME.value.phrase}.`,
  long: "After payment you create your account, then add names, venues, ceremonies, photos and music across guided steps, preview it and publish. Our team doesn't fill it in or design it for you, but support is there if you get stuck.",
  checkoutNote: "After payment you'll set up your invitation yourself in your dashboard.",
  onboardingNext: 'Next: build your invitation',
} as const;

export interface Inclusion {
  id: string;
  title: string;
  detail: string;
  /** Depends on the design; the product page confirms it per template. */
  templateDependent: boolean;
}

export const INCLUDED: readonly Inclusion[] = [
  { id: 'design', title: 'Your chosen design, with your details', detail: 'One event, with every ceremony on one link.', templateDependent: false },
  { id: 'link', title: 'Your own invitation link', detail: 'Opens in any browser, with no app for guests, and shows a preview card in WhatsApp.', templateDependent: false },
  { id: 'partial', title: PARTIAL_INVITE.short, detail: 'For guests invited to only some ceremonies.', templateDependent: false },
  { id: 'rsvp', title: 'RSVP for each ceremony', detail: "Guests tick the ceremonies they'll attend, with plus-ones, meal preference and a message. You see the headcount for each.", templateDependent: true },
  { id: 'wishes', title: 'Guest wishes wall', detail: 'Guests leave wishes on the invitation, and you choose which ones show.', templateDependent: true },
  { id: 'guests', title: 'Guest list with CSV export', detail: 'Keep your guest list in one place and export guests and RSVPs for your caterer or venue.', templateDependent: false },
  { id: 'share', title: 'WhatsApp sharing', detail: 'Open WhatsApp with a message ready to send, or copy your link.', templateDependent: false },
  { id: 'media', title: 'Photos, video and music', detail: 'Upload your own, or choose music from our library of licensed tracks.', templateDependent: true },
  { id: 'maps', title: 'Maps for every venue', detail: 'Paste a Google Maps link and guests get directions in one tap.', templateDependent: true },
  { id: 'planning', title: 'Eight planning tools', detail: 'Budget, tasks, vendors, day-of timeline, inventory, gifts, mood board and photo wall.', templateDependent: false },
  { id: 'preview', title: 'Private preview', detail: "Check it before anyone else sees it, then publish when you're ready.", templateDependent: false },
  { id: 'support', title: 'Support from our team', detail: 'Raise a ticket from your dashboard, or reach us on WhatsApp or email.', templateDependent: false },
];

/** What a customer can change after publishing, and what stays fixed. */
export const CHANGEABLE = {
  canChange: [
    'Venues and map links',
    'Ceremony dates, times, dress codes and notes',
    'Photos, video and music',
    'Special details such as your story and contact person',
    'Whether RSVP and wishes are shown',
    'Instagram and YouTube links',
    "The invitation's language, from those the design supports",
    'Whether the invitation is published',
  ],
  fixed: [
    'Confirmed names: corrections go through support',
    "The design's layout, fonts and colours",
    'Which languages a design supports',
    'The design itself: to move to another, contact support, and if it costs more you pay the difference',
  ],
} as const;

export interface PlanningTool {
  key: string;
  name: string;
  does: string;
  /** An honest limit, so nobody buys expecting more. */
  limit: string;
}

/** Source: aamantran_user/src/pages/{Budget,Tasks,Vendors,Timeline,Inventory,Gifts,MoodBoard,PhotoWall}.jsx. */
export const PLANNING_TOOLS: readonly PlanningTool[] = [
  { key: 'budget', name: 'Budget', does: 'Set a total budget and log expenses by category, vendor and due date, marking each one paid.', limit: "A record for you: it doesn't make or take payments." },
  { key: 'tasks', name: 'Tasks', does: "A to-do board with categories, due dates, priorities and who's responsible.", limit: 'Who is responsible is a label (bride, groom, family or vendor), not a separate login.' },
  { key: 'vendors', name: 'Vendors', does: "Every vendor in one place: contact, package, cost, deposit and what's been paid.", limit: "Your own records: Aamantran doesn't find or book vendors." },
  { key: 'timeline', name: 'Day-of timeline', does: 'A run sheet for each ceremony: time, place, who is responsible and how long each part takes.', limit: 'Kept in your dashboard, separate from the invitation guests see.' },
  { key: 'inventory', name: 'Inventory', does: 'Outfits, jewellery, decor and return gifts, tracked from to-buy to done with quantities and costs.', limit: "A checklist: it doesn't order anything." },
  { key: 'gifts', name: 'Gift tracker', does: 'Record who gave what, so thank-you notes are easy afterwards.', limit: "Not a registry: guests can't buy from it." },
  { key: 'moodboard', name: 'Mood board', does: 'Pin images and Pinterest boards for colours, outfits, decor, flowers, food and jewellery.', limit: 'Private to your account.' },
  { key: 'photowall', name: 'Photo wall', does: 'A private album of your photos, sorted into ceremony, reception, candid, family and couple.', limit: "You upload the photos; guests can't add to it." },
];

export const PLANNING_TOOLS_ACCESS =
  'The planning tools live in your dashboard, and only you can see them when you are logged in to your account.';
