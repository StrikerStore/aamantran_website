'use client';

import type { ReactNode } from 'react';
import { track } from '@/lib/track';

/**
 * Opens a design's live demo in a new tab and records `demo_opened`. The event
 * carries the slug and where it was opened from, nothing about the visitor.
 */
export function DemoLink({
  slug,
  href,
  name,
  source,
  className,
  children = 'Live demo',
}: {
  slug: string;
  href: string;
  /** The design's name, so the link makes sense out of context. */
  name: string;
  source: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={className}
      onClick={() => track('demo_opened', { slug, source })}
    >
      {children}
      <span aria-hidden="true"> ↗</span>
      <span className="visually-hidden"> of {name} (opens in a new tab)</span>
    </a>
  );
}
