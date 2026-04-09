import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductReviewsSection from '@/components/ProductReviewsSection';
import { getPublicApiUrl } from '@/lib/publicEnv';
import { resolveBackendPublicUrl } from '@/lib/assetUrl';

const API = getPublicApiUrl();

interface Template {
  id: string; slug: string; name: string;
  thumbnailUrl: string | null;
  desktopThumbnailUrl?: string | null;
  mobileThumbnailUrl?: string | null;
  community: string;
  bestFor: string; languages: string;
  price: number; originalPrice: number | null;
  aboutText: string; buyerCount: number;
  avgRating: string | number | null; reviewCount: number;
}

interface ReviewItem {
  id: string;
  rating: number;
  reviewText: string | null;
  coupleNames: string | null;
  location: string | null;
  createdAt: string;
}

interface RelatedTemplate {
  id: string;
  slug: string;
  name: string;
  thumbnailUrl: string | null;
  desktopThumbnailUrl?: string | null;
  mobileThumbnailUrl?: string | null;
  community: string;
  price: number;
}

function rupees(paise: number) {
  return (paise / 100).toLocaleString('en-IN');
}

function displayLanguageLabel(lang: string) {
  const key = lang.trim().toLowerCase();
  const map: Record<string, string> = {
    en: 'English',
    english: 'English',
    hi: 'हिन्दी',
    hindi: 'हिन्दी',
    gu: 'ગુજરાતી',
    gujarati: 'ગુજરાતી',
    mr: 'मराठी',
    marathi: 'मराठी',
    pa: 'ਪੰਜਾਬੀ',
    punjabi: 'ਪੰਜਾਬੀ',
    bn: 'বাংলা',
    bengali: 'বাংলা',
    ta: 'தமிழ்',
    tamil: 'தமிழ்',
    te: 'తెలుగు',
    telugu: 'తెలుగు',
    kn: 'ಕನ್ನಡ',
    kannada: 'ಕನ್ನಡ',
    ml: 'മലയാളം',
    malayalam: 'മലയാളം',
    ur: 'اردو',
    urdu: 'اردو',
  };
  return map[key] ?? lang;
}

