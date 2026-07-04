import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicApiUrl } from '@/lib/publicEnv';
import { resolveBackendPublicUrl } from '@/lib/assetUrl';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = buildPageMetadata({
  title: 'Blog — Wedding Tips, Ideas & Inspiration',
  description:
    'Read wedding tips, invitation ideas, etiquette guides, and inspiration from the Aamantran team. Everything you need to plan the perfect Indian wedding invitation.',
  path: '/blog',
});

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  tags: string | null;
  author: string;
  publishedAt: string;
}

async function getBlogPosts(): Promise<{ posts: BlogPost[]; total: number }> {
  try {
    const res = await fetch(`${getPublicApiUrl()}/api/blog?limit=50`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { posts: [], total: 0 };
    return res.json();
  } catch {
    return { posts: [], total: 0 };
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPage() {
  const { posts } = await getBlogPosts();

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_NAME} Blog`,
    description: 'Wedding tips, invitation ideas, and inspiration from Aamantran.',
    url: `${SITE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
    },
  };

  return (
    <>
      <JsonLd data={blogJsonLd} />
      <section className="blog-index-hero">
        <div className="blog-index-hero-inner">
          <p className="blog-index-eyebrow">The Aamantran Journal</p>
          <h1 className="blog-index-title">Wedding Inspiration &amp; <em>Tips</em></h1>
          <p className="blog-index-subtitle">
            Ideas, guides, and stories to help you create the perfect invitation for your special day.
          </p>
        </div>
      </section>

      <section className="blog-index-section">
        {posts.length === 0 ? (
          <div className="blog-index-empty">
            <p>No posts yet — check back soon!</p>
          </div>
        ) : (
          <div className="blog-index-grid">
            {posts.map((post) => {
              const coverSrc = resolveBackendPublicUrl(post.coverImageUrl);
              const tags = post.tags?.split(',').map((t) => t.trim()).filter(Boolean) || [];
              return (
                <Link href={`/blog/${post.slug}`} key={post.id} className="blog-card">
                  <div className="blog-card-image-wrap">
                    {coverSrc ? (
                      <img src={coverSrc} alt={post.title} className="blog-card-image" loading="lazy" />
                    ) : (
                      <div className="blog-card-image-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity=".35">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="blog-card-body">
                    {tags.length > 0 && (
                      <div className="blog-card-tags">
                        {tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="blog-card-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    <h2 className="blog-card-title">{post.title}</h2>
                    {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
                    <div className="blog-card-meta">
                      <span>{post.author}</span>
                      <span className="blog-card-dot">·</span>
                      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <style>{blogIndexStyles}</style>
    </>
  );
}

const blogIndexStyles = `
/* ── Blog Index Hero ── */
.blog-index-hero {
  background: var(--cream);
  padding: 80px 24px 60px;
  text-align: center;
  border-bottom: 1px solid var(--border-soft);
}
.blog-index-hero-inner { max-width: 660px; margin: 0 auto; }
.blog-index-eyebrow {
  font-family: var(--font-body);
  font-size: .76rem;
  font-weight: 600;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 14px;
}
.blog-index-title {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 5vw, 3.2rem);
  font-weight: 500;
  color: var(--text-dark);
  margin: 0 0 14px;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.blog-index-title em { color: var(--burgundy); font-style: italic; }
.blog-index-subtitle {
  font-family: var(--font-body);
  font-size: 1.05rem;
  color: var(--text-mid);
  margin: 0;
  line-height: 1.6;
}

/* ── Blog Grid ── */
.blog-index-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 56px 24px 80px;
}
.blog-index-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
  font-family: var(--font-body);
}
.blog-index-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px;
}

/* ── Blog Card ── */
.blog-card {
  display: flex;
  flex-direction: column;
  background: var(--white);
  border-radius: var(--radius);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-soft);
  transition: transform 0.28s cubic-bezier(.4,0,.2,1), box-shadow 0.28s cubic-bezier(.4,0,.2,1);
}
.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card);
}

.blog-card-image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--cream-dark);
}
.blog-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(.4,0,.2,1);
}
.blog-card:hover .blog-card-image { transform: scale(1.04); }
.blog-card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--cream), var(--cream-deeper));
  color: var(--text-subtle);
}

.blog-card-body {
  padding: 20px 22px 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.blog-card-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.blog-card-tag {
  font-family: var(--font-body);
  font-size: .7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--burgundy);
  background: rgba(110,31,46,0.08);
  border: 1px solid rgba(110,31,46,0.14);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
}

.blog-card-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 8px;
  line-height: 1.3;
  letter-spacing: -0.01em;
  transition: color 0.2s ease;
}
.blog-card:hover .blog-card-title { color: var(--burgundy); }

.blog-card-excerpt {
  font-family: var(--font-body);
  font-size: .88rem;
  color: var(--text-mid);
  margin: 0 0 16px;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.blog-card-meta {
  font-family: var(--font-body);
  font-size: .78rem;
  color: var(--text-light);
  display: flex;
  align-items: center;
  gap: 6px;
}
.blog-card-dot { opacity: .5; }

@media (max-width: 700px) {
  .blog-index-grid { grid-template-columns: 1fr; }
  .blog-index-hero { padding: 60px 20px 44px; }
}
`;
