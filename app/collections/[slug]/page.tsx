import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import TemplateTag from '@/components/TemplateTag';
import { COLLECTIONS, collectionBySlug, type Collection } from '@/lib/collections';
import { buildPageMetadata, SITE_URL, SITE_NAME } from '@/lib/seo';
import { getPublicApiUrl } from '@/lib/publicEnv';
import { resolveBackendPublicUrl } from '@/lib/assetUrl';
import { CURRENCY, IS_INTL, STOREFRONT, formatInr, formatUsd } from '@/lib/storefront';

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
 * template names are in the HTML a crawler receives, not assembled afterwards in
 * the browser the way /templates does it.
 */

interface CollectionTemplate {
  id: string; slug: string; name: string;
  thumbnailUrl: string | null;
  desktopThumbnailUrl?: string | null;
  community: string;
  price: number;
  priceUsd: number | null;
  badge?: string | null;
}

const COMMUNITY_THEME: Record<string, string> = {
  hindu: 'royal', muslim: 'emerald', sikh: 'navy', christian: 'blush', universal: 'minimal',
};

async function getTemplates(community: string): Promise<CollectionTemplate[]> {
  try {
    const res = await fetch(
      `${getPublicApiUrl()}/api/templates?community=${encodeURIComponent(community)}&limit=50&sort=new`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.templates ?? []) as CollectionTemplate[];
  } catch {
    return [];
  }
}

/** Prerender all four at build time; anything else 404s. */
export function generateStaticParams() {
  return COLLECTIONS.map(c => ({ slug: c.slug }));
}
export const dynamicParams = false;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const c = collectionBySlug(slug);
  if (!c) return {};
  return buildPageMetadata({
    title: c.title,
    description: c.description,
    path: `/collections/${c.slug}`,
  });
}

function priceLabel(t: CollectionTemplate) {
  if (IS_INTL) return t.priceUsd != null ? `${CURRENCY} ${formatUsd(t.priceUsd)}` : '—';
  return `${CURRENCY} ${formatInr(t.price)}`;
}

/**
 * Card matching the one on /templates, but built from links rather than an
 * onClick handler so the whole grid works as server-rendered HTML.
 */
function TemplateCard({ t }: { t: CollectionTemplate }) {
  const theme = COMMUNITY_THEME[t.community?.toLowerCase()] ?? 'minimal';
  const raw = t.desktopThumbnailUrl || t.thumbnailUrl || null;
  const src = raw ? resolveBackendPublicUrl(raw) : null;
  const productUrl = `/templates/${t.slug}`;

  return (
    <div className="tpl-grid-card">
      <Link href={productUrl} className="tpl-grid-thumb" aria-label={t.name}>
        {src ? (
          // Descriptive alt rather than the bare template name: this is the only
          // text a crawler gets from the image, and "Sitaare" says nothing.
          <img
            src={src}
            alt={`${t.name} — digital wedding invitation template`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div className={`tpl-grid-thumb-inner ${theme}`}>
            <div>
              <div className="tpl-thumb-names">{t.name}</div>
              <span className="tpl-thumb-date">{t.community?.toUpperCase()}</span>
            </div>
          </div>
        )}
        <TemplateTag badge={t.badge} />
      </Link>
      <div className="tpl-grid-info">
        <div className="tpl-grid-title-row">
          <p className="tpl-grid-name">{t.name}</p>
          <Link href={`/checkout/${t.slug}`} className="tpl-grid-price-pill">{priceLabel(t)}</Link>
        </div>
        <div className="tpl-grid-bottom-row">
          <a
            href={`${getPublicApiUrl()}/demo/${t.slug}?storefront=${STOREFRONT}`}
            className="tpl-grid-chip"
          >
            Live demo
          </a>
          <Link href={productUrl} className="tpl-grid-link-btn">View</Link>
        </div>
      </div>
    </div>
  );
}

function schemaFor(c: Collection, templates: CollectionTemplate[]) {
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
        { '@type': 'ListItem', position: 2, name: 'Templates', item: `${SITE_URL}/templates` },
        { '@type': 'ListItem', position: 3, name: c.heading, item: pageUrl },
      ],
    },
  ];
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = collectionBySlug(slug);
  if (!c) notFound();

  const templates = await getTemplates(c.community);
  const siblings = COLLECTIONS.filter(x => x.slug !== c.slug);

  return (
    <>
      {schemaFor(c, templates).map((data, i) => <JsonLd key={i} data={data} />)}

      <div className="tpl-page-hero">
        <div className="container">
          <p className="eyebrow center">Designs</p>
          <h1>{c.heading}</h1>
          <p>{c.intro}</p>
        </div>
      </div>

      <div className="tpl-grid-section">
        <div className="container">
          {templates.length > 0 ? (
            <div className="tpl-grid">
              {templates.map(t => <TemplateCard key={t.id} t={t} />)}
            </div>
          ) : (
            // Not a 404: the collection is a real category whose catalogue is
            // temporarily empty (or the API blipped at revalidate time). The
            // editorial copy below still answers the question that brought the
            // visitor here.
            <p className="center" style={{ color: 'var(--text-light)' }}>
              New designs for this collection are on the way —{' '}
              <Link href="/templates">browse every template</Link> in the meantime.
            </p>
          )}

          <div className="collection-notes">
            {c.notes.map(n => (
              <div className="collection-note" key={n.heading}>
                <h2>{n.heading}</h2>
                <p>{n.body}</p>
              </div>
            ))}
          </div>

          {/* Internal links: these pages must be reachable by crawl from each
              other, not only from the sitemap. */}
          <div className="collection-siblings">
            <h2>Other collections</h2>
            <ul>
              {siblings.map(s => (
                <li key={s.slug}>
                  <Link href={`/collections/${s.slug}`}>{s.heading}</Link>
                </li>
              ))}
              <li><Link href="/templates">All wedding invitation templates</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