async function getTemplate(slug: string): Promise<Template | null> {
  try {
    const res = await fetch(`${API}/api/templates/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getTemplateReviews(slug: string): Promise<ReviewItem[]> {
  try {
    const res = await fetch(`${API}/api/templates/${slug}/reviews?limit=6`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getFeaturedReviews(): Promise<ReviewItem[]> {
  try {
    const res = await fetch(`${API}/api/reviews/featured?limit=6`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getRelatedTemplates(community: string, excludeSlug: string): Promise<RelatedTemplate[]> {
  try {
    const qs = new URLSearchParams({
      community,
      exclude: excludeSlug,
      limit: '6',
      sort: 'popular',
    });
    const res = await fetch(`${API}/api/templates?${qs.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.templates ?? []) as RelatedTemplate[];
  } catch {
    return [];
  }
}

const PLACEHOLDER_REVIEWS: ReviewItem[] = [
  {
    id: 'ph-1',
    rating: 5,
    reviewText: 'Beautiful template and super easy to customize. Our guests loved the invitation experience.',
    coupleNames: 'Riya & Kunal',
    location: 'Jaipur',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ph-2',
    rating: 5,
    reviewText: 'The RSVP tracking made planning so much easier. Design looked premium on mobile.',
    coupleNames: 'Ananya & Dev',
    location: 'Mumbai',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ph-3',
    rating: 4,
    reviewText: 'Quick setup and lovely look. Sharing on WhatsApp worked perfectly for our family groups.',
    coupleNames: 'Meera & Arjun',
    location: 'Bengaluru',
    createdAt: new Date().toISOString(),
  },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTemplate(slug);
  if (!t) return { title: 'Template Not Found' };
  return {
    title: `${t.name} — Aamantran`,
    description: t.aboutText,
  };
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTemplate(slug);
  if (!t) notFound();
  const [productReviews, featuredReviews, relatedTemplates] = await Promise.all([
    getTemplateReviews(slug),
    getFeaturedReviews(),
    getRelatedTemplates(t.community, slug),
  ]);

  const discountPct = t.originalPrice
    ? Math.round((1 - t.price / t.originalPrice) * 100)
    : null;

  const rating    = Number(t.avgRating ?? 0);
  const stars     = Math.min(5, Math.round(rating));
  const bestFor   = t.bestFor ? t.bestFor.split(',').map(s => s.trim()).filter(Boolean) : [];
  const languages = t.languages ? t.languages.split(',').map(s => s.trim()).filter(Boolean) : ['English'];
  const desktopThumbSrc = t.desktopThumbnailUrl
    ? resolveBackendPublicUrl(t.desktopThumbnailUrl)
    : (t.thumbnailUrl ? resolveBackendPublicUrl(t.thumbnailUrl) : null);
  const mobileThumbSrc = t.mobileThumbnailUrl
    ? resolveBackendPublicUrl(t.mobileThumbnailUrl)
    : desktopThumbSrc;
  const demoUrl   = `${API}/demo/${t.slug}`;
  const reviewsToShow =
    productReviews.length > 0 ? productReviews : featuredReviews.length > 0 ? featuredReviews : PLACEHOLDER_REVIEWS;
  const reviewSourceLabel =
    productReviews.length > 0
      ? 'What couples say about this template'
      : featuredReviews.length > 0
        ? 'What couples say on Aamantran'
        : 'Sample feedback';

  return (
    <div style={{ paddingTop: 80 }}>
      <div className="product-wrap">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/templates">Templates</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{t.name}</span>
        </div>

        <div className="product-cols">
          {/* LEFT — visual */}
          <div className="product-visual">
            <div className="product-main-thumb" style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-lift)' }}>
              {(desktopThumbSrc || mobileThumbSrc) ? (
                <picture>
                  {mobileThumbSrc && <source media="(max-width: 768px)" srcSet={mobileThumbSrc} />}
                  {desktopThumbSrc && <source media="(min-width: 769px)" srcSet={desktopThumbSrc} />}
                  <img
                    src={desktopThumbSrc || mobileThumbSrc || ''}
                    alt={t.name}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </picture>
              ) : (
                <div className="product-main-thumb-inner" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream-dark)', fontFamily: 'var(--font-display)', fontSize: '1.4rem', opacity: 0.4 }}>
                  No preview
                </div>
              )}
              {/* Live Demo overlay */}
              <a
                href={demoUrl}
                className="product-demo-overlay"
                style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                <span style={{
                  color: '#fff', fontSize: '0.9rem', fontWeight: 500,
                  border: '1px solid rgba(255,255,255,0.7)', padding: '8px 20px',
                  borderRadius: '100px', backdropFilter: 'blur(4px)',
                  opacity: 0, transition: 'opacity 0.25s ease',
                }}
                  className="product-demo-label"
                >
                  View Live Demo →
                </span>
              </a>
            </div>
          </div>

          {/* RIGHT — info */}
          <div className="product-info">
            <div className="product-community-badge">{t.community.charAt(0).toUpperCase() + t.community.slice(1)} Wedding</div>
            <h1 className="product-name">{t.name}</h1>

            {stars > 0 && (
              <div className="product-rating-row">
                <span className="product-stars">{'★'.repeat(stars)}</span>
                <span className="product-rating-num">{rating.toFixed(1)}</span>
                <span className="product-rating-count">
                  <a href="#reviews">({t.reviewCount} reviews)</a>
                </span>
              </div>
            )}

            <p style={{ fontSize: '0.85rem', color: 'var(--text-mid)', marginBottom: 20 }}>
              {t.buyerCount} couples have used this template
            </p>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 400, color: 'var(--text-dark)' }}>
                ₹{rupees(t.price)}
              </span>
              {t.originalPrice && (
                <>
                  <span style={{ fontSize: '1rem', color: 'var(--text-subtle)', textDecoration: 'line-through' }}>
                    ₹{rupees(t.originalPrice)}
                  </span>
                  <span style={{ fontSize: '0.75rem', background: '#e8f5e9', color: '#2e7d32', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                    {discountPct}% off
                  </span>
                </>
              )}
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <Link href={`/checkout/${slug}`} className="btn-primary">
                Buy Now →
              </Link>
              <a href={demoUrl} className="btn-secondary">
                Live Demo
              </a>
            </div>
            <p className="einv-disclaimer product-einv-disclaimer">
              This is a <strong>digital e-invitation</strong> — you get an online invitation to share with guests.{' '}
              <strong>No physical product</strong> (printed cards or similar) is included or shipped.
            </p>

            {/* About */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: 8, color: 'var(--text-dark)' }}>About this template</h3>
              <p style={{ fontSize: '0.93rem', color: 'var(--text-mid)', lineHeight: 1.75 }}>{t.aboutText}</p>
            </div>

            {/* Best for */}
            {bestFor.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-subtle)', marginBottom: 8 }}>Best for</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {bestFor.map(b => (
                    <span key={b} style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: 100, background: 'rgba(110,31,46,0.08)', color: 'var(--burgundy)', border: '1px solid rgba(110,31,46,0.15)' }}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-subtle)', marginBottom: 8 }}>Languages</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {languages.map(l => (
                  <span key={l} style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: 100, background: 'var(--cream-dark)', border: '1px solid var(--border-soft)', color: 'var(--text-mid)' }}>
                    {displayLanguageLabel(l)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section id="reviews" className="product-section">
          <div className="product-section-head">
            <h2>Reviews</h2>
            <p>{reviewSourceLabel}</p>
          </div>
          <ProductReviewsSection reviews={reviewsToShow} />
        </section>

        <section className="product-section">
          <div className="product-section-head">
            <h2>You may also like</h2>
            <p>More templates from the {t.community} collection</p>
          </div>
          {relatedTemplates.length === 0 ? (
            <p className="product-empty">More recommendations are coming soon.</p>
          ) : (
            <div className="product-related-grid">
              {relatedTemplates.map(item => (
                <Link key={item.id} href={`/templates/${item.slug}`} className="product-related-card">
                  <div className="product-related-thumb">
                    {(item.desktopThumbnailUrl || item.mobileThumbnailUrl || item.thumbnailUrl) ? (
                      <picture>
                        {(item.mobileThumbnailUrl || item.desktopThumbnailUrl || item.thumbnailUrl) && (
                          <source media="(max-width: 768px)" srcSet={resolveBackendPublicUrl(item.mobileThumbnailUrl || item.desktopThumbnailUrl || item.thumbnailUrl) || ''} />
                        )}
                        {(item.desktopThumbnailUrl || item.thumbnailUrl || item.mobileThumbnailUrl) && (
                          <source media="(min-width: 769px)" srcSet={resolveBackendPublicUrl(item.desktopThumbnailUrl || item.thumbnailUrl || item.mobileThumbnailUrl) || ''} />
                        )}
                        <img
                          src={resolveBackendPublicUrl(item.desktopThumbnailUrl || item.thumbnailUrl || item.mobileThumbnailUrl) || ''}
                          alt={item.name}
                        />
                      </picture>
                    ) : (
                      <div className="product-related-fallback">{item.name}</div>
                    )}
                  </div>
                  <div className="product-related-info">
                    <p className="product-related-name">{item.name}</p>
                    <span className="product-related-price">INR {rupees(item.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
