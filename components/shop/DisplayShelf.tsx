'use client';

import Link from 'next/link';
import { useRef, useState, type ReactNode } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { cx } from '@/lib/cx';
import { pluralize } from '@/lib/format';
import styles from './DisplayShelf.module.css';

export interface DisplayShelfOption {
  /** 'all', or a community value. */
  key: string;
  /** What the capsule reads. */
  label: string;
  /** Designs of this kind in the whole shop — the capsule's count. */
  count: number;
  /** Where "View all" goes for this shelf. */
  href: string;
  /** "View all" names what it opens, e.g. "Muslim weddings & nikah". */
  viewAllLabel: string;
  /** Card ids on this shelf, best-selling first. */
  ids: string[];
}

/**
 * "On display": the best-selling invites, narrowed by wedding tradition.
 *
 * Eight popular designs can easily all be Hindu, and a family planning a nikah
 * who finds nothing for them there leaves. So the capsules above the shelf put
 * each tradition one tap away, and the cards below change in place.
 *
 * The cards themselves are rendered on the server (TemplateCard stays a server
 * component) and handed in by id; this component only chooses which to show.
 * Without JavaScript the "All" shelf renders, which is what the page showed
 * before the capsules existed.
 *
 * On a phone the shelf is a swipe carousel of five cards ending in a "View all"
 * card; from 640px it is the familiar grid.
 */
export function DisplayShelf({
  shelves,
  cards,
}: {
  shelves: readonly DisplayShelfOption[];
  cards: Readonly<Record<string, ReactNode>>;
}) {
  const [activeKey, setActiveKey] = useState(shelves[0]?.key ?? 'all');
  const trackRef = useRef<HTMLUListElement>(null);
  const active = shelves.find((shelf) => shelf.key === activeKey) ?? shelves[0];
  if (!active) return null;

  function choose(key: string) {
    if (key === activeKey) return;
    setActiveKey(key);
    // A new shelf starts at its first card, not wherever the last one was left.
    trackRef.current?.scrollTo({ left: 0 });
  }

  return (
    <>
      {shelves.length > 1 && (
        <div role="group" aria-label="Wedding invitations by tradition" className={styles.capsules}>
          {shelves.map((shelf) => (
            <button
              key={shelf.key}
              type="button"
              aria-pressed={shelf.key === active.key}
              className={cx(styles.capsule, shelf.key === active.key && styles.current)}
              onClick={() => choose(shelf.key)}
            >
              {shelf.label}
              <span className={styles.count}>{shelf.count}</span>
            </button>
          ))}
        </div>
      )}

      <p className="visually-hidden" aria-live="polite">
        {active.key === 'all' ? '' : `Showing ${active.viewAllLabel}`}
      </p>

      <ul ref={trackRef} className={styles.track}>
        {active.ids.map((id) => (
          <li key={id} className={styles.item}>
            {cards[id]}
          </li>
        ))}
        <li className={cx(styles.item, styles.viewAllItem)}>
          <Link href={active.href} className={styles.viewAll}>
            <span className={styles.viewAllTitle}>View all</span>
            <span className={styles.viewAllSub}>
              {active.key === 'all' ? pluralize(active.count, 'invite') : active.viewAllLabel}
            </span>
            <span aria-hidden="true" className={styles.viewAllArrow}>→</span>
          </Link>
        </li>
      </ul>

      <p className={styles.more}>
        <LinkButton href={active.href} variant="secondary">
          {active.key === 'all'
            ? `See every invite${active.count > 0 ? ` (${active.count})` : ''}`
            : `See all ${active.viewAllLabel} (${active.count})`}
        </LinkButton>
      </p>
    </>
  );
}
