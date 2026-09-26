import { apiGet, REVALIDATE } from './client';
import { isRecord, list, str, strOrNull } from './parse';
import type { BlogPostSummary } from './types';

export function normalizePostSummary(raw: unknown): BlogPostSummary | null {
  if (!isRecord(raw) || typeof raw.slug !== 'string' || raw.slug === '') return null;
  return {
    id: str(raw.id),
    slug: raw.slug,
    title: str(raw.title),
    excerpt: strOrNull(raw.excerpt),
    coverImageUrl: strOrNull(raw.coverImageUrl),
    tags: list(raw.tags),
    author: str(raw.author),
    publishedAt: strOrNull(raw.publishedAt),
  };
}

/**
 * Every blog read carries this tag. Publishing, editing, unpublishing or
 * deleting a post in the admin makes the backend call app/api/revalidate,
 * which expires the tag, so the change shows on the next page load instead of
 * after the time-based revalidate below.
 */
export const BLOG_CACHE_TAG = 'blog';

/** Newest published posts, or null when the blog API cannot be read. */
export async function getRecentPosts(limit = 3): Promise<BlogPostSummary[] | null> {
  const data = await apiGet<unknown>('/api/blog', { limit }, { revalidate: REVALIDATE.blog, tags: [BLOG_CACHE_TAG] });
  if (!isRecord(data) || !Array.isArray(data.posts)) return null;
  return data.posts.map(normalizePostSummary).filter((p): p is BlogPostSummary => p !== null);
}
