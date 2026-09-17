import Link from 'next/link';
import { cx } from '@/lib/cx';
import type { SubAisle } from '@/lib/subAisle';
import styles from './SubAisleBar.module.css';

/**
 * Narrowing an aisle by tradition, as a row of links.
 *
 * Links, not a form: each shelf is a real address a shopper can share or go
 * Back from, and the page renders the right designs on the server with no
 * JavaScript at all. "All" is the aisle's own URL, so choosing it leaves no
 * query behind.
 *
 * Counts are on the chips for the same reason they are on the aisle tiles: a
 * shopper deciding where to look is helped most by knowing how much is there.
 */
export function SubAisleBar({
  slug,
  options,
  selected,
}: {
  slug: string;
  options: readonly SubAisle[];
  /** The community in the URL, or null for the whole aisle. */
  selected: string | null;
}) {
  const total = options.reduce((sum, option) => sum + option.count, 0);

  return (
    <nav aria-label="Tradition" className={styles.bar}>
      <ul className={styles.list}>
        <li>
          <Link
            href={`/${slug}`}
            scroll={false}
            aria-current={selected === null ? 'true' : undefined}
            className={cx(styles.chip, selected === null && styles.current)}
          >
            All
            <span className={styles.count}>{total}</span>
          </Link>
        </li>
        {options.map((option) => (
          <li key={option.value}>
            <Link
              href={`/${slug}?tradition=${encodeURIComponent(option.value)}`}
              scroll={false}
              aria-current={selected === option.value ? 'true' : undefined}
              className={cx(styles.chip, selected === option.value && styles.current)}
            >
              {option.label}
              <span className={styles.count}>{option.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
