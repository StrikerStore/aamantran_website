import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ReviewList } from '@/components/product/ReviewList';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { getFeaturedReviews } from '@/lib/api/templates';
import { buildPageMetadata, breadcrumbList } from '@/lib/seo';
import styles from '../content-page.module.css';

/**
 * What couples have said, with nothing invented to fill the space.
 *
 * The page hides itself from search until there are enough genuine customer
 * reviews to be worth finding: a testimonial page carrying one review, or only
 * reviews written by our own team, is not something to rank.
 */

export const revalidate = 300;

/** Below this many genuine customer reviews, the page is noindex. */
const MIN_REVIEWS_TO_INDEX = 3;

const BASE_METADATA = {
  title: 'Stories From Couples Who Used Aamantran',
  description:
    'Reviews from couples who bought an Aamantran invitation and used it for their celebration. Team-written notes are labelled and never counted in ratings.',
  path: '/stories',
};

export async function generateMetadata(): Promise<Metadata> {
  const reviews = await getFeaturedReviews(50);
  const metadata = buildPageMetadata(BASE_METADATA);
  const genuine = reviews?.totalCount ?? 0;
  return genuine >= MIN_REVIEWS_TO_INDEX ? metadata : { ...metadata, robots: { index: false, follow: true } };
}

export default async function StoriesPage() {
  const reviews = await getFeaturedReviews(50);
  const genuine = reviews?.totalCount ?? 0;

  return (
    <div className={styles.page}>
      <JsonLd data={breadcrumbList([{ name: 'Stories', path: '/stories' }])} />
      <header className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>Stories</p>
          <h1 className={styles.title}>What couples have said</h1>
          <p className={styles.intro}>
            Reviews come from couples who bought an invitation and used it for their event. They write them from their
            dashboard, so every one belongs to a real purchase. Notes written by our own team are labelled as such and
            are never counted in any rating.
          </p>
        </Container>
      </header>

      <Container>
        <section aria-labelledby="reviews-heading" className={styles.section}>
          <h2 id="reviews-heading" className={styles.sectionTitle}>
            {genuine > 0 ? 'From couples' : 'No reviews yet'}
          </h2>
          <ReviewList
            reviews={reviews?.reviews ?? []}
            avgRating={reviews?.avgRating ?? 0}
            totalCount={genuine}
            showTemplate
            emptyMessage="No reviews have been left yet. When couples who bought an invitation write one, it appears here — and until then this page stays out of search results."
          />
          {genuine > 0 && genuine < MIN_REVIEWS_TO_INDEX && (
            <p className={styles.note}>
              There are only a few reviews so far, so this page is kept out of search results until more couples have
              had their celebrations.
            </p>
          )}
        </section>

        <section aria-labelledby="where-heading" className={styles.section}>
          <h2 id="where-heading" className={styles.sectionTitle}>
            Where these come from
          </h2>
          <p className={styles.prose}>
            After the event, couples can leave a review from their dashboard. Each one is attached to the invite they
            bought, so you can read what people said about the invite you are considering on its own page.
          </p>
          <ul className={styles.linkRow}>
            <li>
              <Link href="/templates">Browse the invites</Link>
            </li>
            <li>
              <Link href="/how-it-works">How it works</Link>
            </li>
            <li>
              <Link href="/faq">Questions and answers</Link>
            </li>
          </ul>
        </section>
      </Container>

      <section aria-labelledby="cta-heading" className={styles.cta}>
        <Container>
          <h2 id="cta-heading" className={styles.ctaTitle}>
            See the invites for yourself
          </h2>
          <p className={styles.ctaText}>Every invite has a live demo you can open before you buy.</p>
          <LinkButton href="/templates">Browse invitations</LinkButton>
        </Container>
      </section>
    </div>
  );
}
