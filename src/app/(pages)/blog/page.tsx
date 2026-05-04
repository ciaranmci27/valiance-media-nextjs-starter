import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { BlogCard } from '@/components/blog/BlogCard';
import { cachedLoadBlogPosts, cachedLoadCategories } from '@/lib/blog/blog-utils';
import Link from 'next/link';
import { seoConfig } from '@/lib/seo/config';
import { generateStaticMetadata } from '@/lib/seo/generate-static-metadata';

// Dynamic metadata: use seo-config.json when posts exist, noindex when empty
export async function generateMetadata(): Promise<Metadata> {
  const allPosts = await cachedLoadBlogPosts();

  // If no posts, return minimal metadata (page will 404 anyway)
  if (allPosts.length === 0) {
    return {
      title: 'Blog',
      robots: 'noindex, nofollow',
    };
  }

  // Use the standard SEO config when blog has content
  return generateStaticMetadata('blog');
}

export default async function BlogPage() {
  const [allPosts, categories] = await Promise.all([
    cachedLoadBlogPosts(),
    cachedLoadCategories(),
  ]);

  // If no blog posts exist, return 404 - don't show empty blog page
  if (allPosts.length === 0) {
    notFound();
  }

  return (
    <PageWrapper className="py-8 sm:py-12 lg:py-16">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-4">
          Our Blog
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto">
          Insights, tutorials, and updates from the {seoConfig.siteName || 'Valiance Media'} team
        </p>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link
            href="/blog"
            className="px-4 py-2 bg-primary text-text-on-primary rounded-full text-sm font-medium transition-colors"
          >
            All Posts
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/blog/${category.slug}`}
              className="px-4 py-2 bg-primary-50 text-text-secondary rounded-full text-sm font-medium hover:text-primary transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}

      {/* All Posts Grid */}
      <section>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {allPosts.map((post) => (
            <BlogCard key={post.slug} post={post} categories={categories} />
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}