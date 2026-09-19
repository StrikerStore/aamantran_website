'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import styles from './HideOnCommerce.module.css';

/** Paying and setting up an account: pages with their own minimal header. */
export function isCommercePath(pathname: string | null | undefined): boolean {
  const path = pathname ?? '';
  return path.startsWith('/checkout') || path.startsWith('/onboarding');
}

/**
 * Leaves its children out on checkout and onboarding.
 *
 * Those pages exist to finish a purchase, so on a computer the site navigation
 * and the footer would only offer ways to leave. The children can be server
 * components; this decides only whether they render, so the shell keeps its own
 * caching and markup everywhere else.
 *
 * `keepOnPhone` is for the site header: on a phone it stays on every page, so
 * the Browse button and the menu are always where the visitor expects them.
 * The commerce pages' own slim header steps aside at the same width, so there
 * is only ever one header on screen.
 */
export function HideOnCommerce({ children, keepOnPhone = false }: { children: ReactNode; keepOnPhone?: boolean }) {
  if (!isCommercePath(usePathname())) return children;
  return keepOnPhone ? <div className={styles.phoneOnly}>{children}</div> : null;
}
