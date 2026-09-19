import Link from 'next/link';
import type { Review } from '@/lib/api/types';
import { formatDate, pluralize } from '@/lib/format';
import styles from './ReviewList.module.css';

/**
 * Reviews for one design.
 *
 * Every review shown is a customer's, whether they submitted it through the
 * site or the owner transcribed it from a message, so the rating and the count
 * cover all of them. With no reviews at all the section says so — the page it
 * replaces invented three.
 */
export function ReviewList({
  reviews,
  avgRating,
  totalCount,
  curatedCount,
  emptyMessage = 'No reviews for this design yet. Reviews come from couples who bought it and finished their event.',
  showTemplate = false,
}: {
  reviews: Review[];
  avgRating: number;
  totalCount: number;
  curatedCount: number;
  /** Shown instead of the list when there is nothing to show. */
  emptyMessage?: string;
  /** Names the design each review is about — for lists that span designs. */
  showTemplate?: boolean;
}) {
  if (reviews.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.wrap}>
      {totalCount > 0 && (
        <p className={styles.summary}>
          <span className={styles.average}>{avgRating.toFixed(1)}</span>
          <span className={styles.outOf}> out of 5</span>
          <span className={styles.count}>
            {' '}
            from {pluralize(totalCount, 'review')}
          </span>
        </p>
      )}

      <ul className={styles.list}>
        {reviews.map((review) => (
          <li key={review.id} className={styles.card}>
            <p className={styles.stars}>
              <span aria-hidden="true">{'★'.repeat(Math.round(review.rating))}</span>
              <span className="visually-hidden">{review.rating} out of 5</span>
            </p>
            {review.reviewText && <blockquote className={styles.text}>{review.reviewText}</blockquote>}
            <p className={styles.author}>
              {review.coupleNames && <span className={styles.names}>{review.coupleNames}</span>}
              {review.location && <span className={styles.place}>{review.location}</span>}
              {review.createdAt && <span className={styles.date}>{formatDate(review.createdAt, { month: 'short' })}</span>}
            </p>
            {showTemplate && review.template && (
              <p className={styles.template}>
                <Link href={`/templates/${review.template.slug}`}>{review.template.name}</Link>
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
