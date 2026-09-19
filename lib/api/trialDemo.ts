import { apiRequest, type ApiResult } from './client';
import { isRecord, list, num, str } from './parse';
import type { TrialDemoCreated, TrialDemoOptions } from './types';
import { STOREFRONT, storefrontHeaders } from '../storefront';

/**
 * "Try it with your names" calls. Both run in the visitor's browser, never on
 * the Next server: the API caps demos per address, and a server-side call
 * would put every visitor behind the one address of this deployment.
 */

const ROLE_RE = /^[a-z][a-z0-9_]{0,40}$/;

/**
 * What the form should ask for this design: its names, its events, and what to
 * call the date. Null when the design cannot be tried or the answer is not one
 * the form can use — the sheet then says so, rather than guessing at a couple.
 */
export async function getTrialDemoOptions(slug: string, signal?: AbortSignal): Promise<TrialDemoOptions | null> {
  const res = await apiRequest<unknown>('GET', `/api/trial-demo/options?slug=${encodeURIComponent(slug)}`, {
    signal,
    headers: storefrontHeaders(),
  });
  if (!res.ok || !isRecord(res.data)) return null;
  const people = (Array.isArray(res.data.people) ? res.data.people : [])
    .filter(isRecord)
    .map((person) => ({ role: str(person.role), label: str(person.label), required: person.required === true }))
    .filter((person) => ROLE_RE.test(person.role) && person.label);
  const ceremonies = list(res.data.ceremonies);
  const dateLabel = str(res.data.dateLabel) || 'Date';
  const expiresInMinutes = num(res.data.expiresInMinutes);
  return people.length > 0 && ceremonies.length > 0 && expiresInMinutes > 0
    ? { people, ceremonies, dateLabel, expiresInMinutes }
    : null;
}

export type TrialDemoFailure = { ok: false; status: number; message: string; field: string | null; aborted?: boolean };

export async function createTrialDemo(
  body: Record<string, unknown>,
): Promise<{ ok: true; data: TrialDemoCreated } | TrialDemoFailure> {
  const res: ApiResult<unknown> = await apiRequest<unknown>('POST', '/api/trial-demo', {
    body: { ...body, storefront: STOREFRONT },
    headers: storefrontHeaders(),
  });
  if (!res.ok) {
    return { ok: false, status: res.status, message: res.message, field: res.field ?? null, aborted: res.aborted };
  }
  const data = isRecord(res.data) ? res.data : {};
  const token = str(data.token);
  const url = str(data.url);
  if (!/^[0-9a-f]{32}$/.test(token) || !/^https?:\/\//.test(url)) {
    return { ok: false, status: res.status, message: 'Something went wrong. Please try again.', field: null };
  }
  return { ok: true, data: { token, url, expiresInMinutes: num(data.expiresInMinutes, 15) } };
}
