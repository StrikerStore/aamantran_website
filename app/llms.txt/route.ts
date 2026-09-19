import { getCatalogueStats, getFeaturedReviews, getTemplates } from '@/lib/api/templates';
import { ACCESS, NAME_FREEZE, PARTIAL_INVITE, PLANNING_TOOLS, SELF_BUILD } from '@/lib/content/entitlements';
import { SUPPORT } from '@/lib/content/claims';
import { FAQ_CATEGORIES } from '@/lib/content/faqs';
import { COLLECTIONS } from '@/lib/collections';
import { indexableOccasionPages } from '@/lib/occasionPages';
import { SITE_URL } from '@/lib/seo';
import { getStartingPrice } from '@/lib/startingPrice';
import { IS_INTL } from '@/lib/storefront';

/**
 * /llms.txt — what Aamantran is, for language models and anyone reading the
 * plain-text version of the site.
 *
 * Generated rather than kept as a file in public/, so the figures in it come
 * from the same places the pages use: the catalogue for the number of designs
 * and the cheapest price, lib/content for the terms, and the same rules that
 * decide whether /stories and each occasion page exist. A hand-written copy
 * went stale the moment a design was added or a price moved.
 */

export const revalidate = 3600;

/** Matches MIN_REVIEWS_TO_INDEX on /stories: below this the page is noindex. */
const MIN_REVIEWS_FOR_STORIES = 3;

const url = (path: string) => `${SITE_URL}${path}`;

/** Questions actually shown on this storefront, not both. */
const FAQ_COUNT = FAQ_CATEGORIES.reduce((total, category) => total + category.faqs.length, 0);

export async function GET(): Promise<Response> {
  const [stats, catalogue, reviews, startingPrice] = await Promise.all([
    getCatalogueStats(),
    getTemplates({ limit: 100, sort: 'new' }),
    getFeaturedReviews(1),
    getStartingPrice(),
  ]);

  const templates = catalogue?.templates ?? [];
  const designCount = stats?.total ?? templates.length;
  const designs = designCount > 0 ? `${designCount} invites` : 'Every invite';
  const occasions = indexableOccasionPages(templates);
  const storiesWorthListing = (reviews?.totalCount ?? 0) >= MIN_REVIEWS_FOR_STORIES;
  const price = IS_INTL
    ? `Prices start at ${startingPrice} per invite, charged in US dollars.`
    : `Prices start at ${startingPrice} per invite.`;

  const lines: string[] = [
    '# Aamantran',
    '',
    `> Aamantran is a digital wedding invitation service. Couples choose an invite, pay once with no subscription, and fill in their own names, ceremonies, venues, photos and music in a guided builder. The finished invitation is a link they share on WhatsApp. Depending on the design it can include RSVP for each ceremony, a photo gallery, background music, Google Maps venue pins and a countdown. Guests need no app. ${price}`,
    '',
    `Aamantran means "invitation" in Sanskrit. The service is digital only: no printed cards are produced or shipped. ${SELF_BUILD.long} ${NAME_FREEZE.long} ${ACCESS.long} ${ACCESS.dataRetention} ${PARTIAL_INVITE.long} Operated by PLEXZUU; support on WhatsApp ${SUPPORT.whatsappLabel} or ${SUPPORT.email} (${SUPPORT.hours}).`,
    '',
    '## Key pages',
    '',
    `- [Home](${url('/')}): The invites on display, the occasions they are grouped by, the traditions they are written for, what an invite costs and what comes with it.`,
    `- [Invitations](${url('/templates')}): ${designs}, filterable by occasion, community and price, each with a live demo, its price and its reviews.`,
    `- [Pricing](${url('/pricing')}): One payment per invitation, how the total is made up, what it covers, and the terms.`,
    `- [How it works](${url('/how-it-works')}): The steps from choosing an invite to sharing the link, including the builder steps and the name lock.`,
    `- [What's included](${url('/features')}): What comes with any invite, what depends on the invite, and what can be changed after the invitation is live.`,
    `- [Planning tools](${url('/wedding-planning-tools')}): The ${PLANNING_TOOLS.length} tools in the dashboard — ${PLANNING_TOOLS.map((tool) => tool.name.toLowerCase()).join(', ')} — with what each does and does not do, and a working demo of the budget and tasks.`,
    `- [Help centre](${url('/faq')}): ${FAQ_COUNT} answered questions on ordering, building, RSVPs, WhatsApp sharing, pricing${IS_INTL ? '' : ', GST'} and data privacy.`,
  ];

  if (storiesWorthListing) {
    lines.push(`- [Stories](${url('/stories')}): Reviews written by couples who bought an invitation; notes written by the Aamantran team are labelled and never counted in ratings.`);
  }
  lines.push(
    `- [About](${url('/about')}): Why Aamantran exists and what it holds to.`,
    `- [Contact](${url('/contact')}): WhatsApp, email and a contact form. Weddings in the next few days get priority support, though couples still build the invitation themselves.`,
  );

  if (occasions.length > 0) {
    lines.push('', '## By occasion', '');
    for (const { page, templates: matching } of occasions) {
      const count = matching.length;
      lines.push(`- [${page.heading}](${url(`/${page.slug}`)}): ${count} ${count === 1 ? 'invite' : 'invites'}. ${page.intro}`);
    }
  }

  lines.push('', '## By tradition', '');
  for (const collection of COLLECTIONS) {
    lines.push(`- [${collection.heading}](${url(`/collections/${collection.slug}`)}): ${collection.description}`);
  }

  lines.push(
    '',
    '## Policies',
    '',
    `- [Refund Policy](${url('/refund')})`,
    `- [Privacy Policy](${url('/privacy')})`,
    `- [Terms of Service](${url('/terms')})`,
    '',
  );

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
