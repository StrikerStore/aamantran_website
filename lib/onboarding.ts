/**
 * Onboarding rules that do not need a browser: what the address carries, what
 * a payment status means for the page, and what makes the account form valid.
 *
 * The username and password rules mirror the backend (isValidUsername in
 * routes/publicCheckout.js, validateNewPassword in utils/authSecurity.js), which
 * checks again on register — the common-password list lives only there.
 */
import { CURRENCY } from './storefront';
import { EMAIL_RE, contactError } from './checkout';

export interface OnboardingAddress {
  paymentId: string;
  slug: string;
  templateName: string;
  orderId: string;
  /** Minor units of `currency`: paise for INR, cents for USD. */
  amountMinor: number;
  currency: string;
}

export function parseOnboardingAddress(search: string): OnboardingAddress {
  const params = new URLSearchParams(search);
  return {
    paymentId: params.get('paymentId') || '',
    slug: params.get('slug') || '',
    templateName: params.get('template') || 'your selected template',
    orderId: params.get('orderId') || '',
    amountMinor: Number(params.get('amount') || 0),
    // PayU's success redirect appends the order's currency; this deployment's
    // own is the same answer in every normal case.
    currency: (params.get('currency') || CURRENCY).toUpperCase(),
  };
}

/** How many times a pending payment is re-checked, and how far apart. */
export const PENDING_RECHECKS = 3;
export const PENDING_RECHECK_MS = 3000;

export type Phase =
  | 'checking' // asking the server where the payment stands
  | 'pending' // not settled yet; re-checking
  | 'stillPending' // still not settled after the re-checks
  | 'failed' // on its way back to checkout
  | 'missing' // no payment reference, or the server does not know it
  | 'form' // paid and not registered (or the status could not be read)
  | 'registered' // already set up from this payment
  | 'done'; // set up just now

export type StatusAnswer =
  | { ok: true; status: string; registered: boolean; templateSlug: string | null }
  | { ok: false; httpStatus: number; message: string };

/**
 * What the page shows for a payment-status answer.
 *
 * `confirmed` says the purchase can be counted: the server said paid, or the
 * status could not be read at all, in which case the page behaves exactly as
 * it did before status checks existed (it was only ever reached after PayU
 * confirmed the payment).
 */
export function phaseForStatus(answer: StatusAnswer, recheck: number): { phase: Phase; confirmed: boolean; recheckAgain: boolean } {
  if (!answer.ok) {
    // A known 404 from the status endpoint means this payment does not exist.
    if (answer.httpStatus === 404 && answer.message === 'Payment not found') return { phase: 'missing', confirmed: false, recheckAgain: false };
    if (answer.httpStatus === 400) return { phase: 'missing', confirmed: false, recheckAgain: false };
    return { phase: 'form', confirmed: true, recheckAgain: false };
  }
  const status = answer.status.toLowerCase();
  if (status === 'paid') return { phase: answer.registered ? 'registered' : 'form', confirmed: true, recheckAgain: false };
  if (status === 'failed') return { phase: 'failed', confirmed: false, recheckAgain: false };
  if (status === 'pending') {
    return recheck < PENDING_RECHECKS
      ? { phase: 'pending', confirmed: false, recheckAgain: true }
      : { phase: 'stillPending', confirmed: false, recheckAgain: false };
  }
  // An unexpected status: fall back to the form, as before.
  return { phase: 'form', confirmed: true, recheckAgain: false };
}

export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;

export type AccountField = 'email' | 'username' | 'contact' | 'password';
export type AccountErrors = Partial<Record<AccountField, string>>;
export const ACCOUNT_FIELD_ORDER: readonly AccountField[] = ['email', 'username', 'contact', 'password'];

export type UsernameCheck = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'linked';

export function passwordProblem(password: string): string | undefined {
  if (!password) return 'Create a password for your account.';
  if (password.length < 8) return 'Use at least 8 characters.';
  if (password.length > 128) return 'Use at most 128 characters.';
  if (/^(.)\1+$/.test(password)) return 'Don’t use one character repeated.';
  return undefined;
}

export function validateAccount(input: {
  email: string;
  username: string;
  usernameStatus: UsernameCheck;
  contactCountryCode: string;
  contact: string;
  password: string;
  passwordRequired: boolean;
}): AccountErrors {
  const errors: AccountErrors = {};
  const email = input.email.trim();
  if (!email) errors.email = 'Enter the email you used at checkout.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter an email address like name@example.com.';

  const username = input.username.trim().toLowerCase();
  if (!username) errors.username = 'Choose a username to log in with.';
  else if (!USERNAME_RE.test(username) || input.usernameStatus === 'invalid') {
    errors.username = 'Use 3–32 letters, numbers, dots, underscores or hyphens, starting with a letter or number.';
  } else if (input.usernameStatus === 'taken') errors.username = 'That username is taken. Choose another.';

  const contact = contactError(input.contactCountryCode, input.contact);
  if (contact) errors.contact = contact;

  if (input.passwordRequired) {
    const password = passwordProblem(input.password);
    if (password) errors.password = password;
  }
  return errors;
}

export function firstAccountError(errors: AccountErrors): AccountField | null {
  return ACCOUNT_FIELD_ORDER.find((field) => errors[field]) ?? null;
}
