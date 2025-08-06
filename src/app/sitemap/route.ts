import { handleSitemapIndex } from '@/seo/routes/sitemap-handlers';

/**
 * Main Sitemap Route
 * 
 * Serves the main XML sitemap index at /sitemap
 * This is cleaner than /sitemap.xml since it's the primary sitemap
 */

export async function GET(request: Request): Promise<Response> {
  return handleSitemapIndex(request);
}