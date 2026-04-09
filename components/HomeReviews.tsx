'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';

const HOME_REVIEWS = [
  { avatar: '👰', text: '"Our guests kept saying how beautiful the invitation was. The envelope animation left everyone speechless. Sharing on WhatsApp was so easy."', name: 'Priya Sharma', loc: 'Married in Jaipur · Dec 2024' },
  { avatar: '🤵', text: '"I saved at least ₹25,000 on printed cards and the RSVP tracking was a lifesaver. I knew exactly who was coming to which function. Amazing."', name: 'Kabir & Aisha', loc: 'Married in Mumbai · Nov 2024' },
  { avatar: '👰', text: '"We had our invitation live and shared with guests within an hour of signing up. The whole process was so smooth — picked our template, filled in our details, and done!"', name: 'Sneha & Rohan', loc: 'Married in Hyderabad · Oct 2024' },
];

function ReviewCard({ avatar, text, name, loc }: { avatar: string; text: string; name: string; loc: string }) {
  return (
    <article className="review-card">
      <div className="review-stars">★★★★★</div>
      <p className="review-text">{text}</p>
      <div className="review-author">
        <span className="review-avatar">{avatar}</span>
        <div>
          <strong>{name}</strong>
          <span>{loc}</span>
        </div>
      </div>
    </article>
  );
}

export default function HomeReviews() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [slideWidth, setSlideWidth] = useState(0);
  const mobileSlides = useMemo(
    () => [HOME_REVIEWS[HOME_REVIEWS.length - 1], ...HOME_REVIEWS, HOME_REVIEWS[0]],
    []
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
    if (index !== HOME_REVIEWS.length + 1) return;
    const resetTimer = window.setTimeout(() => {
      setAnimate(false);
      setIndex(1);
    }, 520);
    return () => window.clearTimeout(resetTimer);
  }, [index]);

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
        {HOME_REVIEWS.map(({ avatar, text, name, loc }, i) => (
          <ScrollReveal key={name} className="review-card" delay={i * 100}>
            <div className="review-stars">★★★★★</div>
            <p className="review-text">{text}</p>
            <div className="review-author">
              <span className="review-avatar">{avatar}</span>
              <div>
                <strong>{name}</strong>
                <span>{loc}</span>
              </div>
            </div>
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
            <div key={`mobile-${item.name}-${i}`} className="reviews-mobile-slide" style={{ width: `${slideWidth}px` }}>
              <ReviewCard {...item} />
            </div>
          ))}
        </div>
        <div className="reviews-mobile-dots" aria-hidden="true">
          {HOME_REVIEWS.map((item, i) => (
            <span key={`dot-${item.name}`} className={`reviews-mobile-dot${(index - 1 + HOME_REVIEWS.length) % HOME_REVIEWS.length === i ? ' active' : ''}`} />
          ))}
        </div>
      </div>
    </>
  );
}
