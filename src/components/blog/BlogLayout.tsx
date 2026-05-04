'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { BlogPost } from '@/lib/blog/blog-types';

interface BlogLayoutProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
  useFullUrl?: boolean;
}

export function BlogLayout({ post, relatedPosts = [], useFullUrl = false }: BlogLayoutProps) {
  const sanitizedContent = useMemo(() => DOMPurify.sanitize(post.content, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target'],
  }), [post.content]);

  return (
    <PageWrapper className="py-8 sm:py-12 lg:py-16">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Image */}
        {post.image && (
          <div className="mb-8 sm:mb-12 rounded-xl overflow-hidden">
            <Image
              src={post.image}
              alt={post.imageAlt || post.title}
              width={1200}
              height={630}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        )}
        
        {/* Blog Header */}
        <header className="mb-8 sm:mb-12">
          {/* Category Badge */}
          {post.category && (
            <Link
              href={`/blog/${post.category}`}
              className="inline-block text-sm font-semibold text-primary hover:text-primary-dark mb-4 uppercase tracking-wide"
            >
              {post.category}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg sm:text-xl text-text-secondary mb-6">
            {post.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            {/* Author */}
            <div className="flex items-center gap-2">
              {post.author.image && (
                <Image
                  src={post.author.image}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <span className="font-medium">{post.author.name}</span>
            </div>
            
            {/* Date */}
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            
            {/* Reading Time */}
            {post.readingTime && (
              <span>{post.readingTime} min read</span>
            )}
          </div>
        </header>
        
        {/* Blog Content. Code blocks intentionally stay dark in both themes
            (universal dev convention); inline code uses brand-tinted surface. */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-12 overflow-hidden
            prose-headings:font-bold prose-headings:text-text-primary
            prose-p:text-text-primary
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-text-primary
            prose-code:text-text-primary prose-code:bg-primary-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:overflow-x-auto prose-pre:max-w-full
            prose-blockquote:border-l-primary prose-blockquote:bg-primary-50 prose-blockquote:py-1 prose-blockquote:px-4
            prose-img:rounded-xl prose-img:shadow-lg
            [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:break-words"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12 pb-12 border-b border-border-medium">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-primary-50 text-text-secondary rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio */}
        {post.author.bio && (
          <div className="bg-primary-50 rounded-xl p-6 mb-12">
            <div className="flex items-start gap-4">
              {post.author.image && (
                <Image
                  src={post.author.image}
                  alt={post.author.name}
                  width={60}
                  height={60}
                  className="rounded-full flex-shrink-0"
                />
              )}
              <div>
                <h3 className="font-semibold text-text-primary mb-2">
                  About {post.author.name}
                </h3>
                <p className="text-text-secondary">
                  {post.author.bio}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Related Articles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => {
                const relatedUrl = relatedPost.category
                  ? `/blog/${relatedPost.category}/${relatedPost.slug}`
                  : `/blog/${relatedPost.slug}`;
                return (
                  <Link
                    key={relatedPost.slug}
                    href={relatedUrl}
                    className="group"
                  >
                    <article className="bg-surface-elevated rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                      {relatedPost.image && (
                        <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                          <Image
                            src={relatedPost.image}
                            alt={relatedPost.imageAlt || relatedPost.title}
                            width={400}
                            height={225}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </PageWrapper>
  );
}