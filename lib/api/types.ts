/**
 * Storefront-facing shapes of the backend's public API, after normalisation in
 * lib/api/*. Amounts are integers in minor units: INR fields in paise, USD
 * fields in cents.
 *
 * Sources: aamantran_backend/src/routes/publicTemplates.js, publicCheckout.js,
 * controllers/blog.controller.js and services/templateCapabilities.service.js.
 */

export type GallerySort = 'popular' | 'new' | 'price-asc' | 'price-desc';

export interface TemplateListQuery {
  /** Name contains, up to 60 characters. */
  q?: string;
  community?: string;
  /** Matched with "contains" against the template's bestFor terms. */
  eventType?: string;
  /** Slug to leave out. */
  exclude?: string;
  /** Base INR price bounds in paise, before GST. */
  minPrice?: number;
  maxPrice?: number;
  sort?: GallerySort;
  /** 1–100. */
  limit?: number;
  page?: number;
}

export interface TemplateSummary {
  id: string;
  slug: string;
  name: string;
  thumbnailUrl: string | null;
  desktopThumbnailUrl: string | null;
  mobileThumbnailUrl: string | null;
  community: string;
  /** Occasion and ceremony terms, e.g. ["Wedding", "Haldi"]. */
  bestFor: string[];
  languages: string[];
  /** Corner tag key (see lib/templateBadges.ts), or null. */
  badge: string | null;
  shortDescription: string | null;
  /** Opening words of the about text, for cards without a short description. Null from older backends. */
  aboutExcerpt: string | null;
  /** Keys from the backend TEMPLATE_HIGHLIGHTS vocabulary. */
  highlights: string[];
  price: number;
  originalPrice: number | null;
  priceUsd: number | null;
  originalPriceUsd: number | null;
  gstPercent: number;
  buyerCount: number;
  /** Average of genuine customer reviews; null when there are none. */
  avgRating: number | null;
  releasedAt: string | null;
  /** Can show a visitor's own names ("Try it with your names"). False from older backends. */
  tryWithNames: boolean;
}

/** What the try-it form asks for one design. See trialOptionsFor on the backend. */
export interface TrialDemoOptions {
  people: { role: string; label: string; required: boolean }[];
  ceremonies: string[];
  dateLabel: string;
  expiresInMinutes: number;
}

export interface TrialDemoCreated {
  token: string;
  url: string;
  expiresInMinutes: number;
}

export interface TemplateListResponse {
  templates: TemplateSummary[];
  total: number;
  page: number;
  limit: number;
}

/**
 * What a published template supports, in buyer-facing labels. Each section is
 * null when the template does not declare it; rsvp and wishes are null when
 * they could not be determined. The product page omits anything null.
 */
export interface TemplateCapabilities {
  people: { label: string; photo: boolean }[] | null;
  ceremonyFields: string[] | null;
  mediaSlots: { label: string; type: string; multiple: boolean; max: number | null }[] | null;
  customFieldLabels: string[] | null;
  languages: string[];
  rsvp: boolean | null;
  wishes: boolean | null;
}

export interface TemplateDetail extends TemplateSummary {
  style: string | null;
  colourPalette: string | null;
  animations: string | null;
  aboutText: string | null;
  /** Genuine customer reviews only. */
  reviewCount: number;
  /** Team-written reviews, shown labelled and never counted. */
  curatedReviewCount: number;
  /** Present only when requested with { capabilities: true }. */
  capabilities: TemplateCapabilities | null;
}

export interface CatalogueStats {
  total: number;
  /** The template with the lowest payable INR total (GST included, checkout arithmetic). */
  lowest: { price: number; gstPercent: number; total: number } | null;
  /** Exact bestFor term → number of active templates. */
  occasions: Record<string, number>;
}

export interface Review {
  id: string;
  rating: number;
  reviewText: string | null;
  coupleNames: string | null;
  location: string | null;
  createdAt: string | null;
  couplePhotoUrl: string | null;
  /** 'curated' reviews are written by the team: show them labelled, never count them. */
  source: 'customer' | 'curated';
  template: { name: string; slug: string } | null;
}

export interface ReviewsResponse {
  reviews: Review[];
  /** Genuine customer reviews only. */
  avgRating: number;
  totalCount: number;
  curatedCount: number;
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  tags: string[];
  author: string;
  publishedAt: string | null;
}

/* ── Checkout ────────────────────────────────────────────────────────────── */

export interface OfferCoupon {
  code: string;
  discountPercent: number;
  discountAmount: number;
  label: string;
  condition: string;
  expiresAt: string | null;
  eligible: boolean;
  /** 'INR' or 'USD' — the storefront the offer belongs to. */
  currency: string;
  /** Why the offer cannot be used yet, e.g. "Add ₹1,999 more to unlock this offer". */
  unlockMessage: string | null;
}

export interface PriceBreakup {
  baseAmount: number;
  discountAmount: number;
  discountPct: number;
  gstPercent: number;
  gstAmount: number;
  finalAmount: number;
  /** Every amount above is in the minor unit of this currency. */
  currency: string;
}

export interface CouponPreviewRequest {
  templateSlug: string;
  couponCode: string;
  customerEmail?: string;
}

export interface CouponPreview {
  valid: boolean;
  code: string | null;
  /** Why the code was refused, when it was. */
  reason: string | null;
  priceBreakup: PriceBreakup;
}

export interface OrderRequest {
  templateSlug: string;
  couponCode?: string;
  customerEmail: string;
  /** National number, digits only. */
  customerContact: string;
  /** E.g. "+91". */
  customerContactCountryCode: string;
  /** Terms and Privacy acceptance; the backend refuses the order without it. */
  consent: true;
  marketingOptIn: boolean;
  /** A "Try it with your names" demo of this design; the server ignores it if it no longer applies. */
  trialToken?: string;
}

interface OrderBase {
  paymentId: string;
  orderId: string;
  amount: number;
  priceBreakup: PriceBreakup;
}

/** Real payment: POST payuParams to payuUrl. */
export interface PayuOrderResponse extends OrderBase {
  payuUrl: string;
  payuParams: Record<string, string>;
}

/** Backend DUMMY_PAYMENT_MODE: no gateway involved. */
export interface DummyOrderResponse extends OrderBase {
  dummy: true;
}

export type OrderResponse = PayuOrderResponse | DummyOrderResponse;

export interface PaymentStatus {
  /** Payment.status as stored: "pending", "paid" or "failed". */
  status: string;
  /** An account has already been created from this payment. */
  registered: boolean;
  templateSlug: string | null;
}
