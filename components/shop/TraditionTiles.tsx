import Link from 'next/link';
import { RemoteImage } from '@/components/ui/RemoteImage';
import type { TemplateSummary } from '@/lib/api/types';
import { COLLECTIONS } from '@/lib/collections';
import { pluralize } from '@/lib/format';
import styles from './TraditionTiles.module.css';

/**
 * Shop by tradition — the sub-aisle a wedding shopper actually asks for.
 *
 * These are the four community landing pages that already exist, shown as what
 * they are: a door with a picture on it. The picture is a real design from that
 * community, chosen from the catalogue the page already fetched, so a tile can
 * never advertise something the shop does not have.
 *
 * A tradition with no designs is left out rather than shown empty. Unlike an
 * occasion — where "we don't sell birthday invitations yet" is useful news —
 * "we have no Sikh designs" reads as an omission, and the page it would link to
 * would be empty.
 */
export function TraditionTiles({ templates }: { templates: readonly TemplateSummary[] }) {
  const tiles = COLLECTIONS.map((collection) => {
    const matching = templates.filter((t) => t.community === collection.community);
    return { collection, art: matching[0] ?? null, count: matching.length };
  }).filter((tile) => tile.count > 0);

  if (tiles.length === 0) return null;

  return (
    <ul className={styles.tiles}>
      {tiles.map(({ collection, art, count }) => (
        <li key={collection.slug}>
          <Link href={`/collections/${collection.slug}`} className={styles.tile}>
            <RemoteImage
              src={art?.desktopThumbnailUrl ?? art?.thumbnailUrl ?? art?.mobileThumbnailUrl}
              alt=""
              sizes="(max-width: 639px) 45vw, 260px"
              aspectRatio="4 / 3"
              className={styles.art}
              fallback={<span aria-hidden="true" className={styles.mark}>✦</span>}
            />
            <span className={styles.body}>
              <span className={styles.label}>{collection.short}</span>
              <span className={styles.count}>{pluralize(count, 'design')}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
