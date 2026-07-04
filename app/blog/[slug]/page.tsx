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
  background: linear-gradient(135deg, #fdf6ef 0%, #fef1e6 40%, #fce8d8 100%);
  padding: 60px 24px 48px;
  text-align: center;
}
.blog-article-header-inner { max-width: 720px; margin: 0 auto; }
.blog-article-back {
  display: inline-flex; align-items: center; gap: 4px;
  font-family: 'DM Sans', sans-serif; font-size: .82rem; font-weight: 500;
  color: #9d6b3a; text-decoration: none; margin-bottom: 20px;
  transition: color .2s;
}
.blog-article-back:hover { color: #7a4e20; }
.blog-article-tags { display: flex; gap: 6px; justify-content: center; margin-bottom: 14px; flex-wrap: wrap; }
.blog-article-tag {
  font-family: 'DM Sans', sans-serif; font-size: .68rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .06em; color: #9d6b3a;
  background: rgba(157,107,58,.1); padding: 3px 12px; border-radius: 20px;
}
.blog-article-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.8rem, 4.5vw, 2.8rem);
  font-weight: 500; color: #3a2a1f; margin: 0 0 16px;
  line-height: 1.2; letter-spacing: -0.02em;
}
.blog-article-meta {
  font-family: 'DM Sans', sans-serif; font-size: .85rem; color: #a0917f;
  display: flex; align-items: center; gap: 8px; justify-content: center;
}
.blog-article-dot { opacity: .4; }

/* ── Cover Image ── */
.blog-article-cover {
  max-width: 900px; margin: -24px auto 0; padding: 0 24px;
}
.blog-article-cover img {
  width: 100%; border-radius: 16px; aspect-ratio: 16 / 9; object-fit: cover;
  box-shadow: 0 4px 20px rgba(60,40,20,.1);
}

/* ── Article Body ── */
.blog-article-body {
  max-width: 720px; margin: 0 auto; padding: 40px 24px 60px;
  font-family: 'DM Sans', sans-serif; font-size: 1.02rem;
  color: #4a3f36; line-height: 1.75;
}

/* Rendered markdown styles */
.blog-content-rendered h1 { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 500; color: #3a2a1f; margin: 40px 0 16px; }
.blog-content-rendered h2 { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 500; color: #3a2a1f; margin: 36px 0 12px; }
.blog-content-rendered h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; color: #3a2a1f; margin: 28px 0 10px; }
.blog-content-rendered h4, .blog-content-rendered h5, .blog-content-rendered h6 { font-family: 'DM Sans', sans-serif; font-weight: 600; color: #3a2a1f; margin: 24px 0 8px; }
.blog-content-rendered p { margin: 0 0 18px; }
.blog-content-rendered strong { font-weight: 700; color: #3a2a1f; }
.blog-content-rendered a { color: #9d6b3a; text-decoration: underline; text-underline-offset: 3px; }
.blog-content-rendered a:hover { color: #7a4e20; }
.blog-content-rendered img { max-width: 100%; border-radius: 12px; margin: 20px 0; }
.blog-content-rendered ul, .blog-content-rendered ol { padding-left: 24px; margin: 0 0 18px; }
.blog-content-rendered li { margin-bottom: 6px; }
.blog-content-rendered blockquote {
  border-left: 3px solid #c9a66b; padding: 2px 0 2px 20px; margin: 20px 0;
  color: #7a6b5d; font-style: italic;
}
.blog-content-rendered hr { border: none; border-top: 1px solid #ede4d9; margin: 32px 0; }
.blog-content-rendered code {
  background: #f8f2ec; padding: 2px 7px; border-radius: 5px;
  font-size: .88em; font-family: 'SF Mono', 'Fira Code', monospace;
}
.blog-content-rendered pre {
  background: #f8f2ec; padding: 18px 20px; border-radius: 12px;
  overflow-x: auto; margin: 20px 0;
}
.blog-content-rendered pre code { background: transparent; padding: 0; font-size: .85em; }

/* ── CTA Banner ── */
.blog-cta-banner {
  background: linear-gradient(135deg, #fdf6ef 0%, #fce8d8 100%);
  border-radius: 16px; padding: 36px 32px; text-align: center;
  margin: 48px 0 20px;
  border: 1px solid rgba(157,107,58,.12);
}
.blog-cta-title {
  font-family: 'Cormorant Garamond', serif; font-size: 1.5rem;
  font-weight: 500; color: #3a2a1f; margin: 0 0 10px;
}
.blog-cta-text {
  font-size: .92rem; color: #7a6b5d; margin: 0 0 20px; line-height: 1.55;
}
.blog-cta-btn {
  display: inline-block; padding: 12px 28px; border-radius: 30px;
  background: #9d6b3a; color: #fff; font-size: .9rem; font-weight: 600;
  text-decoration: none; transition: all .25s cubic-bezier(.4,0,.2,1);
  font-family: 'DM Sans', sans-serif;
}
.blog-cta-btn:hover { background: #7a4e20; transform: translateY(-2px); box-shadow: 0 4px 14px rgba(157,107,58,.25); }

/* ── Related Posts ── */
.blog-related {
  background: #fdf6ef; padding: 60px 24px 80px;
}
.blog-related-inner { max-width: 1000px; margin: 0 auto; }
.blog-related-title {
  font-family: 'Cormorant Garamond', serif; font-size: 1.7rem;
  font-weight: 500; color: #3a2a1f; margin: 0 0 28px; text-align: center;
}
.blog-related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.blog-related-card {
  background: #fff; border-radius: 14px; overflow: hidden;
  text-decoration: none; color: inherit;
  box-shadow: 0 2px 10px rgba(60,40,20,.05);
  transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s;
}
.blog-related-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(60,40,20,.08); }
.blog-related-image-wrap { aspect-ratio: 16/9; overflow: hidden; background: #f8f2ec; }
.blog-related-image { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
.blog-related-card:hover .blog-related-image { transform: scale(1.04); }
.blog-related-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #fdf6ef, #fce8d8); }
.blog-related-card-title {
  font-family: 'Cormorant Garamond', serif; font-size: 1.15rem;
  font-weight: 600; color: #3a2a1f; margin: 0; padding: 16px 18px 6px;
  line-height: 1.3;
}
.blog-related-date {
  display: block; font-family: 'DM Sans', sans-serif; font-size: .75rem;
  color: #a0917f; padding: 0 18px 18px;
}

@media (max-width: 700px) {
  .blog-article-header { padding: 48px 20px 36px; }
  .blog-article-cover { padding: 0 16px; margin-top: -16px; }
  .blog-article-body { padding: 32px 20px 50px; }
  .blog-cta-banner { padding: 28px 20px; }
  .blog-related-grid { grid-template-columns: 1fr; }
}
`;
