import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { cachedLoadPost } from '@/lib/blog/blog-utils';
import { getSiteUrl } from '@/lib/seo/site-url';
import { getLlmsSettings } from '@/lib/seo/llms-settings';
import { htmlToMarkdown } from '@/lib/llms/html-to-md';

// Internal handler for the public-facing `/blog/{category}/{slug}.md` URL.
// Reached via a rewrite in `src/proxy.ts`. Lives under `/api/blog-md/...` so
// the segment names cannot collide with the `[slug]/page.tsx` HTML route.

interface RouteContext {
  params: Promise<{ category: string; slug: string }>;
}

// Dynamic so the admin AI Search master toggle flips the whole surface
// instantly (disabled → 404 everywhere) without a rebuild.
export const dynamic = 'force-dynamic';
const CACHE_MAX_AGE = 3600;

function notFound() {
  return new Response('Not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const settings = await getLlmsSettings();
  if (!settings.enabled) return notFound();

  const { category, slug } = await ctx.params;
  const post = await cachedLoadPost(slug, category);

  if (!post) return notFound();

  // Drafts and excludeFromSearch posts render with noindex on the HTML side
  // (src/app/blog/[category]/[slug]/page.tsx). The .md sibling must not
  // leak them either — there is no equivalent noindex signal for a plain
  // text response, so 404 is the right surface for AI crawlers.
  if (post.draft || post.excludeFromSearch) return notFound();

  const siteUrl = getSiteUrl();

  // Uncategorized posts must never be served under an arbitrary category URL.
  // `loadPost` falls through to the root `blog-content/{slug}.json` lookup if
  // the category lookup misses, which otherwise lets `/blog/anything/my-post.md`
  // serve a 200. Require an exact category match.
  if (!post.category || post.category !== category) {
    if (post.category) {
      // Wrong category: redirect to the canonical one so crawlers converge.
      return Response.redirect(`${siteUrl}/blog/${post.category}/${post.slug}.md`, 308);
    }
    return notFound();
  }

  const canonical = `${siteUrl}/blog/${category}/${slug}`;
  const lines: string[] = [];
  lines.push(`# ${post.title}`);
  lines.push('');
  lines.push(`**Source:** ${canonical}`);
  if (post.publishedAt) lines.push(`**Published:** ${post.publishedAt.split('T')[0]}`);
  if (post.author?.name) {
    const bio = post.author.bio ? ` (${post.author.bio})` : '';
    lines.push(`**Author:** ${post.author.name}${bio}`);
  }
  if (post.tags?.length) lines.push(`**Tags:** ${post.tags.join(', ')}`);
  lines.push('');
  if (post.excerpt) {
    lines.push(post.excerpt);
    lines.push('');
  }
  if (post.content) {
    lines.push(htmlToMarkdown(post.content));
  }

  const body = lines.join('\n');

  // Content-hash ETag so repeat crawler fetches can 304 cheaply even when
  // the edge cache expires. `Last-Modified` uses the post's own timestamps
  // so crawlers with `If-Modified-Since` get a direct recency signal.
  const etag = `"${crypto.createHash('sha1').update(body).digest('hex').slice(0, 16)}"`;
  const lastModifiedSource = post.publishedAt;
  let lastModified: string | undefined;
  if (lastModifiedSource) {
    const d = new Date(lastModifiedSource);
    if (!isNaN(d.getTime())) lastModified = d.toUTCString();
  }

  // RFC 9110 §13.1.3: If-None-Match takes precedence; If-Modified-Since
  // must be ignored when both are present.
  const ifNoneMatch = _req.headers.get('if-none-match');
  const ifModifiedSince = _req.headers.get('if-modified-since');
  let notModified = false;
  if (ifNoneMatch) {
    notModified = ifNoneMatch === etag;
  } else if (lastModified && ifModifiedSince && lastModifiedSource) {
    notModified = new Date(ifModifiedSince).getTime() >= new Date(lastModifiedSource).getTime();
  }
  if (notModified) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        ...(lastModified ? { 'Last-Modified': lastModified } : {}),
        'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=86400`,
      },
    });
  }

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=86400`,
      Link: `<${canonical}>; rel="canonical"`,
      ETag: etag,
      ...(lastModified ? { 'Last-Modified': lastModified } : {}),
    },
  });
}
