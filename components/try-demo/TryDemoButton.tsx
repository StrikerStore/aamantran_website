'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * The page's one TryDemoSheet listens for this. An event rather than shared
 * state because the buttons live in separate client islands of a server page:
 * the purchase panel, the band below it and the sticky bar.
 */
export const TRY_DEMO_EVENT = 'aamantran:try-demo';

export interface TryDemoEventDetail {
  /** Where it was opened from, for try_demo_started. */
  source: string;
}

export function openTryDemo(source: string) {
  window.dispatchEvent(new CustomEvent<TryDemoEventDetail>(TRY_DEMO_EVENT, { detail: { source } }));
}

export function TryDemoButton({
  source,
  variant = 'secondary',
  size,
  fullWidth,
  className,
  children,
}: {
  source: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'sm';
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      aria-haspopup="dialog"
      onClick={() => openTryDemo(source)}
    >
      {children}
    </Button>
  );
}
