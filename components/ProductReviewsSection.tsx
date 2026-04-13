'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type ProductReviewItem = {
  id: string;
  rating: number;
  reviewText: string | null;
  coupleNames: string | null;
  location: string | null;
  couplePhotoUrl?: string | null;
};

// ── Fixed portrait height for all product review cards ─────────────────────────
const CARD_HEIGHT = 380;

// ── Product Review Flip Card ──────────────────────────────────────────────────
function ProductReviewFlipCard({ r }: { r: ProductReviewItem }) {
  const stars = Math.max(1, Math.min(5, Math.round(r.rating || 0)));
  const hasPhoto = Boolean(r.couplePhotoUrl);
  const [flipped, setFlipped] = useState(false);

  // Auto-flip every 5 s when a photo exists
  useEffect(() => {
    if (!hasPhoto) return;
    const t = window.setInterval(() => setFlipped((f) => !f), 5000);
    return () => window.clearInterval(t);
  }, [hasPhoto]);

  // ── No-photo card ──────────────────────────────────────────────────────────
  if (!hasPhoto) {
    return (
      <article
        className="product-review-card"
        style={{
          height: CARD_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <div className="product-review-stars">{'★'.repeat(stars)}</div>

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', marginBottom: 12 }}>
          <p className="product-review-text" style={{ margin: 0 }}>
            {r.reviewText || 'Loved the overall invitation experience.'}
          </p>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
            background: 'linear-gradient(to bottom, transparent, var(--bg-card, #fff))',
            pointerEvents: 'none',
          }} />
        </div>

        <div className="product-review-author">
          <strong>{r.coupleNames || 'Happy Couple'}</strong>
          <span>{r.location || 'India'}</span>
        </div>
      </article>
    );
  }

  // ── Flip card — portrait fixed height ─────────────────────────────────────
  return (
    <div
      onClick={() => setFlipped((f) => !f)}
      title="Click to flip"
      style={{ perspective: '1000px', cursor: 'pointer', height: CARD_HEIGHT }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* FRONT — review text */}
        <article
          className="product-review-card"
          style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          <div className="product-review-stars">{'★'.repeat(stars)}</div>

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', marginBottom: 12 }}>
            <p className="product-review-text" style={{ margin: 0 }}>
              {r.reviewText || 'Loved the overall invitation experience.'}
            </p>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
              background: 'linear-gradient(to bottom, transparent, var(--bg-card, #fff))',
              pointerEvents: 'none',
            }} />
          </div>

          <div className="product-review-author">
            <strong>{r.coupleNames || 'Happy Couple'}</strong>
            <span>{r.location || 'India'}</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8, opacity: 0.6 }}>
            📸 Click to see photo
          </div>
        </article>

        {/* BACK — couple photo, portrait fill */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 14,
            overflow: 'hidden',
            background: '#1a1a1a',
          }}
        >
          <img
            src={r.couplePhotoUrl!}
            alt={r.coupleNames ? `${r.coupleNames} with their invitation` : 'Couple photo'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '28px 14px 12px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 100%)',
            color: '#fff',
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.coupleNames || 'Happy Couple'}</div>
            {r.location && <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 2 }}>{r.location}</div>}
            <div style={{ fontSize: '0.66rem', opacity: 0.55, marginTop: 6 }}>Click to flip back</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function ProductReviewsSection({ reviews }: { reviews: ProductReviewItem[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [slideWidth, setSlideWidth] = useState(0);

  const n = reviews.length;
  const mobileSlides = useMemo(() => {
    if (n === 0) return [];
    return [reviews[n - 1], ...reviews, reviews[0]];
  }, [reviews, n]);

  const sidePeek = 6;
  const slideGap = 12;
  const step = slideWidth + slideGap;
  const trackX = sidePeek - index * step;

  useEffect(() => {
    if (n <= 1) return;
    const timer = window.setInterval(() => {
      setAnimate(true);
      setIndex((prev) => prev + 1);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [n]);

  useEffect(() => {
    if (n === 0) return;
    if (index !== n + 1) return;
    const resetTimer = window.setTimeout(() => {
      setAnimate(false);
      setIndex(1);
    }, 520);
    return () => window.clearTimeout(resetTimer);
  }, [index, n]);

  useEffect(() => {
    if (animate) return;
    const frame = window.requestAnimationFrame(() => setAnimate(true));
    return () => window.cancelAnimationFrame(frame);
  }, [animate]);

  useEffect(() => {
    const updateSize = () => {
      const containerWidth = carouselRef.current?.clientWidth ?? 0;
      const computed = Math.max(0, containerWidth - sidePeek * 2);
      setSlideWidth(computed);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (n === 0) return null;

  return (
    <>
      <div className="product-reviews-grid product-reviews-desktop-grid">
        {reviews.map((r) => (
          <ProductReviewFlipCard key={r.id} r={r} />
        ))}
      </div>

      <div className="product-reviews-mobile-carousel" aria-label="Couple reviews" ref={carouselRef}>
        <div
          className="product-reviews-mobile-track"
          style={{
            transform: `translateX(${trackX}px)`,
            transition: animate ? 'transform 520ms ease' : 'none',
          }}
        >
          {mobileSlides.map((item, i) => (
            <div key={`${item.id}-${i}`} className="product-reviews-mobile-slide" style={{ width: `${slideWidth}px` }}>
              <ProductReviewFlipCard r={item} />
            </div>
          ))}
        </div>
        <div className="product-reviews-mobile-dots" aria-hidden="true">
          {reviews.map((item, i) => (
            <span
              key={`dot-${item.id}`}
              className={`product-reviews-mobile-dot${(index - 1 + n) % n === i ? ' active' : ''}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
