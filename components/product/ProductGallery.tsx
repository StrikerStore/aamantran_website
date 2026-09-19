'use client';

import { useState, useSyncExternalStore } from 'react';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { DemoLink } from '@/components/gallery/DemoLink';
import { TryDemoButton } from '@/components/try-demo/TryDemoButton';
import { TRY_DEMO } from '@/lib/content/tryDemo';
import { cx } from '@/lib/cx';
import styles from './ProductGallery.module.css';

type View = 'phone' | 'desktop';

/** Below this the page is a phone layout, and the phone preview is the honest one. */
const PHONE_QUERY = '(max-width: 767px)';

/**
 * Which device this is, as an external store.
 *
 * `null` on the server and during hydration — not a guess of "desktop", so the
 * component can tell "not known yet" from "known to be a computer" and leave
 * that first paint to the stylesheet.
 */
function readDevice(): View {
  return window.matchMedia(PHONE_QUERY).matches ? 'phone' : 'desktop';
}

function readDeviceOnServer(): null {
  return null;
}

function subscribeToWidth(onChange: () => void): () => void {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * The design's artwork, with a phone/desktop toggle, and the way into the live
 * demo.
 *
 * The demo opens in a new tab rather than in a dialog on this page: the demo is
 * served from the API domain, which allows framing only by itself and the
 * Template Lab, so an embedded frame would be blocked by the browser.
 *
 * WHICH VIEW OPENS FIRST. A phone shows the phone artwork and a computer shows
 * the computer one — most guests open an invitation on a phone, and showing a
 * phone buyer a desktop mock asks them to imagine the thing they are holding.
 * Until the browser has told us which this is, CSS decides with a media query,
 * so the first paint is already right; the state only takes over once the
 * viewport is known, which is what lets the toggle say truthfully which view is
 * pressed. Picking either explicitly is a decision, and it sticks.
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
  // null until the visitor picks: "whichever device this is".
  const [chosen, setChosen] = useState<View | null>(null);

  // The server cannot know the viewport, so it answers null and the stylesheet
  // decides for that first paint. The browser answers with the real device, and
  // keeps answering if it is rotated or the window resized.
  const device = useSyncExternalStore(subscribeToWidth, readDevice, readDeviceOnServer);

  // Only one artwork? Then there is nothing to choose.
  const onlyView: View | null = desktopSrc && !phoneSrc ? 'desktop' : (!desktopSrc && phoneSrc ? 'phone' : null);
  // `auto` means the stylesheet is showing one of the two, and this code does
  // not yet know which — true on the server and until hydration.
  const auto = onlyView === null && chosen === null && device === null;
  const showing = (option: View) => (auto ? false : (onlyView ?? chosen ?? device ?? 'desktop') === option);
  const layerClass = (option: View) => (auto
    ? (option === 'phone' ? styles.autoPhone : styles.autoDesktop)
    : (showing(option) ? styles.visible : styles.hidden));

  return (
    <figure className={styles.gallery}>
      <div className={cx(styles.stage, auto ? styles.autoStage : showing('phone') && styles.phoneStage)}>
        {desktopSrc && (
          <div className={cx(styles.layer, layerClass('desktop'))} aria-hidden={!auto && !showing('desktop')}>
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
          <div className={cx(styles.layer, styles.phoneLayer, layerClass('phone'))} aria-hidden={!auto && !showing('phone')}>
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
                aria-pressed={showing(option)}
                className={cx(styles.toggleButton, showing(option) && styles.toggleActive)}
                onClick={() => setChosen(option)}
              >
                {option === 'phone' ? 'Phone' : 'Computer'}
              </button>
            ))}
          </div>
        )}
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
        The demo is this design filled with sample details, watermarked. Yours carries your own names and ceremonies.
      </p>
    </figure>
  );
}
