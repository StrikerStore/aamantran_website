import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import JsonLd from '@/components/JsonLd';
import { TemplateCard } from '@/components/gallery/TemplateCard';
import { InstagramStrip } from '@/components/home/InstagramStrip';
import { PaymentFailedRedirect } from '@/components/home/PaymentFailedRedirect';
import { ReviewList } from '@/components/product/ReviewList';
import { AisleTiles } from '@/components/shop/AisleTiles';
import { PriceBoard } from '@/components/shop/PriceBoard';
import { ProofStrip } from '@/components/shop/ProofStrip';
import { ShopWindow } from '@/components/shop/ShopWindow';
import { TraditionTiles } from '@/components/shop/TraditionTiles';
import { Accordion } from '@/components/ui/Accordion';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { getCatalogueStats, getFeaturedReviews, getTemplates } from '@/lib/api/templates';
import { showcase } from '@/lib/showcase';
import { ACCESS } from '@/lib/content/entitlements';
import { PURCHASE_FAQ_IDS, faqsByIds } from '@/lib/content/faqs';
import { HERO_REASSURANCE, SHOP_STEPS } from '@/lib/content/shopHome';
import { pluralize } from '@/lib/format';
import { lowestPrice } from '@/lib/galleryPrice';
import { alternateLanguages } from '@/lib/seo';
import { getStartingPrice } from '@/lib/startingPrice';
import { formatMoney, IS_INTL } from '@/lib/storefront';
import { TRY_DEMO } from '@/lib/content/tryDemo';
import styles from './home.module.css';

/**
 * The homepage, as a shop.
 *
 * The page this replaces was 6,500px tall and, measured section by section, 31%
 * selling to 60% explaining: one grid of six designs sat above roughly 4,000px
 * of prose and two full-screen demos, and on a phone the first screen showed no
 * invitation at all. A customer walking into a shop sees the goods first, then
 * the aisles, then the prices; they ask how it works once they want one.
 *
 * So the order here is: what we sell (in the window), where to find yours (the
 * aisles), what we have (the designs), who it's for (the traditions), what it
 * costs (the board) — and only then how it works, what it comes with, and what
 * other people thought.
 *
 * Both interactive demos moved off this page rather than being deleted: the
 * guest experience now lives on /features and the planning tools on
 * /wedding-planning-tools, where somebody has already said they want the
 * detail. The proof strip here links to both.
 *
 * Everything on the page is still read from the catalogue or from lib/content,
 * so it cannot claim more than the product does.
 */

/** A shop shows a full shelf, not a sample. Baymard's listing research: 24–48. */
const FEATURED_DESIGNS = 8;
/** The window display, above the fold. */
const WINDOW_DESIGNS = 3;
/** Three reviews, then a link. More than three is a reviews page. */
const STORIES = 3;
const CATALOGUE_LIMIT = 100;
/** Four questions here; /faq has the rest. */
const HOME_FAQS = 4;

/** The catalogue and reviews move slowly; two minutes keeps the page cheap to serve. */
export const revalidate = 120;

export const metadata: Metadata = {
  // `absolute` opts out of the layout's "%s — Aamantran" template.
  title: { absolute: 'Aamantran — Digital Invitations You Fill In Yourself' },
  description:
    'Choose an invite, pay once, and fill in your own names, ceremonies, photos and music. Guests open a link, no app, and RSVP to each ceremony.',
  alternates: { canonical: '/', languages: alternateLanguages('/') },
};

