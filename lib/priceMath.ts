/**
 * Price breakdown arithmetic for the storefront.
 *
 * Mirrors the backend's computeBreakup (aamantran_backend/src/services/
 * pricing.service.js) exactly, so a figure shown on a card or product page can
 * never disagree with what checkout charges:
 *   - taxable = max(100, base - discount)   (the floor is in minor units)
 *   - GST     = round(taxable * gstPercent / 100)
 *   - total   = taxable + GST
 * International orders are zero-rated, so GST is always 0 there.
 *
 * Every amount is an integer in the minor units of the storefront currency
 * (paise for INR, cents for USD). Kept free of imports so it can be tested
 * directly under Node.
 */
export interface PriceBreakdown {
  base: number;
  discount: number;
  taxable: number;
  gstPercent: number;
  gst: number;
  total: number;
}

export function computePriceBreakdown(input: {
  base: number;
  gstPercent?: number | null;
  discount?: number | null;
  intl: boolean;
}): PriceBreakdown {
  const base = Math.max(0, Math.round(Number(input.base) || 0));
  const discount = Math.max(0, Math.round(Number(input.discount) || 0));
  const taxable = Math.max(100, base - discount);
  const gstPercent = input.intl ? 0 : Math.max(0, Number(input.gstPercent) || 0);
  const gst = Math.round((taxable * gstPercent) / 100);
  return { base, discount, taxable, gstPercent, gst, total: taxable + gst };
}
