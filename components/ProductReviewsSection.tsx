'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type ProductReviewItem = {
  id: string;
  rating: number;
  reviewText: string | null;
  coupleNames: string | null;
  location: string | null;
};

function ProductReviewCard({ r }: { r: ProductReviewItem }) {
  const stars = Math.max(1, Math.min(5, Math.round(r.rating || 0)));
  return (
    <article className="product-review-card">
      <div className="product-review-stars">{'★'.repeat(stars)}</div>
      <p className="product-review-text">{r.reviewText || 'Loved the overall invitation experience.'}</p>
      <div className="product-review-author">
        <strong>{r.coupleNames || 'Happy Couple'}</strong>
        <span>{r.location || 'India'}</span>
      </div>
    </article>
  );
}

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
      setIndex(prev => prev + 1);
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
        {reviews.map(r => (
          <ProductReviewCard key={r.id} r={r} />
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
              <ProductReviewCard r={item} />
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
