'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';
import TagInput from '@/components/TagInput';
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

export default function BlogPostEditor() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
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
    fetchCategories();
  }, []);

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

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(',').map(keyword => keyword.trim()).filter(keyword => keyword);
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
      const slug = generateSlug(formData.title);
      const publishedAt = new Date().toISOString();
      
      // Get environment-aware CMS configuration
      const cmsConfig = getCMSConfig();

      const postData = {
        ...formData,
        slug,
        publishedAt,
        readingTime: Math.ceil(formData.content.split(/\s+/).length / 200)
      };

      const response = await fetch(cmsConfig.endpoints.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      const result = await response.json();

      if (response.ok) {
        const message = cmsConfig.useGitHub 
          ? 'Blog post created and committed to GitHub!' 
          : 'Blog post created locally!';
        alert(message);
        router.push(`/blog/${formData.category ? formData.category + '/' : ''}${slug}`);
      } else {
        alert(`Error: ${result.error || 'Failed to create blog post'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while creating the blog post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card p-8">
          <h1 className="text-h2" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-xl)' }}>
            New Blog Post
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="text-label" style={{ 
                display: 'block', 
                marginBottom: 'var(--spacing-sm)', 
                color: 'var(--color-text-primary)' 
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
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="text-label" style={{ 
                display: 'block', 
                marginBottom: 'var(--spacing-sm)', 
                color: 'var(--color-text-primary)' 
              }}>
                Excerpt *
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                required
                rows={3}
                className="input-field"
                style={{ resize: 'vertical' }}
                placeholder="Brief description of the blog post"
              />
            </div>

            <div>
              <label htmlFor="content" className="text-label" style={{ 
                display: 'block', 
                marginBottom: 'var(--spacing-sm)', 
                color: 'var(--color-text-primary)' 
              }}>
                Content *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Start writing your blog post content..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)' 
                }}>
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">No Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="_new">+ Create New Category</option>
                </select>
                {formData.category === '_new' && (
                  <input
                    type="text"
                    name="category"
                    placeholder="Enter new category name"
                    className="input-field mt-2"
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  />
                )}
              </div>

              <div>
                <label htmlFor="tags" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)' 
                }}>
                  Tags
                </label>
                <TagInput
                  tags={formData.tags}
                  onChange={handleTagsChange}
                  placeholder="Add tags..."
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--spacing-lg)' }}>
              <h2 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                Author Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="author.name" className="text-label" style={{ 
                    display: 'block', 
                    marginBottom: 'var(--spacing-sm)', 
                    color: 'var(--color-text-primary)' 
                  }}>
                    Author Name *
                  </label>
                  <input
                    type="text"
                    id="author.name"
                    name="author.name"
                    value={formData.author.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="author.image" className="text-label" style={{ 
                    display: 'block', 
                    marginBottom: 'var(--spacing-sm)', 
                    color: 'var(--color-text-primary)' 
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
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="author.bio" className="text-label" style={{ 
                  display: 'block', 
                  marginBottom: 'var(--spacing-sm)', 
                  color: 'var(--color-text-primary)' 
                }}>
                  Author Bio
                </label>
                <textarea
                  id="author.bio"
                  name="author.bio"
                  value={formData.author.bio}
                  onChange={handleInputChange}
                  rows={2}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--spacing-lg)' }}>
              <h2 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                Featured Image
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="image" className="text-label" style={{ 
                    display: 'block', 
                    marginBottom: 'var(--spacing-sm)', 
                    color: 'var(--color-text-primary)' 
                  }}>
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="imageAlt" className="text-label" style={{ 
                    display: 'block', 
                    marginBottom: 'var(--spacing-sm)', 
                    color: 'var(--color-text-primary)' 
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
                  />
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--spacing-lg)' }}>
              <h2 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                SEO Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="seo.title" className="text-label" style={{ 
                    display: 'block', 
                    marginBottom: 'var(--spacing-sm)', 
                    color: 'var(--color-text-primary)' 
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
                  />
                </div>

                <div>
                  <label htmlFor="seo.description" className="text-label" style={{ 
                    display: 'block', 
                    marginBottom: 'var(--spacing-sm)', 
                    color: 'var(--color-text-primary)' 
                  }}>
                    SEO Description
                  </label>
                  <textarea
                    id="seo.description"
                    name="seo.description"
                    value={formData.seo.description}
                    onChange={handleInputChange}
                    rows={2}
                    className="input-field"
                    style={{ resize: 'vertical' }}
                    placeholder="Leave empty to use excerpt"
                  />
                </div>

                <div>
                  <label htmlFor="keywords" className="text-label" style={{ 
                    display: 'block', 
                    marginBottom: 'var(--spacing-sm)', 
                    color: 'var(--color-text-primary)' 
                  }}>
                    SEO Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="keywords"
                    value={formData.seo.keywords.join(', ')}
                    onChange={handleKeywordsChange}
                    className="input-field"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--spacing-lg)' }}>
              <h2 className="text-h3" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
                Post Settings
              </h2>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-body" style={{ color: 'var(--color-text-primary)' }}>Featured Post</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="draft"
                    checked={formData.draft}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-body" style={{ color: 'var(--color-text-primary)' }}>Save as Draft</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="excludeFromSearch"
                    checked={formData.excludeFromSearch}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-body" style={{ color: 'var(--color-text-primary)' }}>Exclude from Search Engines</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/admin/blog')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? 'Creating...' : 'Create Blog Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}