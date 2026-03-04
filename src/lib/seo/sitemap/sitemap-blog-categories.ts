import { MetadataRoute } from 'next';
import { seoConfig } from '../config';
import { loadCategories, loadBlogPosts } from '@/lib/blog/blog-utils';
import { BlogPost } from '@/lib/blog/blog-types';

/**
 * Categories Sitemap - Contains blog categories and blog index
 * This includes the main blog page and all category listing pages
 */

/**
 * Filter posts to only real, publishable content (not examples/drafts)
 */
function filterRealPosts(allPosts: BlogPost[]): BlogPost[] {
  const sitemapConfig = seoConfig.sitemap;

  return allPosts.filter((post) => {
    if (post.draft) return false;
    if (post.excludeFromSearch) return false;

    const hasExcludedPattern = sitemapConfig.excludedBlogPatterns.some(pattern =>
      post.slug.toLowerCase().includes(pattern.toLowerCase())
    );
    if (hasExcludedPattern) return false;

    return true;
  });
}

/**
 * Helper: check if a category has real user content using a pre-loaded posts array
 */
function categoryHasRealContent(categorySlug: string, realPosts: BlogPost[]): boolean {
  return realPosts.some(post => post.category === categorySlug);
}

export async function sitemapCategories(customBaseUrl?: string): Promise<MetadataRoute.Sitemap> {
  const baseUrl = customBaseUrl || (seoConfig as any).siteUrl;
  const sitemapConfig = seoConfig.sitemap;

  // Load all posts once, filter to real content
  const allPosts = await loadBlogPosts();
  const realPosts = filterRealPosts(allPosts);

  // Only generate categories sitemap if there's real blog content
  if (realPosts.length === 0) {
    console.log('No real blog content found, excluding categories from sitemap');
    return [];
  }

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add main blog index page (only if there's real content)
  sitemapEntries.push({
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: sitemapConfig.changeFrequency.categories as any,
    priority: sitemapConfig.priority.categories,
  });

  // Add category pages (only those with real content)
  try {
    const categories = await loadCategories();
    const categoriesWithContent = categories.filter(category =>
      categoryHasRealContent(category.slug, realPosts)
    );

    const categoryPages = categoriesWithContent.map((category) => ({
      url: `${baseUrl}/blog/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: sitemapConfig.changeFrequency.categories as any,
      priority: sitemapConfig.priority.categories,
    }));

    sitemapEntries.push(...categoryPages);

    if (categoriesWithContent.length === 0) {
      console.log('No categories with real content found');
    }
  } catch (error) {
    console.warn('Error loading categories for sitemap:', error);
  }

  return sitemapEntries;
}
