import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Accordion } from '@/components/ui/Accordion';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Notice } from '@/components/ui/Notice';
import { getTemplates } from '@/lib/api/templates';
import { ACCESS, INCLUDED, SELF_BUILD } from '@/lib/content/entitlements';
import { faqsByIds } from '@/lib/content/faqs';
import { buildPageMetadata, breadcrumbList } from '@/lib/seo';
import { formatMoney, IS_INTL, originalPriceFor, priceFor } from '@/lib/storefront';
import styles from '../content-page.module.css';
import pricing from './pricing.module.css';

/**
 * What an invite costs, read from the catalogue rather than written down.
 *
 * The page leads with the price list itself — every invite and its price — so
 * the answer to "how much" is on the first screen and never goes stale when an
 * invite is repriced. Prices are the invites' own; tax is worked out and shown
 * line by line at checkout, before anyone pays, and nowhere else.
 */

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: 'Pricing — One Payment, No Subscription',
  description:
    'What an Aamantran invite costs: one payment per invite, no subscription, and every invite including RSVP, guest list and the planning tools.',
  path: '/pricing',
});

const FAQ_IDS = ['recurring', 'currency', 'payment-methods', 'payment-methods-intl', 'switch-design', 'refunds'];

export default async function PricingPage() {
  const catalogue = await getTemplates({ limit: 100, sort: 'price-asc' });
  const faqs = faqsByIds(FAQ_IDS);

  // Every invite with a price on this storefront, cheapest first.
  const invites = (catalogue?.templates ?? [])
    .map((template) => ({
      slug: template.slug,
      name: template.name,
      price: priceFor(template),
      original: originalPriceFor(template),
    }))
    .filter((invite): invite is typeof invite & { price: number } => invite.price != null)
    .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));

  const lowest = invites[0]?.price ?? null;
  const highest = invites[invites.length - 1]?.price ?? null;
  const oneBand = lowest != null && lowest === highest;

  return (
    <div className={styles.page}>
      <JsonLd data={breadcrumbList([{ name: 'Pricing', path: '/pricing' }])} />

      <header className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>Pricing</p>
          <h1 className={styles.title}>One payment per invite</h1>
          {lowest != null && (
            <p className={pricing.headline}>
              {oneBand ? formatMoney(lowest) : <>From {formatMoney(lowest)}</>}
            </p>
          )}
          <p className={styles.intro}>
            {lowest != null && highest != null && !oneBand && <>Invites run from {formatMoney(lowest)} to {formatMoney(highest)}. </>}
            {IS_INTL && 'Prices are in US dollars. '}
            One payment, no subscription and no renewal.
          </p>
          <div className={styles.heroActions}>
            <LinkButton href="/templates">Browse invites</LinkButton>
          </div>
        </Container>
      </header>

      <Container>
        {!catalogue && (
          <div className={styles.section}>
            <Notice
              tone="error"
              title="We couldn't load today's prices"
              action={
                <LinkButton href="/templates" variant="secondary" size="sm">
                  Open the gallery
                </LinkButton>
              }
            >
              This is our side, not yours. Every invite shows its own price on its page.
            </Notice>
          </div>
        )}

        {invites.length > 0 && (
          <section aria-labelledby="prices-heading" className={styles.section}>
            <h2 id="prices-heading" className={styles.sectionTitle}>
              Every invite, and its price
            </h2>
            <p className={styles.sectionIntro}>
              The same price you see on each invite&rsquo;s page. Tap one to open it and its live demo.
            </p>
            <ul className={pricing.priceList}>
              {invites.map((invite) => (
                <li key={invite.slug} className={pricing.priceRow}>
                  <Link href={`/templates/${invite.slug}`} className={pricing.priceLink}>
                    <span className={pricing.priceName}>{invite.name}</span>
                    <span className={pricing.priceAmounts}>
                      {invite.original != null && invite.original > invite.price && (
                        <s className={pricing.priceWas}>
                          <span className="visually-hidden">Was </span>
                          {formatMoney(invite.original)}
                        </s>
                      )}
                      <span className={pricing.priceNow}>{formatMoney(invite.price)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="covers-heading" className={styles.section}>
          <h2 id="covers-heading" className={styles.sectionTitle}>
            What the payment covers
          </h2>
          <ul className={`${styles.cards} ${styles.cardsThree}`}>
            {INCLUDED.map((item) => (
              <li key={item.id} className={styles.card}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.detail}</p>
              </li>
            ))}
          </ul>
          <p className={styles.more}>
            <Link href="/features">Everything that is included</Link>
          </p>
        </section>

        <section aria-labelledby="terms-heading" className={styles.section}>
          <h2 id="terms-heading" className={styles.sectionTitle}>
            The terms, plainly
          </h2>
          <ul className={`${styles.cards} ${styles.cardsThree}`}>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>{ACCESS.short}</h3>
              <p className={styles.cardText}>
                {ACCESS.long} {ACCESS.dataRetention}
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>You build it yourself</h3>
              <p className={styles.cardText}>{SELF_BUILD.long}</p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Digital only</h3>
              <p className={styles.cardText}>
                You receive an invite to share as a link. Nothing is printed or posted, and there is no physical
                product.
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Offers</h3>
              <p className={styles.cardText}>
                The best offer running appears on each invite&rsquo;s page. Every offer, and whether it applies to your
                order, is listed at checkout. There is no offer hidden behind a request.
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Changing invite later</h3>
              <p className={styles.cardText}>
                Contact support and the team can move you to another invite. If the new one costs more, you pay the
                difference.
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Refunds</h3>
              <p className={styles.cardText}>
                Our refund policy sets out when a refund is available and how to ask for one.
              </p>
              <p className={styles.cardLimit}>
                <Link href="/refund">Read the refund policy</Link>
              </p>
            </li>
          </ul>
        </section>

        <section aria-labelledby="pricing-faq-heading" className={styles.section}>
          <h2 id="pricing-faq-heading" className={styles.sectionTitle}>
            Questions about paying
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
      </Container>

      <section aria-labelledby="cta-heading" className={styles.cta}>
        <Container>
          <h2 id="cta-heading" className={styles.ctaTitle}>
            Find the one that feels like yours
          </h2>
          <p className={styles.ctaText}>Open any invite&rsquo;s live demo before you buy.</p>
          <LinkButton href="/templates">Browse invites</LinkButton>
        </Container>
      </section>
    </div>
  );
}
