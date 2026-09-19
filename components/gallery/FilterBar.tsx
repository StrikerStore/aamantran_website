'use client';

import Form from 'next/form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useOptimistic, useRef, useState, useTransition, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import type { GallerySort } from '@/lib/api/types';
import { withSelected, type FacetOption } from '@/lib/galleryFacets';
import type { PriceBand } from '@/lib/galleryPrice';
import {
  GALLERY_COMMUNITIES,
  GALLERY_QUERY_MAX_LENGTH,
  GALLERY_SORTS,
  galleryHref,
  isFilteredGallery,
  withGalleryChange,
  type GalleryState,
} from '@/lib/gallerySearch';
import { OCCASIONS } from '@/lib/occasions';
import { cx } from '@/lib/cx';
import styles from './FilterBar.module.css';

export const SEARCH_DEBOUNCE_MS = 300;

const ALL_OCCASIONS: FacetOption[] = OCCASIONS.map((o) => ({ value: o.key, label: o.label }));

function cleanQuery(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, GALLERY_QUERY_MAX_LENGTH);
}

/**
 * Search, occasion, community and sort for the gallery.
 *
 * The URL is the state: every change replaces it (no new history entry, no
 * scroll jump) and the server renders the results. Selects apply at once and
 * search after a short pause. Without JavaScript it is a plain GET form, so
 * the Search button still applies everything.
 */
export function FilterBar({
  state,
  occasions,
  communities,
  priceBands = [],
}: {
  state: GalleryState;
  occasions: FacetOption[];
  communities: FacetOption[];
  /** Derived from the live catalogue; empty when every design costs the same. */
  priceBands?: PriceBand[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Shows a choice as applied while its results load, instead of snapping back.
  const [shown, setShown] = useOptimistic(state);
  const latest = useRef(state);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // The search box is typed into ahead of the URL. `pushed` is the value this
  // component last sent, so its own navigation landing never overwrites newer
  // typing, while Back, Forward or "Clear all" still reset the box.
  // Closed to begin with on a phone; on a wider screen the stylesheet ignores
  // this entirely and the fields are always shown.
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState({ value: state.q, basis: state.q, pushed: null as string | null });
  if (search.basis !== state.q) {
    setSearch({ value: search.pushed === state.q ? search.value : state.q, basis: state.q, pushed: null });
  }

  useEffect(() => {
    latest.current = state;
  });
  useEffect(() => () => clearTimeout(timer.current), []);

  function apply(patch: Partial<GalleryState>) {
    clearTimeout(timer.current);
    const current = latest.current;
    const q = cleanQuery(search.value);
    const next = withGalleryChange(current, { q, ...patch });
    if (galleryHref(next) === galleryHref(current)) return;
    if (q !== current.q) setSearch((s) => ({ ...s, pushed: q }));
    startTransition(() => {
      setShown(next);
      router.replace(galleryHref(next), { scroll: false });
    });
  }

  function onSearchChange(value: string) {
    setSearch((s) => ({ ...s, value }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const q = cleanQuery(value);
      if (q === latest.current.q) return;
      setSearch((s) => ({ ...s, pushed: q }));
      const next = withGalleryChange(latest.current, { q });
      startTransition(() => {
        setShown(next);
        router.replace(galleryHref(next), { scroll: false });
      });
    }, SEARCH_DEBOUNCE_MS);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    apply({});
  }

  // Counted for the phone button's label, so a filter that is on is never
  // hidden without a word. The search box is not counted: it is always visible.
  const activeCount = [shown.occasion, shown.community, shown.price].filter(Boolean).length;

  const priceOptions: FacetOption[] = priceBands.map((band) => ({ value: band.key, label: band.label }));
  const occasionOptions = withSelected(occasions, shown.occasion, ALL_OCCASIONS);
  const communityOptions = withSelected(communities, shown.community, GALLERY_COMMUNITIES);

  return (
    <Form
      action="/templates"
      onSubmit={onSubmit}
      className={styles.bar}
      role="search"
      aria-label="Filter invites"
      data-pending={isPending || undefined}
    >
      <div className={styles.searchField}>
        <label htmlFor="gallery-q" className={styles.label}>
          Search by name
        </label>
        <div className={styles.searchRow}>
          <input
            id="gallery-q"
            name="q"
            type="search"
            value={search.value}
            onChange={(e) => onSearchChange(e.target.value)}
            maxLength={GALLERY_QUERY_MAX_LENGTH}
            autoComplete="off"
            enterKeyHint="search"
            className={styles.control}
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </div>
      </div>

      {/*
        * The phone control. Hidden on a wide screen, where every field fits
        * beside the others and folding them away would only add a step.
        *
        * aria-expanded and aria-controls are on the button rather than a
        * <details>, because the fields have to stay in the DOM and visible at
        * desktop width whatever this state says — a media query decides that,
        * and a <details> would have to be opened by script to match.
        */}
      <button
        type="button"
        className={styles.filtersToggle}
        aria-expanded={filtersOpen}
        aria-controls="gallery-filters"
        onClick={() => setFiltersOpen((open) => !open)}
      >
        <span>
          {filtersOpen ? 'Hide filters' : 'Filters'}
          {activeCount > 0 && <span className={styles.activeCount}>{activeCount}</span>}
        </span>
        <span aria-hidden="true" className={cx(styles.chevron, filtersOpen && styles.chevronOpen)}>
          ⌄
        </span>
      </button>

      <div
        id="gallery-filters"
        className={cx(styles.selects, !filtersOpen && styles.selectsCollapsed)}
      >
        <div>
          <label htmlFor="gallery-occasion" className={styles.label}>
            Occasion
          </label>
          <select
            id="gallery-occasion"
            name="occasion"
            value={shown.occasion ?? ''}
            onChange={(e) => apply({ occasion: e.target.value || null })}
            className={styles.control}
          >
            <option value="">All occasions</option>
            {occasionOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="gallery-community" className={styles.label}>
            Community
          </label>
          <select
            id="gallery-community"
            name="community"
            value={shown.community ?? ''}
            onChange={(e) => apply({ community: e.target.value || null })}
            className={styles.control}
          >
            <option value="">All communities</option>
            {communityOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        {/* Offered only when the catalogue has more than one price. */}
        {priceOptions.length > 0 && (
          <div>
            <label htmlFor="gallery-price" className={styles.label}>
              Price
            </label>
            <select
              id="gallery-price"
              name="price"
              value={shown.price ?? ''}
              onChange={(e) => apply({ price: e.target.value || null })}
              className={styles.control}
            >
              <option value="">Any price</option>
              {priceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="gallery-sort" className={styles.label}>
            Sort by
          </label>
          <select
            id="gallery-sort"
            name="sort"
            value={shown.sort}
            onChange={(e) => apply({ sort: e.target.value as GallerySort })}
            className={styles.control}
          >
            {GALLERY_SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.meta}>
        <p className={styles.status} role="status">
          {isPending ? 'Updating invites…' : ''}
        </p>
        {isFilteredGallery(state) && (
          <Link href="/templates" scroll={false} className={styles.clear} onClick={() => clearTimeout(timer.current)}>
            Clear all filters
          </Link>
        )}
      </div>
    </Form>
  );
}
