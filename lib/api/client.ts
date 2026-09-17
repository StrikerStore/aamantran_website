import { getPublicApiUrl } from '../publicEnv';

/**
 * The one place the storefront talks to the backend.
 *
 * Two shapes, because the two kinds of caller need different things:
 *
 * - apiGet: server-rendered reads (catalogue, reviews, stats, blog). Never
 *   throws and returns null on any failure, so a flaky API degrades one page
 *   section instead of failing the render or the build.
 * - apiRequest: browser calls whose failure the visitor has to see (coupon,
 *   order, payment status). Never throws either, but returns the HTTP status
 *   and the server's own message so the page can show it inline.
 */

/** Seconds a cached server read may be served before Next refetches it. */
export const REVALIDATE = {
  list: 120,
  detail: 60,
  reviews: 60,
  stats: 300,
  blog: 300,
} as const;

export type QueryValue = string | number | boolean | null | undefined;

/** Absolute API URL. Empty, null and undefined query values are left out. */
export function apiUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = getPublicApiUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return `${base}${p}${qs ? `?${qs}` : ''}`;
}

async function readJson(res: Response): Promise<{ parsed: boolean; value: unknown }> {
  try {
    const text = await res.text();
    return text ? { parsed: true, value: JSON.parse(text) } : { parsed: false, value: null };
  } catch {
    return { parsed: false, value: null };
  }
}

export interface GetOptions {
  /** Seconds (see REVALIDATE). Omit to skip the Next data cache. */
  revalidate?: number;
  /** Always fetch fresh. Takes precedence over revalidate. */
  noStore?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/** A cached read. Null on network error, non-2xx status or unreadable JSON. */
export async function apiGet<T>(
  path: string,
  query?: Record<string, QueryValue>,
  options: GetOptions = {},
): Promise<T | null> {
  try {
    const init: RequestInit = { headers: options.headers, signal: options.signal };
    if (options.noStore) init.cache = 'no-store';
    else if (options.revalidate !== undefined) init.next = { revalidate: options.revalidate };
    const res = await fetch(apiUrl(path, query), init);
    if (!res.ok) return null;
    const { parsed, value } = await readJson(res);
    return parsed ? (value as T) : null;
  } catch {
    return null;
  }
}

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string; aborted?: boolean; field?: string };

export const NETWORK_ERROR_MESSAGE = "We couldn't reach Aamantran. Check your connection and try again.";
export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export interface RequestOptions {
  query?: Record<string, QueryValue>;
  /** Sent as JSON. */
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * An uncached call whose outcome the visitor sees. `status` is 0 when the
 * request never reached the server; `aborted` marks a caller cancellation, which
 * should be ignored rather than shown.
 */
export async function apiRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  let res: Response;
  try {
    const headers: Record<string, string> = { ...options.headers };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    res = await fetch(apiUrl(path, options.query), {
      method,
      headers,
      cache: 'no-store',
      signal: options.signal,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    const aborted = (error as { name?: string } | null)?.name === 'AbortError';
    return aborted
      ? { ok: false, status: 0, message: 'Request cancelled', aborted: true }
      : { ok: false, status: 0, message: NETWORK_ERROR_MESSAGE };
  }

  const { parsed, value } = await readJson(res);
  if (res.ok && parsed) return { ok: true, status: res.status, data: value as T };

  const serverMessage =
    parsed && value && typeof value === 'object' && typeof (value as { message?: unknown }).message === 'string'
      ? (value as { message: string }).message.trim()
      : '';
  // Some endpoints name the input at fault, so the page can show the message beside it.
  const field =
    parsed && value && typeof value === 'object' && typeof (value as { field?: unknown }).field === 'string'
      ? (value as { field: string }).field
      : undefined;
  return { ok: false, status: res.status, message: serverMessage || GENERIC_ERROR_MESSAGE, ...(field ? { field } : {}) };
}
