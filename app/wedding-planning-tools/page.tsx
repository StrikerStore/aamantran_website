import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PlanningDemo } from '@/components/demos/PlanningDemo';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { PLANNING_TOOLS, PLANNING_TOOLS_ACCESS } from '@/lib/content/entitlements';
import { buildPageMetadata, breadcrumbList } from '@/lib/seo';
import styles from '../content-page.module.css';

/**
 * The eight planning tools, each with what it does and what it does not.
 *
 * The limits are as prominent as the features on purpose: this is the part of
 * the product most easily oversold, and a couple who expects the budget tool to
 * pay vendors has been misled by the page, not by the tool.
 *
 * The working budget-and-tasks demo lives here rather than on the homepage.
 * It is about 900px of interaction that sells nothing directly, and the visitor
 * who wants to poke at it has already said so by clicking through to this page.
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
      <JsonLd data={breadcrumbList([{ name: "Wedding planning tools", path: "/wedding-planning-tools" }])} />

      <header className={styles.hero}>
        <Container>
          <p className={styles.eyebrow}>Planning tools</p>
          <h1 className={styles.title}>Eight planning tools, included with your invitation</h1>
          <p className={styles.intro}>
            An invitation is the part your guests see. These are the parts you use for the months before it: what you
            are spending, what is left to do, who you have booked, and how the day runs. They come with any invite, at
            no extra cost, and they outlast the invitation itself.
          </p>
          <div className={styles.heroActions}>
            <LinkButton href="/templates">Browse invitations</LinkButton>
            <LinkButton href="#planning-demo" variant="secondary">
              Try the tools
            </LinkButton>
          </div>
        </Container>
      </header>

      <Container>
        <section id="planning-demo" aria-labelledby="demo-heading" className={styles.section}>
          <h2 id="demo-heading" className={styles.sectionTitle}>
            The budget and tasks, working
          </h2>
          <p className={styles.sectionIntro}>
            These two are live below — add an expense, mark one paid, move a task on. Nothing is saved, and nothing
            here is sent anywhere.
          </p>
          <PlanningDemo />
        </section>

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
            The tools live in your couple dashboard, beside the invitation itself. You reach them after you buy an invite
            and create your account, and they stay available for as long as your invitation does.
          </p>
          <ul className={styles.linkRow}>
            <li>
              <Link href="#planning-demo">Try the budget and tasks above</Link>
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
            Pick an invite you like and the whole workspace comes with it. One payment, no subscription.
          </p>
          <LinkButton href="/templates">Browse invitations</LinkButton>
        </Container>
      </section>
    </div>
  );
}
