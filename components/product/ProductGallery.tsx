'use client';

import { RemoteImage } from '@/components/ui/RemoteImage';
import { DemoLink } from '@/components/gallery/DemoLink';
import { TryDemoButton } from '@/components/try-demo/TryDemoButton';
import { TRY_DEMO } from '@/lib/content/tryDemo';
import { cx } from '@/lib/cx';
import styles from './ProductGallery.module.css';

/**
 * The invite's artwork, and the way into the live demo.
 *
 * WHICH ARTWORK SHOWS. Whatever suits the screen: the phone version on a phone,
 * the computer version on a computer. There is no toggle — a visitor is holding
 * one of the two and does not need to be asked which. Both are in the markup and
 * the stylesheet picks, so the right one is there from the first paint with no
 * JavaScript and nothing to flip a moment later.
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
  tryWithNames = false,
}: {
  name: string;
  slug: string;
  demoUrl: string;
  desktopSrc: string | null;
  phoneSrc: string | null;
  /** Shows "Try it with your names" beside the demo link on phones. */
  tryWithNames?: boolean;
}) {
  const bothViews = Boolean(desktopSrc && phoneSrc);

  return (
    <figure className={styles.gallery}>
      <div className={cx(styles.stage, bothViews ? styles.autoStage : phoneSrc && !desktopSrc && styles.phoneStage)}>
        {desktopSrc && (
          <div className={cx(styles.layer, bothViews && styles.desktopOnly)}>
            <RemoteImage
              src={desktopSrc}
              alt={`${name} invitation, on a computer`}
              sizes="(max-width: 1023px) 100vw, 640px"
              aspectRatio="16 / 10"
              preload
            />
          </div>
        )}
        {phoneSrc && (
          <div className={cx(styles.layer, styles.phoneLayer, bothViews && styles.phoneOnly)}>
            <RemoteImage
              src={phoneSrc}
              alt={`${name} invitation, on a phone`}
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
        <DemoLink slug={slug} href={demoUrl} name={name} source="product" className={styles.demo}>
          Open the live demo
        </DemoLink>
        {tryWithNames && (
          <TryDemoButton source="product-gallery" className={styles.tryOnPhone}>
            {TRY_DEMO.cta}
          </TryDemoButton>
        )}
      </figcaption>
      <p className={styles.demoNote}>
        The demo is this invite filled with sample details, watermarked. Yours carries your own names and ceremonies.
      </p>
    </figure>
  );
}
