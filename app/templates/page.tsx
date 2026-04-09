'use client';

import { useState, useMemo, useEffect } from 'react';
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

interface DbTemplate {
  id: string; slug: string; name: string;
  thumbnailUrl: string | null;
  desktopThumbnailUrl?: string | null;
  mobileThumbnailUrl?: string | null;
  community: string;
  bestFor: string; languages: string;
  price: number; originalPrice: number | null;
  buyerCount: number; avgRating: string | number | null;
  releasedAt: string | null;
}

function rupees(paise: number) {
  return (paise / 100).toLocaleString('en-IN');
}

function TemplateThumb({ src, theme, name, community }: {
  src: string | null; theme: string; name: string; community: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!src || imgFailed) {
    return (
      <div className={`tpl-grid-thumb-inner ${theme}`}>
        <div>
          <div className="tpl-thumb-names">{name}</div>
          <span className="tpl-thumb-date">{community.toUpperCase()}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setImgFailed(true)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<DbTemplate[]>([]);
  const [loading, setLoading]     = useState(true);
  const [isMobile, setIsMobile]   = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [event, setEvent]         = useState('all');
  const [community, setCommunity] = useState('all');
  const [price, setPrice]         = useState('all');
  const [search, setSearch]       = useState('');
  const [sort, setSort]           = useState('popular');

  useEffect(() => {
    const url = `${API}/api/templates?limit=50`;
    fetch(url)
      .then(r => r.json())
      .then(d => setTemplates(d.templates ?? []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const pricePoints = useMemo(() =>
    [...new Set(templates.map(t => t.price))].sort((a, b) => a - b),
  [templates]);

  const eventOptions = useMemo(() => {
    const events = new Set<string>();
    templates.forEach(t => {
      (t.bestFor || '')
        .split(',')
        .map(v => v.trim())
        .filter(Boolean)
        .forEach(v => events.add(v));
    });
    return Array.from(events).sort((a, b) => a.localeCompare(b));
  }, [templates]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = templates.filter(t =>
      (event === 'all' || (t.bestFor || '').toLowerCase().split(',').map(v => v.trim()).includes(event)) &&
      (community === 'all' || t.community.toLowerCase() === community) &&
      (price === 'all' || t.price === Number(price)) &&
      (q === '' || t.name.toLowerCase().includes(q))
    );
    if (sort === 'popular')    list = [...list].sort((a, b) => b.buyerCount - a.buyerCount);
    if (sort === 'new')        list = [...list].sort((a, b) => (b.releasedAt ?? '').localeCompare(a.releasedAt ?? ''));
    if (sort === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [templates, event, community, price, search, sort]);

  return (
    <>
      <div className="tpl-page-hero">
        <div className="container">
          <p className="eyebrow center">Designs</p>
          <h1>Find your <em>perfect template.</em></h1>
          <p>Every design is hand-crafted for Indian celebrations — pick one, pay once, get everything.</p>
        </div>
      </div>

      <div className="filter-bar" id="filter-bar">
        <div className="filter-bar-inner">
          <div className="mobile-filter-top">
            <input
              id="name-search-mobile"
              type="text"
              placeholder="Search template name"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="mobile-filter-actions">
            <button type="button" className="mobile-filter-btn" onClick={() => setSearch(search.trim())}>
              Search
            </button>
            <button
              type="button"
              className={`mobile-filter-btn${mobileFiltersOpen ? ' active' : ''}`}
              onClick={() => setMobileFiltersOpen(v => !v)}
              aria-expanded={mobileFiltersOpen}
            >
              Filters
            </button>
          </div>

          <div className={`mobile-filter-accordion${mobileFiltersOpen ? ' open' : ''}`}>
            <div className="filter-control">
              <label className="filter-label" htmlFor="event-filter-mobile">Filter by event</label>
              <select id="event-filter-mobile" value={event} onChange={e => setEvent(e.target.value)}>
                <option value="all">All events</option>
                {eventOptions.map(v => (
                  <option key={v} value={v.toLowerCase()}>{v}</option>
                ))}
              </select>
            </div>
            <div className="filter-control">
              <label className="filter-label" htmlFor="community-filter-mobile">Filter by community</label>
              <select id="community-filter-mobile" value={community} onChange={e => setCommunity(e.target.value)}>
                <option value="all">All communities</option>
                {['hindu', 'muslim', 'sikh', 'christian', 'universal'].map(v => (
                  <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="filter-control">
              <label className="filter-label" htmlFor="price-filter-mobile">Filter by price</label>
              <select id="price-filter-mobile" value={price} onChange={e => setPrice(e.target.value)}>
                <option value="all">All prices</option>
                {pricePoints.map(v => (
                  <option key={v} value={String(v)}>₹{rupees(v)}</option>
                ))}
              </select>
            </div>
            <div className="filter-control">
              <label className="filter-label" htmlFor="sort-filter-mobile">Sort</label>
              <select id="sort-filter-mobile" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="popular">Popular</option>
                <option value="new">Newest</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>
          </div>

          <div className="desktop-filters">
            <div className="filter-control">
              <label className="filter-label" htmlFor="event-filter">Filter by event</label>
              <select id="event-filter" value={event} onChange={e => setEvent(e.target.value)}>
                <option value="all">All events</option>
                {eventOptions.map(v => (
                  <option key={v} value={v.toLowerCase()}>{v}</option>
                ))}
              </select>
            </div>

            <div className="filter-control">
              <label className="filter-label" htmlFor="community-filter">Filter by community</label>
              <select id="community-filter" value={community} onChange={e => setCommunity(e.target.value)}>
                <option value="all">All communities</option>
                {['hindu', 'muslim', 'sikh', 'christian', 'universal'].map(v => (
                  <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="filter-control">
              <label className="filter-label" htmlFor="price-filter">Filter by price</label>
              <select id="price-filter" value={price} onChange={e => setPrice(e.target.value)}>
                <option value="all">All prices</option>
                {pricePoints.map(v => (
                  <option key={v} value={String(v)}>₹{rupees(v)}</option>
                ))}
              </select>
            </div>

            <div className="filter-control filter-search">
              <label className="filter-label" htmlFor="name-search">Search by name</label>
              <input
                id="name-search"
                type="text"
                placeholder="Search template name"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-control">
              <label className="filter-label" htmlFor="sort-filter">Sort</label>
              <select id="sort-filter" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="popular">Popular</option>
                <option value="new">Newest</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="tpl-grid-section">
        {loading ? (
          <p className="tpl-results-count">Loading templates…</p>
        ) : (
          <>
            <p className="tpl-results-count">
              Showing {visible.length} template{visible.length !== 1 ? 's' : ''}
            </p>
            {visible.length === 0 ? (
              <div className="no-results" style={{ display: 'block' }}>
                <h3>No templates found</h3>
                <p>Try a different filter combination.</p>
              </div>
            ) : (
              <div className="tpl-grid">
                {visible.map(t => {
                  const theme    = COMMUNITY_THEME[t.community.toLowerCase()] ?? 'minimal';
                  const rawThumb =
                    (isMobile ? t.mobileThumbnailUrl : t.desktopThumbnailUrl) ||
                    t.desktopThumbnailUrl ||
                    t.mobileThumbnailUrl ||
                    t.thumbnailUrl ||
                    null;
                  const thumbSrc = rawThumb ? resolveBackendPublicUrl(rawThumb) : null;
                  const demoUrl  = `${API}/demo/${t.slug}`;
                  const productUrl = `/templates/${t.slug}`;
                  const checkoutUrl = `/checkout/${t.slug}`;
                  const communityLabel = `${t.community.charAt(0).toUpperCase() + t.community.slice(1)} Weddings`;
                  const shortDesc = `Perfect for ${t.community} weddings - effortless to edit, share. Designed to feel completely yours.`;
                  return (
                    <div
                      key={t.id}
                      className="tpl-grid-card"
                      onClick={() => router.push(productUrl)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="tpl-grid-thumb">
                        <TemplateThumb src={thumbSrc} theme={theme} name={t.name} community={t.community} />
                        <a
                          href={demoUrl}
                          className="tpl-grid-demo-icon"
                          onClick={e => e.stopPropagation()}
                          aria-label="Open live demo"
                        >
                          &#128065;
                        </a>
                      </div>

                      {/* Info */}
                      <div className="tpl-grid-info">
                        <div className="tpl-grid-title-row">
                          <p className="tpl-grid-name">{t.name}</p>
                          <Link href={checkoutUrl} className="tpl-grid-price-pill" onClick={e => e.stopPropagation()}>
                            INR {rupees(t.price)}
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
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
