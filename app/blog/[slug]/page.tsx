import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicApiUrl } from '@/lib/publicEnv';
import { resolveBackendPublicUrl } from '@/lib/assetUrl';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import BlogContent from '../BlogContent';

const API = getPublicApiUrl();

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  tags: string | null;
  author: string;
  publishedAt: string;
  updatedAt: string;
}

interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  tags: string | null;
  author: string;
  publishedAt: string;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API}/api/blog/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getRelatedPosts(excludeSlug: string): Promise<BlogListItem[]> {
  try {
    const res = await fetch(`${API}/api/blog?limit=4`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.posts || []).filter((p: BlogListItem) => p.slug !== excludeSlug).slice(0, 3);
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return buildPageMetadata({ title: 'Post Not Found', description: '', path: `/blog/${slug}`, noIndex: true });
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || `Read "${post.title}" on the Aamantran blog.`;
  const coverUrl = resolveBackendPublicUrl(post.coverImageUrl);

  return buildPageMetadata({
    title,
    description,
    path: `/blog/${post.slug}`,
    ...(coverUrl ? { ogImage: coverUrl } : {}),
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const coverSrc = resolveBackendPublicUrl(post.coverImageUrl);
  const tags = post.tags?.split(',').map((t) => t.trim()).filter(Boolean) || [];
  const readTime = estimateReadTime(post.content);
  const related = await getRelatedPosts(post.slug);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription || post.excerpt || '',
    ...(coverSrc ? { image: coverSrc } : {}),
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />

      <article className="blog-article">
        {/* Hero */}
        <header className="blog-article-header">
          <div className="blog-article-header-inner">
            <Link href="/blog" className="blog-article-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              All Posts
            </Link>

            {tags.length > 0 && (
              <div className="blog-article-tags">
                {tags.map((tag) => (
                  <span key={tag} className="blog-article-tag">{tag}</span>
                ))}
              </div>
            )}

            <h1 className="blog-article-title">{post.title}</h1>

            <div className="blog-article-meta">
              <span>{post.author}</span>
              <span className="blog-article-dot">·</span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span className="blog-article-dot">·</span>
              <span>{readTime} min read</span>
            </div>
          </div>
        </header>

        {/* Cover image */}
        {coverSrc && (
          <div className="blog-article-cover">
            <img src={coverSrc} alt={post.title} />
          </div>
        )}

        {/* Content */}
        <div className="blog-article-body">
          <BlogContent content={post.content} />

          {/* CTA Banner */}
          <div className="blog-cta-banner">
            <h3 className="blog-cta-title">Ready to create your perfect invitation?</h3>
            <p className="blog-cta-text">
              Browse our beautiful digital wedding invitation templates — WhatsApp-ready, with RSVP tracking, starting at ₹999.
            </p>
            <Link href="/templates" className="blog-cta-btn">
              Browse Templates →
            </Link>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="blog-related">
          <div className="blog-related-inner">
            <h2 className="blog-related-title">More from the blog</h2>
            <div className="blog-related-grid">
              {related.map((rp) => {
                const rpCover = resolveBackendPublicUrl(rp.coverImageUrl);
                return (
                  <Link href={`/blog/${rp.slug}`} key={rp.id} className="blog-related-card">
                    <div className="blog-related-image-wrap">
                      {rpCover ? (
                        <img src={rpCover} alt={rp.title} className="blog-related-image" loading="lazy" />
                      ) : (
                        <div className="blog-related-placeholder" />
                      )}
                    </div>
                    <h3 className="blog-related-card-title">{rp.title}</h3>
                    <span className="blog-related-date">{formatDate(rp.publishedAt)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <style>{articleStyles}</style>
    </>
  );
}

const articleStyles = `
/* ── Article Header ── */
.blog-article-header {
  background: var(--cream);
  padding: 60px 24px 48px;
  text-align: center;
  border-bottom: 1px solid var(--border-soft);
}
.blog-article-header-inner { max-width: 720px; margin: 0 auto; }
.blog-article-back {
  display: inline-flex; align-items: center; gap: 4px;
  font-family: var(--font-body); font-size: .82rem; font-weight: 600;
  color: var(--burgundy); text-decoration: none; margin-bottom: 20px;
  transition: color .2s;
}
.blog-article-back:hover { color: var(--burgundy-dark); }
.blog-article-tags { display: flex; gap: 6px; justify-content: center; margin-bottom: 14px; flex-wrap: wrap; }
.blog-article-tag {
  font-family: var(--font-body); font-size: .68rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .06em; color: var(--burgundy);
  background: rgba(110,31,46,0.08); border: 1px solid rgba(110,31,46,0.14);
  padding: 3px 12px; border-radius: var(--radius-pill);
}
.blog-article-title {
  font-family: var(--font-display);
  font-size: clamp(1.9rem, 4.5vw, 3rem);
  font-weight: 500; color: var(--text-dark); margin: 0 0 16px;
  line-height: 1.2; letter-spacing: -0.02em;
}
.blog-article-meta {
  font-family: var(--font-body); font-size: .85rem; color: var(--text-light);
  display: flex; align-items: center; gap: 8px; justify-content: center;
}
.blog-article-dot { opacity: .4; }

/* ── Cover Image ── */
.blog-article-cover {
  max-width: 900px; margin: -24px auto 0; padding: 0 24px;
}
.blog-article-cover img {
  width: 100%; border-radius: var(--radius); aspect-ratio: 16 / 9; object-fit: cover;
  box-shadow: var(--shadow-card);
}

/* ── Article Body ── */
.blog-article-body {
  max-width: 720px; margin: 0 auto; padding: 40px 24px 60px;
  font-family: var(--font-body); font-size: 1.04rem;
  color: var(--text-mid); line-height: 1.8;
}

/* Rendered markdown styles */
.blog-content-rendered h1 { font-family: var(--font-display); font-size: 2.1rem; font-weight: 500; color: var(--text-dark); margin: 40px 0 16px; }
.blog-content-rendered h2 { font-family: var(--font-display); font-size: 1.7rem; font-weight: 500; color: var(--burgundy); margin: 38px 0 12px; }
.blog-content-rendered h3 { font-family: var(--font-display); font-size: 1.35rem; font-weight: 600; color: var(--text-dark); margin: 28px 0 10px; }
.blog-content-rendered h4, .blog-content-rendered h5, .blog-content-rendered h6 { font-family: var(--font-body); font-weight: 600; color: var(--text-dark); margin: 24px 0 8px; }
.blog-content-rendered p { margin: 0 0 18px; }
.blog-content-rendered strong { font-weight: 700; color: var(--text-dark); }
.blog-content-rendered a { color: var(--burgundy); text-decoration: underline; text-decoration-color: var(--gold); text-underline-offset: 3px; }
.blog-content-rendered a:hover { color: var(--burgundy-dark); }
.blog-content-rendered img { max-width: 100%; border-radius: var(--radius-sm); margin: 20px 0; }
.blog-content-rendered ul, .blog-content-rendered ol { padding-left: 24px; margin: 0 0 18px; }
.blog-content-rendered li { margin-bottom: 8px; }
.blog-content-rendered li::marker { color: var(--gold); }
.blog-content-rendered blockquote {
  border-left: 3px solid var(--gold); padding: 2px 0 2px 20px; margin: 20px 0;
  color: var(--text-light); font-style: italic;
}
.blog-content-rendered hr { border: none; border-top: 1px solid var(--border-soft); margin: 32px 0; }
.blog-content-rendered code {
  background: var(--cream-dark); padding: 2px 7px; border-radius: 5px;
  font-size: .88em; font-family: 'SF Mono', 'Fira Code', monospace; color: var(--burgundy);
}
.blog-content-rendered pre {
  background: var(--cream-dark); padding: 18px 20px; border-radius: var(--radius-sm);
  overflow-x: auto; margin: 20px 0;
}
.blog-content-rendered pre code { background: transparent; padding: 0; font-size: .85em; color: var(--text-mid); }

/* ── CTA Banner ── */
.blog-cta-banner {
  background: var(--cream);
  border-radius: var(--radius); padding: 40px 32px; text-align: center;
  margin: 48px 0 20px;
  border: 1px solid var(--border);
}
.blog-cta-title {
  font-family: var(--font-display); font-size: 1.7rem;
  font-weight: 500; color: var(--text-dark); margin: 0 0 10px;
}
.blog-cta-text {
  font-size: .95rem; color: var(--text-mid); margin: 0 0 22px; line-height: 1.6;
}
.blog-cta-btn {
  display: inline-block; padding: 13px 30px; border-radius: var(--radius-pill);
  background: var(--burgundy); color: var(--white); font-size: .92rem; font-weight: 600;
  text-decoration: none; transition: all .25s cubic-bezier(.4,0,.2,1);
  font-family: var(--font-body);
}
.blog-cta-btn:hover { background: var(--burgundy-dark); transform: translateY(-2px); box-shadow: 0 6px 18px rgba(110,31,46,.28); }

/* ── Related Posts ── */
.blog-related {
  background: var(--cream); padding: 60px 24px 80px;
  border-top: 1px solid var(--border-soft);
}
.blog-related-inner { max-width: 1000px; margin: 0 auto; }
.blog-related-title {
  font-family: var(--font-display); font-size: 1.9rem;
  font-weight: 500; color: var(--text-dark); margin: 0 0 28px; text-align: center;
}
.blog-related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.blog-related-card {
  background: var(--white); border-radius: var(--radius); overflow: hidden;
  text-decoration: none; color: inherit;
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-soft);
  transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s;
}
.blog-related-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-card); }
.blog-related-image-wrap { aspect-ratio: 16/9; overflow: hidden; background: var(--cream-dark); }
.blog-related-image { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
.blog-related-card:hover .blog-related-image { transform: scale(1.04); }
.blog-related-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, var(--cream), var(--cream-deeper)); }
.blog-related-card-title {
  font-family: var(--font-display); font-size: 1.2rem;
  font-weight: 600; color: var(--text-dark); margin: 0; padding: 16px 18px 6px;
  line-height: 1.3;
}
.blog-related-date {
  display: block; font-family: var(--font-body); font-size: .75rem;
  color: var(--text-light); padding: 0 18px 18px;
}

@media (max-width: 700px) {
  .blog-article-header { padding: 48px 20px 36px; }
  .blog-article-cover { padding: 0 16px; margin-top: -16px; }
  .blog-article-body { padding: 32px 20px 50px; }
  .blog-cta-banner { padding: 28px 20px; }
  .blog-related-grid { grid-template-columns: 1fr; }
}
`;
