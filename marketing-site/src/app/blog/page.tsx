import React from 'react';
import { Metadata } from 'next';
import { PageWrapper } from '@/components/PageWrapper';
import { BlogCard } from '@/components/BlogCard';
import { loadBlogPosts, loadCategories } from '@/lib/blog-utils';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog - Valiance Media',
  description: 'Insights, tutorials, and updates from the Valiance Media team.',
};

export default async function BlogPage() {
  const [allPosts, categories] = await Promise.all([
    loadBlogPosts(),
    loadCategories(),
  ]);
  
  // Show all posts in a grid (no featured section for now)
  // If you want featured posts, you can add a "featured": true field to blog posts

  return (
    <PageWrapper className="py-8 sm:py-12 lg:py-16">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          Our Blog
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Insights, tutorials, and updates from the Valiance Media team
        </p>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link
            href="/blog"
            className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
          >
            All Posts
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/blog/${category.slug}`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}

      {/* All Posts Grid */}
      {allPosts.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            All Articles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {allPosts.map((post) => (
              <BlogCard key={post.slug} post={post} categories={categories} />
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No blog posts yet. Add JSON files to the /public/blog-content directory to get started.
          </p>
        </div>
      )}
    </PageWrapper>
  );
}