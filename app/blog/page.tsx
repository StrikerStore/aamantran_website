import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { getRecentPosts } from '@/lib/api/blog';
import { formatDate } from '@/lib/format';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';
import styles from './blog.module.css';
import page from '../content-page.module.css';

/**
 * The blog index.
 *
 * Its styles used to be a 160-line template literal rendered inside a <style>
 * tag on every request; they now live in a stylesheet shared with the article
 * page.
 */

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: 'Blog — Wedding Tips, Ideas & Inspiration',
  description:
    'Wedding tips, invitation ideas, etiquette guides and inspiration from the Aamantran team — everything around planning and sending your invitation.',
  path: '/blog',
});

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

export default async function BlogPage() {
  const posts = await getRecentPosts(50);

  return (
    <>
      <JsonLd data={blogJsonLd} />
      <div className={page.page}>
        <header className={page.hero}>
          <Container>
            <p className={page.eyebrow}>The Aamantran journal</p>
            <h1 className={page.title}>Wedding inspiration and practical guides</h1>
            <p className={page.intro}>
              Ideas and guidance on inviting people well: what to say, when to send it, and how to keep track of who is
              coming.
            </p>
          </Container>
        </header>

        <Container>
          {!posts || posts.length === 0 ? (
            <p className={page.note}>
              {posts === null
                ? 'We could not load the journal just now. Please try again in a moment.'
                : 'No posts yet. The first guides are being written — check back soon.'}
            </p>
          ) : (
            <ul className={styles.grid}>
              {posts.map((post, i) => (
                <li key={post.id || post.slug}>
                  <Link href={`/blog/${post.slug}`} className={styles.card}>
                    <RemoteImage
                      src={post.coverImageUrl}
                      alt=""
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 400px"
                      aspectRatio="16 / 10"
                      // Only the first card is likely to be the largest image on screen.
                      preload={i === 0}
                    />
                    <span className={styles.cardBody}>
                      {post.tags.length > 0 && (
                        <span className={styles.tags}>
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                          ))}
                        </span>
                      )}
                      <span className={styles.cardTitle}>{post.title}</span>
                      {post.excerpt && <span className={styles.cardExcerpt}>{post.excerpt}</span>}
                      <span className={styles.cardMeta}>
                        <span>{post.author}</span>
                        {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </div>
    </>
  );
}
