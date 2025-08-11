import { MetadataRoute } from 'next';
import { seoConfig } from './seo.config';

/**
 * Sitemap Index - Main sitemap.xml that references other sitemaps
 * This creates a state of the art structure:
 * 
 * /sitemap.xml (index)
 * ├── /sitemap-pages.xml
 * ├── /sitemap-blog-posts.xml
 * └── /sitemap-blog-categories.xml
 * 
 * This approach is better for SEO because:
 * - Search engines can crawl specific content types
 * - Better organization and performance
 * - Easier maintenance and debugging
 * - Follows SEO best practices
 */
export default function sitemapIndex(): MetadataRoute.Sitemap {
  const baseUrl = (seoConfig as any).siteUrl;
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/sitemap-pages.xml`,
      lastModified,
    },
    {
      url: `${baseUrl}/sitemap-blog-posts.xml`, 
      lastModified,
    },
    {
      url: `${baseUrl}/sitemap-blog-categories.xml`,
      lastModified,
    },
  ];
}