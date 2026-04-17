import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getSiteUrl } from '@/lib/seo/site-url';
import { getLlmsSettings } from '@/lib/seo/llms-settings';
import { loadPageSeoConfig } from '@/lib/seo/page-seo-utils';
import { getPageBySlug } from '@/lib/pages/page-utils-server';
import { loadSidecarContent, extractJsxText } from '@/lib/llms/jsx-extract';

// Internal handler for the public-facing `/{path}.md` URL on every
// server-rendered page. Reached via a rewrite in `src/proxy.ts`.
//
// Why a route handler instead of static generation:
//   - The same admin AI Search master toggle that gates `/llms.txt` and the
//     blog `.md` route also gates this surface. Dynamic = no rebuild needed.
//   - Per-page `llms.exclude` flips the response from 200 to 404 instantly.
//   - Content is extracted from the page's TSX source file at request time
//     so the markdown output always tracks the live page.

interface RouteContext {
  params: Promise<{ slug?: string[] }>;
}

export const dynamic = 'force-dynamic';
const CACHE_MAX_AGE = 3600;

// Path prefixes that are not user-facing pages and must never be served as
// markdown. Matches the same intent as the sitemap exclusion lists.
const RESERVED_PREFIXES = ['api', 'admin', '_next', 'auth', 'login', 'signup', 'reset-password', 'confirm-email'];
const RESERVED_EXACT = new Set(['robots.txt', 'sitemap', 'sitemap.xml', 'llms.txt']);

function notFound() {
  return new Response('Not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

function isReserved(slugSegments: string[]): boolean {
  if (slugSegments.length === 0) return false;
  const head = slugSegments[0];
  if (RESERVED_PREFIXES.includes(head)) return true;
  if (RESERVED_EXACT.has(head)) return true;
  // Blog has its own dedicated `.md` surface at /api/blog-md.
  if (head === 'blog') return true;
  return false;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const settings = await getLlmsSettings();
  if (!settings.enabled) return notFound();

  const params = await ctx.params;
  const rawSlug = params.slug ?? [];

  // `/index.md` is the canonical URL for the home page's markdown (since
  // `/.md` is a malformed URL). Everything else maps 1:1 from path segments.
  const isHomePage = rawSlug.length === 0 || (rawSlug.length === 1 && rawSlug[0] === 'index');
  const slugSegments = isHomePage ? [] : rawSlug;

  if (isReserved(slugSegments)) return notFound();

  const pagePath = isHomePage ? '/' : `/${slugSegments.join('/')}`;
  const pageSlug = isHomePage ? 'home' : slugSegments.join('/');

  // The page must actually exist as a server-renderable page in the app.
  // getPageBySlug also tells us whether it's a client component, which we
  // refuse to handle here (the rendered HTML is just a shell).
  const page = await getPageBySlug(pageSlug);
  if (!page || !page.exists) return notFound();
  if (page.isClientComponent) return notFound();

  const seoConfig = await loadPageSeoConfig(pagePath);
  if (seoConfig?.seo?.noIndex) return notFound();
  if (seoConfig?.sitemap?.exclude) return notFound();
  if (seoConfig?.llms?.exclude) return notFound();
  if (seoConfig?.metadata?.draft) return notFound();

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${pagePath}`;

  // Content resolution: sidecar file first, then JSX extraction.
  // A sidecar `llms-content.md` next to the page's `page.tsx` takes
  // priority — this is how pages with API-driven content (Supabase, CMS)
  // provide their own AI-visible markdown. For static pages with hardcoded
  // JSX text, the automatic extractor handles it.
  const contentMarkdown =
    await loadSidecarContent(pageSlug) ||
    (page.content ? extractJsxText(page.content) : null);
  if (!contentMarkdown) return notFound();

  const title = seoConfig?.seo?.title || page.title || 'Untitled';
  const description = seoConfig?.seo?.description || '';
  const author = seoConfig?.metadata?.author;
  const lastModified = seoConfig?.metadata?.lastModified;

  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`**Source:** ${canonical}`);
  if (lastModified) lines.push(`**Updated:** ${lastModified}`);
  if (author) lines.push(`**Author:** ${author}`);
  lines.push('');
  if (description) {
    lines.push(description);
    lines.push('');
  }
  lines.push(contentMarkdown);

  const body = lines.join('\n');

  const etag = `"${crypto.createHash('sha1').update(body).digest('hex').slice(0, 16)}"`;
  let lastModifiedHeader: string | undefined;
  if (lastModified) {
    const d = new Date(lastModified);
    if (!isNaN(d.getTime())) lastModifiedHeader = d.toUTCString();
  }

  // RFC 9110 §13.1.3: If-None-Match takes precedence; If-Modified-Since
  // must be ignored when both are present.
  const ifNoneMatch = req.headers.get('if-none-match');
  const ifModifiedSince = req.headers.get('if-modified-since');
  let notModified = false;
  if (ifNoneMatch) {
    notModified = ifNoneMatch === etag;
  } else if (lastModifiedHeader && ifModifiedSince && lastModified) {
    notModified = new Date(ifModifiedSince).getTime() >= new Date(lastModified).getTime();
  }
  if (notModified) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        ...(lastModifiedHeader ? { 'Last-Modified': lastModifiedHeader } : {}),
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
      ...(lastModifiedHeader ? { 'Last-Modified': lastModifiedHeader } : {}),
    },
  });
}
