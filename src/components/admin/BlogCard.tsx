'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost, BlogCategory } from '@/lib/blog-types';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
  showCategoryLink?: boolean;
  categories?: BlogCategory[];
}

export function BlogCard({ post, featured = false, showCategoryLink = true, categories = [] }: BlogCardProps) {
  const CardContent = () => (
    <>
      {post.image && (
        <div className={`relative overflow-hidden ${featured ? 'aspect-w-16 aspect-h-9' : 'aspect-w-16 aspect-h-9'}`}>
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            width={featured ? 800 : 400}
            height={featured ? 450 : 225}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {post.category && showCategoryLink && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-semibold text-primary dark:text-primary-light rounded-full uppercase tracking-wide">
              {categories.find(cat => cat.slug === post.category)?.name || post.category}
            </span>
          )}
        </div>
      )}
      
      <div className={`p-6 ${featured ? 'lg:p-8' : ''}`}>
        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </time>
          {post.readingTime && (
            <>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span>{post.readingTime} min read</span>
            </>
          )}
        </div>
        
        {/* Title */}
        <h3 className={`font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors mb-3 ${
          featured ? 'text-2xl lg:text-3xl' : 'text-xl'
        }`}>
          {post.title}
        </h3>
        
        {/* Excerpt */}
        <p className={`text-gray-600 dark:text-gray-400 mb-4 ${
          featured ? 'text-base lg:text-lg line-clamp-3' : 'text-sm line-clamp-2'
        }`}>
          {post.excerpt}
        </p>
        
        {/* Author */}
        <div className="flex items-center gap-3">
          {post.author.image && (
            <Image
              src={post.author.image}
              alt={post.author.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {post.author.name}
          </span>
        </div>
        
        {/* Tags (only for featured) */}
        {featured && post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // Determine the correct URL based on whether post has a category
  const postUrl = post.category ? `/blog/${post.category}/${post.slug}` : `/blog/${post.slug}`;
  
  return (
    <Link href={postUrl} className="group block">
      <article className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full ${
        featured ? 'lg:grid lg:grid-cols-2' : ''
      }`}>
        {featured ? (
          <CardContent />
        ) : (
          <CardContent />
        )}
      </article>
    </Link>
  );
}