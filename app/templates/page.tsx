import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { FilterBar } from '@/components/gallery/FilterBar';
import { AisleRail } from '@/components/shop/AisleRail';
import { Pagination } from '@/components/gallery/Pagination';
import { TemplateCard } from '@/components/gallery/TemplateCard';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Notice } from '@/components/ui/Notice';
import { getTemplates } from '@/lib/api/templates';
import type { TemplateSummary } from '@/lib/api/types';
import { COLLECTIONS } from '@/lib/collections';
import { pluralize } from '@/lib/format';
import { activeFilterLabels, galleryFacets } from '@/lib/galleryFacets';
import { lowestPrice, priceBands } from '@/lib/galleryPrice';
import { galleryResults, priceFilterIsSafe } from '@/lib/galleryResults';
import {
  GALLERY_PAGE_SIZE,
  galleryHref,
  isFilteredGallery,
  parseGallerySearch,
  totalPages,
  type GalleryState,
} from '@/lib/gallerySearch';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';
import { getStartingPrice } from '@/lib/startingPrice';
import styles from './templates.module.css';

/**
 * The design gallery.
 *
 * Server-rendered from the URL: the filters, the page number and the designs
 * themselves are in the HTML, so a shared link opens the same view, Back works,
 * and search engines can read the catalogue. It replaces a client-only grid
 * that fetched everything in the browser and showed crawlers an empty page.
 *
 * THE SHOP FLOOR. An eyebrow, a heading, two paragraphs and two rows of link
 * lists used to push the first design roughly 800px down the page. The doors are
 * a compact aisle rail now and the introduction is one line, because on a shelf
 * the goods come first — the prose that was here is on the pages it belongs to.
 */

/** Filter options are read from the catalogue, so a filter never leads to nothing. */
const FACET_SAMPLE_LIMIT = 100;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const state = parseGallerySearch(await searchParams);
  const from = await getStartingPrice();
  const filtered = isFilteredGallery(state);
  // Searched, filtered and re-sorted views are the same designs in a different
  // order, so they point at the plain gallery. Page 2 onward stands on its own.
  const path = filtered ? '/templates' : state.page > 1 ? `/templates?page=${state.page}` : '/templates';

  const metadata = buildPageMetadata({
    title: `Wedding Invites — Digital Invites from ${from}${state.page > 1 ? ` — Page ${state.page}` : ''}`,
    description:
      `Browse hand-crafted digital wedding invites for Hindu, Muslim, Sikh and Christian weddings. WhatsApp-ready, with RSVP tracking, photo galleries and music — from ${from}, one-time payment.`,
    path,
  });

  return filtered ? { ...metadata, robots: { index: false, follow: true } } : metadata;
}

function itemListJsonLd(templates: TemplateSummary[], state: GalleryState) {
  const offset = (state.page - 1) * GALLERY_PAGE_SIZE;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Digital wedding invites',
    url: `${SITE_URL}/templates`,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: templates.map((t, i) => ({
        '@type': 'ListItem',
        position: offset + i + 1,
        name: t.name,
        url: `${SITE_URL}/templates/${t.slug}`,
      })),
    },
  };
}

