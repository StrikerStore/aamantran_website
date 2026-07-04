import type { MetadataRoute } from 'next';
import { getPublicApiUrl } from '@/lib/publicEnv';
import { SITE_URL } from '@/lib/seo';

interface TemplateListItem {
  slug: string;
  releasedAt?: string | null;
}

interface BlogListItem {
  slug: string;
  publishedAt?: string | null;
}

async function getTemplateSlugs(): Promise<TemplateListItem[]> {
  try {
    const res = await fetch(`${getPublicApiUrl()}/api/templates?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.templates ?? []) as TemplateListItem[];
  } catch {
    return [];
  }
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
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/refund`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const templates = await getTemplateSlugs();
  const templateRoutes: MetadataRoute.Sitemap = templates
    .filter(t => t.slug)
    .map(t => ({
      url: `${SITE_URL}/templates/${t.slug}`,
      ...(t.releasedAt ? { lastModified: new Date(t.releasedAt) } : {}),
      changeFrequency: 'weekly',
      priority: 0.8,
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

  return [...staticRoutes, ...templateRoutes, ...blogRoutes];
}
