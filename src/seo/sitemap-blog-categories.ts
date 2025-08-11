import { MetadataRoute } from 'next';
import { seoConfig } from './seo.config';
import { loadCategories, loadBlogPosts } from '@/lib/blog-utils';

/**
 * Categories Sitemap - Contains blog categories and blog index
 * This includes the main blog page and all category listing pages
 */
/**
 * Helper function to check if a category has real user content (not just examples)
 */
function categoryHasRealContent(categorySlug: string): boolean {
  try {
    const allBlogPosts = loadBlogPosts();
    const sitemapConfig = seoConfig.sitemap;
    
    // Get posts in this category that are not examples/drafts/excluded
    const realPostsInCategory = allBlogPosts.filter((post) => {
      if (post.category !== categorySlug) return false;
      if (post.draft) return false;
      if (post.excludeFromSearch) return false;
      
      // Check if it's an example post
      const hasExcludedPattern = sitemapConfig.excludedBlogPatterns.some(pattern => 
        post.slug.toLowerCase().includes(pattern.toLowerCase())
      );
      if (hasExcludedPattern) return false;
      
      return true;
    });
    
    return realPostsInCategory.length > 0;
  } catch (error) {
    console.warn(`Error checking content for category ${categorySlug}:`, error);
    return false;
  }
}

/**
 * Helper function to check if there are any real blog posts at all
 */
function hasAnyRealBlogContent(): boolean {
  try {
    const allBlogPosts = loadBlogPosts();
    const sitemapConfig = seoConfig.sitemap;
    
    const realPosts = allBlogPosts.filter((post) => {
      if (post.draft) return false;
      if (post.excludeFromSearch) return false;
      
      // Check if it's an example post
      const hasExcludedPattern = sitemapConfig.excludedBlogPatterns.some(pattern => 
        post.slug.toLowerCase().includes(pattern.toLowerCase())
      );
      if (hasExcludedPattern) return false;
      
      return true;
    });
    
    return realPosts.length > 0;
  } catch (error) {
    console.warn('Error checking for real blog content:', error);
    return false;
  }
}

export function sitemapCategories(customBaseUrl?: string): MetadataRoute.Sitemap {
  const baseUrl = customBaseUrl || (seoConfig as any).siteUrl;
  const sitemapConfig = seoConfig.sitemap;

  // Only generate categories sitemap if there's real blog content
  if (!hasAnyRealBlogContent()) {
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
    const categories = loadCategories();
    const categoriesWithContent = categories.filter(category => 
      categoryHasRealContent(category.slug)
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