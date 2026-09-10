import { badgeLabel } from '@/lib/templateBadges';

/**
 * The corner tag on a template card — "New", "Trending", and so on.
 *
 * Renders nothing at all when the template has no tag, or when the stored key
 * is one this deployment does not recognise. That second case matters: the two
 * storefronts deploy independently, so a tag added to the database can reach a
 * build that predates it, and showing nothing is better than showing a raw key.
 *
 * Positioning lives in CSS (`.tpl-tag`), pinned to the top-left of whichever
 * `position: relative` thumbnail wraps it — mirroring the demo icon on the
 * right. The colour comes from a per-tag modifier class so each one reads
 * differently at a glance.
 */
export default function TemplateTag({ badge }: { badge?: string | null }) {
  const label = badgeLabel(badge);
  if (!label) return null;
  return <span className={`tpl-tag tpl-tag-${badge!.toLowerCase()}`}>{label}</span>;
}
