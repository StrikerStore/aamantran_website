import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { FAQ_CATEGORIES } from '@/lib/content/faqs';
import { SUPPORT, SUPPORT_RESPONSE_TIME } from '@/lib/content/claims';
import { buildPageMetadata } from '@/lib/seo';
import FaqClient from './FaqClient';
import styles from '../content-page.module.css';

/**
 * The help centre.
 *
 * Every answer comes from lib/content/faqs.ts, which is also the source for the
 * questions shown on the homepage, the product page and the occasion pages — so
 * one correction fixes the answer everywhere it appears.
 */

export const metadata: Metadata = buildPageMetadata({
  title: 'Help Centre — Questions About Digital Invitations',
  description:
    'Ordering, building your invitation, RSVPs and WhatsApp sharing, pricing and GST, how long your invitation stays live, and what happens to guest data.',
  path: '/faq',
});

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_CATEGORIES.flatMap((category) =>
    category.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    }))),
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <div className={styles.page}>
        <header className={styles.hero}>
          <Container>
            <p className={styles.eyebrow}>Help centre</p>
            <h1 className={styles.title}>Questions, answered</h1>
            <p className={styles.intro}>
              Everything we are asked most often, in the words we would use on the phone. If your question is not here,
              ask us — {SUPPORT.hours}, {SUPPORT_RESPONSE_TIME.value}.
            </p>
          </Container>
        </header>

        <Container>
          <FaqClient />

          <section aria-labelledby="ask-heading" className={styles.section}>
            <h2 id="ask-heading" className={styles.sectionTitle}>
              Still stuck?
            </h2>
            <p className={styles.sectionIntro}>
              Message us on WhatsApp or email, {SUPPORT.hours}. If you have already bought an invitation, raising a
              ticket from your dashboard is quickest — it reaches us with your event attached.
            </p>
            <ul className={styles.linkRow}>
              <li>
                <a href={SUPPORT.whatsappHref} target="_blank" rel="noopener noreferrer">
                  WhatsApp {SUPPORT.whatsappLabel}
                </a>
              </li>
              <li>
                <a href={`mailto:${SUPPORT.email}`}>{SUPPORT.email}</a>
              </li>
              <li>
                <Link href="/contact">Send a message</Link>
              </li>
            </ul>
          </section>
        </Container>

        <section aria-labelledby="cta-heading" className={styles.cta}>
          <Container>
            <h2 id="cta-heading" className={styles.ctaTitle}>
              Ready to look at invites?
            </h2>
            <p className={styles.ctaText}>Open any invite&rsquo;s live demo to see it the way your guests will.</p>
            <LinkButton href="/templates">Browse invitations</LinkButton>
          </Container>
        </section>
      </div>
    </>
  );
}
