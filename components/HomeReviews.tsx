'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';

export interface FeaturedReview {
  id: string;
  rating: number;
  reviewText: string | null;
  coupleNames: string | null;
  location: string | null;
  couplePhotoUrl: string | null;
  createdAt: string;
  template: { name: string; slug: string } | null;
}

/** Fallback reviews shown when there are no real reviews in DB yet */
const FALLBACK_REVIEWS: FeaturedReview[] = [
  {
    id: 'fb-1',
    rating: 5,
    reviewText: '"Our guests kept saying how beautiful the invitation was. The envelope animation left everyone speechless. Sharing on WhatsApp was so easy."',
    coupleNames: 'Priya & Rahul',
    location: 'Jaipur',
    couplePhotoUrl: null,
    createdAt: '',
    template: null,
  },
  {
    id: 'fb-2',
    rating: 5,
    reviewText: '"I saved at least ₹25,000 on printed cards and the RSVP tracking was a lifesaver. I knew exactly who was coming to which function."',
    coupleNames: 'Kabir & Aisha',
    location: 'Mumbai',
    couplePhotoUrl: null,
    createdAt: '',
    template: null,
  },
  {
    id: 'fb-3',
    rating: 5,
    reviewText: '"We had our invitation live and shared with guests within an hour of signing up. Picked our template, filled in details, and done!"',
    coupleNames: 'Sneha & Rohan',
    location: 'Hyderabad',
    couplePhotoUrl: null,
    createdAt: '',
    template: null,
  },
];

// ── Flip Card ──────────────────────────────────────────────────────────────────

function ReviewFlipCard({ r }: { r: FeaturedReview }) {
  const stars = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
  const [flipped, setFlipped] = useState(false);
  const hasPhoto = Boolean(r.couplePhotoUrl);

  // Auto-flip every 5 s when the card has a photo
  useEffect(() => {
    if (!hasPhoto) return;
    const t = window.setInterval(() => setFlipped(f => !f), 5000);
    return () => window.clearInterval(t);
  }, [hasPhoto]);

  if (!hasPhoto) {
    // Plain card — no flip behaviour
    return (
      <article className="review-card">
        <div className="review-stars">{'★'.repeat(stars)}</div>
        <p className="review-text">{r.reviewText || '"Loved the overall invitation experience."'}</p>
        <div className="review-author">
          <span className="review-avatar">💑</span>
          <div>
            <strong>{r.coupleNames || 'Happy Couple'}</strong>
            <span>{r.location || 'India'}</span>
            {r.template && (
              <span style={{ display: 'block', fontSize: '0.78rem', marginTop: 2 }}>
                Template:{' '}
                <Link
                  href={`/templates/${r.template.slug}`}
                  style={{ color: 'var(--accent, #8b3a3a)', textDecoration: 'underline', fontWeight: 500 }}
                >
                  {r.template.name}
                </Link>
              </span>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Flip card — click or auto-timer toggles front/back
  return (
    <div
      onClick={() => setFlipped(f => !f)}
      title="Click to flip"
      style={{
        perspective: '1000px',
        cursor: 'pointer',
        height: '100%',
        minHeight: 260,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 260,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* FRONT — review text */}
        <article
          className="review-card"
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            margin: 0,
          }}
        >
          <div className="review-stars">{'★'.repeat(stars)}</div>
          <p className="review-text">{r.reviewText || '"Loved the overall invitation experience."'}</p>
          <div className="review-author">
            <span className="review-avatar">💑</span>
            <div>
              <strong>{r.coupleNames || 'Happy Couple'}</strong>
              <span>{r.location || 'India'}</span>
              {r.template && (
                <span style={{ display: 'block', fontSize: '0.78rem', marginTop: 2 }}>
                  Template:{' '}
                  <Link
                    href={`/templates/${r.template.slug}`}
                    onClick={e => e.stopPropagation()}
                    style={{ color: 'var(--accent, #8b3a3a)', textDecoration: 'underline', fontWeight: 500 }}
                  >
                    {r.template.name}
                  </Link>
                </span>
              )}
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, opacity: 0.7 }}>
                📸 Click to see our photo
              </span>
            </div>
          </div>
        </article>

        {/* BACK — couple photo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 16,
            overflow: 'hidden',
            background: '#1a1a1a',
          }}
        >
          <img
            src={r.couplePhotoUrl!}
            alt={r.coupleNames ? `${r.coupleNames} with their invitation` : 'Couple photo'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Name overlay at bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '32px 16px 16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
            color: '#fff',
          }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{r.coupleNames || 'Happy Couple'}</div>
            {r.location && <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: 2 }}>{r.location}</div>}
            <div style={{ fontSize: '0.7rem', opacity: 0.65, marginTop: 4 }}>Click to flip back</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomeReviews({ reviews: propReviews = [] }: { reviews?: FeaturedReview[] }) {
  const reviews = propReviews.length > 0 ? propReviews : FALLBACK_REVIEWS;

  const carouselRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [slideWidth, setSlideWidth] = useState(0);
  const mobileSlides = useMemo(
    () => [reviews[reviews.length - 1], ...reviews, reviews[0]],
    [reviews]
  );
  const sidePeek = 6;
  const slideGap = 12;
  const step = slideWidth + slideGap;
  const trackX = sidePeek - (index * step);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimate(true);
      setIndex(prev => prev + 1);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (index !== reviews.length + 1) return;
    const resetTimer = window.setTimeout(() => {
      setAnimate(false);
      setIndex(1);
    }, 520);
    return () => window.clearTimeout(resetTimer);
  }, [index, reviews.length]);

  useEffect(() => {
    if (animate) return;
    const frame = window.requestAnimationFrame(() => setAnimate(true));
    return () => window.cancelAnimationFrame(frame);
  }, [animate]);

  useEffect(() => {
    const updateSize = () => {
      const containerWidth = carouselRef.current?.clientWidth ?? 0;
      const computed = Math.max(0, containerWidth - (sidePeek * 2));
      setSlideWidth(computed);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <>
      <div className="reviews-grid reviews-desktop-grid">
        {reviews.map((r, i) => (
          <ScrollReveal key={r.id} className="review-card" delay={i * 100}>
            <ReviewFlipCard r={r} />
          </ScrollReveal>
        ))}
      </div>

      <div className="reviews-mobile-carousel" aria-label="Couple reviews" ref={carouselRef}>
        <div
          className="reviews-mobile-track"
          style={{
            transform: `translateX(${trackX}px)`,
            transition: animate ? 'transform 520ms ease' : 'none',
          }}
        >
          {mobileSlides.map((item, i) => (
            <div key={`mobile-${item.id}-${i}`} className="reviews-mobile-slide" style={{ width: `${slideWidth}px` }}>
              <ReviewFlipCard r={item} />
            </div>
          ))}
        </div>
        <div className="reviews-mobile-dots" aria-hidden="true">
          {reviews.map((item, i) => (
            <span
              key={`dot-${item.id}`}
              className={`reviews-mobile-dot${(index - 1 + reviews.length) % reviews.length === i ? ' active' : ''}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
