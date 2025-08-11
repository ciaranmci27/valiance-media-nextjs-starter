/**
 * Centralized Sitemap Route Handlers
 * 
 * This file contains all sitemap generation logic in one place,
 * keeping the app directory clean while providing a centralized
 * location for all SEO-related routing.
 */

import { seoConfig } from '../seo.config';
import { hasRealBlogPosts, hasRealBlogCategories } from '../sitemap-utils';
import { sitemapPages } from '../sitemap-pages';
import { sitemapBlogPosts } from '../sitemap-blog-posts';
import { sitemapCategories } from '../sitemap-blog-categories';

/**
 * Helper function to get the base URL from request
 */
function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return process.env.NODE_ENV === 'development' 
    ? `${url.protocol}//${url.host}` 
    : (seoConfig as any).siteUrl;
}

/**
 * Helper function to generate XML sitemap response
 */
function generateSitemapXML(entries: any[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified?.toISOString()}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

/**
 * Helper function to generate sitemap index XML
 */
function generateSitemapIndexXML(sitemaps: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join('\n')}
</sitemapindex>`;
}

/**
 * Main Sitemap Index Handler
 * Returns the main sitemap.xml that references all other sitemaps
 */
export async function handleSitemapIndex(request: Request): Promise<Response> {
  const baseUrl = getBaseUrl(request);
  const lastModified = new Date().toISOString();

  // Build sitemaps array dynamically based on available content
  const sitemaps: string[] = [];
  
  // Always include pages sitemap
  sitemaps.push(`  <sitemap>
    <loc>${baseUrl}/sitemap/pages</loc>
    <lastmod>${lastModified}</lastmod>
  </sitemap>`);

  // Only include blog sitemaps if there's real content
  if (hasRealBlogPosts()) {
    sitemaps.push(`  <sitemap>
    <loc>${baseUrl}/sitemap/blog-posts</loc>
    <lastmod>${lastModified}</lastmod>
  </sitemap>`);
  }

  if (hasRealBlogCategories()) {
    sitemaps.push(`  <sitemap>
    <loc>${baseUrl}/sitemap/blog-categories</loc>
    <lastmod>${lastModified}</lastmod>
  </sitemap>`);
  }

  const xml = generateSitemapIndexXML(sitemaps);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

/**
 * Pages Sitemap Handler
 * Returns sitemap for all static pages
 */
export async function handlePagesSitemap(request: Request): Promise<Response> {
  const baseUrl = getBaseUrl(request);
  const sitemap = sitemapPages(baseUrl);
  
  // Return 404 if no content to display
  if (sitemap.length === 0) {
    return new Response('Not Found: No pages available for sitemap', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
  
  const xml = generateSitemapXML(sitemap);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

/**
 * Blog Posts Sitemap Handler
 * Returns sitemap for all published blog posts
 */
export async function handleBlogPostsSitemap(request: Request): Promise<Response> {
  const baseUrl = getBaseUrl(request);
  const sitemap = sitemapBlogPosts(baseUrl);
  
  // Return 404 if no content to display
  if (sitemap.length === 0) {
    return new Response('Not Found: No blog posts available for sitemap', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
  
  const xml = generateSitemapXML(sitemap);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

/**
 * Blog Categories Sitemap Handler
 * Returns sitemap for blog categories and main blog page
 */
export async function handleBlogCategoriesSitemap(request: Request): Promise<Response> {
  const baseUrl = getBaseUrl(request);
  const sitemap = sitemapCategories(baseUrl);
  
  // Return 404 if no content to display
  if (sitemap.length === 0) {
    return new Response('Not Found: No blog categories available for sitemap', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
  
  const xml = generateSitemapXML(sitemap);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}