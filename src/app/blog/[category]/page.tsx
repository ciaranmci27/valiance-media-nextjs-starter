import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PageWrapper } from '@/components/admin/PageWrapper';
import { BlogCard } from '@/components/admin/BlogCard';
import { loadPostsByCategory, loadCategories, loadPost, loadBlogPosts } from '@/lib/blog-utils';
import Link from 'next/link';
import { seoConfig } from '@/seo/seo.config';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// Generate static params for all categories and single posts
export async function generateStaticParams() {
  const categories = await loadCategories();
  const posts = await loadBlogPosts();
  
  // Generate params for categories
  const categoryParams = categories.map((category) => ({
    category: category.slug,
  }));
  
  // Generate params for single posts (without category in URL)
  const postParams = posts.map((post) => ({
    category: post.slug,
  }));
  
  return [...categoryParams, ...postParams];
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  
  // Check if it's a category
  const categories = await loadCategories();
  const category = categories.find(cat => cat.slug === resolvedParams.category);
  if (category) {
    return {
      title: `${category.name} - ${seoConfig.siteName || 'Valiance Media'} Blog`,
      description: category.description || `Browse all ${category.name} articles from the ${seoConfig.siteName || 'Valiance Media'} blog.`,
    };
  }
  
  // Check if it's a blog post
  const post = await loadPost(resolvedParams.category);
  if (post) {
    return {
      title: post.seo?.title || `${post.title} - ${seoConfig.siteName || 'Valiance Media'} Blog`,
      description: post.seo?.description || post.excerpt,
      keywords: post.seo?.keywords?.join(', ') || post.tags?.join(', '),
      robots: post.excludeFromSearch || post.draft ? 'noindex, nofollow' : 'index, follow',
      openGraph: {
        title: post.seo?.title || post.title,
        description: post.seo?.description || post.excerpt,
        type: 'article',
        publishedTime: post.publishedAt,
        authors: [post.author.name],
        tags: post.tags,
      },
    };
  }
  
  return {
    title: 'Not Found',
  };
}

export default async function CategoryOrPostPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  
  // First, check if it's a category
  const categories = await loadCategories();
  const category = categories.find(cat => cat.slug === resolvedParams.category);
  if (category) {
    // It's a category page - show category listing
    const [posts, allCategories] = await Promise.all([
      loadPostsByCategory(resolvedParams.category),
      loadCategories(),
    ]);
    
    return (
      <PageWrapper className="py-8 sm:py-12 lg:py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {category.description}
            </p>
          )}
        </div>

        {/* Categories Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link
            href="/blog"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            All Posts
          </Link>
          {allCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog/${cat.slug}`}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                cat.slug === resolvedParams.category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} showCategoryLink={false} categories={allCategories} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No posts in this category yet.
            </p>
            <Link
              href="/blog"
              className="inline-block mt-4 text-primary dark:text-primary-light hover:underline"
            >
              ← Back to all posts
            </Link>
          </div>
        )}
      </PageWrapper>
    );
  }
  
  // If not a category, check if it's a blog post (for backwards compatibility)
  const post = await loadPost(resolvedParams.category);
  if (post) {
    // Redirect to the proper URL structure
    const { BlogLayout } = await import('@/components/admin/BlogLayout');
    const { getRelatedPosts } = await import('@/lib/blog-utils');
    const relatedPosts = await getRelatedPosts(post, 3);
    
    return <BlogLayout post={post} relatedPosts={relatedPosts} />;
  }
  
  // Neither category nor post found - let 404 page handle it
  notFound();
}