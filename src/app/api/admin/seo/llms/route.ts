import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin/require-auth';
import {
  getLlmsSettings,
  setLlmsSettings,
  KNOWN_AI_CRAWLERS,
  type LlmsSettings,
} from '@/lib/seo/llms-settings';
import { cachedLoadBlogPosts } from '@/lib/blog/blog-utils';
import { getAllPages } from '@/lib/pages/page-utils-server';
import { loadPageSeoConfig } from '@/lib/seo/page-seo-utils';

export const dynamic = 'force-dynamic';

// Quick counts so the admin tab can show "what will appear in llms.txt"
// without re-implementing the route's filter logic in the browser.
async function gatherStats() {
  const [pages, posts] = await Promise.all([
    getAllPages().catch(() => []),
    cachedLoadBlogPosts().catch(() => []),
  ]);

  let indexedPages = 0;
  for (const page of pages) {
    if (page.isDynamicRoute || page.draft) continue;
    const lookupSlug = page.isHomePage ? '' : page.slug;
    const pageSeoPath = lookupSlug === '' ? '/' : `/${lookupSlug}`;
    try {
      const config = await loadPageSeoConfig(pageSeoPath);
      if (config?.seo?.noIndex) continue;
      if (config?.sitemap?.exclude) continue;
      if (config?.llms?.exclude) continue;
    } catch {
      // If the seo-config read fails, err on the side of counting the page.
    }
    indexedPages += 1;
  }

  const indexedPosts = posts.filter(
    (p) => !p.draft && !p.excludeFromSearch && !!p.category,
  ).length;

  return { indexedPages, indexedPosts };
}

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const settings = await getLlmsSettings();
    const stats = await gatherStats();
    return NextResponse.json({ settings, stats, knownCrawlers: KNOWN_AI_CRAWLERS });
  } catch (error) {
    console.error('Error reading llms settings:', error);
    return NextResponse.json(
      { error: 'Failed to read AI Search settings' },
      { status: 500 },
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    if (!isRecord(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const partial: Partial<LlmsSettings> = {};
    if (typeof body.enabled === 'boolean') partial.enabled = body.enabled;
    if (isRecord(body.aiCrawlers)) {
      const map: Record<string, boolean> = {};
      for (const name of KNOWN_AI_CRAWLERS) {
        const value = (body.aiCrawlers as Record<string, unknown>)[name];
        if (typeof value === 'boolean') map[name] = value;
      }
      partial.aiCrawlers = map as LlmsSettings['aiCrawlers'];
    }

    const settings = await setLlmsSettings(partial);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating llms settings:', error);
    return NextResponse.json(
      {
        error: 'Failed to update AI Search settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
