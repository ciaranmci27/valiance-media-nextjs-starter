'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BlogPostEditor from '@/components/admin/blog/BlogPostEditor';

interface BlogFormData {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    image: string;
    bio: string;
  };
  category: string;
  tags: string[];
  image: string;
  imageAlt: string;
  featured: boolean;
  draft: boolean;
  excludeFromSearch: boolean;
  publishedAt?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    image: string;
  };
}

export default function EditBlogPost() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [postData, setPostData] = useState<BlogFormData | null>(null);

  useEffect(() => {
    // If slug is 'new', redirect to the create page
    if (slug === 'new') {
      router.push('/admin/blog-post');
      return;
    }
    
    if (slug) {
      fetchPost();
    } else {
      setIsLoadingPost(false);
    }
  }, [slug, router]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/admin/blog-post?slug=${slug}`);
      
      if (response.ok) {
        const post = await response.json();
        setPostData({
          title: post.title || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          author: post.author || { name: '', image: '/favicon/android-chrome-512x512.png', bio: '' },
          category: post.category || '',
          tags: post.tags || [],
          image: post.image || '/logos/horizontal-logo.png',
          imageAlt: post.imageAlt || '',
          featured: post.featured || false,
          draft: post.draft || false,
          excludeFromSearch: post.excludeFromSearch || false,
          slug: post.slug || slug,
          publishedAt: post.publishedAt || undefined,
          seo: post.seo || { title: '', description: '', keywords: [], image: '/logos/horizontal-logo.png' }
        });
      } else {
        alert('Post not found');
        router.push('/admin/blog');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('Error loading post');
      router.push('/admin/blog');
    } finally {
      setIsLoadingPost(false);
    }
  };

  if (isLoadingPost) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <div className="skeleton" style={{ width: '240px', height: '36px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ width: '360px', height: '20px' }} />
          </div>
          <div className="skeleton" style={{ height: '44px', marginBottom: '24px' }} />
          <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
        </div>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              Post not found
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <BlogPostEditor mode="edit" initialData={postData} slug={slug} />;
}