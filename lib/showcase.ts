import type { TemplateSummary } from './api/types';
import { AISLES, templateInAisle } from './content/shopTaxonomy';

/**
 * The homepage's front window: the leading invite from each category.
 *
 * `ranked` must already be in popularity order — most opened and most bought
 * first — which is what the catalogue returns for `sort=popular`. So the first
 * invite of a category in that list is that category's best, and the order in
 * which categories first appear is the order of their best invites. Walking the
 * list once gives both.
 *
 * Why one per category rather than simply the top three: three weddings in the
 * window tell a first-time visitor the site is only for weddings. The best
 * birthday invite beside the best wedding invite shows the range.
 *
 * An invite in two categories fills only one slot, and a category whose best
 * invite is already shown offers its next best instead. When there are fewer
 * categories than slots, the rest are the next most popular invites, so the
 * window is never short while there are invites to show.
 */
export function showcase(ranked: readonly TemplateSummary[], count: number): TemplateSummary[] {
  const picked: TemplateSummary[] = [];
  const taken = new Set<string>();

  // Each category's position in the ranking is the position of its best invite.
  const order = AISLES
    .map((aisle) => ({ aisle, first: ranked.findIndex((t) => templateInAisle(t, aisle)) }))
    .filter((entry) => entry.first !== -1)
    .sort((a, b) => a.first - b.first);

  for (const { aisle } of order) {
    if (picked.length >= count) break;
    const best = ranked.find((t) => templateInAisle(t, aisle) && !taken.has(t.slug));
    if (!best) continue;
    picked.push(best);
    taken.add(best.slug);
  }

  for (const t of ranked) {
    if (picked.length >= count) break;
    if (taken.has(t.slug)) continue;
    picked.push(t);
    taken.add(t.slug);
  }

  return picked;
}
