import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import PixelViewContent from '@/components/PixelViewContent';
import { TemplateCard } from '@/components/gallery/TemplateCard';
import { Capabilities } from '@/components/product/Capabilities';
import { ProductGallery } from '@/components/product/ProductGallery';
import { PurchasePanel } from '@/components/product/PurchasePanel';
import { ReviewList } from '@/components/product/ReviewList';
import { StickyPurchaseBar } from '@/components/product/StickyPurchaseBar';
import { TryDemoButton } from '@/components/try-demo/TryDemoButton';
import { TryDemoSheet } from '@/components/try-demo/TryDemoSheet';
import { Accordion } from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { getRelatedTemplates, getTemplate, getTemplateReviews } from '@/lib/api/templates';
import type { Review, TemplateDetail } from '@/lib/api/types';
import { resolveBackendPublicUrl } from '@/lib/assetUrl';
import { BUILDER_STEPS } from '@/lib/content/builderSteps';
import { CHANGEABLE, INCLUDED, NAME_FREEZE } from '@/lib/content/entitlements';
import { PURCHASE_FAQ_IDS, faqsByIds } from '@/lib/content/faqs';
import { TRY_DEMO } from '@/lib/content/tryDemo';
import { languageLabel, pluralize, truncateWords } from '@/lib/format';
import { computePriceBreakdown } from '@/lib/priceMath';
import { CURRENCY, IS_INTL, priceFor } from '@/lib/storefront';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';
import { cardOccasionLabels, templateDemoUrl } from '@/lib/templateCard';
import styles from './product.module.css';

/**
 * A design's own page: what it looks like, what it costs, what you fill in, and
 * what you get.
 *
 * Two things the page it replaces did are deliberately gone: it showed three
 * invented reviews ("Sample feedback") when a design had none, and it quoted a
 * price without the GST checkout adds. Both are now honest — no reviews means
 * the page says so, and the price shows the total that will be charged.
 */

type Props = { params: Promise<{ slug: string }> };

/** Reviews quoted inside Product structured data. */
const JSON_LD_REVIEW_LIMIT = 5;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template) return { title: 'Design not found' };

  const description = template.shortDescription
    ?? (template.aboutText
      ? truncateWords(template.aboutText, 28)
      : `${template.name} — a digital invitation design you fill in yourself, with RSVP, guest list and WhatsApp sharing.`);
  const image = resolveBackendPublicUrl(template.desktopThumbnailUrl ?? template.thumbnailUrl ?? template.mobileThumbnailUrl);

  return buildPageMetadata({
    title: `${template.name} — Digital Invitation Design`,
    description,
    path: `/templates/${template.slug}`,
    ...(image ? { ogImage: image } : {}),
  });
}

