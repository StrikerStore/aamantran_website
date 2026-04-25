'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

export type ReviewItem = {
  id: string;
  rating: number;
  reviewText: string | null;
  coupleNames: string | null;
  location: string | null;
  couplePhotoUrl?: string | null;
  template?: { name: string; slug: string } | null;
};

const CARD_HEIGHT = 380;
const DESKTOP_PER_PAGE = 3;
const CAROUSEL_LIMIT = 10;

// ── Stars helper ──────────────────────────────────────────────────────────────
function StarRow({ rating, size = '0.95rem' }: { rating: number; size?: string }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const fullCount = hasHalf ? full : Math.round(rating);
  const empty = 5 - fullCount - (hasHalf ? 1 : 0);
  return (
    <span className="ar-stars" style={{ fontSize: size }}>
      {'★'.repeat(fullCount)}
      {hasHalf && <span className="ar-star-half">★</span>}
      {'☆'.repeat(Math.max(0, empty))}
    </span>
  );
}

// ── Review Flip Card ──────────────────────────────────────────────────────────
function ReviewFlipCard({
  r,
  forceUnflip,
  onInteraction,
  showTemplateLink = false,
}: {
  r: ReviewItem;
  forceUnflip?: number;
  onInteraction?: () => void;
  showTemplateLink?: boolean;
}) {
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

  const Author = (
    <div className="ar-review-author" style={{ marginTop: 'auto', paddingTop: 14 }}>
      <strong>{r.coupleNames || 'Happy Couple'}</strong>
      <span>{r.location || 'India'}</span>
      {showTemplateLink && r.template && (
        <span className="ar-review-template-line">
          Template:{' '}
          <Link
            href={`/templates/${r.template.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="ar-review-template-link"
          >
            {r.template.name}
          </Link>
        </span>
      )}
    </div>
  );

  if (!hasPhoto) {
    return (
      <article
        className="ar-review-card"
        style={{ height: CARD_HEIGHT, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}
      >
        <div className="ar-review-stars" style={{ marginBottom: 10 }}>{'★'.repeat(stars)}</div>
        <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden', paddingBottom: 16 }}>
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
            <p className="ar-review-text" style={{ margin: 0, paddingBottom: 24 }}>
              {r.reviewText || 'Loved the overall invitation experience.'}
            </p>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to bottom, transparent, var(--bg-card, #fff))', pointerEvents: 'none' }} />
        </div>
        {Author}
      </article>
    );
  }

  return (
    <div onClick={handleToggle} title="Click to flip" style={{ perspective: '1000px', cursor: 'pointer', height: CARD_HEIGHT }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        <article
          className="ar-review-card"
          style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', margin: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}
        >
          <div className="ar-review-stars" style={{ marginBottom: 10 }}>{'★'.repeat(stars)}</div>
          <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden', paddingBottom: 16 }}>
            <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
              <p className="ar-review-text" style={{ margin: 0, paddingBottom: 24 }}>
                {r.reviewText || 'Loved the overall invitation experience.'}
              </p>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to bottom, transparent, var(--bg-card, #fff))', pointerEvents: 'none' }} />
          </div>
          {Author}
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
export default function ReviewsSection({
  reviews,
  avgRating,
  totalCount,
  showTemplateLink = false,
}: {
  reviews: ReviewItem[];
  avgRating: number;
  totalCount: number;
  showTemplateLink?: boolean;
}) {
  const carouselReviews = reviews.slice(0, CAROUSEL_LIMIT);
  const n = carouselReviews.length;

  // ── Desktop pagination ─────────────────────────────────────────────────────
  const [desktopPage, setDesktopPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const desktopInteractionRef = useRef(Date.now());

  const desktopPageCount = Math.max(1, Math.ceil(n / DESKTOP_PER_PAGE));
  const pageStart = desktopPage * DESKTOP_PER_PAGE;
  const visibleDesktop = carouselReviews.slice(pageStart, pageStart + DESKTOP_PER_PAGE);

  // ── Mobile carousel ────────────────────────────────────────────────────────
  const carouselRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [slideWidth, setSlideWidth] = useState(0);
  const [forceUnflip, setForceUnflip] = useState(0);
  const lastInteractionRef = useRef(Date.now());
  const touchStartX = useRef<number | null>(null);

  const mobileSlides = useMemo(() => {
    if (n === 0) return [];
    return [carouselReviews[n - 1], ...carouselReviews, carouselReviews[0]];
  }, [carouselReviews, n]);

  const sidePeek = 6;
  const slideGap = 12;
  const step = slideWidth + slideGap;
  const trackX = sidePeek - index * step;

  const handleInteraction = () => { lastInteractionRef.current = Date.now(); };

  // Desktop auto-advance
  useEffect(() => {
    if (desktopPageCount <= 1) return;
    const timer = window.setInterval(() => {
      if (Date.now() - desktopInteractionRef.current < 6000) return;
      setDesktopPage(p => (p + 1) % desktopPageCount);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [desktopPageCount]);

  // Mobile auto-advance
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

  useEffect(() => {
    if (n === 0 || index !== n + 1) return;
    const t = window.setTimeout(() => { setAnimate(false); setIndex(1); }, 520);
    return () => window.clearTimeout(t);
  }, [index, n]);

  useEffect(() => {
    if (n === 0 || index !== 0) return;
    const t = window.setTimeout(() => { setAnimate(false); setIndex(n); }, 520);
    return () => window.clearTimeout(t);
  }, [index, n]);

  useEffect(() => {
    if (animate) return;
    const frame = window.requestAnimationFrame(() => setAnimate(true));
    return () => window.cancelAnimationFrame(frame);
  }, [animate]);

  useEffect(() => {
    const updateSize = () => {
      setSlideWidth(Math.max(0, (carouselRef.current?.clientWidth ?? 0) - sidePeek * 2));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

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

  const safeAvg = Math.min(5, Math.max(0, avgRating || 0));
  const moreThanCarousel = totalCount > CAROUSEL_LIMIT;

  return (
    <div className="ar-reviews">
      {/* ── Average rating header ── */}
      <div className="ar-reviews-summary">
        <div className="ar-reviews-summary-left">
          <span className="ar-reviews-avg">{safeAvg.toFixed(1)}</span>
          <span className="ar-reviews-out-of">/ 5</span>
        </div>
        <div className="ar-reviews-summary-right">
          <StarRow rating={safeAvg} />
          <span className="ar-reviews-count">
            Based on {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </div>

      {/* ── Desktop: paginated carousel ── */}
      <div className="ar-reviews-grid ar-reviews-desktop-grid">
        {visibleDesktop.map(r => (
          <ReviewFlipCard key={r.id} r={r} showTemplateLink={showTemplateLink} />
        ))}
      </div>

      <div className="ar-reviews-desktop-footer">
        {desktopPageCount > 1 && (
          <div className="ar-reviews-desktop-nav">
            <button
              className="ar-reviews-nav-btn"
              onClick={() => { desktopInteractionRef.current = Date.now(); setDesktopPage(p => (p - 1 + desktopPageCount) % desktopPageCount); }}
              aria-label="Previous reviews"
            >‹</button>
            <div className="ar-reviews-page-dots">
              {Array.from({ length: desktopPageCount }, (_, i) => (
                <span
                  key={i}
                  className={`ar-reviews-page-dot${i === desktopPage ? ' active' : ''}`}
                  onClick={() => { desktopInteractionRef.current = Date.now(); setDesktopPage(i); }}
                />
              ))}
            </div>
            <button
              className="ar-reviews-nav-btn"
              onClick={() => { desktopInteractionRef.current = Date.now(); setDesktopPage(p => (p + 1) % desktopPageCount); }}
              aria-label="Next reviews"
            >›</button>
          </div>
        )}
        {moreThanCarousel && (
          <button className="ar-reviews-view-all" onClick={() => setShowAll(s => !s)}>
            {showAll ? 'Show less ↑' : `View all ${totalCount} reviews →`}
          </button>
        )}
      </div>

      {/* ── Mobile: swipeable carousel ── */}
      <div
        className="ar-reviews-mobile-carousel"
        aria-label="Couple reviews"
        ref={carouselRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="ar-reviews-mobile-track"
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
              <div key={`${item.id}-${i}`} className="ar-reviews-mobile-slide" style={{ width: `${slideWidth}px` }}>
                <ReviewFlipCard
                  r={item}
                  forceUnflip={isCurrentlyActive ? forceUnflip : undefined}
                  onInteraction={isCurrentlyActive ? handleInteraction : undefined}
                  showTemplateLink={showTemplateLink}
                />
              </div>
            );
          })}
        </div>

        <div className="ar-reviews-mobile-dots" aria-hidden="true">
          {carouselReviews.map((item, i) => (
            <span
              key={`dot-${item.id}`}
              className={`ar-reviews-mobile-dot${(index - 1 + n) % n === i ? ' active' : ''}`}
            />
          ))}
        </div>

        {moreThanCarousel && (
          <button
            className="ar-reviews-view-all ar-reviews-mobile-view-all"
            onClick={() => setShowAll(s => !s)}
          >
            {showAll ? 'Show less ↑' : `View all ${totalCount} reviews →`}
          </button>
        )}
      </div>

      {/* ── Show all (full grid below carousel) ── */}
      {showAll && (
        <div className="ar-reviews-all-list">
          {reviews.map(r => (
            <ReviewFlipCard key={`all-${r.id}`} r={r} showTemplateLink={showTemplateLink} />
          ))}
        </div>
      )}
    </div>
  );
}
