'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button, LinkButton } from '@/components/ui/Button';
import styles from './status-page.module.css';

/**
 * Error boundary for every page, rendered inside the site header and footer so
 * a failing page still leaves the rest of the site reachable.
 *
 * Next 16 passes `unstable_retry` (it replaced `reset`), which re-fetches and
 * re-renders the page. The digest is shown so a customer can quote it to
 * support and it can be matched to the server log.
 */
export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className={styles.page} aria-labelledby="error-title">
      <div className="ds-container">
        <p className={styles.eyebrow}>Something went wrong</p>
        <h1 id="error-title" className={styles.title}>
          This page couldn&apos;t load
        </h1>
        <p className={styles.lead}>Please try again. If it keeps happening, let us know and we&apos;ll help.</p>
        <div className={styles.actions}>
          <Button onClick={() => unstable_retry()}>Try again</Button>
          <LinkButton href="/" variant="secondary">
            Go to the homepage
          </LinkButton>
        </div>
        <p className={styles.aside}>
          <Link href="/contact">Contact support</Link>
          {error.digest ? ` · Reference ${error.digest}` : null}
        </p>
      </div>
    </section>
  );
}
