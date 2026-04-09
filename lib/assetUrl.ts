import { getPublicApiUrl } from './publicEnv';

/**
 * URLs from the API may be relative (/s/..., /uploads/...) or absolute (R2 https://media...).
 */
export function resolveBackendPublicUrl(pathOrUrl: string | null | undefined): string | null {
  if (pathOrUrl == null || pathOrUrl === '') return null;
  const s = String(pathOrUrl).trim();
  if (/^(https?:|data:|blob:)/i.test(s)) return s;
  const base = getPublicApiUrl().replace(/\/$/, '');
  const p = s.startsWith('/') ? s : `/${s}`;
  return `${base}${p}`;
}
