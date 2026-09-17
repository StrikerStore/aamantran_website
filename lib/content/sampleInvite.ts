/**
 * The made-up invitation behind the homepage guest demo. Everything here is
 * fictional, and pages must label it as a sample.
 *
 * Dates are offsets from the wedding day, so the sample never shows a date in
 * the past. Build real dates with sampleWeddingDate and ceremonyDate.
 */

export const SAMPLE_NOTICE = 'Sample invitation. The names and venues are made up.';

/**
 * Where each ceremony usually falls relative to the wedding day. Also the
 * default spacing when a visitor picks ceremonies for a personal demo.
 */
export const DEFAULT_CEREMONY_OFFSETS: Record<string, number> = {
  Haldi: -2,
  Mehendi: -1,
  Sangeet: -1,
  Wedding: 0,
  Reception: 1,
};

export interface SampleCeremony {
  id: string;
  name: string;
  /** Days from the wedding day. */
  dayOffset: number;
  time: string;
  venue: string;
  dressCode: string;
}

export const SAMPLE_CEREMONIES: readonly SampleCeremony[] = [
  { id: 'haldi', name: 'Haldi', dayOffset: DEFAULT_CEREMONY_OFFSETS.Haldi, time: '10:00 AM', venue: 'The family home, Jaipur', dressCode: 'Shades of yellow' },
  { id: 'mehendi', name: 'Mehendi', dayOffset: DEFAULT_CEREMONY_OFFSETS.Mehendi, time: '4:00 PM', venue: 'The family home, Jaipur', dressCode: 'Greens and pinks' },
  { id: 'sangeet', name: 'Sangeet', dayOffset: DEFAULT_CEREMONY_OFFSETS.Sangeet, time: '7:30 PM', venue: 'Garden lawns, Jaipur', dressCode: 'Indo-western' },
  { id: 'wedding', name: 'Wedding', dayOffset: DEFAULT_CEREMONY_OFFSETS.Wedding, time: '7:00 PM', venue: 'Palace courtyard, Jaipur', dressCode: 'Traditional' },
  { id: 'reception', name: 'Reception', dayOffset: DEFAULT_CEREMONY_OFFSETS.Reception, time: '8:00 PM', venue: 'Banquet hall, Jaipur', dressCode: 'Formal' },
];

export const SAMPLE_INVITE = {
  couple: { first: 'Ananya', second: 'Rohan' },
  city: 'Jaipur',
  /** Ceremonies on the sample's second link, to explain partial invites. */
  partialCeremonyIds: ['wedding', 'reception'],
  mealOptions: ['Vegetarian', 'Non-vegetarian', 'Jain'],
  wishes: [
    { name: 'Meera', text: 'So happy for you both. See you at the sangeet!' },
    { name: 'Kabir', text: 'Wishing you a lifetime of laughter together.' },
    { name: 'Nani', text: 'Blessings to the two of you, always.' },
  ],
} as const;

/** How far ahead the sample wedding sits. */
export const SAMPLE_WEDDING_DAYS_AHEAD = 120;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight UTC, `SAMPLE_WEDDING_DAYS_AHEAD` days after `now`. */
export function sampleWeddingDate(now: Date = new Date()): Date {
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return new Date(midnight + SAMPLE_WEDDING_DAYS_AHEAD * DAY_MS);
}

export function ceremonyDate(ceremony: Pick<SampleCeremony, 'dayOffset'>, weddingDate: Date): Date {
  return new Date(weddingDate.getTime() + ceremony.dayOffset * DAY_MS);
}
