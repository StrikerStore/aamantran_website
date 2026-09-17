import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './CommerceShell.module.css';

/**
 * The frame for checkout and onboarding, which hide the site header and footer
 * (components/shell/HideOnCommerce.tsx): the brand, one line saying where the
 * buyer is, and the policy links a buyer may need mid-purchase, opened in a new
 * tab so the purchase is not lost.
 */
export function CommerceShell({
  label,
  width = 'wide',
  children,
}: {
  /** E.g. "Secure checkout". */
  label: ReactNode;
  width?: 'wide' | 'narrow';
  children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={cx(styles.headerInner, width === 'narrow' && styles.narrow)}>
          <Link href="/" className={styles.brand}>
            <Image src="/logo.png" alt="" width={32} height={32} />
            <span>Aamantran</span>
          </Link>
          <p className={styles.label}>{label}</p>
        </div>
      </header>

      <main className={cx(styles.main, width === 'narrow' && styles.narrow)}>{children}</main>

      <footer className={styles.footer}>
        <Link href="/refund" target="_blank">Refund policy</Link>
        <Link href="/terms" target="_blank">Terms</Link>
        <Link href="/privacy" target="_blank">Privacy</Link>
        <Link href="/contact" target="_blank">Help</Link>
      </footer>
    </div>
  );
}
