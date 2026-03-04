'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { seoConfig } from '@/lib/seo/config';
import SlugChangeWarningModal from '@/components/admin/modals/SlugChangeWarningModal';
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

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categorySlug = params.slug as string;
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
                  {hasPublishedPosts && formData.slug !== originalSlug && (
                    <p className="text-sm mt-2" style={{ color: 'var(--color-warning)' }}>
                      Changing the slug will affect URLs of published posts in this category
                    </p>
                  )}
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
            {isLoading ? 'Updating...' : 'Update Category'}
          </AdminButton>
        </div>

      </form>

      {/* Slug Change Warning Modal */}
      {dialog}

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