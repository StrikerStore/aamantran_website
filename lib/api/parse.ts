import { parseList } from '../format';

/**
 * Small, forgiving readers for API JSON. The backend is ours, but the website
 * and backend deploy separately, so a missing or renamed field must degrade to
 * an empty value rather than crash a page.
 */

export type RawRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function num(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function numOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** A non-blank string, or null. */
export function strOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

/** An array of non-blank strings, or a comma-separated string split into one. */
export function list(value: unknown): string[] {
  if (Array.isArray(value)) {
    return parseList(value.filter((v): v is string => typeof v === 'string').join(','));
  }
  return typeof value === 'string' ? parseList(value) : [];
}
