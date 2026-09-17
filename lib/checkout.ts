/**
 * Checkout rules that do not need a browser: what makes the buyer's details
 * valid, what a failed payment is called in plain words, and what the page
 * reads from its address.
 *
 * The email and phone rules are the ones checkout has always used; the backend
 * validates again on the order, so these exist to explain a problem before the
 * buyer presses Pay, not to decide what is allowed.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CheckoutField = 'email' | 'contact' | 'terms';
export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

/** Order the errors are listed and focused in: the order of the form. */
export const CHECKOUT_FIELD_ORDER: readonly CheckoutField[] = ['email', 'contact', 'terms'];

export interface CheckoutDetails {
  email: string;
  contactCountryCode: string;
  contactNational: string;
  agreeTerms: boolean;
}

export function emailError(email: string): string | undefined {
  const value = email.trim();
  if (!value) return 'Enter your email address.';
  if (!EMAIL_RE.test(value)) return 'Enter an email address like name@example.com.';
  return undefined;
}

export function contactError(countryCode: string, national: string): string | undefined {
  const digits = national.replace(/\D/g, '');
  if (!digits) return 'Enter your mobile number.';
  if (countryCode === '+91') {
    // Every Indian mobile number is ten digits starting 6–9.
    return /^[6-9]\d{9}$/.test(digits) ? undefined : 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.';
  }
  // E.164 caps the whole number, dial code included, at 15 digits.
  const e164 = countryCode.replace(/\D/g, '') + digits;
  return e164.length >= 8 && e164.length <= 15 ? undefined : 'Enter a valid number for the country code you chose.';
}

export function validateCheckout(details: CheckoutDetails): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const email = emailError(details.email);
  const contact = contactError(details.contactCountryCode, details.contactNational);
  if (email) errors.email = email;
  if (contact) errors.contact = contact;
  if (!details.agreeTerms) errors.terms = 'Tick the box to accept the Terms of Service and Privacy Policy.';
  return errors;
}

export function firstErrorField(errors: CheckoutErrors): CheckoutField | null {
  return CHECKOUT_FIELD_ORDER.find((field) => errors[field]) ?? null;
}

/**
 * A payment failure in words.
 *
 * `reason` is the short code the backend puts in the address (PayU's
 * unmappedstatus or status, lower-cased). Unknown codes get the general
 * sentence rather than being shown raw.
 */
export function paymentFailureMessage(reason: string | null): string {
  const code = (reason || '').toLowerCase();
  if (code === 'usercancelled' || code === 'cancelled' || code === 'cancel') return 'The payment was cancelled on the payment page.';
  if (code === 'dropped' || code === 'bounced') return 'The payment page was closed before the payment finished.';
  if (code === 'failed' || code === 'failure' || code === 'declined') return 'Your bank or card did not approve the payment.';
  return 'The payment was not completed.';
}

export interface CheckoutAddress {
  paymentFailed: boolean;
  failureReason: string | null;
  /** "Try it with your names" demo token (Task 22), or ''. */
  trialToken: string;
}

/** What checkout reads from its query string. */
export function parseCheckoutAddress(search: string): CheckoutAddress {
  const params = new URLSearchParams(search);
  const reason = (params.get('reason') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32);
  const trial = params.get('trial') || '';
  return {
    paymentFailed: params.get('payment') === 'failed',
    failureReason: reason || null,
    trialToken: /^[0-9a-f]{32}$/.test(trial) ? trial : '',
  };
}

/** Where a completed purchase goes next, with the same parameters the emails use. */
export function onboardingHref(input: {
  paymentId: string;
  slug: string;
  templateName: string;
  orderId?: string | null;
  amount: number;
  currency: string;
}): string {
  const params = new URLSearchParams({
    paymentId: input.paymentId,
    slug: input.slug,
    template: input.templateName,
    ...(input.orderId ? { orderId: input.orderId } : {}),
    amount: String(input.amount),
    currency: input.currency,
  });
  return `/onboarding?${params.toString()}`;
}

/** sessionStorage key so InitiateCheckout reaches Meta once per design per session. */
export function initiateCheckoutKey(slug: string): string {
  return `aam_fbq_initiate_${slug}`;
}

/**
 * Dedupe key for payment_failed_return. Shared with the homepage's recovery
 * redirect, so a buyer bounced home and then back to checkout counts once.
 */
export function paymentFailedReturnKey(reason: string | null): string {
  return `payment_failed_return:${reason || 'unknown'}`;
}
