'use client';

import type { ReactNode } from 'react';
import { SUPPORT } from '@/lib/content/claims';
import { comingSoonMessage, type Aisle } from '@/lib/content/shopTaxonomy';
import { trackOnce } from '@/lib/track';

/**
 * An aisle the shop means to stock and has not stocked yet.
 *
 * Five of the eight aisles are empty today, and the honest thing to do with an
 * empty shelf is to say so and offer to take the customer's name — not to hide
 * the aisle, which makes the shop look like it sells weddings only, and not to
 * list designs that do not exist.
 *
 * Asking costs one tap: WhatsApp opens with the question already written, on
 * the number the site publishes everywhere else. The `occasion_interest` event
 * fired alongside it is what turns "we should probably do birthdays" into
 * evidence about which aisle to commission first. It is anonymous, like every
 * other event this site sends, and carries only the aisle's key — and it fires
 * once per aisle per browser session, so one person tapping twice is one
 * signal, not two.
 */
export function ComingSoon({
  aisle,
  className,
  children,
}: {
  aisle: Aisle;
  className?: string;
  children: ReactNode;
}) {
  const href = `${SUPPORT.whatsappHref}?text=${encodeURIComponent(comingSoonMessage(aisle))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackOnce(`occasion_interest_${aisle.key}`, 'occasion_interest', { aisle: aisle.key })}
    >
      {children}
      <span className="visually-hidden"> — ask us about {aisle.label.toLowerCase()} invitations on WhatsApp</span>
    </a>
  );
}
