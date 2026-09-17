'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Paying and setting up an account: pages with their own minimal header. */
export function isCommercePath(pathname: string | null | undefined): boolean {
  const path = pathname ?? '';
  return path.startsWith('/checkout') || path.startsWith('/onboarding');
}

/**
 * Leaves its children out on checkout and onboarding.
 *
 * Those pages exist to finish a purchase, so the site navigation, the footer and
 * the "Browse templates" bar would only offer ways to leave. The children can
 * be server components; this decides only whether they render, so the shell
 * keeps its own caching and markup everywhere else.
 */
export function HideOnCommerce({ children }: { children: ReactNode }) {
  return isCommercePath(usePathname()) ? null : children;
}
