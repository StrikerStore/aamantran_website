'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { getPublicApiUrl } from '@/lib/publicEnv';
import { resolveBackendPublicUrl } from '@/lib/assetUrl';

const API = getPublicApiUrl();

const COMMUNITY_THEME: Record<string, string> = {
  hindu:     'tpl-royal',
  muslim:    'tpl-mughal',
  sikh:      'tpl-navy',
  christian: 'tpl-blush',
  universal: 'tpl-lanterns-dusk',
};

interface DbTemplate {
  id: string; slug: string; name: string;
  thumbnailUrl: string | null; community: string;
  price: number;
}

// Image card with CSS-gradient fallback on error
function HeroImgCard({ slug, src, name, price, community }: {
  slug: string; src: string; name: string; price: number; community: string;
}) {
  const [failed, setFailed] = useState(false);
  const theme = COMMUNITY_THEME[community] ?? 'tpl-lanterns-dusk';

  if (failed) {
    return (
      <Link href={`/templates/${slug}`} className={`c3d-inner ${theme}`} style={{ display: 'block', textDecoration: 'none' }}>
        <div className="tpl-bd center">
          <p className="tpl-couple-lg" style={{ fontSize: '1.4rem' }}>{name}</p>
          <p className="tpl-date-badge" style={{ marginTop: 12 }}>₹{price.toLocaleString('en-IN')}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/templates/${slug}`} className="c3d-inner c3d-img-card" style={{ display: 'block', textDecoration: 'none' }}>
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <div className="c3d-img-overlay">
        <span className="c3d-img-name">{name}</span>
      </div>
    </Link>
  );
}

// Static CSS-art showcase cards (always shown as extra variety)
const STATIC_CARDS = [
  {
    key: 'navy',
    content: (
      <div className={`c3d-inner tpl-navy`}>
        <div className="tpl-bd">
          <p className="tpl-eyebrow">The</p>
          <h3 className="tpl-headline">Countdown<br />begins</h3>
          <p className="tpl-countdown">92D 14H 57M</p>
          <div className="tpl-rule"></div>
          <ul className="tpl-linklist">
            <li>Navigation <span>Links</span></li>
            <li>The Venue <span>Venue Guide</span></li>
            <li>Bride and Groom <span>RSVP</span></li>
            <li>Instagram</li>
          </ul>
          <p className="tpl-note">Our families are excited that you are able to join us in celebrating one of the happiest days of our lives.</p>
          <p className="tpl-sig">with love · Abhishek &amp; Kanika</p>
        </div>
      </div>
    ),
  },
  {
    key: 'lanterns-dusk',
    content: (
      <div className="c3d-inner tpl-lanterns-dusk">
        <div className="c3d-lantern-dots"></div>
        <div className="tpl-bd center">
          <div className="tpl-couple-silhouette"></div>
          <p className="tpl-couple-lg">Abhishek<br />&amp; Kanika</p>
          <p className="tpl-date-badge">January 25, 2026</p>
        </div>
      </div>
    ),
  },
  {
    key: 'blush',
    content: (
      <div className="c3d-inner tpl-blush">
        <div className="tpl-blush-top"></div>
        <div className="tpl-bd center">
          <p className="tpl-lantern-row">✦ ✦ ✦</p>
          <p className="tpl-serif-xl">ABHISHEK</p>
          <p className="tpl-weds-txt">W E D S</p>
          <p className="tpl-serif-xl">KANIKA</p>
          <p className="tpl-lantern-row">✦ ✦ ✦</p>
          <p className="tpl-date-badge pink">January 25, 2026</p>
        </div>
        <div className="tpl-blush-btm"></div>
      </div>
    ),
  },
  {
    key: 'mughal',
    content: (
      <div className="c3d-inner tpl-mughal">
        <div className="tpl-mughal-sky">
          <div className="tpl-fountain"></div>
        </div>
        <div className="tpl-mughal-lawn"></div>
        <div className="tpl-bd center mughal-overlay">
          <p className="tpl-invite-txt">WE INVITE</p>
          <p className="tpl-serif-xl gold">ABHISHEK</p>
          <p className="tpl-and-txt">and</p>
          <p className="tpl-serif-xl gold">KANIKA</p>
          <p className="tpl-date-badge gold-bg">Sat · 25 Jan 2026</p>
        </div>
      </div>
    ),
  },
  {
    key: 'royal',
    content: (
      <div className="c3d-inner tpl-royal">
        <div className="tpl-feathers"></div>
        <div className="tpl-mandala-ring">
          <div className="tpl-mandala-face">🕊️</div>
        </div>
        <div className="tpl-bd center royal-text">
          <h3 className="tpl-shaadi">Shaadi</h3>
          <p className="tpl-date-sm">Saturday, January 25th 2026</p>
          <p className="tpl-venue-sm">Swan Hotel, Shamiyana</p>
          <p className="tpl-date-sm">6pm Onwards</p>
        </div>
      </div>
    ),
  },
  {
    key: 'lanterns-night',
    content: (
      <div className="c3d-inner tpl-lanterns-night">
        <div className="c3d-lantern-dots night"></div>
        <div className="tpl-dome"></div>
        <div className="tpl-bd center top-pad">
          <p className="tpl-name-block">ABHISHEK<br />WEDS<br />KANIKA</p>
        </div>
      </div>
    ),
  },
  {
    key: 'rose',
    content: (
      <div className="c3d-inner tpl-rose">
        <div className="tpl-rose-frame">
          <div className="tpl-rose-inner">
            <p className="tpl-serif-xl rose">Abhishek</p>
            <p className="tpl-amp">&amp;</p>
            <p className="tpl-serif-xl rose">Kanika</p>
            <p className="tpl-date-badge rose-bg">January 25, 2026</p>
          </div>
        </div>
      </div>
    ),
  },
];

interface Card {
  key: string;
  content: React.ReactNode;
}

export default function HeroCarousel() {
  const [cards, setCards] = useState<Card[]>(STATIC_CARDS);
  const [current, setCurrent] = useState(0);
  const trackRef    = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const autoRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX  = useRef<number | null>(null);
  const animateRef  = useRef(false);

  // Fetch DB templates and prepend them as image cards
  useEffect(() => {
    fetch(`${API}/api/templates?limit=10&sort=popular`)
      .then(r => r.json())
      .then((d: { templates?: DbTemplate[] }) => {
        const dbTemplates = d.templates ?? [];
        if (dbTemplates.length === 0) return;

        const dbCards: Card[] = dbTemplates.map(t => ({
          key: `db-${t.id}`,
          content: t.thumbnailUrl ? (
            <HeroImgCard slug={t.slug} src={resolveBackendPublicUrl(t.thumbnailUrl) || ''} name={t.name} price={t.price} community={t.community} />
          ) : (
            <Link href={`/templates/${t.slug}`} className={`c3d-inner ${COMMUNITY_THEME[t.community] ?? 'tpl-lanterns-dusk'}`} style={{ display: 'block', textDecoration: 'none' }}>
              <div className="tpl-bd center">
                <p className="tpl-label" style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: 8 }}>New template</p>
                <p className="tpl-couple-lg" style={{ fontSize: '1.4rem' }}>{t.name}</p>
                <p className="tpl-date-badge" style={{ marginTop: 12 }}>₹{t.price.toLocaleString('en-IN')}</p>
              </div>
            </Link>
          ),
        }));

        // Prepend DB cards, keep static cards after
        setCards([...dbCards, ...STATIC_CARDS]);
      })
      .catch(() => {/* keep static cards */});
  }, []);

  const TOTAL = cards.length;

  const getRadius = () => {
    if (typeof window === 'undefined') return 420;
    if (window.innerWidth < 640) return 260;
    if (window.innerWidth < 900) return 320;
    return 420;
  };

  const position = useCallback((animate: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    const els = Array.from(track.querySelectorAll<HTMLElement>('.c3d-card'));
    const RADIUS = getRadius();
    els.forEach((card, i) => {
      const angle = ((i - current) / TOTAL) * 360;
      const rad   = (angle * Math.PI) / 180;
      const x     = Math.sin(rad) * RADIUS;
      const z     = Math.cos(rad) * RADIUS;
      const rotY  = -angle;
      const depth = (z + RADIUS) / (2 * RADIUS);
      const scale = 0.62 + depth * 0.38;
      const opacity = depth < 0.15 ? 0 : Math.max(0, 0.35 + depth * 0.65);
      card.style.transition = animate
        ? 'transform 0.72s cubic-bezier(0.4,0,0.2,1), opacity 0.72s ease'
        : 'none';
      card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`;
      card.style.opacity   = String(opacity);
      card.style.zIndex    = String(Math.round(z + RADIUS));
    });
  }, [current, TOTAL]);

  const resetAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % TOTAL);
    }, 3800);
  }, [TOTAL]);

  useEffect(() => {
    position(animateRef.current);
    animateRef.current = true;
  }, [current, position]);

  useEffect(() => {
    position(false);
    resetAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  function rotate(dir: number) {
    setCurrent(c => ((c + dir) % TOTAL + TOTAL) % TOTAL);
    resetAuto();
  }

  function handleCardClick(i: number) {
    let diff = i - current;
    if (diff === 0) return;
    if (diff > TOTAL / 2) diff -= TOTAL;
    if (diff < -TOTAL / 2) diff += TOTAL;
    setCurrent(c => ((c + diff) % TOTAL + TOTAL) % TOTAL);
    resetAuto();
  }

  function onMouseDown(e: React.MouseEvent) { dragStartX.current = e.clientX; }
  function onMouseUp(e: React.MouseEvent) {
    if (dragStartX.current === null) return;
    const delta = dragStartX.current - e.clientX;
    if (Math.abs(delta) > 55) rotate(delta > 0 ? 1 : -1);
    dragStartX.current = null;
  }
  function onTouchStart(e: React.TouchEvent) { dragStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (dragStartX.current === null) return;
    const delta = dragStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 55) rotate(delta > 0 ? 1 : -1);
    dragStartX.current = null;
  }

  return (
    <div className="hero-c3d" id="hero-c3d">
      <div className="c3d-cta-row">
        <a href="#templates" className="btn-primary">Choose a template</a>
      </div>

      <div
        className="c3d-viewport"
        id="c3d-viewport"
        ref={viewportRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="c3d-track" id="c3d-track" ref={trackRef}>
          {cards.map((card, i) => (
            <div
              key={card.key}
              className="c3d-card"
              onClick={() => handleCardClick(i)}
            >
              {card.content}
            </div>
          ))}
        </div>
      </div>

      <div className="c3d-nav-btns">
        <button className="c3d-btn" onClick={() => rotate(-1)} aria-label="Previous">‹</button>
        <button className="c3d-btn" onClick={() => rotate(1)} aria-label="Next">›</button>
      </div>
    </div>
  );
}
