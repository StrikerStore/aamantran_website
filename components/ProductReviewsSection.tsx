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

const CARD_HEIGHT = 380;
const DESKTOP_PER_PAGE = 3;
const DESKTOP_LIMIT = 6;

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

  if (!hasPhoto) {
    return (
      <article
        className="product-review-card"
        style={{ height: CARD_HEIGHT, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}
      >
        <div className="product-review-stars" style={{ marginBottom: 12 }}>{'★'.repeat(stars)}</div>
        <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden', paddingBottom: 16 }}>
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
            <p className="product-review-text" style={{ margin: 0, paddingBottom: 24 }}>
              {r.reviewText || 'Loved the overall invitation experience.'}
            </p>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to bottom, transparent, var(--bg-card, #fff))', pointerEvents: 'none' }} />
        </div>
        <div className="product-review-author" style={{ marginTop: 'auto', paddingTop: 16 }}>
          <strong>{r.coupleNames || 'Happy Couple'}</strong>
          <span>{r.location || 'India'}</span>
        </div>
      </article>
    );
  }

  return (
    <div onClick={handleToggle} title="Click to flip" style={{ perspective: '1000px', cursor: 'pointer', height: CARD_HEIGHT }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        <article
          className="product-review-card"
          style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', margin: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}
        >
          <div className="product-review-stars" style={{ marginBottom: 12 }}>{'★'.repeat(stars)}</div>
          <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden', paddingBottom: 16 }}>
            <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
              <p className="product-review-text" style={{ margin: 0, paddingBottom: 24 }}>{r.reviewText || 'Loved the overall invitation experience.'}</p>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to bottom, transparent, var(--bg-card, #fff))', pointerEvents: 'none' }} />
          </div>
          <div className="product-review-author" style={{ marginTop: 'auto', paddingTop: 16 }}>
            <strong>{r.coupleNames || 'Happy Couple'}</strong>
            <span>{r.location || 'India'}</span>
          </div>
        </article>

        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 14, overflow: 'hidden', background: '#1a1a1a' }}>
          <img src={r.couplePhotoUrl!} alt={r.coupleNames ? `${r.coupleNames} with their invitation` : 'Couple photo'} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 14px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 100%)', color: '#fff' }}>
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
  // ── Desktop state ──────────────────────────────────────────────────────────
  const [desktopPage, setDesktopPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const desktopInteractionRef = useRef(Date.now());

  const desktopSlice = reviews.slice(0, DESKTOP_LIMIT);
  const desktopPageCount = Math.ceil(desktopSlice.length / DESKTOP_PER_PAGE);
  const pageStart = desktopPage * DESKTOP_PER_PAGE;
  const visibleDesktop = desktopSlice.slice(pageStart, pageStart + DESKTOP_PER_PAGE);
  const remainingReviews = reviews.slice(DESKTOP_LIMIT);

  // ── Mobile state ───────────────────────────────────────────────────────────
  const carouselRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [slideWidth, setSlideWidth] = useState(0);
  const [forceUnflip, setForceUnflip] = useState(0);
  const lastInteractionRef = useRef(Date.now());
  const touchStartX = useRef<number | null>(null);

  const n = reviews.length;
  const mobileSlides = useMemo(() => {
    if (n === 0) return [];
    return [reviews[n - 1], ...reviews, reviews[0]];
  }, [reviews, n]);

  const sidePeek = 6;
  const slideGap = 12;
  const step = slideWidth + slideGap;
  const trackX = sidePeek - index * step;

  const handleInteraction = () => { lastInteractionRef.current = Date.now(); };

  // Desktop auto-slide
  useEffect(() => {
    if (desktopPageCount <= 1) return;
    const timer = window.setInterval(() => {
      if (Date.now() - desktopInteractionRef.current < 6000) return;
      setDesktopPage(p => (p + 1) % desktopPageCount);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [desktopPageCount]);

  // Auto-scroll
  useEffect(() => {
    if (n <= 1) return;
    let timer: number;
    const checkAndScroll = () => {
      const timeSinceInteract = Date.now() - lastInteractionRef.current;
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

  // Wrap forward (index goes past last clone)
  useEffect(() => {
    if (n === 0 || index !== n + 1) return;
    const t = window.setTimeout(() => { setAnimate(false); setIndex(1); }, 520);
    return () => window.clearTimeout(t);
  }, [index, n]);

  // Wrap backward (index goes before first clone)
  useEffect(() => {
    if (n === 0 || index !== 0) return;
    const t = window.setTimeout(() => { setAnimate(false); setIndex(n); }, 520);
    return () => window.clearTimeout(t);
  }, [index, n]);

  // Re-enable animation after instant jump
  useEffect(() => {
    if (animate) return;
    const frame = window.requestAnimationFrame(() => setAnimate(true));
    return () => window.cancelAnimationFrame(frame);
  }, [animate]);

  // Slide width
  useEffect(() => {
    const updateSize = () => {
      setSlideWidth(Math.max(0, (carouselRef.current?.clientWidth ?? 0) - sidePeek * 2));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Mobile touch swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      handleInteraction();
      setForceUnflip(f => f + 1);
      setTimeout(() => {
        setAnimate(true);
        setIndex(prev => prev + (delta > 0 ? 1 : -1));
      }, 50);
    }
    touchStartX.current = null;
  }

  if (n === 0) return null;

  return (
    <>
      {/* ── Desktop: paginated carousel ── */}
      <div className="product-reviews-grid product-reviews-desktop-grid">
        {visibleDesktop.map(r => (
          <ProductReviewFlipCard key={r.id} r={r} />
        ))}
      </div>

      <div className="product-reviews-desktop-footer">
        {desktopPageCount > 1 && (
          <div className="product-reviews-desktop-nav">
            <button
              className="product-reviews-nav-btn"
              onClick={() => { desktopInteractionRef.current = Date.now(); setDesktopPage(p => (p - 1 + desktopPageCount) % desktopPageCount); }}
              aria-label="Previous reviews"
            >‹</button>
            <div className="product-reviews-page-dots">
              {Array.from({ length: desktopPageCount }, (_, i) => (
                <span
                  key={i}
                  className={`product-reviews-page-dot${i === desktopPage ? ' active' : ''}`}
                  onClick={() => { desktopInteractionRef.current = Date.now(); setDesktopPage(i); }}
                />
              ))}
            </div>
            <button
              className="product-reviews-nav-btn"
              onClick={() => { desktopInteractionRef.current = Date.now(); setDesktopPage(p => (p + 1) % desktopPageCount); }}
              aria-label="Next reviews"
            >›</button>
          </div>
        )}
        {reviews.length > DESKTOP_LIMIT && (
          <button className="product-reviews-view-all" onClick={() => setShowAll(s => !s)}>
            {showAll ? 'Show less ↑' : `View all ${n} reviews →`}
          </button>
        )}
      </div>

      {showAll && remainingReviews.length > 0 && (
        <div className="product-reviews-grid product-reviews-desktop-grid product-reviews-expanded">
          {remainingReviews.map(r => (
            <ProductReviewFlipCard key={r.id} r={r} />
          ))}
        </div>
      )}

      {/* ── Mobile: swipeable carousel ── */}
      <div
        className="product-reviews-mobile-carousel"
        aria-label="Couple reviews"
        ref={carouselRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="product-reviews-mobile-track"
          style={{
            transform: `translateX(${trackX}px)`,
            transition: animate ? 'transform 520ms ease' : 'none',
          }}
        >
          {mobileSlides.map((item, i) => {
            const isClone = i === 0 || i === mobileSlides.length - 1;
            const originalIndex = isClone ? (i === 0 ? n - 1 : 0) : i - 1;
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

        <button
          className="product-reviews-view-all product-reviews-mobile-view-all"
          onClick={() => setShowAll(s => !s)}
        >
          {showAll ? 'Show less ↑' : `View all ${n} reviews →`}
        </button>
      </div>

      {/* Mobile expanded list */}
      {showAll && (
        <div className="product-reviews-mobile-all-list">
          {reviews.map(r => (
            <ProductReviewFlipCard key={`all-${r.id}`} r={r} />
          ))}
        </div>
      )}
    </>
  );
}
