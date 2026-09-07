/**
 * Which storefront this deployment IS.
 *
 * aamantran.online and aamantranglobal.com are two deployments of this same
 * codebase, differing only by environment. So the storefront is a build-time
 * constant, not something resolved per request — which is what lets every page
 * stay statically cached. There is no cookie, no geo lookup, and no per-visitor
 * branch: a build either serves rupees or it serves dollars.
 *
 * (An earlier attempt did resolve this per request from a Cloudflare country
 * header and reveal one of two prices with CSS. Splitting the deployments makes
 * all of that unnecessary.)
 *
 * `process.env.NEXT_PUBLIC_STOREFRONT` must be written out literally here:
 * Next inlines NEXT_PUBLIC_* at build time by textual substitution, so
 * destructuring it or reading it through a variable would silently yield
 * undefined in the browser bundle.
 */
export type Storefront = 'IN' | 'INTL';
export type Currency = 'INR' | 'USD';

/** India unless the build explicitly says otherwise — the safe, GST-charging default. */
export const STOREFRONT: Storefront =
  process.env.NEXT_PUBLIC_STOREFRONT === 'INTL' ? 'INTL' : 'IN';

export const IS_INTL = STOREFRONT === 'INTL';

export const CURRENCY: Currency = IS_INTL ? 'USD' : 'INR';

/** Sent with API calls so the server prices and taxes the order the same way. */
export const STOREFRONT_HEADER = 'x-aamantran-storefront';

export function storefrontHeaders(): Record<string, string> {
  return { [STOREFRONT_HEADER]: STOREFRONT };
}

/**
 * Money from minor units.
 *
 * Amounts cross the wire in the minor units of their own currency — paise for
 * INR, cents for USD. Dollars keep their cents because international prices are
 * deliberately .99; rupees drop them, which is how prices have always been shown
 * on the India site.
 */
export function formatMoney(minor: number, currency: string = CURRENCY): string {
  const amount = (Number(minor) || 0) / 100;
  if (String(currency).toUpperCase() === 'USD') {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '₹' + amount.toLocaleString('en-IN');
}

/** Rupees, grouped Indian-style, no symbol. */
export function formatInr(paise: number): string {
  return ((Number(paise) || 0) / 100).toLocaleString('en-IN');
}

/** Dollars with cents, no symbol. */
export function formatUsd(cents: number): string {
  return ((Number(cents) || 0) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * The amount to show for a template on THIS storefront.
 *
 * The catalogue API returns both currencies on every row. Falling back to the
 * rupee figure when a dollar one is missing would quote a wildly wrong price, so
 * this returns null instead and the caller renders nothing.
 */
export function priceFor(t: { price: number; priceUsd?: number | null }): number | null {
  if (!IS_INTL) return t.price ?? null;
  return t.priceUsd ?? null;
}

/** Same rule for the struck-through original. */
export function originalPriceFor(
  t: { originalPrice?: number | null; originalPriceUsd?: number | null }
): number | null {
  if (!IS_INTL) return t.originalPrice ?? null;
  return t.originalPriceUsd ?? null;
}

/** Ready-to-render price for this storefront, or null when it cannot be shown. */
export function displayPrice(t: { price: number; priceUsd?: number | null }): string | null {
  const minor = priceFor(t);
  return minor == null ? null : formatMoney(minor);
}
