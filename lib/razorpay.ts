import type { RazorpayCheckout } from './api/types';

/**
 * Razorpay's Checkout.js, wrapped.
 *
 * PayU is a form POST that takes the whole page; Razorpay is a modal that opens
 * over it. That difference is the only reason this file exists — everything the
 * modal needs is decided by the server, and nothing here is trusted: the payment
 * is only real once the server has checked its signature.
 *
 * The script is fetched from Razorpay when the buyer presses Pay, never on page
 * load, so a visitor who only browses the checkout page loads nothing from a
 * third party.
 *
 * Option building and outcome reading are pure and exported separately, so they
 * can be checked without a browser or a network.
 */

export const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/** What the modal ends with. `dismissed` is the buyer closing it, not a failure. */
export type RazorpayOutcome =
  | { kind: 'paid'; orderId: string; paymentId: string; signature: string }
  | { kind: 'dismissed' }
  | { kind: 'failed'; message: string }
  | { kind: 'unavailable' };

/** What Razorpay hands back to the page. Nothing here is trusted until the server verifies it. */
interface RazorpayHandlerResponse {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
}

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

/**
 * The options Checkout.js is opened with.
 *
 * `amount`, `currency` and `order_id` come from the server's order and are
 * passed through untouched: the modal must charge exactly what the server
 * recorded, and Razorpay itself rejects an amount that disagrees with the order.
 *
 * `prefill` only saves the buyer typing what they already gave us. An empty
 * field is omitted rather than sent blank, which Razorpay treats as "leave it to
 * the buyer" instead of showing an empty required box.
 */
export function razorpayOptions(
  checkout: RazorpayCheckout,
  handlers: { onPaid: (r: RazorpayHandlerResponse) => void; onDismiss: () => void },
): Record<string, unknown> {
  const prefill: Record<string, string> = {};
  if (checkout.prefill?.name) prefill.name = checkout.prefill.name;
  if (checkout.prefill?.email) prefill.email = checkout.prefill.email;
  if (checkout.prefill?.contact) prefill.contact = checkout.prefill.contact;

  return {
    key: checkout.keyId,
    order_id: checkout.orderId,
    amount: checkout.amount,
    currency: checkout.currency,
    name: checkout.name,
    description: checkout.description,
    prefill,
    // Matches the site, so the modal does not arrive in Razorpay's default blue.
    theme: { color: '#8b1e3f' },
    // Razorpay would otherwise send the buyer to a callback URL of its own.
    // The page handles the outcome itself, which keeps the whole flow on one
    // screen and lets a dismissal be told apart from a failure.
    handler: handlers.onPaid,
    modal: { ondismiss: handlers.onDismiss, escape: true },
    retry: { enabled: false },
  };
}

/** A readable line from Razorpay's failure payload, without leaking its internals. */
export function razorpayFailureMessage(payload: unknown): string {
  const error = (payload as { error?: { description?: string; reason?: string } } | undefined)?.error;
  const description = typeof error?.description === 'string' ? error.description.trim() : '';
  // Razorpay's descriptions are buyer-facing ("Payment failed because the card
  // was declined"), so one is worth showing; anything else gets our own words.
  if (description && description.length <= 160) return description;
  return 'The payment did not go through. No money has been taken — you can try again.';
}

let scriptPromise: Promise<boolean> | null = null;

/** Loads Checkout.js once per page. Resolves false if it cannot be fetched. */
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () => resolve(Boolean(window.Razorpay)));
    script.addEventListener('error', () => {
      // Let a later attempt try again: this is usually a blocked request or a
      // dropped connection, not a permanent state.
      scriptPromise = null;
      resolve(false);
    });
    if (!existing) {
      script.src = RAZORPAY_SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });
  return scriptPromise;
}

/**
 * Opens the payment sheet and resolves once with what happened.
 *
 * Resolving exactly once matters: Razorpay can fire `payment.failed` and then
 * `ondismiss` for the same attempt, and the page must not both show an error and
 * reset itself.
 */
export async function openRazorpayCheckout(checkout: RazorpayCheckout): Promise<RazorpayOutcome> {
  const ready = await loadRazorpayScript();
  const Razorpay = typeof window !== 'undefined' ? window.Razorpay : undefined;
  if (!ready || !Razorpay) return { kind: 'unavailable' };

  return new Promise<RazorpayOutcome>((resolve) => {
    let settled = false;
    const finish = (outcome: RazorpayOutcome) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };

    const instance = new Razorpay(
      razorpayOptions(checkout, {
        onPaid: (response) => finish({
          kind: 'paid',
          orderId: String(response?.razorpay_order_id || ''),
          paymentId: String(response?.razorpay_payment_id || ''),
          signature: String(response?.razorpay_signature || ''),
        }),
        onDismiss: () => finish({ kind: 'dismissed' }),
      }),
    );

    instance.on('payment.failed', (payload) => finish({ kind: 'failed', message: razorpayFailureMessage(payload) }));
    instance.open();
  });
}