export default async function HomePage() {
  const [stats, featured, catalogue, reviews, startingPrice] = await Promise.all([
    getCatalogueStats(),
    // The whole catalogue in popularity order — most opened and most bought
    // first. The window and the grid below are both taken from it.
    getTemplates({ limit: CATALOGUE_LIMIT, sort: 'popular' }),
    getTemplates({ limit: CATALOGUE_LIMIT, sort: 'new' }),
    getFeaturedReviews(STORIES),
    getStartingPrice(),
  ]);

  const ranked = featured?.templates ?? [];
  const designs = ranked.slice(0, FEATURED_DESIGNS);
  const templates = catalogue?.templates ?? [];
  // Only offered when a design on this page can take it: the hero links to these cards.
  const hasTryable = designs.some((design) => design.tryWithNames);
  const designCount = stats?.total ?? catalogue?.total ?? 0;
  const faqs = faqsByIds(PURCHASE_FAQ_IDS).slice(0, HOME_FAQS);
  const cheapest = lowestPrice(templates);
  // The window shows the leading invite of each category (see lib/showcase.ts);
  // if the popular list is unavailable it falls back to the newest.
  const windowDesigns = ranked.length > 0
    ? showcase(ranked, WINDOW_DESIGNS)
    : templates.slice(0, WINDOW_DESIGNS);

  // The cheapest design's own price — ₹999, not ₹1,178.82. The headline is the
  // price of the thing, the way a shelf edge is; GST is added at checkout and
  // shown there in full, and the pricing page explains it.
  //
  // `stats.lowest.price` is that figure straight from the catalogue, so it moves
  // when the catalogue does. The fallback is the same number derived on the
  // storefront, for when the stats endpoint is unavailable.
  const fromPrice = !IS_INTL && stats?.lowest
    ? `From ${formatMoney(stats.lowest.price)}`
    : `From ${startingPrice}`;

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
        {/* ── 1. The shop window ───────────────────────────────────────── */}
        <header className={styles.hero}>
          <Container className={styles.heroInner}>
            <div className={styles.heroText}>
              <h1 className={styles.title}>Invitations your guests open, fill out and reply to</h1>
              <p className={styles.lede}>
                Choose an invite, pay once, and fill in your own names, ceremonies, photos and music. One link, no
                app, and an RSVP for every ceremony.
              </p>
              <p className={styles.price}>{fromPrice}</p>
              <div className={styles.heroActions}>
                <LinkButton href="/templates">Browse invitations</LinkButton>
                {hasTryable && (
                  <LinkButton href="#designs" variant="secondary">
                    {TRY_DEMO.cta}
                  </LinkButton>
                )}
              </div>
              <ul className={styles.reassurance}>
                {HERO_REASSURANCE.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className={styles.heroArt}>
              <ShopWindow designs={windowDesigns} />
            </div>
          </Container>
        </header>

        <Container>
          {/* ── 2. Shop by occasion ───────────────────────────────────── */}
          <Reveal as="section" id="occasions" aria-labelledby="occasions-heading" className={styles.section}>
            <p className={styles.eyebrow}>Shop by occasion</p>
            <h2 id="occasions-heading" className={styles.sectionTitle}>
              What are you celebrating?
            </h2>
            <AisleTiles templates={templates} headingLevel={3} />
          </Reveal>

          {/* ── 3. The designs ────────────────────────────────────────── */}
          {designs.length > 0 && (
            <Reveal as="section" id="designs" aria-labelledby="designs-heading" className={styles.section}>
              <p className={styles.eyebrow}>On display</p>
              <h2 id="designs-heading" className={styles.sectionTitle}>
                Invites couples are choosing
              </h2>
              <p className={styles.sectionIntro}>
                Every invite has a live demo you can open before you buy.
                {hasTryable && ` Invites marked “${TRY_DEMO.cta}” can show your own names and dates first, free.`}
              </p>
              <ul className={styles.grid}>
                {designs.map((design, i) => (
                  <li key={design.id || design.slug}>
                    <TemplateCard template={design} eager={i < 2} source="home" lowestPrice={cheapest} />
                  </li>
                ))}
              </ul>
              <p className={styles.more}>
                <LinkButton href="/templates" variant="secondary">
                  See every invite{designCount > 0 ? ` (${designCount})` : ''}
                </LinkButton>
              </p>
            </Reveal>
          )}

          {/* ── 4. Shop by tradition ──────────────────────────────────── */}
          <Reveal as="section" aria-labelledby="tradition-heading" className={styles.section}>
            <p className={styles.eyebrow}>Shop by tradition</p>
            <h2 id="tradition-heading" className={styles.sectionTitle}>
              Written the way your family writes it
            </h2>
            <TraditionTiles templates={templates} />
          </Reveal>

        </Container>

        {/* ── 5. What it costs ─────────────────────────────────────────── */}
        <Reveal as="section" aria-labelledby="price-heading" className={styles.bandSunken}>
          <Container>
            <p className={`${styles.eyebrow} ${styles.eyebrowCenter}`}>What it costs</p>
            <h2 id="price-heading" className={`${styles.sectionTitle} ${styles.centered}`}>
              One payment, and that&rsquo;s the whole price
            </h2>
            <PriceBoard templates={templates} />
          </Container>
        </Reveal>

        <Container>
          {/* ── 6. How it works ───────────────────────────────────────── */}
          <Reveal as="section" id="how" aria-labelledby="how-heading" className={styles.section}>
            <p className={styles.eyebrow}>How it works</p>
            <h2 id="how-heading" className={styles.sectionTitle}>
              Four steps, and you do them yourself
            </h2>
            <ol className={styles.steps}>
              {SHOP_STEPS.map((step, i) => (
                <li key={step.id} className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </li>
              ))}
            </ol>
            <p className={styles.more}>
              <Link href="/how-it-works">See every step in detail</Link>
            </p>
          </Reveal>

          {/* ── 7. What comes with it ─────────────────────────────────── */}
          <Reveal as="section" id="features" aria-labelledby="proof-heading" className={styles.section}>
            <p className={styles.eyebrow}>Included with every invite</p>
            <h2 id="proof-heading" className={styles.sectionTitle}>
              An invitation that does the admin for you
            </h2>
            <ProofStrip />
            <p className={styles.more}>
              <Link href="/features">Everything that&rsquo;s included</Link>
            </p>
          </Reveal>

          {/* ── 8. What couples say ───────────────────────────────────── */}
          <Reveal as="section" id="reviews" aria-labelledby="stories-heading" className={styles.section}>
            <p className={styles.eyebrow}>In their words</p>
            <h2 id="stories-heading" className={styles.sectionTitle}>
              What couples say
            </h2>
            <ReviewList
              reviews={reviews?.reviews ?? []}
              avgRating={reviews?.avgRating ?? 0}
              totalCount={reviews?.totalCount ?? 0}
              showTemplate
              emptyMessage="No reviews yet. When couples who bought an invitation leave one, it appears here."
            />
            {(reviews?.reviews.length ?? 0) > 0 && (
              <p className={styles.more}>
                <Link href="/stories">Read more from couples</Link>
              </p>
            )}
          </Reveal>

          {/* ── 9. Instagram ──────────────────────────────────────────── */}
          <Reveal as="section" aria-labelledby="instagram-heading" className={styles.section}>
            <p className={`${styles.eyebrow} ${styles.eyebrowCenter}`}>Elsewhere</p>
            <h2 id="instagram-heading" className={`${styles.sectionTitle} ${styles.centered}`}>
              Find us on Instagram
            </h2>
            <InstagramStrip />
          </Reveal>

          {/* ── 10. Questions before buying ───────────────────────────── */}
          <Reveal as="section" aria-labelledby="faq-heading" className={styles.section}>
            <p className={styles.eyebrow}>Before you buy</p>
            <h2 id="faq-heading" className={styles.sectionTitle}>
              Questions couples ask
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
          </Reveal>
        </Container>

        {/* ── 11. Closing call to action ───────────────────────────────── */}
        <section aria-labelledby="cta-heading" className={`${styles.cta} ds-ink`}>
          <Container>
            <h2 id="cta-heading" className={styles.ctaTitle}>
              Find the invite, then make it yours
            </h2>
            <p className={styles.ctaText}>
              {designCount > 0 ? `${pluralize(designCount, 'invite')} to choose from. ` : ''}
              {fromPrice}. You build the invitation yourself, and it stays live until {ACCESS.liveMonthsAfterLastCeremony}{' '}
              months after your last ceremony.
            </p>
            <LinkButton href="/templates" className={styles.ctaButton}>
              Browse invitations
            </LinkButton>
          </Container>
        </section>
      </div>
    </>
  );
}
