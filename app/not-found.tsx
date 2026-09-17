import Link from 'next/link';
import { LinkButton } from '@/components/ui/Button';
import { DASHBOARD_URL } from '@/components/shell/navigation';
import styles from './status-page.module.css';

/**
 * 404 page, rendered inside the site header and footer.
 *
 * Offers the three things people most often came for, plus the dashboard link:
 * an existing customer who mistypes an address is usually looking for their
 * invitation.
 */
export default function NotFound() {
  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <div className="ds-container">
        <p className={styles.eyebrow}>Error 404</p>
        <h1 id="not-found-title" className={styles.title}>
          We couldn&apos;t find that page
        </h1>
        <p className={styles.lead}>The link may be mistyped, or the page may have moved.</p>
        <div className={styles.actions}>
          <LinkButton href="/templates">Browse invitations</LinkButton>
          <LinkButton href="/" variant="secondary">
            Go to the homepage
          </LinkButton>
          <LinkButton href="/faq" variant="ghost">
            Get help
          </LinkButton>
        </div>
        <p className={styles.aside}>
          Looking for your invitation? <a href={DASHBOARD_URL}>Log in to your dashboard</a> or{' '}
          <Link href="/contact">contact us</Link>.
        </p>
      </div>
    </section>
  );
}
