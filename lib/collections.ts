/**
 * Community landing pages — /collections/<slug>.
 *
 * These exist because the filters on /templates are client-side state only, so
 * "hindu wedding invitation template" — a real query with real intent — had no
 * page to rank. Each entry becomes one indexable page targeting one such query.
 *
 * WHY COMMUNITY AND NOT OCCASION. An occasion axis was considered and rejected:
 * 8 of 10 live templates carry both Wedding and Engagement, so a
 * /collections/wedding-invitations would have been ~80% the same page as
 * /templates itself. Community is the only axis in this catalogue that yields
 * genuinely distinct sets, and near-duplicate landing pages are discounted.
 *
 * WHY THE PROSE MATTERS. A filtered grid with a swapped adjective is a doorway
 * page. `intro` and `notes` are written per community and must stay that way —
 * if they are ever generated from one shared sentence with the name substituted,
 * these pages stop helping and start hurting.
 *
 * They make claims about religious and cultural convention. Correct them here
 * rather than softening them: a vague page ranks for nothing, and a wrong one is
 * worse than no page at all.
 */
export interface Collection {
  /** URL segment: /collections/<slug>. Never change one that has been indexed. */
  slug: string;
  /** `community` value passed to /api/templates. */
  community: string;
  /** <h1>. Reads as the phrase someone would actually search for. */
  heading: string;
  /**
   * What a shop tile calls this tradition — two or three words. The heading is
   * written for a search engine and is too long to sit under a thumbnail.
   */
  short: string;
  /** <title>, kept short enough that Google does not truncate it. */
  title: string;
  /** Meta description, ~150-160 chars. */
  description: string;
  /** Opening paragraph. Unique per community. */
  intro: string;
  /** Specifics about invitations in this tradition. */
  notes: { heading: string; body: string }[];
}

export const COLLECTIONS: Collection[] = [
  {
    slug: 'hindu-wedding-invitations',
    community: 'hindu',
    heading: 'Hindu Wedding Invitation Templates',
    short: 'Hindu weddings',
    title: 'Hindu Wedding Invitation Templates Online',
    description:
      'Digital Hindu wedding invitations with every ceremony on one link — mehendi, haldi, sangeet and the wedding — plus live RSVP and WhatsApp sharing.',
    intro:
      'A Hindu wedding is rarely a single afternoon. It unfolds over days — mehendi, haldi, sangeet, the ceremony itself, then the reception — each with its own guests, its own venue and often its own dress code. A printed card struggles with that, which is why so many families end up sending a second card and then a flurry of corrections on WhatsApp. These designs carry every function on one link, so a guest can see exactly which events they are invited to and reply to each one separately.',
    notes: [
      {
        heading: 'Every function on one link',
        body: 'Each ceremony gets its own date, time, venue and map pin, and guests RSVP to each independently — so you know that eighty are coming to the sangeet and two hundred to the wedding, without running two guest lists.',
      },
      {
        heading: 'Traditional invocations, kept intact',
        body: 'Invitations in many families open with an invocation to Ganesha, and elders are named before the couple. Every text block is yours to write, so the wording your family uses is the wording that appears — nothing is fixed by the template.',
      },
      {
        heading: 'Changes after you have sent it',
        body: 'A muhurat shifts, a venue changes, a function is added. Because the invitation is a link rather than a printed card, editing it updates what every guest sees — no reprint, no correction message.',
      },
    ],
  },
  {
    slug: 'muslim-wedding-invitations',
    community: 'muslim',
    heading: 'Muslim Wedding & Nikah Invitation Templates',
    short: 'Muslim weddings & nikah',
    title: 'Muslim Nikah & Walima Invitation Templates',
    description:
      'Digital Nikah and Walima invitations with separate guest lists per event, live RSVP tracking and one WhatsApp-ready link for the whole celebration.',
    intro:
      'A Nikah and a Walima are two occasions, and they are frequently two guest lists — the Nikah more intimate, the Walima broader. Sending one card for both makes that awkward to express; sending two doubles the cost and the confusion. These designs let both sit on one link while each keeps its own guest list, so a guest invited to the Walima alone sees the Walima, and nobody has to be told which parts of the card apply to them.',
    notes: [
      {
        heading: 'Nikah and Walima, separately invited',
        body: 'Each event carries its own timing, venue and guest list, and guests reply to each one on its own. The result is an accurate headcount per event rather than a single number you then have to interpret.',
      },
      {
        heading: 'Your wording, including the Arabic',
        body: 'Invitations commonly open with the Bismillah and may name both families in a set order. All of that is free text, so the phrasing and the script are yours — the design does not impose a formula.',
      },
      {
        heading: 'Shared the way families actually share',
        body: 'The link previews as a proper card in a WhatsApp chat, so forwarding it through family groups looks intentional rather than like a pasted URL.',
      },
    ],
  },
  {
    slug: 'sikh-wedding-invitations',
    community: 'sikh',
    heading: 'Sikh Wedding Invitation Templates',
    short: 'Sikh weddings',
    title: 'Sikh & Anand Karaj Invitation Templates',
    description:
      'Digital Sikh wedding invitations covering the Anand Karaj, the functions around it and the reception on one link, with per-event RSVP and WhatsApp sharing.',
    intro:
      'An Anand Karaj takes place in the morning, in a gurdwara, and the celebration around it usually spans several days — a mehendi or ladies sangeet before, langar after, a reception later. Guests need to know not only where to be but when, because a ceremony that begins early leaves no room for a late arrival. These designs put each function on its own card within a single link, with the timing and venue attached to each.',
    notes: [
      {
        heading: 'Morning timings guests actually read',
        body: 'The Anand Karaj gets its own start time and map pin rather than being one line on a crowded card — the detail most likely to be missed is the one given its own space.',
      },
      {
        heading: 'Every function, one link',
        body: 'Mehendi, the ceremony, langar and the reception each carry their own details and their own RSVP, so langar numbers can be planned separately from reception seating.',
      },
      {
        heading: 'Written the way your family writes it',
        body: 'Invitations often open with a Sikh invocation and name elders before the couple. Every line is editable, so the form your family uses is preserved exactly.',
      },
    ],
  },
  {
    slug: 'modern-wedding-invitations',
    community: 'universal',
    heading: 'Modern & Non-Religious Wedding Invitations',
    short: 'Modern & non-religious',
    title: 'Modern Digital Wedding Invitation Templates',
    description:
      'Minimal, non-religious digital wedding invitations — clean typography, live RSVP, a photo gallery and one WhatsApp-ready link for every event.',
    intro:
      'Not every wedding wants ritual imagery on the invitation. Interfaith couples, civil ceremonies, destination weddings and couples who simply prefer restraint all need a card that carries the same information without committing to the iconography of one tradition. These designs lean on typography, space and photography instead — and because nothing in them is tradition-specific, they adapt to a ceremony of any shape.',
    notes: [
      {
        heading: 'Nothing assumed about your ceremony',
        body: 'No fixed ritual imagery and no prescribed running order. Name the events whatever you call them and arrange them in whatever sequence your day actually follows.',
      },
      {
        heading: 'Built for guests who travel',
        body: 'Destination and interfaith weddings usually mean guests arriving from several places. Each event carries a map pin and its own RSVP, so travel plans and headcounts stay legible.',
      },
      {
        heading: 'Photography as the design',
        body: 'With less ornament doing the work, your own photographs carry the invitation — a gallery inside it, and a preview image that appears when the link is shared.',
      },
    ],
  },
];

export function collectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find(c => c.slug === slug);
}
