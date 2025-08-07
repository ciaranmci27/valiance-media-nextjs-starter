import { NextResponse } from 'next/server';
import { loadBlogPosts } from '@/lib/blog-utils';

export async function GET() {
  try {
    const posts = loadBlogPosts();
    
    return NextResponse.json({ 
      posts: posts.map(post => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        publishedAt: post.publishedAt,
        draft: post.draft,
        featured: post.featured,
        tags: post.tags || [],
        author: post.author,
        readingTime: post.readingTime
      }))
    });
    
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}