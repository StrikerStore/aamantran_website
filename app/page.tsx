import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import JsonLd from '@/components/JsonLd';
import { GuestExperienceDemo } from '@/components/demos/GuestExperienceDemo';
import { PlanningDemo } from '@/components/demos/PlanningDemo';
import { TemplateCard } from '@/components/gallery/TemplateCard';
import { PaymentFailedRedirect } from '@/components/home/PaymentFailedRedirect';
import { ReviewList } from '@/components/product/ReviewList';
import { Accordion } from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { getRecentPosts } from '@/lib/api/blog';
import { getCatalogueStats, getFeaturedReviews, getTemplates } from '@/lib/api/templates';
import { COLLECTIONS } from '@/lib/collections';
import { PURCHASE_STEPS } from '@/lib/content/builderSteps';
import { ACCESS, INCLUDED, PLANNING_TOOLS, SELF_BUILD } from '@/lib/content/entitlements';
import { PURCHASE_FAQ_IDS, faqsByIds } from '@/lib/content/faqs';
import { sampleWeddingDate } from '@/lib/content/sampleInvite';
import { pluralize } from '@/lib/format';
import { occasionPagesInShop } from '@/lib/occasionPages';
import { alternateLanguages } from '@/lib/seo';
import { getStartingPrice } from '@/lib/startingPrice';
import { formatMoney, IS_INTL } from '@/lib/storefront';
import { templateArtAlt } from '@/lib/templateCard';
import { TRY_DEMO } from '@/lib/content/tryDemo';
import styles from './home.module.css';

/**
 * The homepage.
 *
 * Everything on it is either read from the catalogue or written in
 * lib/content, so the page cannot claim more than the product does. The page it
 * replaces carried three invented testimonials, a per-guest link feature that
 * does not exist, "20+ designs" against a catalogue of twelve, "edit anytime"
 * against names that lock, and a price table asserting what printed cards and
 * video invitations cost elsewhere.
 *
 * The guest and planning demos (the plan's H04 and H05) arrive with their
 * components in the next task; the anchors other pages link to — #how,
 * #features and #reviews — are already here.
 */

const FEATURED_DESIGNS = 6;
const STORIES = 9;
const CATALOGUE_LIMIT = 100;

/** The catalogue and reviews move slowly; two minutes keeps the page cheap to serve. */
export const revalidate = 120;

export const metadata: Metadata = {
  // `absolute` opts out of the layout's "%s — Aamantran" template.
  title: { absolute: 'Aamantran — Digital Invitations You Fill In Yourself' },
  description:
    'Choose an invitation design, pay once, and fill in your own names, ceremonies, photos and music. Guests open a link, no app, and RSVP to each ceremony.',
  alternates: { canonical: '/', languages: alternateLanguages('/') },
};

