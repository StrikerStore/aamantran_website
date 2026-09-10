/**
 * The occasions a customer shops by, shown as tiles above the homepage carousel.
 *
 * This is a CURATED ALLOWLIST, not a list of every `bestFor` value in the
 * catalogue, and that is the whole point of the file. Templates are tagged with
 * ceremonies as well as occasions — Reception, Haldi, Mehendi, Sangeet, Nikah —
 * and those are parts OF a wedding, not separate things anyone shops for. As
 * tiles they would split one event across five buttons and leave the customer
 * guessing which held the design they wanted. Excluding them hides nothing:
 * every template tagged Haldi or Mehendi also carries Wedding, so it appears
 * under the Wedding tile, which is where someone planning a wedding looks.
 *
 * Order here is display order. It never comes from how many templates match, so
 * the tiles do not reshuffle under the customer as the catalogue grows.
 *
 * Adding an occasion means adding an entry here. Nothing else — the tiles are
 * derived from live template data, so a new occasion appears by itself once a
 * template is tagged with it, and stays invisible until then.
 */
export interface Occasion {
  /** Stable identifier used in component state and CSS class names. */
  key: string;
  /** What the tile reads. Safe to reword; the key is what code depends on. */
  label: string;
  /**
   * Extra spellings that mean this occasion.
   *
   * `bestFor` is free text an admin types, so it drifts: "Housewarming" as one
   * word, "Anniversery" misspelled, "Griha Pravesh" with or without the space.
   * Without aliases a single typo silently drops a whole tile — and because the
   * row hides itself below a threshold, that failure looks exactly like
   * "the feature isn't ready yet" rather than like a bug. The label's own
   * normalised form is always matched and does not need repeating here.
   */
  aliases?: string[];
}

export const OCCASIONS: Occasion[] = [
  { key: 'wedding',       label: 'Wedding',       aliases: ['weddings', 'shaadi', 'shadi'] },
  { key: 'engagement',    label: 'Engagement',    aliases: ['engagements', 'roka', 'sagai'] },
  { key: 'griha-pravesh', label: 'Griha Pravesh', aliases: ['grihapravesh', 'grah pravesh', 'grahpravesh', 'griha pravesh puja'] },
  { key: 'birthday',      label: 'Birthday',      aliases: ['birthdays', 'birthday party'] },
  { key: 'baby-shower',   label: 'Baby Shower',   aliases: ['babyshower', 'godh bharai', 'godbharai'] },
  { key: 'house-warming', label: 'House Warming', aliases: ['housewarming', 'house-warming'] },
  { key: 'anniversary',   label: 'Anniversary',   aliases: ['anniversery', 'anniversaries', 'wedding anniversary'] },
  { key: 'retirement',    label: 'Retirement',    aliases: ['retirement party', 'farewell'] },
];

/**
 * How many occasions must have at least one live template before the tile row
 * appears at all.
 *
 * Two tiles over a catalogue where almost every template carries both tags is
 * worse than none — the buttons would look broken. Three is the point where the
 * row starts doing real work. Change this one number to move the threshold; it
 * is deliberately not inlined into the component.
 */
export const MIN_OCCASION_TILES = 3;

/**
 * Lowercase, strip punctuation, collapse whitespace — so "Griha-Pravesh",
 * "griha pravesh" and "Griha  Pravesh" all land on the same string.
 */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Built once: every normalised spelling → the occasion key it belongs to. */
const KEY_BY_SPELLING: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const occ of OCCASIONS) {
    map.set(normalize(occ.label), occ.key);
    map.set(normalize(occ.key), occ.key);
    for (const alias of occ.aliases ?? []) map.set(normalize(alias), occ.key);
  }
  return map;
})();

export const OCCASION_BY_KEY: Map<string, Occasion> =
  new Map(OCCASIONS.map(o => [o.key, o]));

/**
 * One raw `bestFor` entry → its occasion key, or null when it is not a curated
 * occasion. Returning null is how Reception, Haldi and the rest get dropped.
 */
export function occasionKeyFor(value: string): string | null {
  return KEY_BY_SPELLING.get(normalize(value)) ?? null;
}

/**
 * Split a template's `bestFor` field into its entries.
 *
 * Same convention as the event dropdown on /templates (TemplatesClient.tsx) —
 * comma separated, trimmed, empties dropped. Kept identical on purpose: one
 * parsing rule for one stored format.
 */
export function parseBestFor(bestFor?: string | null): string[] {
  return (bestFor || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
}

/**
 * The occasions actually represented in a set of templates, in OCCASIONS order.
 *
 * Data-driven by design: a tile exists only when something live matches it, so
 * the row can never send a customer to an empty result.
 */
export function occasionsPresentIn(
  templates: { bestFor?: string | null }[],
): Occasion[] {
  const present = new Set<string>();
  for (const t of templates) {
    for (const entry of parseBestFor(t.bestFor)) {
      const key = occasionKeyFor(entry);
      if (key) present.add(key);
    }
  }
  return OCCASIONS.filter(o => present.has(o.key));
}

/** Does this template belong under the given occasion tile? */
export function templateMatchesOccasion(
  template: { bestFor?: string | null },
  key: string,
): boolean {
  return parseBestFor(template.bestFor).some(entry => occasionKeyFor(entry) === key);
}
