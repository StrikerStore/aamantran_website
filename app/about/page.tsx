import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { getFeaturedReviews, getTemplates } from '@/lib/api/templates';
import { SETUP_TIME, SUPPORT, publishableStats } from '@/lib/content/claims';
import { ACCESS } from '@/lib/content/entitlements';
import { pluralize } from '@/lib/format';
import { buildPageMetadata, breadcrumbList } from '@/lib/seo';
import { getStartingPrice } from '@/lib/startingPrice';
import styles from '../content-page.module.css';

/**
 * Who we are and why the product is shaped this way.
 *
 * The figures here are counted from live data — designs in the catalogue,
 * reviews couples have actually left — rather than typed in. The page this
 * replaces claimed "20+ curated templates" against a catalogue of twelve, a
 * "24 hrs" average setup time, "500+ couples served" and a five-star average,
 * none of which could be checked.
 */

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: 'About Aamantran',
  description:
    'Why Aamantran exists: digital invitations built for Indian celebrations, where a wedding runs over days and every ceremony has its own guests, timings and venue.',
  path: '/about',
});

export default async function AboutPage() {
  const [catalogue, reviews, startingPrice] = await Promise.all([
    getTemplates({ limit: 100, sort: 'new' }),
    getFeaturedReviews(1),
    getStartingPrice(),
  ]);

  const designCount = catalogue?.total ?? 0;
  const reviewCount = reviews?.totalCount ?? 0;
  const averageRating = reviews?.avgRating ?? 0;

  // Counted, not claimed. Anything that cannot be counted is left out unless
  // the business has confirmed it (lib/content/claims.ts).
  const figures = [
    designCount > 0 ? { value: String(designCount), label: pluralize(designCount, 'design') } : null,
    reviewCount > 0
      ? { value: averageRating > 0 ? averageRating.toFixed(1) : String(reviewCount), label: averageRating > 0 ? `average from ${pluralize(reviewCount, 'review')}` : pluralize(reviewCount, 'review') }
      : null,
    { value: 'One', label: 'payment, no subscription' },
    { value: '6', label: 'months live after your last ceremony' },
    ...publishableStats().map((stat) => ({ value: stat.figure, label: stat.label })),
  ].filter((figure): figure is { value: string; label: string } => figure !== null);

  return (
    <div className={styles.page}>
      <JsonLd data={breadcrumbList([{ name: "About", path: "/about" }])} />

      <header className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>Our story</p>
          <h1 className={styles.title}>Invitations built for the way Indian celebrations actually run</h1>
          <p className={styles.intro}>
            An Indian wedding is rarely one afternoon, wherever it is held. It is haldi at home, mehendi the next evening, a sangeet that runs
            late, the ceremony itself and a reception — each with its own hour, its own venue and often its own guest
            list. Aamantran is built around that, rather than around a single printed card.
          </p>
        </Container>
      </header>

      <Container>
        {figures.length > 0 && (
          <section aria-labelledby="figures-heading" className={styles.section}>
            <h2 id="figures-heading" className={styles.sectionTitle}>
              Where we are today
            </h2>
            <ul className={`${styles.cards} ${styles.cardsThree}`}>
              {figures.map((figure) => (
                <li key={figure.label} className={styles.card}>
                  <h3 className={styles.cardTitle}>{figure.value}</h3>
                  <p className={styles.cardText}>{figure.label}</p>
                </li>
              ))}
            </ul>
            <p className={styles.note}>
              These are counted from the catalogue and from reviews couples have left, so they change as we do.
            </p>
          </section>
        )}

        <section aria-labelledby="began-heading" className={styles.section}>
          <h2 id="began-heading" className={styles.sectionTitle}>
            How Aamantran began
          </h2>
          <p className={styles.prose}>
            It started at a wedding in Jaipur, watching a family spend a small fortune on printed cards that guests
            glanced at once and left on the table. There was no way to know who was coming, and when a venue changed at
            the last minute there was no way to tell anyone without a hundred phone calls.
          </p>
          <p className={styles.prose}>
            Aamantran — the word means <em>invitation</em> in Sanskrit — is the answer to that evening: something
            beautiful enough to feel special, useful enough to handle the replies, and cheap enough that it is not a
            line item anyone argues about.
          </p>
        </section>

        <section aria-labelledby="values-heading" className={styles.section}>
          <h2 id="values-heading" className={styles.sectionTitle}>
            What we hold to
          </h2>
          <ul className={`${styles.cards} ${styles.cardsThree}`}>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Every ceremony, properly</h3>
              <p className={styles.cardText}>
                Each function carries its own date, time, venue and map pin, and guests reply to each one separately —
                so you get a headcount per ceremony rather than a single number to interpret.
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Yours to set up</h3>
              <p className={styles.cardText}>
                You fill in the invitation yourself in a guided builder — most couples need {SETUP_TIME.value.phrase}{' '}
                once their details are ready. We would rather you had control than waited on us.
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Said plainly</h3>
              <p className={styles.cardText}>
                What is included, what is fixed and how long it lasts are written down before you pay, not discovered
                afterwards. {ACCESS.short}.
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Your guest data is yours</h3>
              <p className={styles.cardText}>
                We never share, sell or use it for marketing, and it is deleted on a schedule you are told about in
                advance.
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Priced to be affordable</h3>
              <p className={styles.cardText}>
                Designs start at {startingPrice}, paid once. No subscription, no renewal, and no charge for the planning
                tools that come with it.
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Lighter than paper</h3>
              <p className={styles.cardText}>
                No printing, no courier, no box of leftover cards — and a change of venue reaches everyone who already
                has the link.
              </p>
            </li>
          </ul>
        </section>

        <section aria-labelledby="who-heading" className={styles.section}>
          <h2 id="who-heading" className={styles.sectionTitle}>
            Who builds it
          </h2>
          <p className={styles.prose}>
            Aamantran is made by PLEXZUU. If something is wrong, unclear, or missing, we would rather hear it: write to{' '}
            <a href={`mailto:${SUPPORT.email}`}>{SUPPORT.email}</a> or message{' '}
            <a href={SUPPORT.whatsappHref} target="_blank" rel="noopener noreferrer">
              {SUPPORT.whatsappLabel}
            </a>{' '}
            — {SUPPORT.hours}.
          </p>
          <ul className={styles.linkRow}>
            <li>
              <Link href="/how-it-works">How it works</Link>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
            <li>
              <Link href="/stories">What couples say</Link>
            </li>
          </ul>
        </section>
      </Container>

      <section aria-labelledby="cta-heading" className={styles.cta}>
        <Container>
          <h2 id="cta-heading" className={styles.ctaTitle}>
            Have a look at the designs
          </h2>
          <p className={styles.ctaText}>
            Every one has a live demo you can open before you buy — no account, no payment.
          </p>
          <LinkButton href="/templates">Browse invitations</LinkButton>
        </Container>
      </section>
    </div>
  );
}
