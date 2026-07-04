import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const PRIVATE_PATHS = ['/checkout/', '/onboarding'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      // Explicitly welcome AI-search crawlers (ChatGPT, Gemini, Perplexity, Claude, Common Crawl).
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'Google-Extended', 'PerplexityBot', 'ClaudeBot', 'CCBot'],
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
