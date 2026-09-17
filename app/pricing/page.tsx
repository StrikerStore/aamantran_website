import type { Metadata } from 'next';
import Link from 'next/link';
import { Accordion } from '@/components/ui/Accordion';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Notice } from '@/components/ui/Notice';
import { getTemplates } from '@/lib/api/templates';
import { ACCESS, INCLUDED, SELF_BUILD } from '@/lib/content/entitlements';
import { faqsByIds } from '@/lib/content/faqs';
import { computePriceBreakdown } from '@/lib/priceMath';
import { buildPageMetadata } from '@/lib/seo';
import { formatMoney, IS_INTL, priceFor } from '@/lib/storefront';
import styles from '../content-page.module.css';

/**
 * What it costs, read from the catalogue rather than written down.
 *
 * Every figure on this page is computed from live prices with the same
 * arithmetic checkout uses, so a price here can never disagree with the amount
 * charged, and nothing goes stale when a design is repriced.
 */

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: 'Pricing — One Payment, No Subscription',
  description:
    'What an Aamantran invitation costs: one payment per invitation, the full total shown before you pay, and every design including RSVP, guest list and the planning tools.',
  path: '/pricing',
});

const FAQ_IDS = ['recurring', 'gst', 'currency', 'payment-methods', 'payment-methods-intl', 'switch-design', 'refunds'];

export default async function PricingPage() {
  const catalogue = await getTemplates({ limit: 100, sort: 'price-asc' });
  const faqs = faqsByIds(FAQ_IDS);

  // Payable totals, computed the way checkout computes them.
  const totals = (catalogue?.templates ?? [])
    .map((template) => {
      const base = priceFor(template);
      return base == null ? null : computePriceBreakdown({ base, gstPercent: template.gstPercent, intl: IS_INTL });
    })
    .filter((breakdown): breakdown is NonNullable<typeof breakdown> => breakdown !== null)
    .sort((a, b) => a.total - b.total);

  const lowest = totals[0] ?? null;
  const highest = totals[totals.length - 1] ?? null;
  const oneBand = lowest && highest && lowest.total === highest.total;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>Pricing</p>
          <h1 className={styles.title}>One payment per invitation</h1>
          {lowest && highest ? (
            <p className={styles.intro}>
              {oneBand ? (
                <>Every design is {formatMoney(lowest.total)}.</>
              ) : (
                <>
                  Designs run from {formatMoney(lowest.total)} to {formatMoney(highest.total)}.
                </>
              )}{' '}
              {IS_INTL
                ? 'Prices are in US dollars, and no GST is added to international orders.'
                : 'That is the payable total with GST included — the design price plus GST, which is what checkout charges.'}{' '}
              No subscription and no renewal.
            </p>
          ) : (
            <p className={styles.intro}>
              One payment per invitation, with no subscription and no renewal. Prices are shown on each design, and the
              full total appears before you pay.
            </p>
          )}
          <div className={styles.heroActions}>
            <LinkButton href="/templates">See the designs and their prices</LinkButton>
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
              This is our side, not yours. Every design shows its own price, and the total is confirmed at checkout.
            </Notice>
          </div>
        )}

        {lowest && !IS_INTL && (
          <section aria-labelledby="breakdown-heading" className={styles.section}>
            <h2 id="breakdown-heading" className={styles.sectionTitle}>
              How the total is made up
            </h2>
            <p className={styles.sectionIntro}>
              Taking the least expensive design as an example, with GST at {lowest.gstPercent}%:
            </p>
            <ul className={styles.list}>
              <li>Design price: {formatMoney(lowest.base)}</li>
              <li>
                GST ({lowest.gstPercent}%): {formatMoney(lowest.gst)}
              </li>
              <li>
                <strong>Total charged: {formatMoney(lowest.total)}</strong>
              </li>
            </ul>
            <p className={styles.note}>
              Gallery cards show the design price with &ldquo;+ GST&rdquo;; each design&rsquo;s own page and checkout
              show the full total. If an offer is running, the discount is applied before GST and the new total is shown
              before you pay.
            </p>
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
                You receive an invitation to share as a link. Nothing is printed or posted, and there is no physical
                product.
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Offers</h3>
              <p className={styles.cardText}>
                When a discount is running it appears on the design&rsquo;s page and at checkout, with the code applied
                before you pay. There is no offer hidden behind a request.
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Changing design later</h3>
              <p className={styles.cardText}>
                Contact support and the team can move your invitation to another design. If the new one costs more, you
                pay the difference.
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
            Every design shows its own price
          </h2>
          <p className={styles.ctaText}>Open the gallery, compare the designs, and see the total before you pay.</p>
          <LinkButton href="/templates">Browse invitations</LinkButton>
        </Container>
      </section>
    </div>
  );
}
