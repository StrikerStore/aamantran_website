'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Reveal.module.css';

/**
 * A section that fades and rises once, the first time it is seen.
 *
 * The only scroll-driven motion on the site. It is deliberately small — 18px
 * over 480ms, the `--rise-section` and `--dur-section` tokens that have sat
 * unused since the design system was written — because the point is that a page
 * feels composed as it loads, not that anything performs.
 *
 * Three rules it keeps:
 * - Content is visible without JavaScript. The hidden state is applied by the
 *   effect, so a page that never hydrates simply shows everything.
 * - It reveals once and disconnects. Nothing re-animates on scroll-up.
 * - It does nothing at all when the visitor asks for reduced motion, checked
 *   here as well as in CSS so no element is ever left mid-transition.
 */
export function Reveal({
  as: Tag = 'div',
  delay = 0,
  className,
  children,
}: {
  as?: ElementType;
  /** Milliseconds to stagger a sibling by. Keep under ~150ms. */
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') return;

    element.classList.add(styles.pending);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          element.classList.add(styles.shown);
          observer.disconnect();
        }
      },
      // Start a little before it arrives, so the motion finishes as it lands.
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={cx(styles.reveal, className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
