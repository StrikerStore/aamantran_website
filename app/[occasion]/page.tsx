import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { TemplateCard } from '@/components/gallery/TemplateCard';
import { AisleRail } from '@/components/shop/AisleRail';
import { SubAisleBar } from '@/components/shop/SubAisleBar';
import { Accordion } from '@/components/ui/Accordion';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Notice } from '@/components/ui/Notice';
import { getRecentPosts } from '@/lib/api/blog';
import { getTemplates } from '@/lib/api/templates';
import { lowestPrice } from '@/lib/galleryPrice';
import type { TemplateSummary } from '@/lib/api/types';
import { COLLECTIONS } from '@/lib/collections';
import { SELF_BUILD } from '@/lib/content/entitlements';
import { faqsByIds } from '@/lib/content/faqs';
import type { OccasionPage } from '@/lib/content/occasionPages';
import { pluralize } from '@/lib/format';
import {
  occasionPageBySlug,
  occasionPageSlugs,
  occasionPageVerdict,
  occasionPagesInShop,
  templatesForOccasion,
} from '@/lib/occasionPages';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';
import { aisleForPageSlug } from '@/lib/content/shopTaxonomy';
import { parseTradition, subAisles, templatesInSubAisle, traditionLabel } from '@/lib/subAisle';
import styles from '@/components/landing/landing.module.css';

/**
 * An occasion landing page — /engagement-invitations and its siblings.
 *
 * The route is a single dynamic segment at the root because these URLs have no
 * shared prefix; `dynamicParams = false` limits it to the slugs in
 * lib/content/occasionPages.ts, so no other address can fall through to it.
 *
 * A page exists only while the catalogue supports it (lib/occasionPages.ts):
 * too few designs, or an occasion that covers most of the shop, gives a 404
 * rather than a thin page or a copy of /templates. That is checked on every
 * render, so a page appears or disappears with the stock instead of with a
 * deploy.
 *
 * SUB-AISLES. `?tradition=hindu` narrows the aisle without leaving it, the way
 * a shopper moves along a shelf. It is a query parameter and not a route,
 * because a route would be a fourth address for the same designs; the filtered
 * view is `noindex` with a canonical back to the aisle, exactly as /templates
 * treats its own filters. Only aisles whose shopTaxonomy entry is narrowed by
 * tradition offer it, and only with the traditions actually in stock.
 */

/*
 * Reading `?tradition=` makes this route render per request, so `revalidate`
 * no longer governs the page shell. It still matters: the catalogue fetch
 * inside carries its own revalidate (lib/api/templates.ts), so a render costs
 * CPU and not an API call, and this value is what the shell goes back to if the
 * sub-aisle filter is ever removed.
 */
export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return occasionPageSlugs().map((occasion) => ({ occasion }));
}

type Props = {
  params: Promise<{ occasion: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const CATALOGUE_LIMIT = 100;

/**
 * Editorial content, the designs for it, and whether it may be published.
 * `catalogueFailed` separates "no designs" from "we could not look".
 */
async function loadOccasion(slug: string): Promise<{
  page: OccasionPage;
  templates: TemplateSummary[];
  catalogue: TemplateSummary[];
  verdict: ReturnType<typeof occasionPageVerdict>;
  catalogueFailed: boolean;
} | null> {
  const page = occasionPageBySlug(slug);
  if (!page) return null;

  const catalogue = await getTemplates({ limit: CATALOGUE_LIMIT, sort: 'new' });
  if (!catalogue) {
    return { page, templates: [], catalogue: [], verdict: occasionPageVerdict(0, 0), catalogueFailed: true };
  }

  const templates = templatesForOccasion(catalogue.templates, page);
  return {
    page,
    templates,
    catalogue: catalogue.templates,
    verdict: occasionPageVerdict(templates.length, catalogue.total),
    catalogueFailed: false,
  };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { occasion } = await params;
  const loaded = await loadOccasion(occasion);
  if (!loaded) return {};

  const metadata = buildPageMetadata({
    title: loaded.page.title,
    description: loaded.page.description,
    path: `/${loaded.page.slug}`,
  });

  // A narrowed shelf is the same designs in a smaller pile: never its own result.
  const options = subAisles(loaded.templates, aisleForPageSlug(loaded.page.slug));
  if (parseTradition((await searchParams).tradition, options)) {
    return {
      ...metadata,
      robots: { index: false, follow: true },
      alternates: { ...metadata.alternates, canonical: `${SITE_URL}/${loaded.page.slug}` },
    };
  }

  // A page can exist for shoppers and still be wrong to offer search engines:
  // too few designs to be worth a result, a near-copy of /templates, or a
  // catalogue that could not be read at all.
  if (loaded.catalogueFailed || loaded.verdict.status === 'noindex') {
    return {
      ...metadata,
      robots: { index: false, follow: true },
      ...(loaded.verdict.reason === 'covers-most-of-catalogue'
        ? { alternates: { ...metadata.alternates, canonical: `${SITE_URL}/templates` } }
        : {}),
    };
  }
  return metadata;
}

function schemaFor(page: OccasionPage, templates: TemplateSummary[], faqs: { q: string; a: string }[]) {
  const pageUrl = `${SITE_URL}/${page.slug}`;
  const schemas: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: page.heading,
      description: page.description,
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
        { '@type': 'ListItem', position: 3, name: page.heading, item: pageUrl },
      ],
    },
  ];
  if (faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    });
  }
  return schemas;
}

