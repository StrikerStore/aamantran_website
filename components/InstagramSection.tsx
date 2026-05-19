import { getInstagramHandle } from '@/lib/publicEnv';

export default function InstagramSection() {
  const handle = getInstagramHandle();
  const url = `https://www.instagram.com/${handle}`;

  return (
    <section className="instagram-section">
      <div className="container ig-container">
        <div className="ig-icon-wrap">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <p className="eyebrow center">Social</p>
        <h2 className="section-h2 center">
          Follow us on <em>Instagram</em>
        </h2>
        <p className="ig-sub">
          Wedding inspiration, real couple stories &amp; behind-the-scenes moments — all on{' '}
          <span className="ig-handle">@{handle}</span>.
        </p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary ig-btn"
        >
          Follow @{handle} →
        </a>
      </div>
    </section>
  );
}
