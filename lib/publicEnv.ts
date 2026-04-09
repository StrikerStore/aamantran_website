/**
 * Public env helpers for the marketing site.
 * Set NEXT_PUBLIC_* on Railway; production fallbacks match aamantran.online layout.
 */

const PROD_API = 'https://api.aamantran.online';
const PROD_APP = 'https://app.aamantran.online';

export function getPublicApiUrl(): string {
  const v = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (v) return v.replace(/\/$/, '');
  return process.env.NODE_ENV === 'production' ? PROD_API : 'http://localhost:4000';
}

export function getCoupleDashboardUrl(): string {
  const v = process.env.NEXT_PUBLIC_COUPLE_DASHBOARD_URL?.trim();
  if (v) return v.replace(/\/$/, '');
  return process.env.NODE_ENV === 'production' ? PROD_APP : 'http://localhost:3001';
}
