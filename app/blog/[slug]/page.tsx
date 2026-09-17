import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { resolveBackendPublicUrl } from '@/lib/assetUrl';
import { formatDate, parseList, pluralize } from '@/lib/format';
import { getPublicApiUrl } from '@/lib/publicEnv';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';
import { getStartingPrice } from '@/lib/startingPrice';
import BlogContent from '../BlogContent';
import styles from '../blog.module.css';
import page from '../../content-page.module.css';
import prose from '../../prose.module.css';

/**
 * One article.
 *
 * The article body arrives as HTML from the API, so it is styled by the shared
 * prose stylesheet rather than by rules that used to be injected in a <style>
 * tag alongside it.
 */

const API = getPublicApiUrl();

export const revalidate = 300;

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
  coverImageUrl: string | null;
  publishedAt: string;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API}/api/blog/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } });
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return buildPageMetadata({ title: 'Post not found', description: '', path: `/blog/${slug}`, noIndex: true });
  }

  const coverUrl = resolveBackendPublicUrl(post.coverImageUrl);
  return buildPageMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || `Read "${post.title}" on the Aamantran blog.`,
    path: `/blog/${post.slug}`,
    ...(coverUrl ? { ogImage: coverUrl } : {}),
  });
}

/** Reading time at roughly 200 words a minute. */
function estimateReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [startingPrice, related] = await Promise.all([getStartingPrice(), getRelatedPosts(post.slug)]);
  const tags = parseList(post.tags);
  const readTime = estimateReadTime(post.content);
  const coverSrc = resolveBackendPublicUrl(post.coverImageUrl);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription || post.excerpt || '',
    ...(coverSrc ? { image: coverSrc } : {}),
    author: { '@type': 'Person', name: post.author },
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
      <div className={page.page}>
        <header className={page.hero}>
          <Container>
            <Link href="/blog" className={styles.back}>
              <span aria-hidden="true">←</span> All posts
            </Link>
            {tags.length > 0 && (
              <ul className={styles.tags} aria-label="Topics">
                {tags.map((tag) => (
                  <li key={tag}>
                    <Badge>{tag}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <h1 className={page.title}>{post.title}</h1>
            <p className={styles.articleMeta}>
              <span>{post.author}</span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span>{pluralize(readTime, 'minute')} read</span>
            </p>
          </Container>
        </header>

        <Container>
          {coverSrc && (
            <div className={styles.cover}>
              <RemoteImage src={coverSrc} alt="" sizes="(max-width: 900px) 100vw, 900px" aspectRatio="16 / 9" preload />
            </div>
          )}

          <article className={`${prose.prose} ${styles.body}`}>
            <BlogContent content={post.content} />
          </article>

          <aside className={styles.ctaBand}>
            <h2 className={styles.ctaTitle}>Ready to make your own invitation?</h2>
            <p className={styles.ctaText}>
              Every design has a live demo you can open before you buy. From {startingPrice}, paid once, and you fill in
              your own details.
            </p>
            <LinkButton href="/templates">Browse invitations</LinkButton>
          </aside>

          {related.length > 0 && (
            <section aria-labelledby="related-heading" className={page.section}>
              <h2 id="related-heading" className={page.sectionTitle}>
                More from the journal
              </h2>
              <ul className={styles.grid}>
                {related.map((item) => (
                  <li key={item.id || item.slug}>
                    <Link href={`/blog/${item.slug}`} className={styles.card}>
                      <RemoteImage
                        src={item.coverImageUrl}
                        alt=""
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 400px"
                        aspectRatio="16 / 10"
                      />
                      <span className={styles.cardBody}>
                        <span className={styles.cardTitle}>{item.title}</span>
                        {item.publishedAt && (
                          <span className={styles.cardMeta}>
                            <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Container>
      </div>
    </>
  );
}
