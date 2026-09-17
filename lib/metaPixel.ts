/**
 * The Meta Pixel's `fbq`, if it is there.
 *
 * The pixel is injected only after the visitor accepts advertising cookies
 * (components/CookieConsent.tsx), so every caller has to cope with it being
 * absent — on most page views it is. One typed accessor keeps that check in one
 * place instead of a `window as any` at each call site.
 */
type Fbq = (...args: unknown[]) => void;

export function getFbq(): Fbq | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { fbq?: Fbq }).fbq;
}

/** Sends a standard Meta event, or does nothing when there is no pixel. */
export function trackPixel(event: string, params?: Record<string, unknown>, options?: { eventID: string }): boolean {
  const fbq = getFbq();
  if (!fbq) return false;
  if (options) fbq('track', event, params ?? {}, options);
  else if (params) fbq('track', event, params);
  else fbq('track', event);
  return true;
}
