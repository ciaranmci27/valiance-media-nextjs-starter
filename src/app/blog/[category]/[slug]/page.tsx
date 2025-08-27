import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { BlogLayout } from '@/components/admin/BlogLayout';
import { loadPost, loadBlogPosts, getRelatedPosts, loadCategories } from '@/lib/blog-utils';
import { seoConfig } from '@/seo/seo.config';

interface BlogPostPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// Generate static params for all blog posts with categories
export async function generateStaticParams() {
  const posts = await loadBlogPosts();
  const categories = await loadCategories();
  
  const params = [];
  
  // Generate params for posts that have categories
  for (const post of posts) {
    if (post.category) {
      params.push({
        category: post.category,
        slug: post.slug,
      });
    }
  }
  
  return params;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await loadPost(resolvedParams.slug, resolvedParams.category);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }
  
  return {
    title: post.seo?.title || `${post.title} - ${seoConfig.siteName || 'Valiance Media'} Blog`,
    description: post.seo?.description || post.excerpt,
    keywords: post.seo?.keywords?.join(', ') || post.tags?.join(', '),
    robots: post.excludeFromSearch || post.draft ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt,
      images: post.seo?.image || post.image ? [post.seo?.image || post.image!] : undefined,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt,
      images: post.seo?.image || post.image ? [post.seo?.image || post.image!] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = await loadPost(resolvedParams.slug, resolvedParams.category);
  
  // If post doesn't exist, let 404 page handle the smart redirect
  if (!post) {
    notFound();
  }
  
  // Verify the category matches
  if (post.category !== resolvedParams.category) {
    // Post exists but in wrong category - redirect to correct URL
    if (post.category) {
      redirect(`/blog/${post.category}/${post.slug}`);
    } else {
      redirect(`/blog/${post.slug}`);
    }
  }
  
  const relatedPosts = await getRelatedPosts(post, 3);
  
  return <BlogLayout post={post} relatedPosts={relatedPosts} useFullUrl={true} />;
}