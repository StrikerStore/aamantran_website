import { STOREFRONT, type Storefront } from '../storefront';
import { SETUP_TIME } from './claims';
import { ACCESS, PARTIAL_INVITE } from './entitlements';
import { TRY_DEMO } from './tryDemo';

/**
 * Every FAQ answer on the site, in plain text so it serves the page, the
 * FAQPage JSON-LD and llms.txt alike. Answers describe what the product does
 * today; see lib/content/entitlements.ts for the rules they rest on.
 *
 * `id` is stable: pages pick questions by id, so reword freely but never reuse
 * an id for a different question.
 */

export interface Faq {
  id: string;
  q: string;
  a: string;
  /** Shown after the answer. */
  link?: { href: string; label: string };
  /** Limits a question to one storefront, e.g. GST to India. */
  storefront?: Storefront;
}

export interface FaqCategory {
  id: string;
  title: string;
  faqs: Faq[];
}

const ALL_CATEGORIES: FaqCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    faqs: [
      {
        id: 'how-to-order',
        q: 'How do I place an order?',
        a: 'Choose a design on the invitations page and pay once. After payment you create your account and build the invitation yourself in your dashboard, adding names, venues, ceremonies, photos and music step by step. Publish it and your link is live. Aamantran is digital only: nothing is printed or shipped.',
        link: { href: '/templates', label: 'Browse invitations' },
      },
      {
        id: 'do-you-build-it',
        q: 'Do you set up the invitation for me?',
        a: "No, you build it yourself. The guided builder takes you through each step, and our support team is there if you get stuck, but we don't fill in or design the invitation for you.",
        link: { href: '/contact', label: 'Contact support' },
      },
      {
        id: 'how-long',
        q: 'How long does setup take?',
        a: `Your invitation is live as soon as you publish it. How long it takes to get there depends on how much you add; most couples need ${SETUP_TIME.value.phrase} once their details are ready.`,
      },
      {
        id: 'whats-needed',
        q: 'What do I need to have ready?',
        a: "What you'll need to enter in the builder: the names to appear on the invitation, each venue's name and address (a Google Maps link fills in the location), each ceremony's date and time, and any photos, video or music you'd like to include.",
      },
      {
        id: 'sample',
        q: 'Can I see a design before I buy?',
        a: 'Yes. Every design has a live demo on its page, so you can open it the way your guests will before you buy.',
        link: { href: '/templates', label: 'See the designs' },
      },
      {
        id: 'try-with-names',
        q: 'Can I see a design with our own names before buying?',
        a: `Yes, on any design with a "${TRY_DEMO.cta}" button, whatever the occasion. Enter the names the design asks for, the date, the venue and the events, and you see that design filled in with them — free, with no account and no email address. The preview is watermarked, RSVPs and wishes on it don't send anything, and the link works for ${TRY_DEMO.linkMinutes} minutes. If you buy that design within a day, your new invitation starts with those details for you to check, without the watermark; otherwise what you typed is deleted about a day later.`,
        link: { href: '/privacy', label: 'How we handle preview details' },
      },
    ],
  },
  {
    id: 'design',
    title: 'Design & customisation',
    faqs: [
      {
        id: 'choose-design',
        q: 'Can I choose any design?',
        a: "Yes. Browse the gallery, open any design's live demo, and buy the one you like. You then add your own names, dates, venues and ceremonies to it.",
      },
      {
        id: 'own-fonts',
        q: 'Can I use my own fonts or colours?',
        a: "No. Each design's layout, fonts and colours are fixed, and you fill in the content. If you want a different look, pick the design that has it; every one has a live demo.",
      },
      {
        id: 'photos',
        q: 'Can I add my own photos?',
        a: 'Yes, in the designs that have space for them. You upload photos yourself in the Photos & Music step, and designs differ in how many they take.',
      },
      {
        id: 'music',
        q: 'Can I add background music?',
        a: 'Yes, if the design includes music. Upload your own track in the Photos & Music step, or pick one from our library of licensed tracks.',
      },
      {
        id: 'can-i-edit',
        q: 'Can I make changes after the invitation goes live?',
        a: 'Most details, yes. Venues, ceremony dates and times, photos, music and other details can be edited from your dashboard at any time, and the live invitation updates straight away on the same link. Names are the exception: they lock once you confirm them at the first step, and a correction after that goes through a support ticket.',
      },
      {
        id: 'languages',
        q: 'Can the invitation be in Hindi or another language?',
        a: "Each design supports particular languages, listed on its page, and you choose one in the Language step. Your own text, such as names, venues and messages, appears exactly as you type it; Aamantran doesn't translate it.",
      },
    ],
  },
  {
    id: 'sharing',
    title: 'Sharing & RSVP',
    faqs: [
      {
        id: 'how-rsvp',
        q: 'How do guests RSVP?',
        a: "Guests open your link in their browser and tap RSVP. They tick the ceremonies they'll attend and can add plus-ones, a meal preference and a message. Responses appear in your dashboard straight away, with a headcount for each ceremony. You can switch RSVP off in the builder if you don't need it.",
      },
      {
        id: 'whatsapp',
        q: 'How do I share the invitation on WhatsApp?',
        a: 'Your invitation has its own link, and it shows a preview card when shared in WhatsApp. The Share page in your dashboard opens WhatsApp with a message ready to send, including your names, dates and link, and you can copy the link to share anywhere else.',
      },
      {
        id: 'partial-invite',
        q: 'Can I invite some guests to only some ceremonies?',
        a: `Yes. ${PARTIAL_INVITE.long} Guests who open that link see, and RSVP to, only those ceremonies.`,
      },
      {
        id: 'no-app',
        q: 'Do guests need to download an app?',
        a: 'No. Your invitation is a web link that opens in any browser, with no downloads or sign-ups for your guests.',
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing & payment',
    faqs: [
      {
        id: 'physical',
        q: 'Will I receive printed invitations or any physical product?',
        a: 'No. Aamantran is a digital service only. You receive an online invitation that you share by link, for example on WhatsApp. No printed cards, envelopes or other physical items are produced or delivered.',
      },
      {
        id: 'recurring',
        q: 'Are there any recurring charges?',
        a: `No. You pay once per invitation, with no subscription or renewal. Your invitation stays live until ${ACCESS.liveMonthsAfterLastCeremony} months after your last ceremony.`,
      },
      {
        id: 'gst',
        q: 'Is GST included in the price?',
        a: 'GST is added to the design price at checkout, and you see the full total, GST included, before you pay.',
        storefront: 'IN',
      },
      {
        id: 'currency',
        q: 'Which currency do you charge in?',
        a: 'Prices are in US dollars, and that is the amount you pay. No GST is added to international orders.',
        storefront: 'INTL',
      },
      {
        id: 'payment-methods',
        q: 'What payment methods do you accept?',
        a: 'UPI, credit and debit cards, and net banking, through our secure payment partner PayU.',
        storefront: 'IN',
      },
      {
        id: 'payment-methods-intl',
        q: 'How do I pay?',
        a: 'Payments are processed securely in US dollars by our payment partner PayU.',
        storefront: 'INTL',
      },
      {
        id: 'switch-design',
        q: 'Can I switch to a different design after buying?',
        a: 'Contact support and our team can move your invitation to another design. If the new design costs more, you pay the difference.',
        link: { href: '/contact', label: 'Contact support' },
      },
      {
        id: 'refunds',
        q: 'Can I get a refund?',
        a: 'Our refund policy sets out when a refund is available and how to ask for one.',
        link: { href: '/refund', label: 'Read the refund policy' },
      },
    ],
  },
  {
    id: 'technical',
    title: 'Technical & hosting',
    faqs: [
      {
        id: 'how-long-live',
        q: 'How long will my invitation stay live?',
        a: ACCESS.long,
      },
      {
        id: 'postponed',
        q: 'What if my event is postponed?',
        a: 'Change the ceremony dates in your dashboard. The update goes live straight away on the same link, your guest list and RSVPs are kept, and the date your invitation stays live until moves with the new dates.',
      },
      {
        id: 'devices',
        q: 'Does the invitation work on all devices?',
        a: 'Yes. Invitations work on phones, tablets and computers, on Android, iOS, Windows and Mac.',
      },
      {
        id: 'data-safe',
        q: 'Is my guest data safe?',
        a: `Your guest data belongs to you, and we never share, sell or use it for marketing. ${ACCESS.dataRetention}`,
        link: { href: '/privacy', label: 'Read our Privacy Policy' },
      },
    ],
  },
];

/** The FAQ for this storefront, with questions for the other storefront removed. */
export const FAQ_CATEGORIES: FaqCategory[] = ALL_CATEGORIES.map((category) => ({
  ...category,
  faqs: category.faqs.filter((faq) => !faq.storefront || faq.storefront === STOREFRONT),
})).filter((category) => category.faqs.length > 0);

/** Every question on both storefronts, for checks that must see all copy. */
export const ALL_FAQS: Faq[] = ALL_CATEGORIES.flatMap((category) => category.faqs);

/** The buying questions shown near purchase decisions (home, product page). */
export const PURCHASE_FAQ_IDS = ['do-you-build-it', 'how-long', 'can-i-edit', 'how-long-live', 'recurring', 'partial-invite'] as const;

/** Questions by id, in the order given, skipping any not on this storefront. */
export function faqsByIds(ids: readonly string[]): Faq[] {
  const byId = new Map(FAQ_CATEGORIES.flatMap((category) => category.faqs).map((faq) => [faq.id, faq]));
  return ids.map((id) => byId.get(id)).filter((faq): faq is Faq => faq !== undefined);
}
