import type { Metadata } from 'next';
import Link from 'next/link';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { PLANNING_TOOLS, PLANNING_TOOLS_ACCESS } from '@/lib/content/entitlements';
import { buildPageMetadata } from '@/lib/seo';
import styles from '../content-page.module.css';

/**
 * The eight planning tools, each with what it does and what it does not.
 *
 * The limits are as prominent as the features on purpose: this is the part of
 * the product most easily oversold, and a couple who expects the budget tool to
 * pay vendors has been misled by the page, not by the tool.
 */

export const metadata: Metadata = buildPageMetadata({
  title: 'Wedding Planning Tools Included With Your Invitation',
  description:
    'Budget, tasks, vendors, day-of timeline, inventory, gifts, mood board and photo wall — eight planning tools included with every Aamantran invitation.',
  path: '/wedding-planning-tools',
});

export default function PlanningToolsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>Planning tools</p>
          <h1 className={styles.title}>Eight planning tools, included with your invitation</h1>
          <p className={styles.intro}>
            An invitation is the part your guests see. These are the parts you use for the months before it: what you
            are spending, what is left to do, who you have booked, and how the day runs. They come with any design, at
            no extra cost, and they outlast the invitation itself.
          </p>
          <div className={styles.heroActions}>
            <LinkButton href="/templates">Browse invitations</LinkButton>
            <LinkButton href="/#planning-demo" variant="secondary">
              Try the tools
            </LinkButton>
          </div>
        </Container>
      </header>

      <Container>
        <section aria-labelledby="tools-heading" className={styles.section}>
          <h2 id="tools-heading" className={styles.sectionTitle}>
            What each one does — and what it does not
          </h2>
          <ul className={`${styles.cards} ${styles.cardsThree}`}>
            {PLANNING_TOOLS.map((tool) => (
              <li key={tool.key} className={styles.card}>
                <h3 className={styles.cardTitle}>{tool.name}</h3>
                <p className={styles.cardText}>{tool.does}</p>
                <p className={styles.cardLimit}>{tool.limit}</p>
              </li>
            ))}
          </ul>
          <p className={styles.note}>{PLANNING_TOOLS_ACCESS}</p>
        </section>

        <section aria-labelledby="where-heading" className={styles.section}>
          <h2 id="where-heading" className={styles.sectionTitle}>
            Where to find them
          </h2>
          <p className={styles.prose}>
            The tools live in your couple dashboard, beside the invitation itself. You reach them after you buy a design
            and create your account, and they stay available for as long as your invitation does.
          </p>
          <ul className={styles.linkRow}>
            <li>
              <Link href="/#planning-demo">Try the budget and tasks on the homepage</Link>
            </li>
            <li>
              <Link href="/how-it-works">How setting up works</Link>
            </li>
            <li>
              <Link href="/features">Everything that is included</Link>
            </li>
          </ul>
        </section>
      </Container>

      <section aria-labelledby="cta-heading" className={styles.cta}>
        <Container>
          <h2 id="cta-heading" className={styles.ctaTitle}>
            The tools come with the invitation
          </h2>
          <p className={styles.ctaText}>
            Pick a design you like and the whole workspace comes with it. One payment, no subscription.
          </p>
          <LinkButton href="/templates">Browse invitations</LinkButton>
        </Container>
      </section>
    </div>
  );
}
