import Link from 'next/link';
import { RemoteImage } from '@/components/ui/RemoteImage';
import type { TemplateSummary } from '@/lib/api/types';
import { templateArtAlt } from '@/lib/templateCard';
import styles from './ShopWindow.module.css';

/**
 * The shop window: real invitations on display, above the fold.
 *
 * The homepage used to open on a headline, a paragraph, a price and two buttons
 * over a flat pink block — on a phone, not one invitation was visible on the
 * first screen. This puts three of them there, in phone frames, softly
 * staggered, each one a link to the design it shows.
 *
 * They are the live catalogue's own designs, not artwork: if the shop changes
 * what it sells, the window changes with it. The middle one is the tallest
 * because a window display has a centrepiece; nothing else distinguishes them.
 */
export function ShopWindow({ designs }: { designs: readonly TemplateSummary[] }) {
  const shown = designs.slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <ul className={styles.window} aria-label="Designs on display">
      {shown.map((design, i) => (
        <li key={design.id || design.slug} className={styles.pane} data-position={i}>
          <Link href={`/templates/${design.slug}`} className={styles.frame}>
            <RemoteImage
              src={design.mobileThumbnailUrl ?? design.desktopThumbnailUrl ?? design.thumbnailUrl}
              alt={templateArtAlt(design.name)}
              sizes="(max-width: 639px) 40vw, 220px"
              aspectRatio="9 / 16"
              className={styles.art}
              // Only the centrepiece is worth the extra priority on first paint.
              preload={i === 1}
              fallback={<span className={styles.fallback} aria-hidden="true">{design.name}</span>}
            />
            <span className={styles.name}>{design.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
