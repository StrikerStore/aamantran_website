import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { TemplateCard } from '@/components/gallery/TemplateCard';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import styles from '@/components/landing/landing.module.css';
import { getTemplates } from '@/lib/api/templates';
import { AISLES } from '@/lib/content/shopTaxonomy';
import { occasionPagesInShop } from '@/lib/occasionPages';
import type { TemplateSummary } from '@/lib/api/types';
import { COLLECTIONS, collectionBySlug, type Collection } from '@/lib/collections';
import { SELF_BUILD } from '@/lib/content/entitlements';
import { pluralize } from '@/lib/format';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';

/**
 * A community landing page — /collections/hindu-wedding-invitations and friends.
 *
 * Lives OUTSIDE /templates on purpose: app/templates/[slug]/page.tsx already
 * matches every segment under that path and would notFound() on a collection
 * slug. Sharing one route between two different page types would mean branching
 * generateMetadata, generateStaticParams and the body on what the slug turned
 * out to be.
 *
 * Server-rendered, deliberately. The whole point is that the copy and the
 * design names are in the HTML a crawler receives, not assembled afterwards in
 * the browser.
 *
 * Shares its cards and styling with the occasion pages, so a design shows the
 * same name, description, price with GST and actions wherever it appears.
 */

/** Prerender all four at build time; anything else 404s. */
export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = collectionBySlug(slug);
  if (!c) return {};
  return buildPageMetadata({ title: c.title, description: c.description, path: `/collections/${c.slug}` });
}

function schemaFor(c: Collection, templates: TemplateSummary[]) {
  const pageUrl = `${SITE_URL}/collections/${c.slug}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: c.heading,
      description: c.description,
      url: pageUrl,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: templates.length,
        itemListElement: templates.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.name,
          url: `${SITE_URL}/templates/${t.slug}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Invitations', item: `${SITE_URL}/templates` },
        { '@type': 'ListItem', position: 3, name: c.heading, item: pageUrl },
      ],
    },
  ];
}

/**
 * The aisles a community collection can narrow into: the ones shopTaxonomy
 * marks as narrowed by tradition, which is what makes `?tradition=` mean
 * anything on them.
 */
/** Enough to decide which aisle pages exist; see lib/occasionPages.ts. */
const CATALOGUE_LIMIT = 100;

const SUB_AISLE_SLUGS = new Set(
  AISLES.filter((aisle) => aisle.subCategory === 'tradition' && aisle.pageSlug).map((aisle) => aisle.pageSlug),
);

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = collectionBySlug(slug);
  if (!c) notFound();

  const [response, catalogue] = await Promise.all([
    getTemplates({ community: c.community, limit: 50, sort: 'new' }),
    getTemplates({ limit: CATALOGUE_LIMIT, sort: 'new' }),
  ]);
  const templates = response?.templates ?? [];
  const siblings = COLLECTIONS.filter((x) => x.slug !== c.slug);

  // Only aisles that currently have a page: lib/occasionPages.ts decides that
  // from the catalogue on every render, so linking without asking would put a
  // dead internal link on the page whose whole job is to be crawled.
  const subAisleLinks = occasionPagesInShop(catalogue?.templates ?? [])
    .filter(({ page }) => SUB_AISLE_SLUGS.has(page.slug))
    .map(({ page }) => ({ slug: page.slug, label: page.heading }));

  return (
    <>
      {schemaFor(c, templates).map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}

      <div className={styles.page}>
        <header className={styles.hero}>
          <Container>
            <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
              <ol>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/templates">Invitations</Link>
                </li>
                <li aria-current="page">{c.heading}</li>
              </ol>
            </nav>
            <h1 className={styles.title}>{c.heading}</h1>
            <p className={styles.intro}>{c.intro}</p>
            <p className={styles.selfBuild}>{SELF_BUILD.short}</p>
          </Container>
        </header>

        <Container>
          <section id="designs" aria-labelledby="designs-heading" className={styles.section}>
            <h2 id="designs-heading" className={styles.sectionTitle}>
              {templates.length > 0 ? `${pluralize(templates.length, 'design')} in this collection` : 'Designs in this collection'}
            </h2>
            {templates.length > 0 ? (
              <>
                <ul className={styles.grid}>
                  {templates.map((template, i) => (
                    <li key={template.id || template.slug}>
                      <TemplateCard template={template} eager={i < 2} source="collection" />
                    </li>
                  ))}
                </ul>
                <p className={styles.more}>
                  <LinkButton href="/templates" variant="secondary">
                    See every design
                  </LinkButton>
                </p>
              </>
            ) : (
              // Not a 404: the collection is a real category whose catalogue is
              // temporarily empty (or the API blipped at revalidate time). The
              // editorial copy below still answers the question that brought the
              // visitor here.
              <p className={styles.sectionIntro}>
                New designs for this collection are on the way. <Link href="/templates">Browse every design</Link> in the
                meantime — you can use any of them for this celebration.
              </p>
            )}
          </section>

          <section aria-labelledby="notes-heading" className={styles.section}>
            <h2 id="notes-heading" className={styles.sectionTitle}>
              What to know
            </h2>
            <div className={styles.notes}>
              {c.notes.map((note) => (
                <div key={note.heading} className={styles.note}>
                  <h3 className={styles.noteHeading}>{note.heading}</h3>
                  <p className={styles.noteBody}>{note.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Internal links: these pages must be reachable by crawl from each
              other, not only from the sitemap. The aisle links are the same
              designs on the shop floor — this page is the one written for the
              search that brings someone here, the aisle is where they browse. */}
          <section aria-labelledby="other-heading" className={styles.section}>
            <h2 id="other-heading" className={styles.sectionTitle}>
              Other collections
            </h2>
            <ul className={styles.links}>
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link href={`/collections/${s.slug}`}>{s.heading}</Link>
                </li>
              ))}
              {subAisleLinks.map((aisle) => (
                <li key={aisle.slug}>
                  <Link href={`/${aisle.slug}?tradition=${encodeURIComponent(c.community)}`}>
                    {c.short} in {aisle.label.toLowerCase()}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/templates">Every design</Link>
              </li>
            </ul>
          </section>
        </Container>
      </div>
    </>
  );
}
