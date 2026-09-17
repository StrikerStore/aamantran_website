import { getImageProps } from 'next/image';
import { resolveBackendPublicUrl } from '@/lib/assetUrl';
import { cx } from '@/lib/cx';
import { isOptimizable } from '@/lib/imageHosts';
import styles from './TemplateArt.module.css';

/** Below this width the mobile artwork is shown, in a portrait frame. */
export const PHONE_ART_MAX_WIDTH = 639;

function imgProps(src: string, alt: string, sizes: string, eager: boolean) {
  return getImageProps({
    src,
    alt,
    fill: true,
    sizes,
    unoptimized: !isOptimizable(src),
    loading: eager ? 'eager' : 'lazy',
    fetchPriority: eager ? 'high' : undefined,
  }).props;
}

/**
 * A design's preview image, art-directed: the mobile artwork on phones and the
 * desktop artwork on wider screens, in a frame that reserves its space so the
 * grid never shifts while images load. With no artwork, the design's name is
 * shown on a soft gradient instead.
 */
export function TemplateArt({
  desktopSrc,
  mobileSrc,
  alt,
  sizes,
  eager = false,
  fallbackLabel,
  className,
}: {
  desktopSrc: string | null;
  mobileSrc: string | null;
  alt: string;
  sizes: string;
  /** For the first visible cards only. */
  eager?: boolean;
  fallbackLabel: string;
  className?: string;
}) {
  const desktop = resolveBackendPublicUrl(desktopSrc);
  const mobile = resolveBackendPublicUrl(mobileSrc);
  const primary = desktop ?? mobile;

  if (!primary) {
    return (
      <div className={cx(styles.frame, styles.empty, className)} role="img" aria-label={alt}>
        <span className={styles.fallback} aria-hidden="true">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  const main = imgProps(primary, alt, sizes, eager);
  const phone = mobile && mobile !== primary ? imgProps(mobile, alt, sizes, eager) : null;

  return (
    <div className={cx(styles.frame, phone && styles.hasPhoneArt, className)}>
      <picture>
        {phone && (
          <source media={`(max-width: ${PHONE_ART_MAX_WIDTH}px)`} srcSet={phone.srcSet ?? phone.src} sizes={phone.sizes} />
        )}
        {/* Art direction needs <picture>, which next/image cannot render; getImageProps keeps its optimisation. */}
        <img {...main} alt={alt} className={styles.img} />
      </picture>
    </div>
  );
}
