import type { MetadataRoute } from 'next';
import { getPublicApiUrl } from '@/lib/publicEnv';
import { SITE_URL, alternateLanguages } from '@/lib/seo';
import { COLLECTIONS } from '@/lib/collections';
import { getFeaturedReviews, getTemplates } from '@/lib/api/templates';
import { publishedOccasionPages } from '@/lib/occasionPages';

/** Matches MIN_REVIEWS_TO_INDEX on /stories: below this the page is noindex. */
const MIN_REVIEWS_FOR_STORIES = 3;

interface BlogListItem {
  slug: string;
  publishedAt?: string | null;
}

async function getBlogSlugs(): Promise<BlogListItem[]> {
  try {
    const res = await fetch(`${getPublicApiUrl()}/api/blog?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.posts ?? []) as BlogListItem[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/templates`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/pricing`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/features`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/wedding-planning-tools`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/refund`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const collectionRoutes: MetadataRoute.Sitemap = COLLECTIONS.map(c => ({
    url: `${SITE_URL}/collections/${c.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const catalogue = await getTemplates({ limit: 100, sort: 'new' });
  const templates = catalogue?.templates ?? [];
  const templateRoutes: MetadataRoute.Sitemap = templates.map(t => ({
    url: `${SITE_URL}/templates/${t.slug}`,
    ...(t.releasedAt ? { lastModified: new Date(t.releasedAt) } : {}),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Listed only once there are enough genuine reviews to index, so the sitemap
  // and the page agree about whether /stories is worth finding.
  const reviews = await getFeaturedReviews(1);
  const storyRoutes: MetadataRoute.Sitemap = (reviews?.totalCount ?? 0) >= MIN_REVIEWS_FOR_STORIES
    ? [{ url: `${SITE_URL}/stories`, changeFrequency: 'weekly' as const, priority: 0.6 }]
    : [];

  // Occasion pages are listed only while the catalogue supports them, so the
  // sitemap never points at a page that answers with a 404.
  const occasionRoutes: MetadataRoute.Sitemap = publishedOccasionPages(templates).map(({ page }) => ({
    url: `${SITE_URL}/${page.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const blogPosts = await getBlogSlugs();
  const blogRoutes: MetadataRoute.Sitemap = blogPosts
    .filter(p => p.slug)
    .map(p => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      ...(p.publishedAt ? { lastModified: new Date(p.publishedAt) } : {}),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // hreflang in the sitemap as well as in the page head. Both are valid signals
  // and Google treats the sitemap form as the stronger of the two, because it
  // cannot be missed by a crawler that never renders the page.
  return [...staticRoutes, ...storyRoutes, ...collectionRoutes, ...occasionRoutes, ...templateRoutes, ...blogRoutes].map(entry => ({
    ...entry,
    alternates: { languages: alternateLanguages(new URL(entry.url).pathname) },
  }));
}
