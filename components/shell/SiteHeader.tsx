import Image from 'next/image';
import Link from 'next/link';
import { LinkButton } from '@/components/ui/Button';
import { InvitationsMenu } from './InvitationsMenu';
import { MobileMenu } from './MobileMenu';
import { DASHBOARD_URL, INVITATION_LINKS, PRIMARY_LINKS } from './navigation';
import styles from './SiteHeader.module.css';

/**
 * Site header.
 *
 * Fixed and exactly --header-height tall, like the header it replaces: every
 * existing page pads its own top for that height, so matching it keeps their
 * layout unchanged.
 *
 * Wide screens show the full navigation. Below 1024px it collapses into the
 * menu dialog, and phones get a short "Browse" label that keeps the full
 * accessible name.
 */
export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Aamantran home">
          <Image src="/logo.png" alt="" width={40} height={40} className={styles.logo} />
          <span className={styles.brandName}>Aamantran</span>
        </Link>

        <nav aria-label="Main" className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <InvitationsMenu links={INVITATION_LINKS} />
            </li>
            {PRIMARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.navLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <LinkButton href={DASHBOARD_URL} variant="ghost" size="sm" className={styles.login}>
            Log in
          </LinkButton>
          <LinkButton href="/templates" size="sm">
            <span className={styles.browseShort} aria-hidden="true">
              Browse
            </span>
            <span className={styles.browseLong}>Browse invitations</span>
          </LinkButton>
          <MobileMenu invitationLinks={INVITATION_LINKS} primaryLinks={PRIMARY_LINKS} dashboardUrl={DASHBOARD_URL} />
        </div>
      </div>
    </header>
  );
}
