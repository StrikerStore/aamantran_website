import Image from 'next/image';
import Link from 'next/link';
import CookiePrefsLink from '@/components/CookiePrefsLink';
import { cx } from '@/lib/cx';
import { getInstagramHandle, getYouTubeHandle } from '@/lib/publicEnv';
import { GLOBAL_SITE_URL, INDIA_SITE_URL } from '@/lib/seo';
import { IS_INTL } from '@/lib/storefront';
import { DASHBOARD_URL, INVITATION_LINKS, PRIMARY_LINKS, SUPPORT } from './navigation';
import styles from './SiteFooter.module.css';

/**
 * Site footer: identity, navigation, account access, policies and support.
 *
 * "Your account" keeps the couple dashboard one click away for customers whose
 * invitation is already live. The bottom row links to the other storefront, so
 * a visitor on the wrong site for their currency can switch.
 */
export default function SiteFooter() {
  const instagramUrl = `https://www.instagram.com/${getInstagramHandle()}`;
  const youtubeUrl = `https://www.youtube.com/@${getYouTubeHandle()}`;
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={cx('ds-container', styles.top)}>
        <div>
          <Link href="/" className={styles.brandLink}>
            <Image src="/logo.png" alt="" width={44} height={44} />
            <span>Aamantran</span>
          </Link>
          <p className={styles.tagline}>
            Beautiful interactive invitations, with the tools to bring your celebration together.
          </p>
          <p className={styles.company}>Aamantran by PLEXZUU</p>
          <div className={styles.socials}>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="Aamantran on Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="Aamantran on YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>

        <nav aria-label="Footer" className={styles.columns}>
          <div>
            <h2 className={styles.columnTitle}>Invitations</h2>
            <ul className={styles.linkList}>
              {INVITATION_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={styles.columnTitle}>Learn</h2>
            <ul className={styles.linkList}>
              {PRIMARY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/blog">Guides &amp; blog</Link>
              </li>
              <li>
                <Link href="/about">About us</Link>
              </li>
              <li>
                <Link href="/contact">Contact us</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className={styles.columnTitle}>Your account</h2>
            <ul className={styles.linkList}>
              <li>
                <a href={DASHBOARD_URL}>Log in to your dashboard</a>
              </li>
              <li>
                <Link href="/contact">Help with an order</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className={styles.columnTitle}>Policies</h2>
            <ul className={styles.linkList}>
              <li>
                <Link href="/privacy">Privacy policy</Link>
              </li>
              <li>
                <Link href="/refund">Refund policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
              <li>
                <CookiePrefsLink />
              </li>
            </ul>
          </div>
        </nav>

        <div className={styles.support}>
          <h2 className={styles.columnTitle}>Support</h2>
          <p className={styles.hours}>{SUPPORT.hours}</p>
          <a href={`mailto:${SUPPORT.email}`}>{SUPPORT.email}</a>
          <a href={SUPPORT.whatsappHref} target="_blank" rel="noopener noreferrer">
            WhatsApp {SUPPORT.whatsappLabel}
          </a>
        </div>
      </div>

      <div className={cx('ds-container', styles.bottom)}>
        {/* Same sentiment, without telling a buyer in New Jersey that the site
            is for somewhere else. */}
        <p>© {year} Aamantran. Made with ❤️ for {IS_INTL ? 'celebrations everywhere' : 'Indian celebrations'}.</p>
        <p>
          <a href={`mailto:${SUPPORT.email}`}>Share an idea to improve Aamantran</a>
        </p>
        <p>
          {IS_INTL ? (
            <a href={INDIA_SITE_URL}>Shopping from India? Prices in rupees at aamantran.online</a>
          ) : (
            <a href={GLOBAL_SITE_URL}>Outside India? Prices in US dollars at aamantranglobal.com</a>
          )}
        </p>
      </div>
    </footer>
  );
}
