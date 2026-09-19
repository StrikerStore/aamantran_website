import { CONTACT_EMAIL, WHATSAPP_NUMBER } from '../seo';

/**
 * Commercial claims the site makes, each written once.
 *
 * `ownerConfirmed: false` marks a figure that appears on the site today but has
 * not been confirmed by the business. Pages built in the revamp use only
 * confirmed claims, except where noted, so the business can confirm or correct
 * a figure by editing one line here.
 *
 * Figures the site can read from data, such as the number of designs or the
 * average rating, never belong here: they come from /api/templates/stats and
 * genuine customer reviews.
 */

export interface Claim<T> {
  value: T;
  ownerConfirmed: boolean;
  /** Where the figure comes from, or why it is unconfirmed. */
  note: string;
}

/** Published support details. Hours match the contact page. */
export const SUPPORT = {
  email: CONTACT_EMAIL,
  whatsappLabel: WHATSAPP_NUMBER.replace(/-/g, ' '),
  whatsappHref: `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`,
  hours: 'Mon–Sat, 9 AM–9 PM IST',
};

export const SUPPORT_RESPONSE_TIME: Claim<string> = {
  value: 'within a few hours during support hours',
  ownerConfirmed: false,
  note: 'The contact page says 2–4 hours; the dashboard guide says one business day.',
};

/**
 * How long building an invitation takes.
 *
 * Confirmed by the business, so it is stated as fact — but the sentences around
 * it keep their qualifiers ("most couples", "once their details are ready"),
 * because it is a typical time and not a promise. Change the figure here and it
 * changes everywhere it is quoted; nothing else on the site may state a setup
 * time of its own (see the `setup-time` rule in forbiddenClaims.ts).
 */
export const SETUP_TIME: Claim<{ minutes: number; phrase: string }> = {
  value: { minutes: 15, phrase: 'about 15 minutes' },
  ownerConfirmed: true,
  note: 'Confirmed by the owner on 2026-09-20: most couples build their invitation in about 15 minutes.',
};

export const MARKETING_STATS: Claim<{ figure: string; label: string }>[] = [
  {
    value: { figure: '500+', label: 'Couples served' },
    ownerConfirmed: false,
    note: 'From the About page; the site has no data to check it against.',
  },
];

/** Stats safe to publish: only those the business has confirmed. */
export function publishableStats(): { figure: string; label: string }[] {
  return MARKETING_STATS.filter((stat) => stat.ownerConfirmed).map((stat) => stat.value);
}
