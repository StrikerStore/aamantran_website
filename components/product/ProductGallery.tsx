'use client';

import { useState } from 'react';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { DemoLink } from '@/components/gallery/DemoLink';
import { cx } from '@/lib/cx';
import styles from './ProductGallery.module.css';

type View = 'phone' | 'desktop';

/**
 * The design's artwork, with a phone/desktop toggle, and the way into the live
 * demo.
 *
 * The demo opens in a new tab rather than in a dialog on this page: the demo is
 * served from the API domain, which allows framing only by itself and the
 * Template Lab, so an embedded frame would be blocked by the browser.
 */
export function ProductGallery({
  name,
  slug,
  demoUrl,
  desktopSrc,
  phoneSrc,
}: {
  name: string;
  slug: string;
  demoUrl: string;
  desktopSrc: string | null;
  phoneSrc: string | null;
}) {
  const bothViews = Boolean(desktopSrc && phoneSrc);
  const [view, setView] = useState<View>(phoneSrc && !desktopSrc ? 'phone' : 'desktop');

  return (
    <figure className={styles.gallery}>
      <div className={cx(styles.stage, view === 'phone' && styles.phoneStage)}>
        {desktopSrc && (
          <div className={cx(styles.layer, view === 'desktop' ? styles.visible : styles.hidden)} aria-hidden={view !== 'desktop'}>
            <RemoteImage
              src={desktopSrc}
              alt={`${name} invitation design, on a computer`}
              sizes="(max-width: 1023px) 100vw, 640px"
              aspectRatio="16 / 10"
              preload
            />
          </div>
        )}
        {phoneSrc && (
          <div className={cx(styles.layer, styles.phoneLayer, view === 'phone' ? styles.visible : styles.hidden)} aria-hidden={view !== 'phone'}>
            <RemoteImage
              src={phoneSrc}
              alt={`${name} invitation design, on a phone`}
              sizes="(max-width: 1023px) 80vw, 360px"
              aspectRatio="9 / 16"
              preload={!desktopSrc}
            />
          </div>
        )}
        {!desktopSrc && !phoneSrc && (
          <div className={styles.empty} role="img" aria-label={`No preview image for ${name}`}>
            <span aria-hidden="true">{name}</span>
          </div>
        )}
      </div>

      <figcaption className={styles.actions}>
        {bothViews && (
          <div className={styles.toggle} role="group" aria-label="Preview on">
            {(['phone', 'desktop'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                className={cx(styles.toggleButton, view === option && styles.toggleActive)}
                onClick={() => setView(option)}
              >
                {option === 'phone' ? 'Phone' : 'Computer'}
              </button>
            ))}
          </div>
        )}
        <DemoLink slug={slug} href={demoUrl} name={name} source="product" className={styles.demo}>
          Open the live demo
        </DemoLink>
      </figcaption>
      <p className={styles.demoNote}>
        The demo is this design filled with sample details, watermarked. Yours carries your own names and ceremonies.
      </p>
    </figure>
  );
}
