/**
 * Which image origins next/image may optimise.
 *
 * The single source for next.config.ts `images.remotePatterns` and for
 * components/ui/RemoteImage. The component has to render any other origin with
 * `unoptimized`: the optimiser refuses unlisted hosts outright, and Next 16 also
 * refuses localhost and private IPs.
 *
 * The env reads are written out literally so Next can inline them into the
 * browser bundle, which keeps the server and client decisions identical. Kept
 * free of project imports so next.config.ts can load it.
 */
export const DEFAULT_MEDIA_ORIGIN = 'https://media.aamantran.online';

/** Mirrors lib/publicEnv.ts getPublicApiUrl(). */
export function defaultApiOrigin(nodeEnv: string | undefined): string {
  return nodeEnv === 'production' ? 'https://api.aamantran.online' : 'http://localhost:4000';
}

/** Origin (scheme + host + port) of a configured URL, or the fallback if unset or malformed. */
export function originOf(raw: string | undefined | null, fallback: string): string {
  try {
    return raw && raw.trim() ? new URL(raw.trim()).origin : fallback;
  } catch {
    return fallback;
  }
}

export function optimizableOrigins(): string[] {
  return [
    originOf(process.env.NEXT_PUBLIC_MEDIA_URL, DEFAULT_MEDIA_ORIGIN),
    originOf(process.env.NEXT_PUBLIC_API_URL, defaultApiOrigin(process.env.NODE_ENV)),
  ];
}

const PRIVATE_HOST = /^(localhost$|127\.|10\.|0\.0\.0\.0$|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[::1\]$)/;

/** True when next/image can optimise `url`: a listed, public http(s) origin. */
export function isOptimizable(url: string, origins: string[] = optimizableOrigins()): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
  if (PRIVATE_HOST.test(parsed.hostname)) return false;
  return origins.includes(parsed.origin);
}
