import Link from 'next/link';
import { cx } from '@/lib/cx';
import { galleryHref, paginationItems, type GalleryState } from '@/lib/gallerySearch';
import styles from './Pagination.module.css';

/**
 * Real links between result pages, so every page is reachable without
 * JavaScript and by crawlers. Links land on the results, not the top of the page.
 */
export function Pagination({ state, totalPages }: { state: GalleryState; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (page: number) => `${galleryHref({ ...state, page })}#results`;
  const current = Math.min(state.page, totalPages);

  return (
    <nav aria-label="Result pages" className={styles.nav}>
      <ul className={styles.list}>
        <li>
          {current > 1 ? (
            <Link href={href(current - 1)} className={styles.item} rel="prev">
              <span aria-hidden="true">←</span> Previous
            </Link>
          ) : (
            <span className={cx(styles.item, styles.disabled)} aria-disabled="true">
              <span aria-hidden="true">←</span> Previous
            </span>
          )}
        </li>
        {paginationItems(current, totalPages).map((item, i) =>
          item === 'gap' ? (
            <li key={`gap-${i}`} className={styles.gap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              {item === current ? (
                <span className={cx(styles.item, styles.current)} aria-current="page">
                  <span className="visually-hidden">Page </span>
                  {item}
                </span>
              ) : (
                <Link href={href(item)} className={styles.item}>
                  <span className="visually-hidden">Page </span>
                  {item}
                </Link>
              )}
            </li>
          ),
        )}
        <li>
          {current < totalPages ? (
            <Link href={href(current + 1)} className={styles.item} rel="next">
              Next <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span className={cx(styles.item, styles.disabled)} aria-disabled="true">
              Next <span aria-hidden="true">→</span>
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
