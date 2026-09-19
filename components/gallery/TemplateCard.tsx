import Link from 'next/link';
import TemplateTag from '@/components/TemplateTag';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import type { TemplateSummary } from '@/lib/api/types';
import { TRY_DEMO } from '@/lib/content/tryDemo';
import { IS_INTL, formatMoney, originalPriceFor, priceFor } from '@/lib/storefront';
import { pluralize } from '@/lib/format';
import {
  cardBuyers,
  cardDescription,
  cardHighlights,
  cardOccasionLabels,
  cardRating,
  isLowestPrice,
  templateArtAlt,
  templateDemoUrl,
} from '@/lib/templateCard';
import { DemoLink } from './DemoLink';
import { TemplateArt } from './TemplateArt';
import styles from './TemplateCard.module.css';

/** Image widths for a 1 / 2 / 3 column grid inside the 1260px container. */
export const CARD_IMAGE_SIZES = '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 400px';

/**
 * One design in a list. Server-rendered, built only from links, so it works
 * before JavaScript loads.
 *
 * Price: the base price in this storefront's currency. India adds "+ GST",
 * because checkout adds it; the product page shows the full breakdown.
 *
 * MERCHANDISING. The rating and the buyer count were in the API payload from the
 * start and the card ignored both. They are shown now, but only when they are
 * worth reading: a rating only when genuine reviews produced one, a buyer count
 * only above CARD_MIN_BUYERS. Neither is ever invented, rounded up or stood in
 * for — a design with no reviews simply has no stars, which is the honest thing
 * for a shop the size of this one to say.
 */
export function TemplateCard({
  template: t,
  headingLevel = 3,
  eager = false,
  source = 'gallery',
  lowestPrice = null,
}: {
  template: TemplateSummary;
  headingLevel?: 2 | 3;
  eager?: boolean;
  /** Where the card is shown, for the demo_opened event. */
  source?: string;
  /**
   * The catalogue's cheapest price in INR paise (lib/galleryPrice.ts), so the
   * cheapest designs can say so. Null or omitted means no chip.
   */
  lowestPrice?: number | null;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const productHref = `/templates/${t.slug}`;
  const occasions = cardOccasionLabels(t.bestFor);
  const description = cardDescription(t);
  const highlights = cardHighlights(t.highlights);
  const price = priceFor(t);
  const original = originalPriceFor(t);
  const rating = cardRating(t);
  const buyers = cardBuyers(t);
  const cheapest = isLowestPrice(t, lowestPrice);

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {/* The image repeats the "View design" link, so it is skipped by keyboard and screen readers. */}
        <Link href={productHref} className={styles.mediaLink} tabIndex={-1} aria-hidden="true">
          <TemplateArt
            desktopSrc={t.desktopThumbnailUrl ?? t.thumbnailUrl}
            mobileSrc={t.mobileThumbnailUrl}
            alt={templateArtAlt(t.name)}
            sizes={CARD_IMAGE_SIZES}
            eager={eager}
            fallbackLabel={t.name}
          />
        </Link>
        <TemplateTag badge={t.badge} />
      </div>

      <div className={styles.body}>
        <Heading className={styles.name}>{t.name}</Heading>

        {(rating || buyers) && (
          <p className={styles.proof}>
            {rating && (
              <span className={styles.rating}>
                <span aria-hidden="true">★ </span>
                {rating}
                <span className="visually-hidden"> out of 5, average of its reviews</span>
              </span>
            )}
            {buyers && <span className={styles.buyers}>Bought {pluralize(buyers, 'time')}</span>}
          </p>
        )}

        {occasions.length > 0 && (
          <ul className={styles.occasions} aria-label="Occasions">
            {occasions.map((label) => (
              <li key={label}>
                <Badge>{label}</Badge>
              </li>
            ))}
          </ul>
        )}

        {description && <p className={styles.description}>{description}</p>}

        {highlights.length > 0 && (
          <ul className={styles.highlights} aria-label="Highlights">
            {highlights.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        )}

        <div className={styles.footer}>
          {price != null && (
            <p className={styles.price}>
              {original != null && original > price && (
                <s className={styles.was}>
                  <span className="visually-hidden">Original price </span>
                  {formatMoney(original)}
                </s>
              )}
              <span className={styles.amount}>{formatMoney(price)}</span>
              {!IS_INTL && <span className={styles.tax}> + GST</span>}
              {cheapest && <span className={styles.tier}>Lowest price</span>}
            </p>
          )}
          <div className={styles.actions}>
            <LinkButton href={productHref} size="sm" aria-label={`View the ${t.name} design`}>
              View design
            </LinkButton>
            <DemoLink slug={t.slug} href={templateDemoUrl(t.slug)} name={t.name} source={source} className={styles.demo} />
          </div>
          {t.tryWithNames && (
            // Opens the product page with the form already showing (?try=1).
            <LinkButton href={`${productHref}?try=1`} variant="ghost" size="sm" fullWidth className={styles.try}>
              <span aria-hidden="true">✦ </span>
              {TRY_DEMO.cta}
              <span className="visually-hidden"> on the {t.name} design</span>
            </LinkButton>
          )}
        </div>
      </div>
    </article>
  );
}
