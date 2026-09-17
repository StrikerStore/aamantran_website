import Image from 'next/image';
import type { ReactNode } from 'react';
import { resolveBackendPublicUrl } from '@/lib/assetUrl';
import { isOptimizable } from '@/lib/imageHosts';
import { cx } from '@/lib/cx';
import styles from './RemoteImage.module.css';

/**
 * An image from the API or media bucket in a fixed-ratio frame.
 *
 * - The frame reserves the space before the image loads, so nothing shifts.
 * - Relative API paths are resolved; hosts next/image cannot optimise (anything
 *   off the allowlist, localhost, private IPs) render `unoptimized` instead of
 *   failing.
 * - `sizes` is required: without it the browser downloads the largest variant.
 * - `preload` is for the one LCP image on a page only (Next 16 replaced
 *   `priority` with `preload`).
 * - With no source, a decorative placeholder (or `fallback`) fills the frame.
 */
export function RemoteImage({
  src,
  alt,
  sizes,
  aspectRatio = '16 / 10',
  fit = 'cover',
  preload = false,
  fallback,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  aspectRatio?: string;
  fit?: 'cover' | 'contain';
  preload?: boolean;
  fallback?: ReactNode;
  className?: string;
}) {
  const url = resolveBackendPublicUrl(src);
  return (
    <div className={cx(styles.frame, className)} style={{ aspectRatio }}>
      {url ? (
        <Image
          src={url}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          unoptimized={!isOptimizable(url)}
          style={{ objectFit: fit }}
        />
      ) : (
        fallback ?? <div className={styles.placeholder} aria-hidden="true" />
      )}
    </div>
  );
}
