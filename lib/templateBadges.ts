/**
 * Corner tags shown on template cards.
 *
 * MIRRORS TEMPLATE_BADGES in aamantran_backend/src/lib/constants.js, which is
 * the authority — it validates what admin is allowed to save. Adding a tag means
 * adding it there, in aamantran_admin/src/lib/constants.js, and here, plus a
 * colour rule in app/extra.css.
 *
 * Stored as the lowercase key, never the label, so the wording can change
 * without touching the database.
 */
export const TEMPLATE_BADGE_LABELS: Record<string, string> = {
  new: 'New',
  trending: 'Trending',
  bestseller: 'Bestseller',
  popular: 'Popular',
  limited: 'Limited',
};

/**
 * Label for a stored key, or null when there is no tag or the key is unknown.
 *
 * Returning null for an unrecognised value is deliberate: a tag that arrives
 * from an older or newer deployment renders as nothing at all, rather than as a
 * raw key like `bestseller` in an unstyled pill.
 */
export function badgeLabel(badge?: string | null): string | null {
  if (!badge) return null;
  return TEMPLATE_BADGE_LABELS[badge.toLowerCase()] ?? null;
}
