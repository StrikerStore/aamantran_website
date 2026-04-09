'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPublicApiUrl } from '@/lib/publicEnv';
import { resolveBackendPublicUrl } from '@/lib/assetUrl';

const API = getPublicApiUrl();

const COMMUNITY_THEME: Record<string, string> = {
  hindu:     'royal',
  muslim:    'emerald',
  sikh:      'navy',
  christian: 'blush',
  universal: 'minimal',
};

const DEMO_NAMES: Record<string, [string, string]> = {
  hindu:     ['Arjun', 'Priya'],
  muslim:    ['Zain', 'Noor'],
  sikh:      ['Harpreet', 'Simran'],
  christian: ['Aaron', 'Diya'],
  universal: ['Rohan', 'Sneha'],
};

interface DbTemplate {
  id: string; slug: string; name: string;
  thumbnailUrl: string | null;
  desktopThumbnailUrl?: string | null;
  mobileThumbnailUrl?: string | null;
  community: string;
  price: number; originalPrice: number | null;
  buyerCount?: number;
  bestFor?: string;
}

function rupees(paise: number) {
  return (paise / 100).toLocaleString('en-IN');
}

function CarouselThumb({ src, theme, name, name1, name2 }: {
  src: string | null; theme: string; name: string; name1: string; name2: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`tpl-grid-thumb-inner ${theme}`}>
        <div>
          <div className="tpl-thumb-names">{name1} &amp; {name2}</div>
          <span className="tpl-thumb-date">{name}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

export default function TemplatesCarousel() {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<DbTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/templates?limit=5&sort=popular`)
      .then(r => r.json())
      .then(d => setSlides(d.templates ?? []))
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  function slideWidth() {
    const slide = carouselRef.current?.querySelector<HTMLElement>('.tpl-slide');
    if (!slide) return 304;
    return slide.offsetWidth + 24;
  }

  function goToSlide(idx: number) {
    const clamped = Math.max(0, Math.min(idx, slides.length - 1));
    setCurrentSlide(clamped);
    if (carouselRef.current) {
      carouselRef.current.style.scrollBehavior = 'smooth';
      carouselRef.current.scrollLeft = clamped * slideWidth();
    }
  }

  function onScroll() {
    if (!carouselRef.current) return;
    const idx = Math.round(carouselRef.current.scrollLeft / slideWidth());
    if (idx !== currentSlide) setCurrentSlide(idx);
  }

  if (loading) {
    return (
      <div className="templates-carousel-wrap" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-subtle)' }}>
        Loading templates…
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="templates-carousel-wrap" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-subtle)' }}>
        No templates available yet.
      </div>
    );
  }

  return (
    <div className="templates-carousel-wrap">
      <div className="templates-carousel" id="templates-carousel" ref={carouselRef} onScroll={onScroll}>
        {slides.map(s => {
          const key      = s.community.toLowerCase();
          const theme    = COMMUNITY_THEME[key] ?? 'minimal';
          const rawThumb =
            (isMobile ? s.mobileThumbnailUrl : s.desktopThumbnailUrl) ||
            s.desktopThumbnailUrl ||
            s.mobileThumbnailUrl ||
            s.thumbnailUrl ||
            null;
          const thumbSrc = rawThumb ? resolveBackendPublicUrl(rawThumb) : null;
          const [name1, name2] = DEMO_NAMES[key] ?? ['Sample', 'Couple'];
          const demoUrl  = `${API}/demo/${s.slug}`;
          const productUrl = `/templates/${s.slug}`;
          const checkoutUrl = `/checkout/${s.slug}`;
          const communityLabel = `${s.community.charAt(0).toUpperCase() + s.community.slice(1)} Weddings`;
          const shortDesc = `Perfect for ${s.community} weddings - effortless to edit, share. Designed to feel completely yours.`;

          return (
            <div className="tpl-slide" key={s.id}>
              <div className="tpl-grid-card" onClick={() => router.push(productUrl)} style={{ cursor: 'pointer' }}>
                <div className="tpl-grid-thumb">
                  <CarouselThumb src={thumbSrc} theme={theme} name={s.name} name1={name1} name2={name2} />
                  <a
                    href={demoUrl}
                    className="tpl-grid-demo-icon"
                    onClick={e => e.stopPropagation()}
                    aria-label="Open live demo"
                  >
                    &#128065;
                  </a>
                </div>

                <div className="tpl-grid-info">
                  <div className="tpl-grid-title-row">
                    <p className="tpl-grid-name">{s.name}</p>
                    <Link href={checkoutUrl} className="tpl-grid-price-pill" onClick={e => e.stopPropagation()}>
                      INR {rupees(s.price)}
                    </Link>
                  </div>
                  <p className="tpl-grid-desc">{shortDesc}</p>
                  <div className="tpl-grid-bottom-row">
                    <span className="tpl-grid-chip">{communityLabel}</span>
                    <Link href={productUrl} className="tpl-grid-link-btn" onClick={e => e.stopPropagation()}>
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="carousel-controls">
        <button className="carousel-btn" onClick={() => goToSlide(currentSlide - 1)} aria-label="Previous">‹</button>
        <div className="carousel-dots">
          {slides.map((_, i) => (
            <span key={i} className={`dot${i === currentSlide ? ' active' : ''}`} onClick={() => goToSlide(i)} />
          ))}
        </div>
        <button className="carousel-btn" onClick={() => goToSlide(currentSlide + 1)} aria-label="Next">›</button>
      </div>
    </div>
  );
}
