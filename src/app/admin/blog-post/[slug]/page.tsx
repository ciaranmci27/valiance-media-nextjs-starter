'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';
import TagInput from '@/components/TagInput';
import KeywordsInput from '@/components/KeywordsInput';
import { getCMSConfig } from '@/lib/cms-config';

interface BlogFormData {
  title: string;
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
  seo: {
    title: string;
    description: string;
    keywords: string[];
    image: string;
  };
}

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [originalCategory, setOriginalCategory] = useState<string>('');
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    excerpt: '',
    content: '',
    author: {
      name: '',
      image: '/logos/square-logo.png',
      bio: ''
    },
    category: '',
    tags: [],
    image: '/logos/horizontal-logo.png',
    imageAlt: '',
    featured: false,
    draft: false,
    excludeFromSearch: false,
    seo: {
      title: '',
      description: '',
      keywords: [],
      image: '/logos/horizontal-logo.png'
    }
  });

  useEffect(() => {
    if (slug && slug !== 'new') {
      fetchPost();
    } else {
      setIsLoadingPost(false);
    }
    fetchCategories();
  }, [slug]);

  const fetchPost = async () => {
    try {
      // Try to fetch from all categories if no specific category
      const response = await fetch(`/api/admin/blog-post?slug=${slug}`);
      
      if (response.ok) {
        const post = await response.json();
        setFormData({
          title: post.title || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          author: post.author || { name: '', image: '/logos/square-logo.png', bio: '' },
          category: post.category || '',
          tags: post.tags || [],
          image: post.image || '/logos/horizontal-logo.png',
          imageAlt: post.imageAlt || '',
          featured: post.featured || false,
          draft: post.draft || false,
          excludeFromSearch: post.excludeFromSearch || false,
          seo: post.seo || { title: '', description: '', keywords: [], image: '/logos/horizontal-logo.png' }
        });
        setOriginalCategory(post.category || '');
      } else {
        alert('Post not found');
        router.push('/admin/blog');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('Error loading post');
    } finally {
      setIsLoadingPost(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleContentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleKeywordsChange = (keywords: string[]) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords
      }
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isEdit = slug && slug !== 'new';
      const postSlug = isEdit ? slug : generateSlug(formData.title);
      const publishedAt = new Date().toISOString();
      
      // Get environment-aware CMS configuration
      const cmsConfig = getCMSConfig();

      const postData = {
        ...formData,
        slug: postSlug,
        publishedAt,
        readingTime: Math.ceil(formData.content.split(/\s+/).length / 200),
        originalSlug: isEdit ? slug : undefined,
        originalCategory: isEdit ? originalCategory : undefined
      };

      const endpoint = isEdit ? cmsConfig.endpoints.update : cmsConfig.endpoints.create;
      const response = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        router.push('/admin/blog');
        router.refresh();
      } else {
        const result = await response.json();
        
        // Display detailed error information
        let errorMessage = result.error || result.message || 'Failed to save blog post';
        
        if (result.hint) {
          errorMessage += `\n\n${result.hint}`;
        }
        
        if (result.details) {
          console.error('Blog post save error details:', result.details);
          if (result.details.environment === 'production' && !result.details.gitHubConfigured) {
            errorMessage += '\n\nNote: You are in production but GitHub is not configured. Please add GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO to your Vercel environment variables.';
          }
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('An error occurred while saving the blog post');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPost) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading blog post...</p>
      </div>
    );
  }

  const isEdit = slug && slug !== 'new';

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
            {isEdit ? 'Edit Blog Post' : 'New Blog Post'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {isEdit ? 'Update your blog post content and settings.' : 'Write and publish a new blog post to share with your audience.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Main Content Section */}
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            padding: 'var(--spacing-xl)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <h2 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-lg)' }}>
              Post Content
            </h2>
            
            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
              <div>
                <label htmlFor="title" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter blog post title"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label htmlFor="excerpt" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  Excerpt *
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Brief description of the blog post"
                  rows={3}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div>
                <label className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  Content *
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Start writing your blog post content..."
                />
              </div>
            </div>
          </div>

          {/* Meta Information Section */}
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            padding: 'var(--spacing-xl)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <h2 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-lg)' }}>
              Post Details
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-lg)' }}>
              <div>
                <label htmlFor="category" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                  style={{ width: '100%' }}
                >
                  <option value="">No Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  Tags
                </label>
                <TagInput
                  tags={formData.tags}
                  onChange={handleTagsChange}
                  placeholder="Add tags..."
                />
              </div>

              <div>
                <label htmlFor="image" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  Featured Image URL
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="/images/blog-post-image.jpg"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label htmlFor="imageAlt" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  Image Alt Text
                </label>
                <input
                  type="text"
                  id="imageAlt"
                  name="imageAlt"
                  value={formData.imageAlt}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Descriptive alt text for the image"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Author Information Section */}
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            padding: 'var(--spacing-xl)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <h2 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-lg)' }}>
              Author Information
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-lg)' }}>
              <div>
                <label htmlFor="author.name" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  Author Name
                </label>
                <input
                  type="text"
                  id="author.name"
                  name="author.name"
                  value={formData.author.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="John Doe"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label htmlFor="author.image" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  Author Image URL
                </label>
                <input
                  type="text"
                  id="author.image"
                  name="author.image"
                  value={formData.author.image}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="/images/author.jpg"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label htmlFor="author.bio" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  Author Bio
                </label>
                <textarea
                  id="author.bio"
                  name="author.bio"
                  value={formData.author.bio}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Brief author biography"
                  rows={2}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* SEO Settings Section */}
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            padding: 'var(--spacing-xl)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <h2 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-lg)' }}>
              SEO Settings
            </h2>
            
            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
              <div>
                <label htmlFor="seo.title" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  SEO Title
                </label>
                <input
                  type="text"
                  id="seo.title"
                  name="seo.title"
                  value={formData.seo.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Leave empty to use post title"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label htmlFor="seo.description" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  SEO Description
                </label>
                <textarea
                  id="seo.description"
                  name="seo.description"
                  value={formData.seo.description}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Leave empty to use excerpt"
                  rows={2}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div>
                <label htmlFor="keywords" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  SEO Keywords
                </label>
                <KeywordsInput
                  keywords={formData.seo.keywords}
                  onChange={handleKeywordsChange}
                  placeholder="Add SEO keywords..."
                />
              </div>

              <div>
                <label htmlFor="seo.image" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: '500'
                }}>
                  SEO Image URL
                </label>
                <input
                  type="text"
                  id="seo.image"
                  name="seo.image"
                  value={formData.seo.image}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Leave empty to use featured image"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Post Settings Section */}
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            padding: 'var(--spacing-xl)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <h2 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-lg)' }}>
              Post Settings
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  style={{ width: '20px', height: '20px' }}
                />
                <span style={{ color: 'var(--color-text-primary)' }}>
                  Featured Post
                </span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                  (Highlight this post on the homepage)
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="draft"
                  checked={formData.draft}
                  onChange={handleInputChange}
                  style={{ width: '20px', height: '20px' }}
                />
                <span style={{ color: 'var(--color-text-primary)' }}>
                  Save as Draft
                </span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                  (Post won't be published publicly)
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="excludeFromSearch"
                  checked={formData.excludeFromSearch}
                  onChange={handleInputChange}
                  style={{ width: '20px', height: '20px' }}
                />
                <span style={{ color: 'var(--color-text-primary)' }}>
                  Exclude from Search
                </span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                  (Hide from search engines)
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: 'var(--spacing-md)', 
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={() => router.push('/admin/blog')}
              style={{
                padding: '12px 24px',
                background: 'var(--color-surface-elevated)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '12px 32px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Saving...' : (isEdit ? 'Update Post' : 'Publish Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}