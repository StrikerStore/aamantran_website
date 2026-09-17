/**
 * Editorial content for occasion landing pages, one per thing people actually
 * shop for.
 *
 * A page here is only a candidate. It is published when the catalogue can
 * support it — see lib/occasionPages.ts for the rule — so writing an entry
 * costs nothing while there are no designs for it, and the page appears by
 * itself once there are.
 *
 * WHY WEDDING IS A CANDIDATE AND NOT A GUARANTEE. Most designs in this
 * catalogue are wedding designs, so a wedding page would be a near-copy of
 * /templates, which already targets that search. The inventory rule keeps it
 * unpublished until the catalogue is broad enough that a wedding page is a
 * genuine subset rather than the whole shop.
 *
 * WHY THE PROSE MATTERS. A filtered grid with a swapped adjective is a doorway
 * page. Every field below is written per occasion and must stay that way.
 */

export interface WordingExample {
  label: string;
  text: string;
}

export interface OccasionPage {
  /** URL segment. Never change one that has been indexed. */
  slug: string;
  /** Occasion keys from lib/occasions.ts whose designs belong here. */
  occasionKeys: string[];
  /** <h1>. */
  heading: string;
  /** <title>, short enough not to be truncated. */
  title: string;
  /** Meta description, ~150-160 characters. */
  description: string;
  /** Opening paragraph. Unique per occasion. */
  intro: string;
  /** What to have ready before opening the builder. */
  prepare: string[];
  /** Wording a family can adapt. Not printed on the design; it is theirs to type. */
  wording: WordingExample[];
  /** Specifics about invitations for this occasion. */
  notes: { heading: string; body: string }[];
  /** Question ids from lib/content/faqs.ts. */
  faqIds: string[];
}

