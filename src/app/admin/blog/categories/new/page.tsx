'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { seoConfig } from '@/lib/seo/config';
import PageSchemaEditor from '@/components/admin/seo/PageSchemaEditor';
import { PageSchema } from '@/lib/seo/schema-types';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminBanner from '@/components/admin/ui/AdminBanner';
import { TextInput, Textarea } from '@/components/ui/inputs';
import { toast, useConfirmationDialog } from '@/components/ui/feedback';

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
  const { confirm: confirmAction, dialog } = useConfirmationDialog();
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

  const applySEOTemplate = async () => {
    if (!formData.name) {
      toast.warning('Please enter a category name first before applying the SEO template.');
      return;
    }

    // Check if user has existing SEO content
    const hasExistingSEO = formData.seo.title || formData.seo.description || (formData.seo.keywords && formData.seo.keywords.length > 0);

    if (hasExistingSEO) {
      const confirmReplace = await confirmAction({
        title: 'Replace SEO Content?',
        description: 'Your existing SEO title, description, and keywords will be overwritten by the template.',
        confirmLabel: 'Replace',
        variant: 'warning',
      });

      if (!confirmReplace) {
        return;
      }
    }

    const siteName = (seoConfig as any).siteName || (seoConfig.openGraph as any)?.siteName || seoConfig.siteName;
    
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
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          New Category
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Create a new blog category
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="pages-filter-bar animate-fade-up" style={{ animationDelay: '60ms' } as React.CSSProperties}>
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`pages-filter-pill ${activeTab === 'general' ? 'active' : ''}`}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`pages-filter-pill ${activeTab === 'seo' ? 'active' : ''}`}
        >
          SEO
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schema')}
          className={`pages-filter-pill ${activeTab === 'schema' ? 'active' : ''}`}
        >
          Schema
        </button>
      </div>

      <form onSubmit={handleSubmit}>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="dash-card animate-fade-up" style={{ animationDelay: '120ms' } as React.CSSProperties}>
            <div className="dash-card-header">
              <h2 className="dash-card-title">Category Details</h2>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}
                title={`/blog/${formData.slug || 'category-slug'}`}>
                /blog/{formData.slug || 'category-slug'}
              </span>
            </div>

            <div className="space-y-5">
              {/* Category Name and Slug Row - 70% / 30% split */}
              <div className="form-row form-row-70-30">
                {/* Category Name - 70% */}
                <TextInput
                  id="name"
                  name="name"
                  label="Category Name *"
                  value={formData.name}
                  onChange={(val) => handleInputChange({ target: { name: 'name', value: val } } as React.ChangeEvent<HTMLInputElement>)}
                  placeholder="e.g., Technology"
                  error={errors.name}
                />

                {/* Slug - 30% */}
                <div style={{ minWidth: 0 }}>
                  <TextInput
                    id="slug"
                    name="slug"
                    label="Slug *"
                    value={formData.slug}
                    onChange={(val) => handleInputChange({ target: { name: 'slug', value: val } } as React.ChangeEvent<HTMLInputElement>)}
                    placeholder="category-slug"
                    error={errors.slug}
                    inputClassName="font-mono"
                  />
                </div>
              </div>

              <Textarea
                id="description"
                name="description"
                label="Description"
                value={formData.description}
                onChange={(val) => handleInputChange({ target: { name: 'description', value: val } } as React.ChangeEvent<HTMLTextAreaElement>)}
                rows={4}
                placeholder="Brief description of this category..."
              />
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="dash-card animate-fade-up" style={{ animationDelay: '120ms' } as React.CSSProperties}>
            <div className="dash-card-header">
              <h2 className="dash-card-title">Search Engine Optimization</h2>
            </div>

            <div className="space-y-6">
              <AdminBanner>
                <div className="flex items-center justify-between gap-4">
                  <p className="mb-0">
                    You can apply the default category SEO template to quickly fill in the fields below.
                  </p>
                  <AdminButton
                    type="button"
                    size="sm"
                    onClick={applySEOTemplate}
                    className="shrink-0"
                  >
                    Apply SEO Template
                  </AdminButton>
                </div>
              </AdminBanner>

              <TextInput
                id="seo.title"
                name="seo.title"
                label="SEO Title"
                description={`${formData.seo.title.length}/60`}
                value={formData.seo.title}
                onChange={(val) => handleInputChange({ target: { name: 'seo.title', value: val } } as React.ChangeEvent<HTMLInputElement>)}
                placeholder={formData.name || "Category SEO title"}
                maxLength={60}
              />

              <Textarea
                id="seo.description"
                name="seo.description"
                label="SEO Description"
                value={formData.seo.description}
                onChange={(val) => handleInputChange({ target: { name: 'seo.description', value: val } } as React.ChangeEvent<HTMLTextAreaElement>)}
                rows={3}
                placeholder={formData.description || "Category SEO description"}
                maxLength={160}
              />

              <TextInput
                id="keywords"
                label="Keywords"
                description="Separate with commas"
                value={formData.seo.keywords.join(', ')}
                onChange={(val) => handleKeywordsChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>)}
                placeholder="technology, tech news, software"
              />
            </div>
          </div>
        )}

        {/* Schema Tab */}
        {activeTab === 'schema' && (
          <div className="dash-card animate-fade-up" style={{ animationDelay: '120ms' } as React.CSSProperties}>
            <div className="dash-card-header">
              <h2 className="dash-card-title">Structured Data Schema</h2>
            </div>

            <AdminBanner className="mb-4">
              <p className="mb-0">
                Configure structured data schemas for this category page. These schemas help search engines understand
                your content and can enable rich snippets in search results.
              </p>
            </AdminBanner>

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
          <AdminBanner variant="error" className="mt-6">
            <p>{errors.submit}</p>
          </AdminBanner>
        )}

        {/* Action Bar */}
        <div
          className="flex items-center justify-between pt-4 pb-2 mt-6"
          style={{ borderTop: '1px solid var(--color-border-light)' }}
        >
          <AdminButton
            variant="secondary"
            type="button"
            onClick={() => router.push('/admin/blog/categories')}
          >
            Cancel
          </AdminButton>

          <AdminButton
            onClick={handleSubmit}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? 'Creating...' : 'Create Category'}
          </AdminButton>
        </div>

      </form>
      {dialog}
    </div>
  );
}