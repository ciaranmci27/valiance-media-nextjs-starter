'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { seoConfig } from '@/seo/seo.config';
import PageSchemaEditor from '@/components/admin/seo/PageSchemaEditor';
import { PageSchema } from '@/components/admin/seo/schema-types';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  schemas?: PageSchema[];
}

export default function NewCategoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  });
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'schema'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')  // Keep letters, numbers, and hyphens
      .replace(/-+/g, '-')           // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: generateSlug(value)
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

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords
      }
    }));
  };

  const applySEOTemplate = () => {
    if (!formData.name) {
      alert('Please enter a category name first before applying the SEO template.');
      return;
    }

    // Check if user has existing SEO content
    const hasExistingSEO = formData.seo.title || formData.seo.description || (formData.seo.keywords && formData.seo.keywords.length > 0);
    
    if (hasExistingSEO) {
      const confirmReplace = confirm(
        'You have existing SEO content that will be replaced by the template.\n\n' +
        'Current content:\n' +
        (formData.seo.title ? `Title: ${formData.seo.title}\n` : '') +
        (formData.seo.description ? `Description: ${formData.seo.description}\n` : '') +
        (formData.seo.keywords.length > 0 ? `Keywords: ${formData.seo.keywords.join(', ')}\n` : '') +
        '\nDo you want to continue and replace this content?'
      );
      
      if (!confirmReplace) {
        return;
      }
    }

    const siteName = (seoConfig as any).siteName || (seoConfig.openGraph as any)?.siteName || 'Your Site';
    
    // Use category template if available, otherwise use default
    const titleTemplate = seoConfig.titleTemplate || '{pageName} | {siteName}';
    const descTemplate = 'Browse articles in {pageName} category on {siteName}';
    
    // Replace variables with actual values
    const seoTitle = titleTemplate
      .replace('{pageName}', formData.name)
      .replace('{categoryName}', formData.name)
      .replace('{siteName}', siteName);

    const seoDescription = descTemplate
      .replace('{pageName}', formData.name)
      .replace('{categoryName}', formData.name)
      .replace('{siteName}', siteName);

    // Use the keywords from the SEO template configuration
    const seoKeywords = [] as string[];

    setFormData(prev => ({
      ...prev,
      seo: {
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords
      }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/blog/categories');
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || 'Failed to create category' });
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setErrors({ submit: 'Failed to create category' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
            Create New Category
          </h1>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          borderBottom: '1px solid var(--color-border-light)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              style={{
                padding: '12px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'general' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === 'general' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '-1px'
              }}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              style={{
                padding: '12px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'seo' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === 'seo' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '-1px'
              }}
            >
              SEO
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schema')}
              style={{
                padding: '12px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'schema' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === 'schema' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '-1px'
              }}
            >
              Schema
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* General Tab */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {/* Category Name and Slug Row - 70% / 30% split */}
              <div className="form-row form-row-70-30">
                {/* Category Name - 70% */}
                <div className="form-group">
                  <label className="form-label form-label-required">
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Technology"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Slug - 30% */}
                <div className="form-group" style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-xs)' }}>
                    <label className="form-label form-label-required" style={{ marginBottom: 0 }}>
                      Slug
                    </label>
                    <span style={{ 
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: 'var(--color-text-tertiary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={`/blog/${formData.slug || 'category-slug'}`}>
                      /blog/{formData.slug || 'category-slug'}
                    </span>
                  </div>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="input-field input-field-mono"
                    placeholder="category-slug"
                  />
                  {errors.slug && (
                    <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field"
                  placeholder="Brief description of this category..."
                />
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  You can apply the default category SEO template to quickly fill in the fields below.
                </p>
                <button
                  type="button"
                  onClick={applySEOTemplate}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm font-medium"
                >
                  Apply SEO Template
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">
                  SEO Title
                </label>
                <input
                  type="text"
                  id="seo.title"
                  name="seo.title"
                  value={formData.seo.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder={formData.name || "Category SEO title"}
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seo.title.length}/60 characters
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  SEO Description
                </label>
                <textarea
                  id="seo.description"
                  name="seo.description"
                  value={formData.seo.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                  placeholder={formData.description || "Category SEO description"}
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seo.description.length}/160 characters
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Keywords
                </label>
                <input
                  type="text"
                  id="keywords"
                  value={formData.seo.keywords.join(', ')}
                  onChange={handleKeywordsChange}
                  className="input-field"
                  placeholder="technology, tech news, software (comma-separated)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate keywords with commas
                </p>
              </div>
            </div>
          )}

          {/* Schema Tab */}
          {activeTab === 'schema' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Structured Data Schema</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Configure structured data schemas for this category page. These schemas help search engines understand 
                  your content and can enable rich snippets in search results.
                </p>
              </div>
              
              <PageSchemaEditor
                pageType="category"
                schemas={formData.schemas || []}
                onChange={(schemas) => setFormData(prev => ({ ...prev, schemas }))}
                pageData={{
                  title: formData.name,
                  description: formData.description,
                }}
              />
            </div>
          )}

          {/* Error message */}
          {errors.submit && (
            <div className="mt-6 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <p className="text-red-700 dark:text-red-300">{errors.submit}</p>
            </div>
          )}

        </form>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: '12px', 
          marginTop: 'var(--spacing-xl)',
          paddingTop: 'var(--spacing-lg)',
          borderTop: '1px solid var(--color-border-light)'
        }}>
          <button
            onClick={() => router.push('/admin/blog/categories')}
            className="btn btn-secondary"
            style={{
              padding: '12px 24px',
              fontSize: '16px'
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              padding: '12px 24px',
              fontSize: '16px'
            }}
            type="button"
          >
            {isLoading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
}