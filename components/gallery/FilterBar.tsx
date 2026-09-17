'use client';

import Form from 'next/form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useOptimistic, useRef, useState, useTransition, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import type { GallerySort } from '@/lib/api/types';
import { withSelected, type FacetOption } from '@/lib/galleryFacets';
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
}: {
  state: GalleryState;
  occasions: FacetOption[];
  communities: FacetOption[];
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

  const occasionOptions = withSelected(occasions, shown.occasion, ALL_OCCASIONS);
  const communityOptions = withSelected(communities, shown.community, GALLERY_COMMUNITIES);

  return (
    <Form
      action="/templates"
      onSubmit={onSubmit}
      className={styles.bar}
      role="search"
      aria-label="Filter designs"
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

      <div className={styles.selects}>
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
        <div className={styles.sort}>
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
          {isPending ? 'Updating designs…' : ''}
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
