import Link from 'next/link';
import { cx } from '@/lib/cx';
import { shopAisles } from '@/lib/content/shopTaxonomy';
import type { TemplateSummary } from '@/lib/api/types';
import { pluralize } from '@/lib/format';
import styles from './AisleTiles.module.css';

/**
 * The aisles, as a customer walks past them.
 *
 * Only aisles with designs in them appear, each with its count from the live
 * catalogue. Empty aisles used to show as "Coming soon" tiles; they came off
 * because a shopper scanning for their occasion should only meet doors that open
 * onto designs. When an aisle gets its first design it appears here on its own —
 * nothing to edit. (ComingSoon.tsx still holds the WhatsApp "tell us" tile,
 * should empty aisles ever be shown again.)
 *
 * The count is on the tile because it is the single most useful thing a shopper
 * can know before clicking: eight designs is worth a look, zero is not.
 */
export function AisleTiles({
  templates,
  /** `h2` on the homepage section, `h3` when the rail sits under one. */
  headingLevel = 3,
  className,
}: {
  templates: readonly TemplateSummary[];
  headingLevel?: 2 | 3 | 4;
  className?: string;
}) {
  const aisles = shopAisles(templates).filter((state) => state.href !== null);
  if (aisles.length === 0) return null;
  const Heading = `h${headingLevel}` as const;

  return (
    <ul className={cx(styles.tiles, className)}>
      {aisles.map(({ aisle, count, href }) => {
        const body = (
          <>
            <Heading className={styles.label}>{aisle.label}</Heading>
            <p className={styles.blurb}>{aisle.blurb}</p>
            <p className={styles.count}>{pluralize(count, 'invite')}</p>
          </>
        );

        return (
          <li key={aisle.key} className={styles.item}>
            <Link href={href!} className={cx(styles.tile, styles.stocked)}>
              {body}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
