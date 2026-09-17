/**
 * A checkout form saved just before the buyer leaves for the payment page, so a
 * failed or cancelled payment returns them to a filled-in form.
 *
 * - sessionStorage only: it stays in this tab on this device and is gone when
 *   the tab closes. Nothing is sent anywhere.
 * - Expires after 2 hours; a stale draft is removed when read.
 * - Consent is never stored. Terms acceptance and marketing opt-in must be
 *   given again on every attempt.
 */

export const CHECKOUT_DRAFT_KEY = 'aam_checkout_draft';
export const CHECKOUT_DRAFT_TTL_MS = 2 * 60 * 60 * 1000;
/** Tolerated clock drift for a savedAt slightly in the future. */
const FUTURE_SKEW_MS = 60 * 1000;

export interface CheckoutDraft {
  version: 1;
  templateSlug: string;
  email: string;
  contactCountryCode: string;
  contactNational: string;
  couponCode: string;
  savedAt: number;
}

export type CheckoutDraftInput = Omit<CheckoutDraft, 'version' | 'savedAt'>;

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

interface StorageOptions {
  storage?: DraftStorage | null;
  now?: number;
}

function sessionStore(): DraftStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null; // storage blocked (private mode, sandboxed frame)
  }
}

const LIMITS = { templateSlug: 200, email: 254, contactCountryCode: 6, contactNational: 20, couponCode: 64 };

function clip(value: unknown, max: number): string | null {
  return typeof value === 'string' && value.length <= max ? value : null;
}

/** Saves the form. False when storage is unavailable or the input is not usable. */
export function saveCheckoutDraft(input: CheckoutDraftInput, { storage = sessionStore(), now = Date.now() }: StorageOptions = {}): boolean {
  if (!storage || !input.templateSlug) return false;
  const draft: CheckoutDraft = {
    version: 1,
    templateSlug: input.templateSlug.slice(0, LIMITS.templateSlug),
    email: input.email.trim().slice(0, LIMITS.email),
    contactCountryCode: input.contactCountryCode.trim().slice(0, LIMITS.contactCountryCode),
    contactNational: input.contactNational.replace(/\D/g, '').slice(0, LIMITS.contactNational),
    couponCode: input.couponCode.trim().slice(0, LIMITS.couponCode),
    savedAt: now,
  };
  try {
    storage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearCheckoutDraft({ storage = sessionStore() }: StorageOptions = {}): void {
  try {
    storage?.removeItem(CHECKOUT_DRAFT_KEY);
  } catch {
    // nothing to clear
  }
}

/**
 * The saved draft, or null when there is none, it expired, it is malformed,
 * or it belongs to a different template than `templateSlug`.
 */
export function readCheckoutDraft({
  templateSlug,
  storage = sessionStore(),
  now = Date.now(),
}: StorageOptions & { templateSlug?: string } = {}): CheckoutDraft | null {
  if (!storage) return null;
  let raw: string | null;
  try {
    raw = storage.getItem(CHECKOUT_DRAFT_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let value: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('not an object');
    value = parsed as Record<string, unknown>;
  } catch {
    clearCheckoutDraft({ storage });
    return null;
  }

  const draft = {
    templateSlug: clip(value.templateSlug, LIMITS.templateSlug),
    email: clip(value.email, LIMITS.email),
    contactCountryCode: clip(value.contactCountryCode, LIMITS.contactCountryCode),
    contactNational: clip(value.contactNational, LIMITS.contactNational),
    couponCode: clip(value.couponCode, LIMITS.couponCode),
    savedAt: typeof value.savedAt === 'number' && Number.isFinite(value.savedAt) ? value.savedAt : null,
  };
  const valid =
    value.version === 1 &&
    draft.templateSlug &&
    draft.email !== null &&
    draft.contactCountryCode !== null &&
    draft.contactNational !== null &&
    draft.couponCode !== null &&
    draft.savedAt !== null &&
    draft.savedAt <= now + FUTURE_SKEW_MS &&
    now - draft.savedAt <= CHECKOUT_DRAFT_TTL_MS;

  if (!valid) {
    clearCheckoutDraft({ storage });
    return null;
  }
  if (templateSlug && draft.templateSlug !== templateSlug) return null;
  return { version: 1, ...(draft as Omit<CheckoutDraft, 'version'>) };
}
