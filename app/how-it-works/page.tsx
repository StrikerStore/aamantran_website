import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Accordion } from '@/components/ui/Accordion';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { BUILDER_RULES, BUILDER_STEPS, PURCHASE_STEPS } from '@/lib/content/builderSteps';
import { ACCESS, NAME_FREEZE, PARTIAL_INVITE, SELF_BUILD } from '@/lib/content/entitlements';
import { faqsByIds } from '@/lib/content/faqs';
import { buildPageMetadata, breadcrumbList } from '@/lib/seo';
import styles from '../content-page.module.css';

/**
 * How it works, described as it actually happens.
 *
 * The builder steps here are the dashboard's own steps (lib/content/
 * builderSteps.ts mirrors them), so this page cannot drift into describing a
 * flow the product does not have.
 */

export const metadata: Metadata = buildPageMetadata({
  title: 'How Aamantran Works — From Choosing an Invite to Sharing',
  description:
    'What happens after you buy: create your account, fill in names, venues, ceremonies, photos and music in a guided builder, preview privately, publish and share.',
  path: '/how-it-works',
});

const FAQ_IDS = ['do-you-build-it', 'how-long', 'whats-needed', 'can-i-edit', 'postponed'];

export default function HowItWorksPage() {
  const faqs = faqsByIds(FAQ_IDS);

  return (
    <div className={styles.page}>
      <JsonLd data={breadcrumbList([{ name: "How it works", path: "/how-it-works" }])} />

      <header className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>How it works</p>
          <h1 className={styles.title}>You choose the invite. You fill in the details.</h1>
          <p className={styles.intro}>{SELF_BUILD.long}</p>
          <div className={styles.heroActions}>
            <LinkButton href="/templates">Browse invitations</LinkButton>
            <LinkButton href="/pricing" variant="secondary">
              See pricing
            </LinkButton>
          </div>
        </Container>
      </header>

      <Container>
        <section aria-labelledby="journey-heading" className={styles.section}>
          <h2 id="journey-heading" className={styles.sectionTitle}>
            From choosing an invite to sharing your link
          </h2>
          <ol className={styles.steps}>
            {PURCHASE_STEPS.map((step, i) => (
              <li key={step.id} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="builder-heading" className={styles.section}>
          <h2 id="builder-heading" className={styles.sectionTitle}>
            Inside the builder
          </h2>
          <p className={styles.sectionIntro}>
            These are the steps you will see in your dashboard, in this order. Each one saves as you go.
          </p>
          <ol className={styles.steps}>
            {BUILDER_STEPS.map((step, i) => (
              <li key={step.id} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className={styles.stepTitle}>{step.label}</h3>
                <p className={styles.stepText}>{step.youEnter}</p>
              </li>
            ))}
          </ol>
          <ul className={styles.list}>
            {BUILDER_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="know-heading" className={styles.section}>
          <h2 id="know-heading" className={styles.sectionTitle}>
            Worth knowing before you start
          </h2>
          <ul className={`${styles.cards} ${styles.cardsThree}`}>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>{NAME_FREEZE.short}</h3>
              <p className={styles.cardText}>{NAME_FREEZE.long}</p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>{PARTIAL_INVITE.short}</h3>
              <p className={styles.cardText}>{PARTIAL_INVITE.long}</p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>{ACCESS.short}</h3>
              <p className={styles.cardText}>
                {ACCESS.long} {ACCESS.dataRetention}
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Check it privately first</h3>
              <p className={styles.cardText}>
                Preview the invitation before anyone else can see it. Nothing is public until you publish, and you can
                unpublish at any time.
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Sharing opens after you publish</h3>
              <p className={styles.cardText}>
                The Share page gives you your link and opens WhatsApp with a message ready to send, including your names,
                dates and the link.
              </p>
            </li>
            <li className={styles.card}>
              <h3 className={styles.cardTitle}>Support, not setup</h3>
              <p className={styles.cardText}>
                Our team answers questions and fixes problems, and can correct a confirmed name. We do not fill in or
                design the invitation for you.
              </p>
            </li>
          </ul>
        </section>

        <section aria-labelledby="how-faq-heading" className={styles.section}>
          <h2 id="how-faq-heading" className={styles.sectionTitle}>
            Questions about setting up
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
      </Container>

      <section aria-labelledby="cta-heading" className={styles.cta}>
        <Container>
          <h2 id="cta-heading" className={styles.ctaTitle}>
            Ready when you are
          </h2>
          <p className={styles.ctaText}>
            Open any invite&rsquo;s live demo to see it the way your guests will, then make it yours.
          </p>
          <LinkButton href="/templates">Browse invitations</LinkButton>
        </Container>
      </section>
    </div>
  );
}
