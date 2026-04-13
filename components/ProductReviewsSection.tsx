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
function ProductReviewFlipCard({ r, forceUnflip, onInteraction }: { r: ProductReviewItem, forceUnflip?: number, onInteraction?: () => void }) {
  const stars = Math.max(1, Math.min(5, Math.round(r.rating || 0)));
  const hasPhoto = Boolean(r.couplePhotoUrl);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (forceUnflip) setFlipped(false);
  }, [forceUnflip]);

  const handleToggle = () => {
    setFlipped(f => !f);
    if (onInteraction) onInteraction();
  };

  // Auto-flip exactly once when a photo exists
  const [hasAutoFlipped, setHasAutoFlipped] = useState(false);
  useEffect(() => {
    if (!hasPhoto || hasAutoFlipped) return;
    const t = window.setTimeout(() => {
      setFlipped(true);
      setHasAutoFlipped(true);
      if (onInteraction) onInteraction();
      const t2 = window.setTimeout(() => setFlipped(false), 4500);
      return () => window.clearTimeout(t2);
    }, 4000);
    return () => window.clearTimeout(t);
  }, [hasPhoto, hasAutoFlipped, onInteraction]);

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
        <div className="product-review-stars" style={{ marginBottom: 12 }}>{'★'.repeat(stars)}</div>

        <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden', paddingBottom: 16 }}>
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
            <p className="product-review-text" style={{ margin: 0, paddingBottom: 24 }}>
              {r.reviewText || 'Loved the overall invitation experience.'}
            </p>
          </div>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
            background: 'linear-gradient(to bottom, transparent, var(--bg-card, #fff))',
            pointerEvents: 'none',
          }} />
        </div>

        <div className="product-review-author" style={{ marginTop: 'auto', paddingTop: 16 }}>
          <strong>{r.coupleNames || 'Happy Couple'}</strong>
          <span>{r.location || 'India'}</span>
        </div>
      </article>
    );
  }

  // ── Flip card — portrait fixed height ─────────────────────────────────────
  return (
    <div
      onClick={handleToggle}
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
          <div className="product-review-stars" style={{ marginBottom: 12 }}>{'★'.repeat(stars)}</div>

          <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden', paddingBottom: 16 }}>
            <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
              <p className="product-review-text" style={{ margin: 0, paddingBottom: 24 }}>
                {r.reviewText || 'Loved the overall invitation experience.'}
              </p>
            </div>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
              background: 'linear-gradient(to bottom, transparent, var(--bg-card, #fff))',
              pointerEvents: 'none',
            }} />
          </div>

          <div className="product-review-author" style={{ marginTop: 'auto', paddingTop: 16 }}>
            <strong>{r.coupleNames || 'Happy Couple'}</strong>
            <span>{r.location || 'India'}</span>
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
  const [forceUnflip, setForceUnflip] = useState(0);
  const lastInteractionRef = useRef(Date.now());

  const n = reviews.length;
  const mobileSlides = useMemo(() => {
    if (n === 0) return [];
    return [reviews[n - 1], ...reviews, reviews[0]];
  }, [reviews, n]);

  const sidePeek = 6;
  const slideGap = 12;
  const step = slideWidth + slideGap;
  const trackX = sidePeek - index * step;

  const handleInteraction = () => {
    lastInteractionRef.current = Date.now();
  };

  useEffect(() => {
    if (n <= 1) return;
    
    let timer: number;
    const checkAndScroll = () => {
      const now = Date.now();
      const timeSinceInteract = now - lastInteractionRef.current;
      
      if (timeSinceInteract < 8000) {
        timer = window.setTimeout(checkAndScroll, 8000 - timeSinceInteract);
        return;
      }
      
      setForceUnflip(f => f + 1);
      
      setTimeout(() => {
        setAnimate(true);
        setIndex(prev => prev + 1);
        lastInteractionRef.current = Date.now();
      }, 700);

      timer = window.setTimeout(checkAndScroll, 8000);
    };

    timer = window.setTimeout(checkAndScroll, 8000);
    return () => window.clearTimeout(timer);
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
          {mobileSlides.map((item, i) => {
            const isClone = i === 0 || i === mobileSlides.length - 1;
            const originalIndex = isClone 
              ? (i === 0 ? n - 1 : 0) 
              : i - 1;
            const isCurrentlyActive = ((index - 1 + n) % n) === originalIndex;

            return (
              <div key={`${item.id}-${i}`} className="product-reviews-mobile-slide" style={{ width: `${slideWidth}px` }}>
                <ProductReviewFlipCard 
                  r={item} 
                  forceUnflip={isCurrentlyActive ? forceUnflip : undefined}
                  onInteraction={isCurrentlyActive ? handleInteraction : undefined}
                />
              </div>
            );
          })}
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
