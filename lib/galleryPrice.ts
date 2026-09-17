import type { TemplateSummary } from './api/types';
import { formatMoney, priceFor } from './storefront';

/**
 * Price bands for the gallery filter, worked out from the live catalogue.
 *
 * Every boundary here is a price a design actually has, so a band can never be
 * empty and the labels can never disagree with the shelf. Nothing is written
 * down: a new price tier appears as a band the day it ships, and a retired one
 * disappears.
 *
 * TWO CURRENCIES, ONE FILTER. The backend filters on `minPrice`/`maxPrice` in
 * INR paise before GST — the same number for both storefronts — so the band's
 * bounds are always INR. What the shopper reads is this storefront's currency,
 * taken from the designs in the band, which is why a band carries both.
 */

/** Above this many distinct prices, bands become ranges rather than exact prices. */
export const MAX_PRICE_BANDS = 4;

export interface PriceBand {
  /** URL value: the INR bounds, e.g. "99900" or "99900-299900". */
  key: string;
  /** What the option reads, in this storefront's currency. */
  label: string;
  /** INR paise, before GST — what the backend filters on. */
  minPrice: number;
  maxPrice: number;
  count: number;
}

interface Priced {
  price: number;
  priceUsd?: number | null;
}

function bandKey(min: number, max: number): string {
  return min === max ? String(min) : `${min}-${max}`;
}

/** Split a sorted list into at most `parts` contiguous chunks, none empty. */
function chunk<T>(items: readonly T[], parts: number): T[][] {
  const size = Math.ceil(items.length / parts);
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function priceBands(templates: readonly TemplateSummary[], maxBands = MAX_PRICE_BANDS): PriceBand[] {
  const priced = templates.filter((t) => Number.isFinite(t.price) && t.price > 0);
  const distinct = [...new Set(priced.map((t) => t.price))].sort((a, b) => a - b);
  // One price is not a choice, and no prices is not a filter.
  if (distinct.length < 2) return [];

  const groups = distinct.length <= maxBands ? distinct.map((p) => [p]) : chunk(distinct, maxBands);

  return groups.map((group) => {
    const min = group[0];
    const max = group[group.length - 1];
    const inBand = priced.filter((t) => t.price >= min && t.price <= max);
    return { key: bandKey(min, max), label: bandLabel(inBand), minPrice: min, maxPrice: max, count: inBand.length };
  });
}

/**
 * What a band reads, in the storefront's own currency: one amount when every
 * design in it costs the same, a range when they do not. Tax wording is left to
 * the caller, as it is on the cards.
 */
function bandLabel(inBand: readonly Priced[]): string {
  const shown = inBand.map((t) => priceFor(t)).filter((minor): minor is number => minor != null);
  if (shown.length === 0) return '';
  const low = Math.min(...shown);
  const high = Math.max(...shown);
  return low === high ? formatMoney(low) : `${formatMoney(low)} – ${formatMoney(high)}`;
}

/**
 * The bounds a URL value asks for, or null.
 *
 * Well-formed values are accepted without checking them against the catalogue,
 * the way every other gallery filter parses: a link shared after a price
 * changed then shows "no designs match" rather than silently showing everything.
 */
export function parsePriceBand(value: string): { minPrice: number; maxPrice: number } | null {
  const match = /^(\d{1,9})(?:-(\d{1,9}))?$/.exec(value.trim());
  if (!match) return null;
  const minPrice = Number(match[1]);
  const maxPrice = match[2] === undefined ? minPrice : Number(match[2]);
  return maxPrice >= minPrice ? { minPrice, maxPrice } : null;
}

/** The band a key names, for the "filters applied" summary. */
export function bandByKey(bands: readonly PriceBand[], key: string | null): PriceBand | undefined {
  return key ? bands.find((band) => band.key === key) : undefined;
}

/**
 * The cheapest price in the catalogue, for the "lowest price" chip on a card.
 * Null when every design costs the same, because then it says nothing.
 */
export function lowestPrice(templates: readonly TemplateSummary[]): number | null {
  const prices = templates.map((t) => t.price).filter((p) => Number.isFinite(p) && p > 0);
  const distinct = new Set(prices);
  return distinct.size > 1 ? Math.min(...prices) : null;
}
