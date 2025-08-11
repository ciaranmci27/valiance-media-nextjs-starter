import { MetadataRoute } from 'next';
import { seoConfig } from './seo.config';
import { loadBlogPosts } from '@/lib/blog-utils';

/**
 * Blog Posts Sitemap - Contains all published blog posts
 * This includes individual blog post URLs with proper filtering
 */
export function sitemapBlogPosts(customBaseUrl?: string): MetadataRoute.Sitemap {
  const baseUrl = customBaseUrl || (seoConfig as any).siteUrl;
  const sitemapConfig = seoConfig.sitemap;

  try {
    const allBlogPosts = loadBlogPosts();
    
    // Filter out excluded blog posts
    const publishedBlogPosts = allBlogPosts.filter((post) => {
      // Exclude drafts
      if (post.draft) return false;
      
      // Exclude posts marked to exclude from search
      if (post.excludeFromSearch) return false;
      
      // Exclude posts with example patterns in filename
      const hasExcludedPattern = sitemapConfig.excludedBlogPatterns.some(pattern => 
        post.slug.toLowerCase().includes(pattern.toLowerCase())
      );
      if (hasExcludedPattern) return false;
      
      return true;
    });

    // Only return sitemap entries if there are actual user posts (not just examples)
    if (publishedBlogPosts.length === 0) {
      console.log('No published blog posts found, excluding from sitemap');
      return [];
    }

    return publishedBlogPosts.map((post) => {
      const postUrl = post.category 
        ? `${baseUrl}/blog/${post.category}/${post.slug}`
        : `${baseUrl}/blog/${post.slug}`;
      
      return {
        url: postUrl,
        lastModified: new Date(post.publishedAt),
        changeFrequency: sitemapConfig.changeFrequency.blog as any,
        priority: sitemapConfig.priority.blog,
      };
    });
  } catch (error) {
    console.warn('Error loading blog posts for sitemap:', error);
    return [];
  }
}