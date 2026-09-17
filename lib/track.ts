import { getPublicApiUrl } from './publicEnv';
import { STOREFRONT } from './storefront';

/**
 * First-party analytics beacon (anonymous — no cookies, no PII).
 * Sessions are a random UUID in localStorage, rotated after 30 min of inactivity.
 * Sent as text/plain so sendBeacon stays a simple CORS request; the backend
 * parses the JSON manually (see aamantran_backend/src/routes/track.js).
 */

const SID_KEY = 'aam_sid';
const SID_LAST_KEY = 'aam_sid_last';
const SESSION_GAP_MS = 30 * 60 * 1000;

/**
 * Must match the backend allowlist in aamantran_backend/src/lib/analyticsEvents.js
 * -- any other type is rejected there with a 400. Funnel stages count as
 * conversions; the storefront interaction events below never do.
 */
export type TrackEventType =
  | 'pageview'
  // Funnel stages
  | 'view_template'
  | 'initiate_checkout'
  | 'purchase'
  | 'register_complete'
  // Storefront interactions (not conversions)
  | 'demo_opened'
  | 'guest_demo_interaction'
  | 'planning_demo_interaction'
  | 'checkout_error'
  | 'payment_failed_return'
  | 'checkout_retry'
  | 'try_demo_started'
  | 'try_demo_created'
  | 'try_demo_opened'
  | 'try_demo_to_checkout';

function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const now = Date.now();
    const last = Number(localStorage.getItem(SID_LAST_KEY) || 0);
    let sid = localStorage.getItem(SID_KEY);
    if (!sid || !last || now - last > SESSION_GAP_MS) {
      sid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${now.toString(36)}-${Math.random().toString(36).slice(2, 12)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(SID_KEY, sid);
    }
    localStorage.setItem(SID_LAST_KEY, String(now));
    return sid;
  } catch {
    return null; // storage blocked (private mode) — skip tracking
  }
}

export function track(type: TrackEventType, meta?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const sessionId = getSessionId();
  if (!sessionId) return;

  const params = new URLSearchParams(window.location.search);
  const body = JSON.stringify({
    sessionId,
    type,
    path: window.location.pathname,
    // In the BODY, not a header: this is sent as text/plain precisely so it
    // stays a "simple" CORS request, and a custom header would force a
    // preflight that sendBeacon cannot make.
    storefront: STOREFRONT,
    // Attribution fields are only persisted on the session's first event
    referrer: document.referrer || undefined,
    utm: {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
    },
    meta,
  });
  const url = `${getPublicApiUrl()}/api/track`;

  try {
    if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }))) {
      return;
    }
  } catch {
    // fall through to fetch
  }
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, keepalive: true }).catch(() => {});
}

/** Fire an event at most once per browser session (dedupe key survives reloads). */
export function trackOnce(dedupeKey: string, type: TrackEventType, meta?: Record<string, unknown>) {
  try {
    const k = `aam_evt_${dedupeKey}`;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, '1');
  } catch {
    // storage blocked — track anyway rather than lose the event
  }
  track(type, meta);
}
