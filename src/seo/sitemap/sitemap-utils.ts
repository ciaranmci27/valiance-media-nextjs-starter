import { loadBlogPosts } from '@/lib/blog/blog-utils';
import { BlogPost } from '@/lib/blog/blog-types';
import { seoConfig } from '../seo.config';

/**
 * Utility functions for sitemap generation
 * These functions determine what content should be included in sitemaps
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
 * Check if there are any real blog posts (not examples/drafts)
 * Accepts an optional pre-loaded posts array to avoid redundant filesystem reads.
 */
export async function hasRealBlogPosts(allPosts?: BlogPost[]): Promise<boolean> {
  try {
    const posts = allPosts ?? await loadBlogPosts();
    return filterRealPosts(posts).length > 0;
  } catch (error) {
    console.warn('Error checking for real blog posts:', error);
    return false;
  }
}

/**
 * Check if there are any categories with real content (not just examples)
 * Accepts an optional pre-loaded posts array to avoid redundant filesystem reads.
 */
export async function hasRealBlogCategories(allPosts?: BlogPost[]): Promise<boolean> {
  try {
    const posts = allPosts ?? await loadBlogPosts();
    const realPosts = filterRealPosts(posts);

    const categoriesWithRealContent = new Set<string>();
    for (const post of realPosts) {
      if (post.category) {
        categoriesWithRealContent.add(post.category);
      }
    }

    return categoriesWithRealContent.size > 0;
  } catch (error) {
    console.warn('Error checking for real blog categories:', error);
    return false;
  }
}
