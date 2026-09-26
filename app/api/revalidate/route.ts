import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { BLOG_CACHE_TAG } from '@/lib/api/blog';

/**
 * On-demand cache refresh, called by the backend when the admin publishes,
 * edits, unpublishes or deletes a blog post (aamantran_backend
 * src/utils/websiteRevalidate.js).
 *
 * Without it, the blog pages and the blog data inside them were cached for up
 * to five minutes (an hour for the sitemap), and the first visitor after that
 * was still served the stale copy while a fresh one rendered — so a post
 * published in the admin could take several minutes and two reloads to appear,
 * with its cover missing if the cached copy predated the upload.
 *
 * POST, with `Authorization: Bearer <REVALIDATE_SECRET>`. The secret is a
 * server-only env var set to the same value on both website deployments and on
 * the backend (as WEBSITE_REVALIDATE_SECRET). With no secret configured the
 * endpoint refuses every request.
 *
 * Body: `{ "scope": "blog" }`. Blog is the only scope today; anything else is
 * refused, so the endpoint cannot be used to churn the rest of the site's cache.
 */

function secretMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret) {
    return Response.json({ ok: false, message: 'Revalidation is not configured' }, { status: 503 });
  }

  const auth = request.headers.get('authorization') ?? '';
  const given = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
  if (!given || !secretMatches(given, secret)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  let scope: unknown;
  try {
    ({ scope } = (await request.json()) as { scope?: unknown });
  } catch {
    scope = undefined;
  }
  if (scope !== 'blog') {
    return Response.json({ ok: false, message: 'Unknown scope' }, { status: 400 });
  }

  // Expire the data at once rather than serving it stale one more time: the
  // person who just pressed Publish reloads the blog expecting to see the post.
  revalidateTag(BLOG_CACHE_TAG, { expire: 0 });
  // And every page that renders blog data, so none keeps a stale copy.
  revalidatePath('/blog');
  revalidatePath('/blog/[slug]', 'page');
  revalidatePath('/[occasion]', 'page'); // the "Guides" list on the aisle pages
  revalidatePath('/sitemap.xml');

  return Response.json({ ok: true, scope, now: Date.now() });
}
