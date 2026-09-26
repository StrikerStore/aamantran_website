import Link from 'next/link';
import { cx } from '@/lib/cx';
import type { TemplateSummary } from '@/lib/api/types';
import { shopAisles } from '@/lib/content/shopTaxonomy';
import styles from './AisleRail.module.css';

/**
 * The aisles as a compact rail, for the top of the shop floor.
 *
 * The homepage shows aisles as tiles, because a shopper arriving there is
 * choosing where to go. On /templates they have already arrived, so the aisles
 * are a rail of chips — the same eight doors, the same live counts, in about a
 * fifth of the height, because what has to be on the first screen here is the
 * designs.
 *
 * Only stocked aisles are shown, as on the homepage tiles: an occasion appears
 * by itself when its first design goes live. A row of "soon" chips pushed the
 * designs down without offering anything to open.
 */
export function AisleRail({
  templates,
  /** Highlighted as the aisle being browsed, when the page is one. */
  currentKey,
  className,
}: {
  templates: readonly TemplateSummary[];
  currentKey?: string;
  className?: string;
}) {
  const aisles = shopAisles(templates).filter((entry) => entry.count > 0);
  if (aisles.length === 0) return null;

  return (
    <nav aria-label="Occasions" className={cx(styles.rail, className)}>
      <ul className={styles.list}>
        {aisles.map(({ aisle, count, href }) => {
          const current = aisle.key === currentKey;
          return (
            <li key={aisle.key}>
              {href && !current ? (
                <Link href={href} className={cx(styles.chip, styles.stocked)}>
                  {aisle.label}
                  <span className={styles.count}>{count}</span>
                </Link>
              ) : (
                <span className={cx(styles.chip, current ? styles.current : styles.empty)} aria-current={current || undefined}>
                  {aisle.label}
                  <span className={styles.count}>{count}</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
