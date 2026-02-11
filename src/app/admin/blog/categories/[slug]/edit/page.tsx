'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { seoConfig } from '@/seo/seo.config';
import SlugChangeWarningModal from '@/components/admin/modals/SlugChangeWarningModal';
import PageSchemaEditor from '@/components/admin/seo/PageSchemaEditor';
import { PageSchema } from '@/components/admin/seo/schema-types';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminBanner from '@/components/admin/ui/AdminBanner';

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

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categorySlug = params.slug as string;
  
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
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalSlug, setOriginalSlug] = useState<string>('');
  const [hasPublishedPosts, setHasPublishedPosts] = useState(false);
  const [showSlugWarning, setShowSlugWarning] = useState(false);
  const [pendingSlug, setPendingSlug] = useState<string>('');
  const [isCircularRedirect, setIsCircularRedirect] = useState(false);

  useEffect(() => {
    fetchCategory();
  }, [categorySlug]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/admin/blog/categories/${categorySlug}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || '',
          slug: data.slug || categorySlug,
          description: data.description || '',
          seo: {
            title: data.seo?.title || '',
            description: data.seo?.description || '',
            keywords: data.seo?.keywords || []
          },
          schemas: data.schemas || []
        });
        setOriginalSlug(data.slug || categorySlug);
        setHasPublishedPosts(data.hasPublishedPosts || false);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      // Handle slug field specially to force lowercase
      if (name === 'slug') {
        // Just lowercase and remove invalid chars, but allow typing hyphens
        const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData(prev => ({
          ...prev,
          [name]: cleanSlug
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
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

  const handleSlugWarningConfirm = async (createRedirect: boolean) => {
    setShowSlugWarning(false);
    
    if (createRedirect && hasPublishedPosts) {
      try {
        // First, create redirect for the category page itself
        const categoryRedirectResponse = await fetch('/api/admin/redirects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: `/blog/${originalSlug}`,
            to: `/blog/${pendingSlug}`,
            permanent: true,
            createdAt: new Date().toISOString(),
            reason: 'Category slug changed'
          })
        });
        
        if (categoryRedirectResponse.ok) {
          const result = await categoryRedirectResponse.json();
          if (result.updatedChains && result.updatedChains > 0) {
            console.log(`Prevented redirect chains: Updated ${result.updatedChains} existing redirect(s) to point directly to the new category URL`);
          }
        }

        // Then, get all posts in this category and create redirects for them
        const response = await fetch(`/api/admin/blog/categories/${originalSlug}/posts`);
        if (response.ok) {
          const data = await response.json();
          const posts = data.posts || [];
          
          // Create redirects for each post
          for (const post of posts) {
            if (!post.draft && post.publishedAt) {
              await fetch('/api/admin/redirects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  from: `/blog/${originalSlug}/${post.slug}`,
                  to: `/blog/${pendingSlug}/${post.slug}`,
                  permanent: true,
                  createdAt: new Date().toISOString(),
                  reason: `Category slug changed from ${originalSlug} to ${pendingSlug}`
                })
              });
            }
          }
        }
      } catch (error) {
        console.error('Error creating redirects:', error);
      }
    }
    
    // Continue with saving
    await saveCategory();
  };

  const saveCategory = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/blog/categories/${categorySlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          originalSlug: originalSlug
        }),
      });

      if (response.ok) {
        router.push('/admin/blog/categories');
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || 'Failed to update category' });
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setErrors({ submit: 'Failed to update category' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if slug has changed and category has published posts
    if (hasPublishedPosts && formData.slug && formData.slug !== originalSlug) {
      // Check if this would create a circular redirect
      const oldUrl = `/blog/${originalSlug}`;
      const newUrl = `/blog/${formData.slug}`;
      
      try {
        const response = await fetch('/api/admin/redirects');
        if (response.ok) {
          const data = await response.json();
          const wouldBeCircular = data.redirects?.some((r: any) => 
            r.from === newUrl && r.to === oldUrl
          );
          setIsCircularRedirect(wouldBeCircular || false);
        }
      } catch (error) {
        console.error('Error checking redirects:', error);
        setIsCircularRedirect(false);
      }
      
      setPendingSlug(formData.slug);
      setShowSlugWarning(true);
      return;
    }

    await saveCategory();
  };

  if (isFetching) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="hidden md:block">
          <div className="skeleton" style={{ width: '200px', height: '36px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '280px', height: '18px' }} />
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ width: '80px', height: '36px', borderRadius: 'var(--radius-full)' }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-xl, 16px)' }} />
        <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-xl, 16px)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          Edit Category
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Editing: {formData.name || 'Untitled Category'}
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
                <div>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Technology"
                    style={errors.name ? { borderColor: 'var(--color-error)' } : undefined}
                  />
                  {errors.name && (
                    <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>{errors.name}</p>
                  )}
                </div>

                {/* Slug - 30% */}
                <div style={{ minWidth: 0 }}>
                  <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Slug *
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="input-field input-field-mono"
                    placeholder="category-slug"
                    style={errors.slug ? { borderColor: 'var(--color-error)' } : undefined}
                  />
                  {errors.slug && (
                    <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>{errors.slug}</p>
                  )}
                  {hasPublishedPosts && formData.slug !== originalSlug && (
                    <p className="text-sm mt-2" style={{ color: 'var(--color-warning)' }}>
                      Changing the slug will affect URLs of published posts in this category
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
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

              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
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
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  {formData.seo.title.length}/60 characters
                </p>
              </div>

              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
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
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  {formData.seo.description.length}/160 characters
                </p>
              </div>

              <div>
                <label className="text-label block mb-2" style={{ color: 'var(--color-text-primary)' }}>
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
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Separate keywords with commas
                </p>
              </div>
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
            {isLoading ? 'Updating...' : 'Update Category'}
          </AdminButton>
        </div>

      </form>

      {/* Slug Change Warning Modal */}
      <SlugChangeWarningModal
        isOpen={showSlugWarning}
        onClose={() => {
          setShowSlugWarning(false);
          setIsCircularRedirect(false);
        }}
        onConfirm={handleSlugWarningConfirm}
        oldSlug={originalSlug}
        newSlug={pendingSlug}
        isCircularRedirect={isCircularRedirect}
      />
    </div>
  );
}