function productSchema(template: TemplateDetail, reviews: Review[], total: number) {
  const base = priceFor(template);
  const pageUrl = `${SITE_URL}/templates/${template.slug}`;
  const image = resolveBackendPublicUrl(template.desktopThumbnailUrl ?? template.thumbnailUrl);
  // The price a buyer is charged, GST included, not the pre-tax figure: the
  // amount in search results has to match the amount at checkout.
  const payable = base == null ? null : computePriceBreakdown({ base, gstPercent: template.gstPercent, intl: IS_INTL }).total;
  const customerReviews = reviews.filter((review) => review.source === 'customer' && review.reviewText);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: template.name,
    description: template.shortDescription ?? template.aboutText ?? `${template.name} — digital invitation design by ${SITE_NAME}.`,
    ...(image ? { image: [image] } : {}),
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(payable != null
      ? {
          offers: {
            '@type': 'Offer',
            url: pageUrl,
            priceCurrency: CURRENCY,
            price: (payable / 100).toFixed(2),
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
    // Genuine customer reviews only; team-written ones are shown on the page but
    // never counted, so they cannot inflate a rating in search results.
    ...(total > 0 && template.avgRating
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: template.avgRating.toFixed(1), reviewCount: total } }
      : {}),
    ...(customerReviews.length > 0
      ? {
          review: customerReviews.slice(0, JSON_LD_REVIEW_LIMIT).map((review) => ({
            '@type': 'Review',
            reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5 },
            ...(review.coupleNames ? { author: { '@type': 'Person', name: review.coupleNames } } : {}),
            reviewBody: review.reviewText,
            ...(review.createdAt ? { datePublished: review.createdAt.slice(0, 10) } : {}),
          })),
        }
      : {}),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const template = await getTemplate(slug, { capabilities: true });
  if (!template) notFound();

  const [reviewsResponse, related] = await Promise.all([
    getTemplateReviews(slug),
    getRelatedTemplates(template.community, slug, 3),
  ]);
  const reviews = reviewsResponse?.reviews ?? [];
  const genuineTotal = reviewsResponse?.totalCount ?? template.reviewCount;
  const curatedTotal = reviewsResponse?.curatedCount ?? template.curatedReviewCount;

  const occasions = cardOccasionLabels(template.bestFor, 4);
  const summary = template.shortDescription ?? (template.aboutText ? truncateWords(template.aboutText, 32) : null);
  const faqs = faqsByIds(PURCHASE_FAQ_IDS);
  const attributes = [
    { label: 'Style', value: template.style },
    { label: 'Colours', value: template.colourPalette },
    { label: 'Animation', value: template.animations },
    { label: 'Languages', value: template.languages.map(languageLabel).join(', ') || null },
    { label: 'Best for', value: template.bestFor.join(', ') || null },
  ].filter((attribute): attribute is { label: string; value: string } => Boolean(attribute.value));

  const pageUrl = `${SITE_URL}/templates/${template.slug}`;
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Invitations', item: `${SITE_URL}/templates` },
      { '@type': 'ListItem', position: 3, name: template.name, item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd data={productSchema(template, reviews, genuineTotal)} />
      <JsonLd data={breadcrumbSchema} />
      <PixelViewContent slug={slug} price={template.price} priceUsd={template.priceUsd} name={template.name} />

      <div className={styles.page}>
        <Container>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/templates">Invitations</Link>
              </li>
              <li aria-current="page">{template.name}</li>
            </ol>
          </nav>

          <div className={styles.top}>
            <div className={styles.visual}>
              <ProductGallery
                name={template.name}
                slug={template.slug}
                demoUrl={templateDemoUrl(template.slug)}
                desktopSrc={template.desktopThumbnailUrl ?? template.thumbnailUrl}
                phoneSrc={template.mobileThumbnailUrl}
              />
            </div>

            <div className={styles.buy}>
              <h1 className={styles.name}>{template.name}</h1>
              {occasions.length > 0 && (
                <ul className={styles.occasions} aria-label="Occasions">
                  {occasions.map((occasion) => (
                    <li key={occasion}>
                      <Badge>{occasion}</Badge>
                    </li>
                  ))}
                </ul>
              )}
              {summary && <p className={styles.summary}>{summary}</p>}
              {genuineTotal > 0 && template.avgRating && (
                <p className={styles.rating}>
                  <span aria-hidden="true" className={styles.stars}>
                    {'★'.repeat(Math.round(template.avgRating))}
                  </span>
                  <span>
                    {template.avgRating.toFixed(1)} from <a href="#reviews">{pluralize(genuineTotal, 'customer review')}</a>
                  </span>
                </p>
              )}

              <PurchasePanel
                slug={template.slug}
                name={template.name}
                price={template.price}
                priceUsd={template.priceUsd}
                originalPrice={template.originalPrice}
                originalPriceUsd={template.originalPriceUsd}
                gstPercent={template.gstPercent}
                tryWithNames={template.tryWithNames}
              />
            </div>
          </div>

          {template.tryWithNames && (
            <section aria-labelledby="try-heading" className={styles.tryBand}>
              <div className={styles.tryText}>
                <h2 id="try-heading" className={styles.tryTitle}>
                  {TRY_DEMO.bandTitle}
                </h2>
                <p className={styles.tryIntro}>{TRY_DEMO.bandText}</p>
              </div>
              <TryDemoButton source="product-band" variant="primary">
                {TRY_DEMO.cta}
              </TryDemoButton>
            </section>
          )}

          {template.aboutText && (
            <section aria-labelledby="about-heading" className={styles.section}>
              <h2 id="about-heading" className={styles.sectionTitle}>
                About this design
              </h2>
              <p className={styles.prose}>{template.aboutText}</p>
              {attributes.length > 0 && (
                <dl className={styles.attributes}>
                  {attributes.map((attribute) => (
                    <div key={attribute.label}>
                      <dt>{attribute.label}</dt>
                      <dd>{attribute.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          )}

          {template.capabilities && (
            <section aria-labelledby="fill-heading" className={styles.section}>
              <h2 id="fill-heading" className={styles.sectionTitle}>
                What you fill in on this design
              </h2>
              <Capabilities capabilities={template.capabilities} />
            </section>
          )}

          <section aria-labelledby="included-heading" className={styles.section}>
            <h2 id="included-heading" className={styles.sectionTitle}>
              What the price includes
            </h2>
            <ul className={styles.included}>
              {INCLUDED.map((item) => (
                <li key={item.id}>
                  <span className={styles.includedTitle}>{item.title}</span>
                  <span className={styles.includedDetail}>
                    {item.detail}
                    {item.templateDependent && ' Where this design supports it.'}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="setup-heading" className={styles.section}>
            <h2 id="setup-heading" className={styles.sectionTitle}>
              How you set it up
            </h2>
            <ol className={styles.steps}>
              {BUILDER_STEPS.map((step) => (
                <li key={step.id}>
                  <span className={styles.stepLabel}>{step.label}</span>
                  <span className={styles.stepText}>{step.youEnter}</span>
                </li>
              ))}
            </ol>
            <p className={styles.note}>{NAME_FREEZE.long}</p>
          </section>

          <section aria-labelledby="change-heading" className={styles.section}>
            <h2 id="change-heading" className={styles.sectionTitle}>
              What you can change later, and what you cannot
            </h2>
            <div className={styles.changeGrid}>
              <div className={styles.changeCard}>
                <h3 className={styles.changeTitle}>Change any time</h3>
                <ul>
                  {CHANGEABLE.canChange.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.changeCard}>
                <h3 className={styles.changeTitle}>Fixed</h3>
                <ul>
                  {CHANGEABLE.fixed.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="reviews" aria-labelledby="reviews-heading" className={styles.section}>
            <h2 id="reviews-heading" className={styles.sectionTitle}>
              Reviews of this design
            </h2>
            <ReviewList reviews={reviews} avgRating={reviewsResponse?.avgRating ?? 0} totalCount={genuineTotal} curatedCount={curatedTotal} />
          </section>

          <section aria-labelledby="faq-heading" className={styles.section}>
            <h2 id="faq-heading" className={styles.sectionTitle}>
              Before you buy
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
          </section>

          {related.length > 0 && (
            <section aria-labelledby="related-heading" className={styles.section}>
              <h2 id="related-heading" className={styles.sectionTitle}>
                Other designs like this one
              </h2>
              <ul className={styles.related}>
                {related.map((item) => (
                  <li key={item.id || item.slug}>
                    <TemplateCard template={item} source="product-related" />
                  </li>
                ))}
              </ul>
              <p className={styles.more}>
                <LinkButton href="/templates" variant="secondary">
                  See every design
                </LinkButton>
              </p>
            </section>
          )}
        </Container>
      </div>

      <StickyPurchaseBar
        slug={template.slug}
        name={template.name}
        price={template.price}
        priceUsd={template.priceUsd}
        tryWithNames={template.tryWithNames}
      />
      {template.tryWithNames && <TryDemoSheet slug={template.slug} name={template.name} />}
    </>
  );
}
