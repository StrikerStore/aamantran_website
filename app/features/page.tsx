import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { ACCESS, CHANGEABLE, INCLUDED, PLANNING_TOOLS, SELF_BUILD } from '@/lib/content/entitlements';
import { buildPageMetadata, breadcrumbList } from '@/lib/seo';
import styles from '../content-page.module.css';

/**
 * What comes with an invitation, and what does not.
 *
 * Items that depend on the design say so rather than being promised flatly: a
 * buyer checks the design's own page for the ones marked that way.
 *
 * The working guest-side demo lives here rather than on the homepage. It is
 * about 900px of interaction, and this is the page a visitor reaches by asking
 * the question it answers.
 */

export const metadata: Metadata = buildPageMetadata({
  title: "What's Included With an Aamantran Invitation",
  description:
    'RSVP for each ceremony, a guest list with CSV export, WhatsApp sharing, maps, photos and music, a second link for selected ceremonies, and eight planning tools.',
  path: '/features',
});

export default function FeaturesPage() {
  return (
    <div className={styles.page}>
      <JsonLd data={breadcrumbList([{ name: "What's included", path: "/features" }])} />

      <header className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>What&rsquo;s included</p>
          <h1 className={styles.title}>Everything that comes with your invitation</h1>
          <p className={styles.intro}>
            One payment covers the design, the invitation itself and the tools around it. Some parts depend on the
            design you choose — those are marked, and each design&rsquo;s page lists exactly what it supports.
          </p>
          <div className={styles.heroActions}>
            <LinkButton href="/templates">Browse invitations</LinkButton>
          </div>
        </Container>
      </header>

      <Container>
        <section aria-labelledby="included-heading" className={styles.section}>
          <h2 id="included-heading" className={styles.sectionTitle}>
            Included with any design
          </h2>
          <ul className={`${styles.cards} ${styles.cardsThree}`}>
            {INCLUDED.map((item) => (
              <li key={item.id} className={styles.card}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.detail}</p>
                {item.templateDependent && <p className={styles.cardLimit}>Where the design supports it.</p>}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="change-heading" className={styles.section}>
          <h2 id="change-heading" className={styles.sectionTitle}>
            What you can change later, and what you cannot
          </h2>
          <div className={styles.cards}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Change any time</h3>
              <ul className={styles.list}>
                {CHANGEABLE.canChange.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Fixed</h3>
              <ul className={styles.list}>
                {CHANGEABLE.fixed.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className={styles.note}>
            {ACCESS.long} {ACCESS.dataRetention}
          </p>
        </section>

        <section aria-labelledby="tools-heading" className={styles.section}>
          <h2 id="tools-heading" className={styles.sectionTitle}>
            The eight planning tools
          </h2>
          <p className={styles.sectionIntro}>
            Included with every invitation, in your dashboard, for the months before the day.
          </p>
          <ul className={styles.linkRow}>
            {PLANNING_TOOLS.map((tool) => (
              <li key={tool.key}>
                <Link href="/wedding-planning-tools">{tool.name}</Link>
              </li>
            ))}
          </ul>
          <p className={styles.more}>
            <Link href="/wedding-planning-tools">What each tool does, and what it does not</Link>
          </p>
        </section>

        <section aria-labelledby="build-heading" className={styles.section}>
          <h2 id="build-heading" className={styles.sectionTitle}>
            You build it yourself
          </h2>
          <p className={styles.prose}>{SELF_BUILD.long}</p>
          <p className={styles.more}>
            <Link href="/how-it-works">See how setting up works</Link>
          </p>
        </section>
      </Container>

      <section aria-labelledby="cta-heading" className={styles.cta}>
        <Container>
          <h2 id="cta-heading" className={styles.ctaTitle}>
            Start with a design you love
          </h2>
          <p className={styles.ctaText}>
            Every design has a live demo. Open a few, then pick the one that feels like your celebration.
          </p>
          <LinkButton href="/templates">Browse invitations</LinkButton>
        </Container>
      </section>
    </div>
  );
}