export default async function TemplatesPage({ searchParams }: Props) {
  const asked = parseGallerySearch(await searchParams);
  const catalogue = await getTemplates({ limit: FACET_SAMPLE_LIMIT, sort: 'new' });

  // Price bands are only offered while the whole catalogue fits in one request,
  // because that is what lets lib/galleryResults.ts guarantee the count is real
  // on a backend that ignores the price bounds. Above that the filter is not
  // offered, and one asked for in the URL is dropped.
  const priceSafe = priceFilterIsSafe(catalogue?.total ?? 0);
  const bands = priceSafe ? priceBands(catalogue?.templates ?? []) : [];
  const state = priceSafe ? asked : { ...asked, price: null };

  const { response: result } = await galleryResults(state, bands);

  // Facets come from the catalogue when it loaded, and from this page of results
  // when it did not, so the controls still show something usable either way.
  const sample = catalogue?.templates ?? result?.templates ?? [];
  const facets = galleryFacets(sample);
  const cheapest = lowestPrice(sample);
  const filters = activeFilterLabels(state, bands);
  const filtered = isFilteredGallery(state);
  const pages = result ? totalPages(result.total) : 1;
  const shown = result?.templates ?? [];
  const firstIndex = (state.page - 1) * GALLERY_PAGE_SIZE + 1;
  // A page number past the end: the results exist, this slice of them does not.
  const pastLastPage = Boolean(result && result.total > 0 && shown.length === 0);

  let summary = '';
  if (result && shown.length > 0) {
    const range = result.total > shown.length ? `${firstIndex}–${firstIndex + shown.length - 1} of ` : '';
    summary = `Showing ${range}${pluralize(result.total, 'invite')}${filters.length ? ` · ${filters.join(' · ')}` : ''}`;
  } else if (result && !pastLastPage) {
    summary = filtered ? `No invites match ${filters.join(' · ')}` : 'No invites are listed yet';
  }

  return (
    <>
      {!filtered && shown.length > 0 && <JsonLd data={itemListJsonLd(shown, state)} />}

      <div className={styles.page}>
        <header className={styles.hero}>
          <Container>
            <p className={styles.eyebrow}>Invitations</p>
            <h1 className={styles.title}>Find your invite</h1>
            <p className={styles.intro}>Every invite has a live demo you can open before you buy.</p>
            <AisleRail templates={sample} className={styles.rail} />
            <nav aria-label="Traditions" className={styles.collections}>
              <span className={styles.collectionsLabel}>By tradition:</span>
              <ul>
                {COLLECTIONS.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/collections/${c.slug}`}>{c.short}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Container>
        </header>

        <Container>
          <div className={styles.filters}>
            <FilterBar state={state} occasions={facets.occasions} communities={facets.communities} priceBands={bands} />
          </div>

          <section id="results" aria-labelledby="results-heading" className={styles.results}>
            <h2 id="results-heading" className="visually-hidden">
              Invites
            </h2>
            <p className={styles.summary} aria-live="polite">
              {summary}
            </p>

            {!result ? (
              <Notice
                tone="error"
                title="We couldn't load the invites just now"
                action={
                  <LinkButton href={galleryHref(state)} variant="secondary" size="sm">
                    Try again
                  </LinkButton>
                }
              >
                This is our side, not yours. Please try again in a moment.
              </Notice>
            ) : pastLastPage ? (
              <Notice
                tone="info"
                title={`There ${pages === 1 ? 'is only 1 page' : `are only ${pages} pages`} of invites`}
                action={
                  <LinkButton href={galleryHref({ ...state, page: pages })} variant="secondary" size="sm">
                    Go to page {pages}
                  </LinkButton>
                }
              >
                The page you asked for is past the end of the results.
              </Notice>
            ) : shown.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>{filtered ? 'No invites match those filters' : 'New invites are on the way'}</p>
                <p className={styles.emptyText}>
                  {filtered
                    ? 'Try removing a filter, or search for a different name.'
                    : 'The catalogue is being updated. Please check back shortly, or ask us what is coming.'}
                </p>
                <LinkButton href={filtered ? '/templates' : '/contact'} variant="secondary">
                  {filtered ? 'Show all invites' : 'Contact us'}
                </LinkButton>
              </div>
            ) : (
              <ul className={styles.grid}>
                {shown.map((template, i) => (
                  <li key={template.id || template.slug}>
                    {/* The first row is above the fold on most screens. */}
                    <TemplateCard template={template} eager={i < 2} lowestPrice={cheapest} />
                  </li>
                ))}
              </ul>
            )}

            <Pagination state={state} totalPages={pages} />
          </section>
        </Container>
      </div>
    </>
  );
}
