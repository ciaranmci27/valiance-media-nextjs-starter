import { loadBlogPosts } from '@/lib/blog-utils';
import { seoConfig } from './seo.config';

/**
 * Utility functions for sitemap generation
 * These functions determine what content should be included in sitemaps
 */

/**
 * Check if there are any real blog posts (not examples/drafts)
 */
export function hasRealBlogPosts(): boolean {
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
    console.warn('Error checking for real blog posts:', error);
    return false;
  }
}

/**
 * Check if there are any categories with real content (not just examples)
 */
export function hasRealBlogCategories(): boolean {
  try {
    const allBlogPosts = loadBlogPosts();
    const sitemapConfig = seoConfig.sitemap;
    
    // Get unique categories that have real posts
    const categoriesWithRealContent = new Set<string>();
    
    allBlogPosts.forEach((post) => {
      if (post.draft) return;
      if (post.excludeFromSearch) return;
      if (!post.category) return; // Skip posts without categories
      
      // Check if it's an example post
      const hasExcludedPattern = sitemapConfig.excludedBlogPatterns.some(pattern => 
        post.slug.toLowerCase().includes(pattern.toLowerCase())
      );
      if (hasExcludedPattern) return;
      
      categoriesWithRealContent.add(post.category);
    });
    
    return categoriesWithRealContent.size > 0;
  } catch (error) {
    console.warn('Error checking for real blog categories:', error);
    return false;
  }
}