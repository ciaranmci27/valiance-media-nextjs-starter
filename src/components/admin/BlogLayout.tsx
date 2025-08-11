'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PageWrapper } from '@/components/admin/PageWrapper';
import { BlogPost } from '@/lib/blog-types';

interface BlogLayoutProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
  useFullUrl?: boolean;
}

export function BlogLayout({ post, relatedPosts = [], useFullUrl = false }: BlogLayoutProps) {
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
              className="inline-block text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4 uppercase tracking-wide"
            >
              {post.category}
            </Link>
          )}
          
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          
          {/* Excerpt */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6">
            {post.excerpt}
          </p>
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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
        
        {/* Blog Content */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none mb-12 overflow-hidden
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:overflow-x-auto prose-pre:max-w-full
            prose-blockquote:border-l-primary-600 dark:prose-blockquote:border-l-primary-400 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/50 prose-blockquote:py-1 prose-blockquote:px-4
            prose-img:rounded-xl prose-img:shadow-lg
            [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:break-words"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12 pb-12 border-b border-gray-200 dark:border-gray-700">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Author Bio */}
        {post.author.bio && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-12">
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
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  About {post.author.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {post.author.bio}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
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
                    <article className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
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
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
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