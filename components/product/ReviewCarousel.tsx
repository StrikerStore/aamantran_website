'use client';

import { useCallback, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './ReviewCarousel.module.css';

/**
 * Reviews in a row you can swipe, with arrows and dots underneath.
 *
 * The cards are rendered by the server component that uses this; only the
 * scrolling and the controls are client-side. The row is a plain scroll
 * container with snap points, so it works by touch, by trackpad and by keyboard
 * before any JavaScript runs — the arrows and dots are an addition, not the
 * mechanism.
 *
 * A "page" is one screenful of the row rather than one card: on a computer three
 * cards are visible at once, so three dots for three cards would be wrong. The
 * count is measured from the row itself and re-measured when the window
 * changes, because how many fit depends on the width.
 *
 * With more pages than dots can usefully show, it says "4 of 17" instead. A wall
 * of identical dots is not navigation.
 */

const MAX_DOTS = 10;

export function ReviewCarousel({ children, label }: { children: ReactNode; label: string }) {
  const scroller = useRef<HTMLUListElement>(null);

  /*
   * How many pages there are, and which one is in view, read from the row
   * itself rather than kept in state: the row is the source of truth, and a
   * finger on a phone moves it without asking React first. The two numbers
   * travel as one string so the snapshot can be compared by value.
   */
  const subscribe = useCallback((onChange: () => void) => {
    const el = scroller.current;
    if (!el) return () => {};
    const observer = new ResizeObserver(onChange);
    observer.observe(el);
    el.addEventListener('scroll', onChange, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', onChange);
    };
  }, []);

  const readPosition = useCallback(() => {
    const el = scroller.current;
    if (!el || el.clientWidth === 0) return '1|0';
    const total = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
    return `${total}|${Math.round(el.scrollLeft / el.clientWidth)}`;
  }, []);

  // The server has no row to measure, so it renders one page and no controls.
  const position = useSyncExternalStore(subscribe, readPosition, () => '1|0');
  const [pages, page] = position.split('|').map(Number);

  const goTo = (next: number) => {
    const el = scroller.current;
    if (!el) return;
    const target = Math.min(Math.max(next, 0), pages - 1);
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: target * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  };

  const atStart = page <= 0;
  const atEnd = page >= pages - 1;

  return (
    <div className={styles.wrap}>
      {/*
        * tabIndex makes the row reachable by keyboard: its cards are usually
        * just text, and a scroll container with nothing focusable inside cannot
        * otherwise be scrolled without a mouse.
        */}
      <ul ref={scroller} className={styles.scroller} tabIndex={0} role="group" aria-label={label}>
        {children}
      </ul>

      {pages > 1 && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => goTo(page - 1)}
            disabled={atStart}
            aria-label="Previous reviews"
          >
            <span aria-hidden="true">‹</span>
          </button>

          {pages <= MAX_DOTS ? (
            <div className={styles.dots}>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={cx(styles.dot, i === page && styles.dotCurrent)}
                  onClick={() => goTo(i)}
                  aria-label={`Reviews, page ${i + 1} of ${pages}`}
                  aria-current={i === page ? 'true' : undefined}
                />
              ))}
            </div>
          ) : (
            <p className={styles.counter} aria-live="polite">
              {page + 1} of {pages}
            </p>
          )}

          <button
            type="button"
            className={styles.arrow}
            onClick={() => goTo(page + 1)}
            disabled={atEnd}
            aria-label="More reviews"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      )}
    </div>
  );
}