export const OCCASION_PAGES: readonly OccasionPage[] = [
  {
    slug: 'engagement-invitations',
    occasionKeys: ['engagement'],
    heading: 'Engagement Invitation Templates',
    title: 'Engagement & Roka Invitation Templates Online',
    description:
      'Digital engagement, roka and sagai invitations you can send the day the date is set, with live RSVP, venue directions and WhatsApp sharing.',
    intro:
      'An engagement is usually the first evening both families sit together as one guest list, and it is often arranged in a fortnight: a date is fixed, a hall is held, and the invitation has to go out that week. A link is quicker than a card and easier to correct — send it the day you decide, and if the hall or the hour changes, everyone who has it sees the change. These designs are built for one evening rather than a week of ceremonies, so the three things a guest needs, where, when and who to tell, sit on a single screen.',
    prepare: [
      'The names as they should appear on the invitation, including how the families are named. You confirm these at the first step and they lock afterwards.',
      'The date and the time guests should arrive, which is often earlier than the ring ceremony itself.',
      'The venue name and address, or a Google Maps link, which fills in the location for you.',
      'Any photos you would like inside, if the design you choose has space for them.',
    ],
    wording: [
      {
        label: 'Both families inviting',
        text: 'Mr & Mrs Sharma, together with Mr & Mrs Verma, request the pleasure of your company at the engagement ceremony of Ananya and Rohan.',
      },
      {
        label: 'The couple inviting',
        text: 'We are getting engaged, and we would love you there. Join Ananya and Rohan for an evening of dinner and dancing.',
      },
      {
        label: 'Roka or sagai',
        text: 'With the blessings of our elders, we invite you to the roka ceremony of Ananya and Rohan, followed by lunch.',
      },
    ],
    notes: [
      {
        heading: 'One evening, one screen',
        body: 'An engagement rarely needs a week of separate cards. The arrival time, the venue, the dress code if there is one, and the RSVP all sit together, so nobody has to scroll for the part that matters to them.',
      },
      {
        heading: 'Roka, sagai or engagement — your wording',
        body: 'Families name this evening differently, and some open with an invocation or name elders before the couple. Every line of text is yours to type, so the form your family uses is the form that appears.',
      },
      {
        heading: 'Numbers before the caterer asks',
        body: 'Guests reply on the invitation itself, and your dashboard shows the count as replies arrive, with each guest’s name. For a single evening that is usually the only number you need.',
      },
      {
        heading: 'Change it after you have sent it',
        body: 'Engagement details move more often than wedding ones. Edit the venue, the time or the photographs from your dashboard and the same link shows the new version — no second message correcting the first.',
      },
    ],
    faqIds: ['do-you-build-it', 'how-rsvp', 'can-i-edit', 'how-long-live'],
  },
  {
    slug: 'wedding-invitations',
    occasionKeys: ['wedding'],
    heading: 'Wedding Invitation Templates',
    title: 'Digital Wedding Invitation Templates Online',
    description:
      'Digital wedding invitations with every ceremony on one link, RSVP per ceremony, venue maps and WhatsApp sharing. One payment, no subscription.',
    intro:
      'An Indian wedding is rarely one afternoon. Haldi, mehendi, sangeet, the ceremony and the reception each have their own hour, their own venue and often their own guest list, which is more than a printed card can carry without a second card and a flurry of corrections afterwards. These designs hold every function on one link, so a guest can see exactly which events they are invited to and reply to each one separately.',
    prepare: [
      'The names to appear on the invitation, including both families. They lock once you confirm them at the first step.',
      'Each ceremony with its date, start time and venue, including the ones on the same day.',
      'Addresses or Google Maps links for each venue, so guests get directions in one tap.',
      'Photographs and, if the design supports it, the music you would like playing.',
    ],
    wording: [
      {
        label: 'Families inviting',
        text: 'Mr & Mrs Sharma request the honour of your presence at the wedding of their daughter Ananya to Rohan, son of Mr & Mrs Verma.',
      },
      {
        label: 'The couple inviting',
        text: 'Ananya and Rohan invite you to celebrate their wedding, with the blessings of their families.',
      },
      {
        label: 'Naming the ceremonies',
        text: 'Haldi at home on the 12th, sangeet that evening, and the wedding at the Palace Courtyard on the 14th. Details for each are inside.',
      },
    ],
    notes: [
      {
        heading: 'Every function on one link',
        body: 'Each ceremony carries its own date, time, venue and map pin, and guests reply to each independently — so you know eighty are coming to the sangeet and two hundred to the wedding, without running two guest lists.',
      },
      {
        heading: 'A second link for a shorter guest list',
        body: 'When some guests are invited to the reception but not the wedding, you can publish a second link showing only those ceremonies. It is included, and you set it up yourself when you publish.',
      },
      {
        heading: 'Dates move; the link does not',
        body: 'If a muhurat shifts or a venue changes, edit it in your dashboard and every guest holding the link sees the new details. Your invitation stays live until six months after your last ceremony.',
      },
    ],
    faqIds: ['partial-invite', 'how-rsvp', 'can-i-edit', 'postponed'],
  },
  {
    slug: 'anniversary-invitations',
    occasionKeys: ['anniversary'],
    heading: 'Anniversary Invitation Templates',
    title: 'Wedding Anniversary Invitation Templates',
    description:
      'Digital anniversary invitations for 25th, 50th and every year in between — live RSVP, venue directions and one link to share on WhatsApp.',
    intro:
      'Anniversary parties are usually arranged by somebody other than the couple: children hosting their parents, a family marking twenty-five or fifty years together. That changes who the invitation comes from and who guests reply to, and it often means inviting people who have known the couple for decades and are not on any recent guest list. A link can be forwarded through a family group and still look like an invitation rather than a message.',
    prepare: [
      'The names of the couple, and whose invitation it is — the couple’s own, or their family’s.',
      'The date, the time and the venue, with a Google Maps link if guests are travelling.',
      'Photographs worth showing, which for an anniversary often means older ones.',
      'Who guests should contact, if the couple are not the ones taking calls.',
    ],
    wording: [
      {
        label: 'Children hosting',
        text: 'We invite you to celebrate the 50th wedding anniversary of our parents, Meera and Suresh Sharma, with dinner and music.',
      },
      {
        label: 'The couple hosting',
        text: 'Twenty-five years ago you watched us marry. Join us for an evening of dinner and old photographs.',
      },
      {
        label: 'A quiet gathering',
        text: 'A small lunch to mark forty years together. No gifts, only your company.',
      },
    ],
    notes: [
      {
        heading: 'The invitation comes from the hosts',
        body: 'Every line is yours to write, so the invitation can come from the children, the couple, or the whole family, and the names appear exactly as your family words them.',
      },
      {
        heading: 'Guests who are not in your phone',
        body: 'Old friends and distant relatives are hard to reach by group message. One link works wherever you send it, opens in any browser, and needs no app or sign-up from your guests.',
      },
      {
        heading: 'A headcount for the caterer',
        body: 'Guests reply on the invitation, and your dashboard keeps the running count with names, so the number you give the caterer is the number who said yes.',
      },
    ],
    faqIds: ['do-you-build-it', 'how-rsvp', 'recurring', 'how-long-live'],
  },
  {
    slug: 'birthday-invitations',
    occasionKeys: ['birthday'],
    heading: 'Birthday Invitation Templates',
    title: 'Birthday & First Birthday Invitation Templates',
    description:
      'Digital birthday invitations for first birthdays and milestone years, with live RSVP, venue directions and one WhatsApp-ready link.',
    intro:
      'A birthday invitation has a shorter life than a wedding one: it goes out a fortnight before, the replies matter for the cake and the chairs, and after the day it is a keepsake rather than a document. First birthdays and milestone years are the ones families treat as an event in their own right, and both usually mean a mix of relatives and a parents’ WhatsApp group, which is exactly the kind of list a link travels through easily.',
    prepare: [
      'Whose birthday it is and how their name should appear.',
      'The date, the start time and the time it ends, which parents will look for.',
      'The venue with a Google Maps link, and a note if parking or entry needs explaining.',
      'A photograph or two, if the design has space for them.',
    ],
    wording: [
      {
        label: 'First birthday',
        text: 'Aarav turns one. Join us for cake, lunch and a very short attention span.',
      },
      {
        label: 'Milestone birthday',
        text: 'Meera is turning sixty, and her family would love you there for dinner.',
      },
      {
        label: 'Children’s party',
        text: 'Ishaan is turning five. Drop-off at four, pick-up at seven, cake somewhere in between.',
      },
    ],
    notes: [
      {
        heading: 'Start and end times, in writing',
        body: 'For a children’s party the end time is as useful as the start. Each event carries its own timing, so both are on the invitation rather than in a follow-up message.',
      },
      {
        heading: 'Replies you can count',
        body: 'Guests reply on the invitation and your dashboard shows the total, so the cake and the chairs are ordered against a real number.',
      },
      {
        heading: 'Shared the way parents share',
        body: 'The link previews as a proper card in a WhatsApp chat, so forwarding it through a class or family group looks intentional rather than like a pasted address.',
      },
    ],
    faqIds: ['do-you-build-it', 'how-rsvp', 'no-app', 'recurring'],
  },
  {
    slug: 'griha-pravesh-invitations',
    occasionKeys: ['griha-pravesh', 'house-warming'],
    heading: 'Griha Pravesh & House Warming Invitation Templates',
    title: 'Griha Pravesh Invitation Templates Online',
    description:
      'Digital griha pravesh and house warming invitations with the puja muhurat, directions to a new address and live RSVP on one link.',
    intro:
      'A griha pravesh is fixed to a muhurat, which means the hour matters more than it does at most gatherings, and the address is one nobody has been to before. Those two facts decide what the invitation has to do: state the time the puja begins, and get people to a new door without a phone call. A link carries both, and the map pin is the part guests will actually use on the morning.',
    prepare: [
      'The names of the family inviting, as they should appear.',
      'The muhurat time for the puja, and the time guests should arrive if it differs.',
      'The new address, with a Google Maps link — this is the detail guests lean on most.',
      'Whether lunch or dinner follows, so guests know how long to stay.',
    ],
    wording: [
      {
        label: 'Traditional',
        text: 'With the blessings of Lord Ganesha, we invite you to the griha pravesh of our new home, followed by lunch.',
      },
      {
        label: 'House warming',
        text: 'We have moved. Come and see the new place, and stay for dinner.',
      },
      {
        label: 'Puja and lunch',
        text: 'The puja begins at 9:15 in the morning. Please join us from 9:00, with lunch to follow at noon.',
      },
    ],
    notes: [
      {
        heading: 'The muhurat, stated plainly',
        body: 'A ceremony that starts on a fixed minute leaves no room for a late arrival, so the timing gets its own line rather than being buried in a paragraph.',
      },
      {
        heading: 'Directions to an address nobody knows',
        body: 'Paste a Google Maps link when you set up the invitation and guests get one-tap directions to the new house, which matters more here than at a familiar hall.',
      },
      {
        heading: 'A count for the kitchen',
        body: 'Lunch after a griha pravesh is usually cooked at home or catered to a rough number. Replies arrive on the invitation and your dashboard keeps the running total.',
      },
    ],
    faqIds: ['do-you-build-it', 'how-rsvp', 'can-i-edit', 'recurring'],
  },
];
