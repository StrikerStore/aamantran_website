'use client';

import type { Occasion } from '@/lib/occasions';

/**
 * The row of occasion pills above the homepage carousel.
 *
 * Presentational only — it is handed the occasions that qualify and reports
 * clicks back. Deciding WHICH occasions qualify, and whether the row should
 * exist at all, belongs to TemplatesShowcase, which owns the template data.
 */
export default function OccasionTiles({ occasions, active, onSelect }: {
  occasions: Occasion[];
  /** Occasion key, or 'all' for the unfiltered view. */
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="occ-tiles" role="group" aria-label="Filter templates by occasion">
      {/* 'All' leads, and is the way back out of a filter. Without it a visitor
          who picks a tile has no obvious route to the full set. */}
      <button
        type="button"
        className={`occ-tile${active === 'all' ? ' active' : ''}`}
        aria-pressed={active === 'all'}
        onClick={() => onSelect('all')}
      >
        All
      </button>
      {occasions.map(o => (
        <button
          key={o.key}
          type="button"
          className={`occ-tile${active === o.key ? ' active' : ''}`}
          /* aria-pressed, not colour alone — the selected pill has to be
             announced to a screen reader and legible without colour vision. */
          aria-pressed={active === o.key}
          onClick={() => onSelect(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
