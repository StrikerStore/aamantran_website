'use client';

import { useMemo, useState } from 'react';
import TemplatesCarousel, { type CarouselTemplate } from '@/components/TemplatesCarousel';
import OccasionTiles from '@/components/OccasionTiles';
import {
  MIN_OCCASION_TILES,
  occasionsPresentIn,
  templateMatchesOccasion,
} from '@/lib/occasions';

/** How many templates the homepage carousel shows at once. */
const CAROUSEL_SIZE = 5;

/**
 * The homepage templates block: occasion tiles above, carousel below, one piece
 * of shared state between them.
 *
 * This exists so a tile can filter the carousel IN PLACE rather than navigating
 * to /templates — which means both need to read the same `active` value, and
 * that state has to live in a client component above the two of them. The page
 * itself stays a server component; only this subtree ships to the browser.
 */
export default function TemplatesShowcase({ templates }: { templates?: CarouselTemplate[] }) {
  const [active, setActive] = useState('all');

  // Derived from live data, so a tile can never lead to an empty carousel.
  const occasions = useMemo(
    () => occasionsPresentIn(templates ?? []),
    [templates],
  );

  // Below the threshold the row does not render — no empty container, no
  // reserved space, no heading. Today only Wedding and Engagement exist, so
  // nothing appears; the row switches itself on, with no deploy, once the
  // catalogue carries a third occasion.
  const showTiles = occasions.length >= MIN_OCCASION_TILES;

  const visible = useMemo(() => {
    if (!templates) return undefined; // let the carousel do its own fetch
    // FILTER FIRST, then slice. The page used to hand over a pre-sliced 5, and
    // filtering that would search 5 templates instead of the full homepage set —
    // an occasion with matches further down the list would look empty.
    const list = showTiles && active !== 'all'
      ? templates.filter(t => templateMatchesOccasion(t, active))
      : templates;
    return list.slice(0, CAROUSEL_SIZE);
  }, [templates, active, showTiles]);

  return (
    <>
      {showTiles && (
        <OccasionTiles occasions={occasions} active={active} onSelect={setActive} />
      )}
      <TemplatesCarousel initialTemplates={visible} />
    </>
  );
}
