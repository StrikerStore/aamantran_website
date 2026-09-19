import Link from 'next/link';
import { ComingSoon } from './ComingSoon';
import { cx } from '@/lib/cx';
import { shopAisles } from '@/lib/content/shopTaxonomy';
import type { TemplateSummary } from '@/lib/api/types';
import { pluralize } from '@/lib/format';
import styles from './AisleTiles.module.css';

/**
 * The aisles, as a customer walks past them.
 *
 * Every aisle the shop means to stock appears, with the number of designs in it
 * counted from the live catalogue. An aisle with nothing in it says "Coming
 * soon" rather than disappearing — a shop with five empty shelves is still
 * recognisably a shop, while one that hides them looks like it sells only
 * weddings. An empty one offers to take the customer's interest instead: one tap
 * to WhatsApp with the question written, and an anonymous `occasion_interest`
 * event that is the evidence for which aisle to commission next.
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
  const aisles = shopAisles(templates);
  const Heading = `h${headingLevel}` as const;

  return (
    <ul className={cx(styles.tiles, className)}>
      {aisles.map(({ aisle, count, href }) => {
        const body = (
          <>
            <Heading className={styles.label}>{aisle.label}</Heading>
            <p className={styles.blurb}>{aisle.blurb}</p>
            <p className={styles.count}>
              {count > 0 ? pluralize(count, 'invite') : 'Coming soon — tell us'}
            </p>
          </>
        );

        return (
          <li key={aisle.key} className={styles.item}>
            {href ? (
              <Link href={href} className={cx(styles.tile, styles.stocked)}>
                {body}
              </Link>
            ) : (
              // Still quieter than a stocked tile — it leads to a conversation,
              // not to designs — but it is something to tap rather than a dead end.
              <ComingSoon aisle={aisle} className={cx(styles.tile, styles.empty)}>
                {body}
              </ComingSoon>
            )}
          </li>
        );
      })}
    </ul>
  );
}
