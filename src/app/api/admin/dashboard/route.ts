import { NextResponse } from 'next/server';
import { loadBlogPosts, loadAllCategories } from '@/lib/blog-utils';

export async function GET() {
  try {
    const posts = loadBlogPosts();
    const categories = loadAllCategories();
    
    // Create a mapping of slug to category name
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.slug, cat.name);
    });
    
    // Calculate statistics
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(p => !p.draft).length;
    const draftPosts = posts.filter(p => p.draft).length;
    const featuredPosts = posts.filter(p => p.featured).length;
    
    // Initialize all categories with 0 count
    const categoriesWithCounts: { [key: string]: number } = {};
    categories.forEach(cat => {
      categoriesWithCounts[cat.name] = 0;
    });
    
    // Count posts for each category
    posts.forEach(post => {
      if (post.category) {
        const categoryName = categoryMap.get(post.category) || post.category;
        categoriesWithCounts[categoryName] = (categoriesWithCounts[categoryName] || 0) + 1;
      }
    });
    
    // Get recent posts (last 10)
    const recentPosts = posts
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 10)
      .map(post => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        publishedAt: post.publishedAt,
        draft: post.draft,
        featured: post.featured,
        author: post.author,
        readingTime: post.readingTime,
        tags: post.tags
      }));
    
    // Calculate popular tags
    const tagCounts: { [key: string]: number } = {};
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
    
    return NextResponse.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      featuredPosts,
      categories: categoriesWithCounts,
      recentPosts,
      popularTags
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}