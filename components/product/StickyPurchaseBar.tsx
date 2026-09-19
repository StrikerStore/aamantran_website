'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { TryDemoButton } from '@/components/try-demo/TryDemoButton';
import { TRY_DEMO } from '@/lib/content/tryDemo';
import { cx } from '@/lib/cx';
import { formatMoney, priceFor } from '@/lib/storefront';
import styles from './StickyPurchaseBar.module.css';

/**
 * The price and the Buy button, kept within reach once the purchase panel has
 * scrolled away. Phones and small tablets only: on a wide screen the panel is
 * still beside the content.
 *
 * It watches the panel rather than a scroll offset, so it appears exactly when
 * the real button leaves the screen and never covers it.
 *
 * While it is showing, its height is published as --sticky-bar-height on the
 * root element, so other things fixed to the bottom of the screen (the cookie
 * banner, the WhatsApp button) can sit above it instead of covering Buy.
 */
export const STICKY_BAR_HEIGHT_VAR = '--sticky-bar-height';

export function StickyPurchaseBar({
  slug,
  name,
  price,
  priceUsd,
  tryWithNames = false,
}: {
  slug: string;
  name: string;
  price: number;
  priceUsd: number | null;
  tryWithNames?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = document.getElementById('purchase-panel');
    if (!panel || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { rootMargin: '0px' });
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const bar = barRef.current;
    const root = document.documentElement;
    if (!bar) return;
    function publish() {
      // Hidden by CSS on wide screens, where it takes no room at the bottom.
      const shown = visible && bar !== null && getComputedStyle(bar).display !== 'none';
      if (shown) root.style.setProperty(STICKY_BAR_HEIGHT_VAR, `${bar.offsetHeight}px`);
      else root.style.removeProperty(STICKY_BAR_HEIGHT_VAR);
    }
    publish();
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(publish);
    resize?.observe(bar);
    window.addEventListener('resize', publish);
    return () => {
      resize?.disconnect();
      window.removeEventListener('resize', publish);
      root.style.removeProperty(STICKY_BAR_HEIGHT_VAR);
    };
  }, [visible]);

  const minor = priceFor({ price, priceUsd });
  if (minor == null) return null;

  return (
    <div ref={barRef} className={cx(styles.bar, visible && styles.visible)} hidden={!visible}>
      <div className={styles.text}>
        <p className={styles.name}>{name}</p>
        <p className={styles.price}>
          {formatMoney(minor)}
        </p>
      </div>
      <div className={styles.buttons}>
        {tryWithNames && (
          <TryDemoButton source="sticky-bar" size="sm" className={styles.try}>
            {TRY_DEMO.ctaShort}
          </TryDemoButton>
        )}
        <Link href={`/checkout/${slug}`} className={styles.buy}>
          Buy
        </Link>
      </div>
    </div>
  );
}