export default async function OccasionLandingPage({ params, searchParams }: Props) {
  const { occasion } = await params;
  const [loaded, query] = await Promise.all([loadOccasion(occasion), searchParams]);
  // Not a candidate slug, or nothing in this aisle to show.
  if (!loaded || (loaded.verdict.status === 'none' && !loaded.catalogueFailed)) notFound();

  const { page, templates, catalogue, catalogueFailed } = loaded;
  const faqs = faqsByIds(page.faqIds);
  const posts = await getRecentPosts(3);
  const siblings = occasionPagesInShop(catalogue).filter((p) => p.page.slug !== page.slug);
  const cheapest = lowestPrice(catalogue);

  const aisle = aisleForPageSlug(page.slug);
  const traditions = subAisles(templates, aisle);
  const tradition = parseTradition(query.tradition, traditions);
  const shown = templatesInSubAisle(templates, tradition);
  const narrowedTo = traditionLabel(traditions, tradition);

  return (
    <>
      {/* The aisle's own designs, never a filtered subset: the structured data
          describes the page search engines are offered. */}
      {!catalogueFailed && !tradition && schemaFor(page, templates, faqs).map((data, i) => <JsonLd key={i} data={data} />)}

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
                <li aria-current="page">{page.heading}</li>
              </ol>
            </nav>
            <h1 className={styles.title}>{page.heading}</h1>
            <p className={styles.intro}>{page.intro}</p>
            <p className={styles.selfBuild}>{SELF_BUILD.short}</p>
            <AisleRail templates={catalogue} currentKey={aisle?.key} />
          </Container>
        </header>

        <Container>
          <section id="designs" aria-labelledby="designs-heading" className={styles.section}>
            <h2 id="designs-heading" className={styles.sectionTitle}>
              {catalogueFailed
                ? 'Designs'
                : narrowedTo
                  ? `${narrowedTo}: ${pluralize(shown.length, 'design')}`
                  : `${pluralize(templates.length, 'design')} for this occasion`}
            </h2>

            {!catalogueFailed && traditions.length > 0 && (
              <SubAisleBar slug={page.slug} options={traditions} selected={tradition} />
            )}

            {catalogueFailed ? (
              <Notice
                tone="error"
                title="We couldn't load the designs just now"
                action={
                  <LinkButton href="/templates" variant="secondary" size="sm">
                    Try the full gallery
                  </LinkButton>
                }
              >
                This is our side, not yours. The rest of this page still applies.
              </Notice>
            ) : (
              <>
                <ul className={styles.grid}>
                  {shown.map((template, i) => (
                    <li key={template.id || template.slug}>
                      <TemplateCard
                        template={template}
                        eager={i < 2}
                        source={`occasion:${page.slug}`}
                        lowestPrice={cheapest}
                      />
                    </li>
                  ))}
                </ul>
                <p className={styles.more}>
                  <LinkButton href="/templates" variant="secondary">
                    See every invitation design
                  </LinkButton>
                </p>
              </>
            )}
          </section>

          <section aria-labelledby="prepare-heading" className={styles.section}>
            <h2 id="prepare-heading" className={styles.sectionTitle}>
              What to have ready
            </h2>
            <p className={styles.sectionIntro}>
              You fill these in yourself, in the builder, after you buy. Nothing is needed before you choose a design.
            </p>
            <ol className={styles.prepare}>
              {page.prepare.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="wording-heading" className={styles.section}>
            <h2 id="wording-heading" className={styles.sectionTitle}>
              Wording you can borrow
            </h2>
            <p className={styles.sectionIntro}>
              Every line of text on the invitation is yours to type, so nothing here is fixed by the design. Adapt these
              or write your own.
            </p>
            <ul className={styles.wording}>
              {page.wording.map((example) => (
                <li key={example.label}>
                  <p className={styles.wordingLabel}>{example.label}</p>
                  <blockquote className={styles.wordingText}>{example.text}</blockquote>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="notes-heading" className={styles.section}>
            <h2 id="notes-heading" className={styles.sectionTitle}>
              What these invitations do
            </h2>
            <ul className={styles.notes}>
              {page.notes.map((note) => (
                <li key={note.heading} className={styles.note}>
                  <h3 className={styles.noteHeading}>{note.heading}</h3>
                  <p className={styles.noteBody}>{note.body}</p>
                </li>
              ))}
            </ul>
          </section>

          {faqs.length > 0 && (
            <section aria-labelledby="faq-heading" className={styles.section}>
              <h2 id="faq-heading" className={styles.sectionTitle}>
                Questions people ask
              </h2>
              <Accordion
                headingLevel={3}
                items={faqs.map((faq) => ({
                  id: faq.id,
                  title: faq.q,
                  content: (
                    <p>
                      {faq.a}
                      {faq.link && (
                        <>
                          {' '}
                          <Link href={faq.link.href}>{faq.link.label}</Link>
                        </>
                      )}
                    </p>
                  ),
                }))}
              />
              <p className={styles.more}>
                <Link href="/faq">Read every question</Link>
              </p>
            </section>
          )}

          {posts && posts.length > 0 && (
            <section aria-labelledby="guides-heading" className={styles.section}>
              <h2 id="guides-heading" className={styles.sectionTitle}>
                Guides
              </h2>
              <ul className={styles.links}>
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="elsewhere-heading" className={styles.section}>
            <h2 id="elsewhere-heading" className={styles.sectionTitle}>
              Looking for something else?
            </h2>
            <ul className={styles.links}>
              {siblings.map(({ page: sibling }) => (
                <li key={sibling.slug}>
                  <Link href={`/${sibling.slug}`}>{sibling.heading}</Link>
                </li>
              ))}
              {COLLECTIONS.map((collection) => (
                <li key={collection.slug}>
                  <Link href={`/collections/${collection.slug}`}>{collection.heading}</Link>
                </li>
              ))}
              <li>
                <Link href="/templates">Every invitation design</Link>
              </li>
            </ul>
          </section>
        </Container>
      </div>
    </>
  );
}
