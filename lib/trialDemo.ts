/**
 * Form state and rules for "Try it with your names".
 *
 * The rules mirror the backend validator (aamantran_backend/src/services/
 * trialDemo.service.js) so a visitor sees the problem on the right step before
 * anything is sent. The server still decides: anything this file lets through
 * and the server refuses comes back as a message on the field it names.
 *
 * Pure apart from the sessionStorage helpers at the end, so it can be tested
 * without a browser.
 */

export const MAX_CEREMONIES = 6;
const NAME_MAX = 60;
const VENUE_MAX = 80;
const CITY_MAX = 60;
const WEDDING_MAX_YEARS_AHEAD = 3;
const CEREMONY_DAYS_BEFORE = 30;
const CEREMONY_DAYS_AFTER = 7;

const NAME_RE = /^[\p{L}\p{M} .'’-]{1,60}$/u;
const VENUE_RE = /^[\p{L}\p{M}\p{N} ,.'’\-/&()]{1,80}$/u;
const CITY_RE = /^[\p{L}\p{M} .'’-]{1,60}$/u;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Used until the API's own list arrives, and if it never does. */
export const FALLBACK_CEREMONIES = ['Roka', 'Engagement', 'Haldi', 'Mehendi', 'Sangeet', 'Nikah', 'Wedding', 'Reception'];

/**
 * Days from the wedding a ceremony usually falls, so a chosen ceremony starts
 * with a sensible date. Every offset is inside the range the server accepts.
 */
export const CEREMONY_OFFSETS: Readonly<Record<string, number>> = {
  Roka: -30,
  Engagement: -30,
  Haldi: -2,
  Mehendi: -1,
  Sangeet: -1,
  Nikah: 0,
  Wedding: 0,
  Reception: 1,
};

export interface CeremonyChoice {
  name: string;
  /** YYYY-MM-DD, or '' until a wedding date exists. */
  date: string;
  /** hh:mm, or '' for none. */
  time: string;
  /** Once the visitor sets a date, changing the wedding date leaves it alone. */
  dateEdited: boolean;
}

export interface TryDemoValues {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venueName: string;
  city: string;
  ceremonies: CeremonyChoice[];
}

export type TryDemoField = 'brideName' | 'groomName' | 'weddingDate' | 'venueName' | 'city' | 'ceremonies';
export type FieldErrors = Partial<Record<TryDemoField, string>>;
export type Step = 1 | 2 | 3;

export const STEP_FIELDS: Readonly<Record<Step, readonly TryDemoField[]>> = {
  1: ['brideName', 'groomName'],
  2: ['weddingDate', 'venueName', 'city'],
  3: ['ceremonies'],
};

export const EMPTY_VALUES: TryDemoValues = {
  brideName: '',
  groomName: '',
  weddingDate: '',
  venueName: '',
  city: '',
  ceremonies: [],
};

/** Which step owns a field the server complained about. */
export function stepForField(field: string | null | undefined): Step | null {
  for (const step of [1, 2, 3] as const) {
    if (STEP_FIELDS[step].includes(field as TryDemoField)) return step;
  }
  return null;
}

// ── Dates (local calendar days, like the date input) ────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function addDays(value: string, days: number): string {
  const date = parseDateInput(value);
  if (!date) return '';
  date.setDate(date.getDate() + days);
  return toDateInput(date);
}

export function weddingDateBounds(now: Date): { min: string; max: string } {
  const min = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const max = new Date(min);
  max.setFullYear(max.getFullYear() + WEDDING_MAX_YEARS_AHEAD);
  return { min: toDateInput(min), max: toDateInput(max) };
}

export function ceremonyDateBounds(weddingDate: string): { min: string; max: string } | null {
  if (!parseDateInput(weddingDate)) return null;
  return { min: addDays(weddingDate, -CEREMONY_DAYS_BEFORE), max: addDays(weddingDate, CEREMONY_DAYS_AFTER) };
}

// ── Updates ─────────────────────────────────────────────────────────────────

/** Adds a ceremony with a starting date, or removes it. Kept in `order`. */
export function toggleCeremony(values: TryDemoValues, name: string, order: readonly string[]): TryDemoValues {
  if (values.ceremonies.some((c) => c.name === name)) {
    return { ...values, ceremonies: values.ceremonies.filter((c) => c.name !== name) };
  }
  if (values.ceremonies.length >= MAX_CEREMONIES) return values;
  const added: CeremonyChoice = {
    name,
    date: values.weddingDate ? addDays(values.weddingDate, CEREMONY_OFFSETS[name] ?? 0) : '',
    time: '',
    dateEdited: false,
  };
  const rank = (n: string) => {
    const i = order.indexOf(n);
    return i === -1 ? order.length : i;
  };
  const ceremonies = [...values.ceremonies, added].sort((a, b) => rank(a.name) - rank(b.name));
  return { ...values, ceremonies };
}

/** Sets the wedding date and moves every ceremony date the visitor has not set. */
export function setWeddingDate(values: TryDemoValues, weddingDate: string): TryDemoValues {
  const valid = Boolean(parseDateInput(weddingDate));
  return {
    ...values,
    weddingDate,
    ceremonies: values.ceremonies.map((c) =>
      c.dateEdited || !valid ? c : { ...c, date: addDays(weddingDate, CEREMONY_OFFSETS[c.name] ?? 0) },
    ),
  };
}

export function updateCeremony(
  values: TryDemoValues,
  name: string,
  change: Partial<Pick<CeremonyChoice, 'date' | 'time'>>,
): TryDemoValues {
  return {
    ...values,
    ceremonies: values.ceremonies.map((c) =>
      c.name === name ? { ...c, ...change, dateEdited: c.dateEdited || change.date !== undefined } : c,
    ),
  };
}

// ── Validation ──────────────────────────────────────────────────────────────

function clean(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function nameError(value: string): string | undefined {
  const v = clean(value);
  if (!v) return 'Please enter this name.';
  if (v.length > NAME_MAX || !NAME_RE.test(v)) return 'Please use letters only, up to 60 characters.';
  return undefined;
}

export function validateStep(step: Step, values: TryDemoValues, now: Date): FieldErrors {
  const errors: FieldErrors = {};
  if (step === 1) {
    const bride = nameError(values.brideName);
    const groom = nameError(values.groomName);
    if (bride) errors.brideName = bride;
    if (groom) errors.groomName = groom;
  }
  if (step === 2) {
    const wedding = parseDateInput(values.weddingDate);
    const { min, max } = weddingDateBounds(now);
    if (!wedding) errors.weddingDate = 'Please choose the wedding date.';
    else if (values.weddingDate < min) errors.weddingDate = 'The wedding date is in the past.';
    else if (values.weddingDate > max) errors.weddingDate = 'Please choose a date within the next three years.';

    const venue = clean(values.venueName);
    if (!venue) errors.venueName = 'Please enter the venue.';
    else if (venue.length > VENUE_MAX || !VENUE_RE.test(venue)) errors.venueName = 'Please enter a shorter venue name, without symbols.';

    const city = clean(values.city);
    if (city && (city.length > CITY_MAX || !CITY_RE.test(city))) errors.city = 'Please enter a shorter city name, without symbols.';
  }
  if (step === 3) {
    const bounds = ceremonyDateBounds(values.weddingDate);
    if (values.ceremonies.length === 0) errors.ceremonies = 'Please choose at least one ceremony.';
    else if (values.ceremonies.length > MAX_CEREMONIES) errors.ceremonies = `Please choose up to ${MAX_CEREMONIES} ceremonies.`;
    else {
      for (const c of values.ceremonies) {
        if (!parseDateInput(c.date)) { errors.ceremonies = `Please choose a date for the ${c.name}.`; break; }
        if (bounds && (c.date < bounds.min || c.date > bounds.max)) {
          errors.ceremonies = `The ${c.name} date is too far from the wedding date.`;
          break;
        }
        if (c.time && !TIME_RE.test(c.time)) { errors.ceremonies = `Please enter the ${c.name} time as hh:mm.`; break; }
      }
    }
  }
  return errors;
}

/** The first step with a problem, checking every step in order. */
export function firstInvalidStep(values: TryDemoValues, now: Date): { step: Step; errors: FieldErrors } | null {
  for (const step of [1, 2, 3] as const) {
    const errors = validateStep(step, values, now);
    if (Object.keys(errors).length > 0) return { step, errors };
  }
  return null;
}

/** The request body. `website` is the honeypot, sent as the visitor left it. */
export function toRequestBody(values: TryDemoValues, input: { slug: string; startedAt: number; website: string }) {
  return {
    slug: input.slug,
    website: input.website,
    startedAt: input.startedAt,
    brideName: clean(values.brideName),
    groomName: clean(values.groomName),
    weddingDate: values.weddingDate,
    venueName: clean(values.venueName),
    ...(clean(values.city) ? { city: clean(values.city) } : {}),
    ceremonies: values.ceremonies.map((c) => ({ name: c.name, date: c.date, ...(c.time ? { time: c.time } : {}) })),
  };
}

// ── Result ──────────────────────────────────────────────────────────────────

/** "14:05" for a remaining duration; "0:00" once it has run out. */
export function formatCountdown(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;
}

export function whatsappShareUrl(url: string, linkMinutes: number): string {
  const text = `Here’s a preview of our invitation. The link works for ${linkMinutes} minutes: ${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function checkoutHrefWithTrial(slug: string, token: string): string {
  return `/checkout/${encodeURIComponent(slug)}?trial=${encodeURIComponent(token)}`;
}

// ── Remembered for this tab ─────────────────────────────────────────────────

export interface TryDemoResult {
  slug: string;
  token: string;
  url: string;
  /** Client clock, so a skewed device clock cannot shorten or stretch the countdown. */
  expiresAt: number;
  linkMinutes: number;
}

export interface StoredTryDemo {
  values: TryDemoValues;
  result: TryDemoResult | null;
}

/**
 * sessionStorage, not localStorage: the details stay in this tab and are gone
 * when it closes, instead of sitting in the browser for the next person.
 */
const STORAGE_KEY = 'aam_try_demo_v1';

function isValues(value: unknown): value is TryDemoValues {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return ['brideName', 'groomName', 'weddingDate', 'venueName', 'city'].every((k) => typeof v[k] === 'string')
    && Array.isArray(v.ceremonies)
    && v.ceremonies.every((c) => c && typeof c === 'object' && typeof (c as CeremonyChoice).name === 'string'
      && typeof (c as CeremonyChoice).date === 'string' && typeof (c as CeremonyChoice).time === 'string');
}

function isResult(value: unknown): value is TryDemoResult {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return typeof r.slug === 'string' && typeof r.token === 'string' && typeof r.url === 'string'
    && typeof r.expiresAt === 'number' && typeof r.linkMinutes === 'number';
}

export function loadStoredTryDemo(): StoredTryDemo | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!isValues(parsed.values)) return null;
    return {
      values: {
        ...parsed.values,
        ceremonies: parsed.values.ceremonies.slice(0, MAX_CEREMONIES).map((c) => ({ ...c, dateEdited: c.dateEdited === true })),
      },
      result: isResult(parsed.result) ? parsed.result : null,
    };
  } catch {
    return null;
  }
}

export function saveStoredTryDemo(stored: StoredTryDemo): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage blocked: the sheet still works, it just forgets on reload.
  }
}