export default async function HomePage() {
  const [stats, featured, catalogue, reviews, posts, startingPrice] = await Promise.all([
    getCatalogueStats(),
    getTemplates({ limit: FEATURED_DESIGNS, sort: 'popular' }),
    getTemplates({ limit: CATALOGUE_LIMIT, sort: 'new' }),
    getFeaturedReviews(STORIES),
    getRecentPosts(3),
    getStartingPrice(),
  ]);

  const designs = featured?.templates ?? [];
  // Only offered when a design on this page can take it: the hero links to these cards.
  const hasTryable = designs.some((design) => design.tryWithNames);
  const designCount = stats?.total ?? catalogue?.total ?? 0;
  const occasionPages = occasionPagesInShop(catalogue?.templates ?? []);
  const faqs = faqsByIds(PURCHASE_FAQ_IDS);
  const heroArt = catalogue?.templates[0] ?? designs[0] ?? null;
  // Fixed here rather than in the browser, so the sample dates in the guest
  // demo are the same in the HTML and after hydration.
  const sampleWeddingIso = sampleWeddingDate().toISOString();

  // The India figure is the payable total from /api/templates/stats, so the
  // headline price matches what checkout charges. That endpoint is part of a
  // backend that may not be deployed yet, and it is INR-only, so both other
  // cases fall back to the cheapest base price for this storefront.
  const fromPrice = !IS_INTL && stats?.lowest
    ? `From ${formatMoney(stats.lowest.total)}, GST included`
    : `From ${startingPrice}${IS_INTL ? '' : ' + GST'}`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      {/* Reads the URL, so it renders inside its own boundary. */}
      <Suspense fallback={null}>
        <PaymentFailedRedirect />
      </Suspense>

      <div className={styles.page}>
        {/* ── H01 Hero ─────────────────────────────────────────────────── */}
        <header className={styles.hero}>
          <Container className={styles.heroInner}>
            <div className={styles.heroText}>
              <h1 className={styles.title}>Beautiful invitations, with the tools to bring your celebration together</h1>
              <p className={styles.lede}>
                Choose a design and pay once. You fill in your own names, ceremonies, photos and music, then share one
                link. Guests open it in any browser and reply to each ceremony separately.
              </p>
              <p className={styles.price}>{fromPrice}</p>
              <div className={styles.heroActions}>
                <LinkButton href="/templates">Browse invitations</LinkButton>
                {hasTryable ? (
                  <LinkButton href="#designs" variant="secondary">
                    {TRY_DEMO.cta}
                  </LinkButton>
                ) : (
                  <LinkButton href="#how" variant="secondary">
                    See how it works
                  </LinkButton>
                )}
              </div>
              <ul className={styles.reassurance}>
                <li>{SELF_BUILD.short}</li>
                <li>{ACCESS.short}.</li>
                <li>One payment, no subscription.</li>
              </ul>
            </div>
            <div className={styles.heroArt}>
              {heroArt && (
                <RemoteImage
                  src={heroArt.mobileThumbnailUrl ?? heroArt.desktopThumbnailUrl ?? heroArt.thumbnailUrl}
                  alt={templateArtAlt(heroArt.name)}
                  sizes="(max-width: 1023px) 70vw, 420px"
                  aspectRatio={heroArt.mobileThumbnailUrl ? '9 / 16' : '16 / 10'}
                  className={styles.heroImage}
                  preload
                />
              )}
            </div>
          </Container>
        </header>

        <Container>
          {/* ── H02 Browse by occasion or tradition ────────────────────── */}
          <section aria-labelledby="browse-heading" className={styles.section}>
            <h2 id="browse-heading" className={styles.sectionTitle}>
              Browse by occasion or tradition
            </h2>
            <ul className={styles.tiles}>
              {occasionPages.map(({ page }) => (
                <li key={page.slug}>
                  <Link href={`/${page.slug}`}>{page.heading}</Link>
                </li>
              ))}
              {COLLECTIONS.map((collection) => (
                <li key={collection.slug}>
                  <Link href={`/collections/${collection.slug}`}>{collection.heading}</Link>
                </li>
              ))}
              <li>
                <Link href="/templates">Every design{designCount > 0 ? ` (${designCount})` : ''}</Link>
              </li>
            </ul>
          </section>

          {/* ── H03 Designs ───────────────────────────────────────────── */}
          {designs.length > 0 && (
            <section id="designs" aria-labelledby="designs-heading" className={styles.section}>
              <h2 id="designs-heading" className={styles.sectionTitle}>
                Designs couples are choosing
              </h2>
              <p className={styles.sectionIntro}>
                Every design has a live demo you can open before you buy.
                {hasTryable && ` Designs marked “${TRY_DEMO.cta}” can show your own names and dates first, free.`}
              </p>
              <ul className={styles.grid}>
                {designs.map((design, i) => (
                  <li key={design.id || design.slug}>
                    <TemplateCard template={design} eager={i < 2} source="home" />
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

          {/* ── H04 What your guests see ──────────────────────────────── */}
          <section id="guest-demo" aria-labelledby="guest-demo-heading" className={styles.section}>
            <h2 id="guest-demo-heading" className={styles.sectionTitle}>
              What your guests see
            </h2>
            <p className={styles.sectionIntro}>
              A working sample of the invitation itself: the ceremonies, directions, the RSVP and the wishes wall. Try
              it — nothing here is sent anywhere.
            </p>
            <GuestExperienceDemo weddingDateIso={sampleWeddingIso} />
          </section>

          {/* ── H05 The planning tools ────────────────────────────────── */}
          <section id="planning-demo" aria-labelledby="planning-demo-heading" className={styles.section}>
            <h2 id="planning-demo-heading" className={styles.sectionTitle}>
              The planning tools, working
            </h2>
            <p className={styles.sectionIntro}>
              These come with every invitation. The budget and tasks below are live — add an expense, mark one paid,
              move a task on — and nothing is saved.
            </p>
            <PlanningDemo />
          </section>

          {/* ── H06 How it works ──────────────────────────────────────── */}
          <section id="how" aria-labelledby="how-heading" className={styles.section}>
            <h2 id="how-heading" className={styles.sectionTitle}>
              How it works
            </h2>
            <ol className={styles.steps}>
              {PURCHASE_STEPS.map((step, i) => (
                <li key={step.id} className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>
                    {step.text}
                    {step.id === 'choose' && hasTryable && ' Or try one with your own names first, free and with no account.'}
                  </p>
                </li>
              ))}
            </ol>
            <p className={styles.note}>{SELF_BUILD.long}</p>
          </section>

          {/* ── H08 What's included ───────────────────────────────────── */}
          <section id="features" aria-labelledby="included-heading" className={styles.section}>
            <h2 id="included-heading" className={styles.sectionTitle}>
              What’s included
            </h2>
            <p className={styles.sectionIntro}>
              Everything below comes with any design, for one payment. {ACCESS.long}
            </p>
            <ul className={styles.included}>
              {INCLUDED.map((item) => (
                <li key={item.id}>
                  <span className={styles.includedTitle}>{item.title}</span>
                  <span className={styles.includedDetail}>
                    {item.detail}
                    {item.templateDependent && ' Where the design supports it.'}
                  </span>
                </li>
              ))}
            </ul>
            <h3 className={styles.subTitle}>The eight planning tools</h3>
            <ul className={styles.tools}>
              {PLANNING_TOOLS.map((tool) => (
                <li key={tool.key}>
                  <Badge>{tool.name}</Badge>
                  <span className={styles.toolText}>{tool.does}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── H07 Stories ───────────────────────────────────────────── */}
          <section id="reviews" aria-labelledby="stories-heading" className={styles.section}>
            <h2 id="stories-heading" className={styles.sectionTitle}>
              What couples say
            </h2>
            <ReviewList
              reviews={reviews?.reviews ?? []}
              avgRating={reviews?.avgRating ?? 0}
              totalCount={reviews?.totalCount ?? 0}
              curatedCount={reviews?.curatedCount ?? 0}
              showTemplate
              emptyMessage="No reviews yet. When couples who bought an invitation leave one, it appears here."
            />
          </section>

          {/* ── H09 Questions ─────────────────────────────────────────── */}
          <section aria-labelledby="faq-heading" className={styles.section}>
            <h2 id="faq-heading" className={styles.sectionTitle}>
              Questions before buying
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

          {/* ── H10 Guides ────────────────────────────────────────────── */}
          {posts && posts.length > 0 && (
            <section aria-labelledby="guides-heading" className={styles.section}>
              <h2 id="guides-heading" className={styles.sectionTitle}>
                Guides
              </h2>
              <ul className={styles.guides}>
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    {post.excerpt && <span className={styles.guideText}>{post.excerpt}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Container>

        {/* ── Final call to action ─────────────────────────────────────── */}
        <section aria-labelledby="cta-heading" className={styles.cta}>
          <Container>
            <h2 id="cta-heading" className={styles.ctaTitle}>
              Find the design, then make it yours
            </h2>
            <p className={styles.ctaText}>
              {designCount > 0 ? `${pluralize(designCount, 'design')} to choose from. ` : ''}
              {fromPrice}. You build the invitation yourself, and it stays live until six months after your last ceremony.
            </p>
            <LinkButton href="/templates">Browse invitations</LinkButton>
          </Container>
        </section>
      </div>
    </>
  );
}
