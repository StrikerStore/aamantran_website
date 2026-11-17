/**
 * Price breakdown arithmetic for the storefront.
 *
 * Mirrors the backend's computeBreakup (aamantran_backend/src/services/
 * pricing.service.js) exactly, so a figure shown on a card or product page can
 * never disagree with what checkout charges. First the coupon:
 *   - net = max(100, base - discount)   (the floor is in minor units)
 * Then GST, which depends on whether the price already includes it:
 *   - inclusive: total = net; taxable = round(net * 100 / (100 + gstPercent));
 *                GST = total - taxable   (backed out, not added)
 *   - exclusive: taxable = net; GST = round(taxable * gstPercent / 100);
 *                total = taxable + GST  (added on top)
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
  /** True when `gst` is already inside `total` rather than added to it. Always false abroad. */
  gstInclusive: boolean;
  gst: number;
  total: number;
}

export function computePriceBreakdown(input: {
  base: number;
  gstPercent?: number | null;
  gstInclusive?: boolean | null;
  discount?: number | null;
  intl: boolean;
}): PriceBreakdown {
  const base = Math.max(0, Math.round(Number(input.base) || 0));
  const discount = Math.max(0, Math.round(Number(input.discount) || 0));
  const net = Math.max(100, base - discount);
  const gstPercent = input.intl ? 0 : Math.max(0, Number(input.gstPercent) || 0);
  const gstInclusive = !input.intl && input.gstInclusive === true;
  if (gstInclusive) {
    const taxable = Math.round((net * 100) / (100 + gstPercent));
    return { base, discount, taxable, gstPercent, gstInclusive, gst: net - taxable, total: net };
  }
  const gst = Math.round((net * gstPercent) / 100);
  return { base, discount, taxable: net, gstPercent, gstInclusive, gst, total: net + gst };
}
