import { NextResponse } from 'next/server';
import { seoConfig } from '@/lib/seo/config';
import { getSiteUrl } from '@/lib/seo/site-url';
import { getLlmsSettings } from '@/lib/seo/llms-settings';
import { getAllPages } from '@/lib/pages/page-utils-server';
import { loadPageSeoConfig } from '@/lib/seo/page-seo-utils';
import { cachedLoadBlogPosts } from '@/lib/blog/blog-utils';

// Served at /llms.txt. Dynamic so the admin master toggle and per-page
// exclusions apply instantly without a rebuild — the Cache-Control headers
// keep load off the origin between edits.
export const dynamic = 'force-dynamic';

function notFound() {
  return new NextResponse('Not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

function escapeInline(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export async function GET() {
  const settings = await getLlmsSettings();
  if (!settings.enabled) return notFound();

  const siteUrl = getSiteUrl();
  const siteName = seoConfig.siteName || 'Site';
  const siteDescription = escapeInline(seoConfig.defaultDescription || '');

  const lines: string[] = [];
  lines.push(`# ${siteName}`);
  lines.push('');
  if (siteDescription) {
    lines.push(`> ${siteDescription}`);
    lines.push('');
  }

  // Pages section: everything the sitemap would emit, minus per-page opt-outs.
  const allPages = await getAllPages();
  const pageEntries: { title: string; url: string; description: string }[] = [];

  for (const page of allPages) {
    if (page.isDynamicRoute) continue;
    if (page.draft) continue;
    // Client components have no server-rendered content for the .md route to
    // extract, so skip them in the index rather than advertise a 404.
    if (page.isClientComponent) continue;

    const lookupSlug = page.isHomePage ? '' : page.slug;
    const pageSeoPath = lookupSlug === '' ? '/' : `/${lookupSlug}`;
    const config = await loadPageSeoConfig(pageSeoPath);

    if (config?.seo?.noIndex) continue;
    if (config?.sitemap?.exclude) continue;
    if (config?.llms?.exclude) continue;

    const title = config?.seo?.title || page.title || siteName;
    const description = config?.seo?.description || '';
    // Link AI crawlers at the markdown sibling, not the HTML page. They
    // follow these links to harvest clean content. Home page uses
    // `/index.md` since `/.md` is a malformed URL.
    const url = page.isHomePage
      ? `${siteUrl}/index.md`
      : `${siteUrl}/${page.slug}.md`;

    pageEntries.push({
      title: escapeInline(title),
      url,
      description: escapeInline(description),
    });
  }

  if (pageEntries.length > 0) {
    lines.push('## Pages');
    lines.push('');
    for (const entry of pageEntries) {
      const tail = entry.description ? `: ${entry.description}` : '';
      lines.push(`- [${entry.title}](${entry.url})${tail}`);
    }
    lines.push('');
  }

  // Blog posts section: link each to its `.md` sibling so AI crawlers pull
  // clean markdown rather than re-parsing the rendered HTML page.
  const posts = await cachedLoadBlogPosts();
  const visiblePosts = posts
    .filter((p) => !p.draft && !p.excludeFromSearch && !!p.category)
    .sort((a, b) => {
      const aDate = a.publishedAt || '';
      const bDate = b.publishedAt || '';
      return bDate.localeCompare(aDate);
    });

  if (visiblePosts.length > 0) {
    lines.push('## Blog');
    lines.push('');
    for (const post of visiblePosts) {
      const title = escapeInline(post.title || post.slug);
      const excerpt = escapeInline(post.excerpt || '');
      const mdUrl = `${siteUrl}/blog/${post.category}/${post.slug}.md`;
      const published = post.publishedAt ? ` (Published: ${post.publishedAt.split('T')[0]})` : '';
      const tail = excerpt ? `: ${excerpt}${published}` : published;
      lines.push(`- [${title}](${mdUrl})${tail}`);
    }
    lines.push('');
  }

  const body = lines.join('\n');

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
