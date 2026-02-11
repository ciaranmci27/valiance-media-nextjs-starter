'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/admin/editors/RichTextEditor';
import TagInputImproved from '@/components/admin/inputs/TagInputImproved';
import KeywordsInput from '@/components/admin/inputs/KeywordsInput';
import SocialMediaPreview from '@/components/admin/seo/SocialMediaPreview';
import UrlChangeWarningModal from '@/components/admin/modals/UrlChangeWarningModal';
import { getCMSConfig } from '@/lib/admin/cms-config';
import { seoConfig } from '@/seo/seo.config';
import { Switch } from '@/components/admin/ui/Switch';
import PageSchemaEditor from '@/components/admin/seo/PageSchemaEditor';
import { PageSchema } from '@/components/admin/seo/schema-types';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminBanner from '@/components/admin/ui/AdminBanner';
import { Select } from '@/components/admin/ui/Select';

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
  schemas?: PageSchema[];
}

interface BlogPostEditorProps {
  initialData?: BlogFormData;
  slug?: string;
  mode: 'create' | 'edit';
}

export default function BlogPostEditor({ initialData, slug, mode }: BlogPostEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('content');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [showFeaturedPreview, setShowFeaturedPreview] = useState(false);
  const [showSEOPreview, setShowSEOPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showSlugWarning, setShowSlugWarning] = useState(false);
  const [pendingSlug, setPendingSlug] = useState<string>('');
  const [originalSlug, setOriginalSlug] = useState<string>(slug || '');
  const [originalCategory, setOriginalCategory] = useState<string>(initialData?.category || '');
  const [pendingCategory, setPendingCategory] = useState<string>('');
  const [isCircularRedirect, setIsCircularRedirect] = useState(false);
  // Check if post is published based on initial data
  const isPublished = mode === 'edit' && initialData && !initialData.draft && !!initialData.publishedAt;

  const [formData, setFormData] = useState<BlogFormData>(initialData ?
    { ...initialData, slug: initialData.slug || slug || '' } : {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: {
      name: '',
      image: '',
      bio: ''
    },
    category: '',
    tags: [],
    image: '',
    imageAlt: '',
    featured: false,
    draft: false,
    excludeFromSearch: false,
    seo: {
      title: '',
      description: '',
      keywords: [],
      image: ''
    },
    schemas: []
  });

  // Tab configuration
  const tabs = [
    { id: 'content', label: 'Content' },
    { id: 'media', label: 'Featured Image' },
    { id: 'seo', label: 'SEO & Social' },
    { id: 'schema', label: 'Schema' },
    { id: 'author', label: 'Author' },
    { id: 'settings', label: 'Settings' },
  ];

  useEffect(() => {
    fetchCategories();
    // SEO fields are now manually filled via the "Apply SEO Template" button
  }, []);

  // SEO fields are now manually filled via the "Apply SEO Template" button
  // Users must explicitly click the button to populate SEO fields

  const applySEOTemplate = () => {
    if (!formData.title) {
      alert('Please enter a title first before applying the SEO template.');
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
    const siteTagline = (seoConfig as any).siteTagline || '';
    const titleTemplate = seoConfig.titleTemplate || '{pageName} | {siteName}';

    // Replace variables with actual values
    const seoTitle = titleTemplate
      .replace('{pageName}', formData.title)
      .replace('{siteName}', siteName)
      .replace('{siteTagline}', siteTagline);

    // Use excerpt as description if available, otherwise use the template description
    const configFull = seoConfig as any;
    const seoDescription = formData.excerpt || configFull.defaultDescription?.replace('{pageName}', formData.title).replace('{siteName}', siteName).replace('{siteTagline}', siteTagline) || `Read our article about ${formData.title}`;

    // Use the keywords from the SEO template configuration
    const blogPostKeywords = configFull.defaultKeywords || [];

    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        title: seoTitle,
        description: seoDescription,
        keywords: blogPostKeywords
      }
    }));
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/blog/categories/list');
      const data = await response.json();
      setCategories(data.categories?.map((cat: any) => cat.slug) || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    }
    // Check if content has actual text (not just HTML tags)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formData.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    if (!textContent.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Force lowercase for image URLs and SEO image fields
    const imageFields = ['image', 'imageAlt', 'seo.image', 'author.image'];
    const processedValue = imageFields.includes(name) ? value.toLowerCase() : value;

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
          [child]: processedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getSlugPreview = () => {
    const slug = formData.slug || (mode === 'create' ? generateSlug(formData.title) : '');
    if (formData.category && formData.category !== '') {
      return `/blog/${formData.category}/${slug}`;
    }
    return `/blog/${slug}`;
  };

  const handleContentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
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

  const handleSlugChange = (newSlug: string) => {
    // Force lowercase for slugs
    const lowercaseSlug = newSlug.toLowerCase();

    // Always update the form data to allow typing
    setFormData(prev => ({ ...prev, slug: lowercaseSlug }));
  };

  const handleSlugWarningConfirm = async (createRedirect: boolean) => {
    if (createRedirect) {
      // Add redirect to the redirects config
      try {
        // Determine the old and new URLs based on what changed
        const fromUrl = originalCategory
          ? `/blog/${originalCategory}/${originalSlug}`
          : `/blog/${originalSlug}`;
        const toUrl = (pendingCategory || formData.category)
          ? `/blog/${pendingCategory || formData.category}/${pendingSlug || formData.slug}`
          : `/blog/${pendingSlug || formData.slug}`;

        const response = await fetch('/api/admin/redirects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromUrl,
            to: toUrl,
            permanent: true,
            createdAt: new Date().toISOString(),
            reason: 'Blog post slug changed'
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.action === 'removed_circular') {
            console.log('Removed circular redirect:', result.removedRedirect);
          } else if (result.updatedChains && result.updatedChains > 0) {
            console.log(`Prevented redirect chains: Updated ${result.updatedChains} existing redirect(s) to point directly to the new URL`);
          }
        } else {
          console.error('Failed to create redirect');
        }
      } catch (error) {
        console.error('Error creating redirect:', error);
      }
    }

    // Close the modal
    setShowSlugWarning(false);

    // IMPORTANT: Update formData with the new slug before saving
    setFormData(prev => ({ ...prev, slug: pendingSlug }));

    // Now perform the save with the updated slug
    // Use setTimeout to ensure state update happens first
    setTimeout(() => {
      // Update the original slug AFTER saving to prevent future warnings
      setOriginalSlug(pendingSlug);
      setPendingSlug('');
      performSave();
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Find the first tab with an error and switch to it
      if (errors.title || errors.excerpt || errors.content) {
        setActiveTab('content');
      }
      return;
    }

    // Check if slug OR category changed for existing posts (both published and drafts)
    const slugChanged = mode === 'edit' && formData.slug && formData.slug !== originalSlug;
    const categoryChanged = mode === 'edit' && formData.category !== originalCategory;

    if (slugChanged || categoryChanged) {
      console.log('Slug or category changed, showing warning modal');
      console.log('Original slug:', originalSlug, 'New slug:', formData.slug);
      console.log('Original category:', originalCategory, 'New category:', formData.category);

      // Check if this would create a circular redirect
      const oldUrl = originalCategory
        ? `/blog/${originalCategory}/${originalSlug}`
        : `/blog/${originalSlug}`;
      const newUrl = formData.category
        ? `/blog/${formData.category}/${formData.slug}`
        : `/blog/${formData.slug}`;

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

      setPendingSlug(formData.slug || originalSlug || '');
      setPendingCategory(formData.category);
      setShowSlugWarning(true);
      return; // Stop here, let the modal handle the rest
    }

    performSave();
  };

  const performSave = async () => {
    setIsLoading(true);
    setSaveStatus('saving');

    try {
      const endpoint = '/api/admin/blog-post';

      const method = mode === 'create' ? 'POST' : 'PUT';

      const postSlug = formData.slug || (mode === 'create' ? generateSlug(formData.title) : originalSlug);

      // Only set publishedAt if not a draft
      const postData: any = {
        ...formData,
        slug: postSlug,
        readingTime: Math.ceil(formData.content.split(/\s+/).length / 200)
      };

      // Add original slug/category info for PUT requests (needed to delete old file if slug/category changed)
      if (mode === 'edit') {
        postData.originalSlug = originalSlug;
        postData.originalCategory = originalCategory;
      }

      // Only set publishedAt for non-draft posts
      if (!formData.draft) {
        postData.publishedAt = initialData?.publishedAt || new Date().toISOString();
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        setSaveStatus('saved');
        // Show success message based on draft status
        const message = formData.draft
          ? 'Post saved as draft successfully!'
          : 'Post published successfully!';
        console.log(message, postData);
        setTimeout(() => {
          router.push('/admin/blog');
        }, 1500);
      } else {
        setSaveStatus('error');
        const error = await response.json();
        console.error('Error saving post:', error);
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Find the first tab with an error and switch to it
      if (errors.title || errors.excerpt || errors.content) {
        setActiveTab('content');
      }
      return;
    }

    setIsLoading(true);
    setSaveStatus('saving');

    try {
      const endpoint = '/api/admin/blog-post';

      const method = mode === 'create' ? 'POST' : 'PUT';

      const postSlug = formData.slug || (mode === 'create' ? generateSlug(formData.title) : originalSlug);

      // Force draft to true for save as draft
      const postData: any = {
        ...formData,
        draft: true, // Always true when saving as draft
        slug: postSlug,
        readingTime: Math.ceil(formData.content.split(/\s+/).length / 200)
      };

      // Add original slug/category info for PUT requests (needed to delete old file if slug/category changed)
      if (mode === 'edit') {
        postData.originalSlug = originalSlug;
        postData.originalCategory = originalCategory;
      }

      // Don't set publishedAt for drafts
      // Keep existing publishedAt if it exists (for unpublishing)

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        setSaveStatus('saved');
        console.log('Post saved as draft successfully!', postData);
        setTimeout(() => {
          router.push('/admin/blog');
        }, 1500);
      } else {
        setSaveStatus('error');
        const error = await response.json();
        console.error('Error saving post:', error);
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Required fields
    if (formData.title) completed++;
    total++;

    if (formData.excerpt) completed++;
    total++;

    if (formData.content) completed++;
    total++;

    // Optional but recommended
    if (formData.image && formData.image !== '/logos/horizontal-logo.png') completed++;
    total++;

    if (formData.category) completed++;
    total++;

    if (formData.tags.length > 0) completed++;
    total++;

    if (formData.seo.description || formData.excerpt) completed++;
    total++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          {mode === 'create' ? 'New Blog Post' : 'Edit Blog Post'}
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          {mode === 'create'
            ? 'Write and publish a new blog post'
            : `Editing: ${formData.title || 'Untitled Post'}`}
          <span
            className="inline-flex items-center ml-3 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
              color: 'var(--color-primary)',
            }}
          >
            {completionPercentage}% complete
          </span>
        </p>
      </div>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <AdminBanner
          variant={saveStatus === 'saving' ? 'info' : saveStatus === 'saved' ? 'success' : 'error'}
          className="animate-fade-up"
        >
          <p className="text-sm font-medium">
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Post saved successfully! Redirecting...'}
            {saveStatus === 'error' && 'Error saving post. Please try again.'}
          </p>
        </AdminBanner>
      )}

      {/* Tab Navigation */}
      <div className="pages-filter-bar animate-fade-up" style={{ animationDelay: '60ms' } as React.CSSProperties}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pages-filter-pill ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form wraps all tab content */}
      <form onSubmit={handleSubmit}>
        {/* Content Tab */}
        {activeTab === 'content' && (
          <>
            {/* Post Details Card */}
            <div className="dash-card animate-fade-up" style={{ animationDelay: '120ms' } as React.CSSProperties}>
              <div className="dash-card-header">
                <h2 className="dash-card-title">Post Details</h2>
                <span
                  style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}
                  title={getSlugPreview()}
                >
                  {getSlugPreview()}
                </span>
              </div>

              <div className="space-y-6">
                {/* Title, Category, and Slug Row */}
                <div className="grid grid-cols-1 lg:grid-cols-[5fr_2fr_3fr] gap-4">
                  {/* Title Field */}
                  <div>
                    <label htmlFor="title" className="text-label block mb-2">
                      Post Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="input-field"
                      style={errors.title ? { borderColor: 'var(--color-error)' } : undefined}
                      placeholder="Enter a compelling title"
                    />
                    {errors.title && (
                      <p className="text-sm mt-1" style={{ color: 'var(--color-error, #EF4444)' }}>{errors.title}</p>
                    )}
                  </div>

                  {/* Category Field */}
                  <Select
                    label="Category"
                    id="category"
                    value={formData.category}
                    onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    placeholder="No Category"
                    options={categories.map(cat => ({
                      value: cat,
                      label: cat.split('-').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' '),
                    }))}
                  />

                  {/* Slug Field */}
                  <div className="min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <label htmlFor="slug" className="text-label whitespace-nowrap shrink-0">
                        Post Slug *
                      </label>
                      <span
                        className="text-xs font-mono block flex-1 min-w-0 truncate max-w-[140px] sm:max-w-[220px] md:max-w-[280px]"
                        style={{ color: 'var(--color-text-tertiary)' }}
                        title={getSlugPreview()}
                      >
                        {getSlugPreview()}
                      </span>
                    </div>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug || (mode === 'create' ? generateSlug(formData.title) : '')}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="input-field font-mono w-full"
                      style={errors.slug ? { borderColor: 'var(--color-error)' } : undefined}
                      placeholder="enter-post-slug"
                    />
                  </div>
                </div>

                {/* Excerpt and Tags Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="excerpt" className="text-label">
                        Excerpt *
                      </label>
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {formData.excerpt.length}/200
                      </span>
                    </div>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows={3}
                      className="input-field"
                      style={errors.excerpt ? { borderColor: 'var(--color-error)' } : undefined}
                      placeholder="Write a brief summary that will appear in blog listings"
                    />
                    {errors.excerpt && (
                      <p className="text-sm mt-1" style={{ color: 'var(--color-error, #EF4444)' }}>{errors.excerpt}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-label block mb-2">
                      Tags
                    </label>
                    <TagInputImproved
                      tags={formData.tags}
                      onChange={handleTagsChange}
                      placeholder="Type to search or add tags..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Editor Card */}
            <div className="dash-card animate-fade-up mt-6" style={{ animationDelay: '180ms' } as React.CSSProperties}>
              <div className="dash-card-header">
                <h2 className="dash-card-title">Content *</h2>
              </div>

              <div>
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Start writing your blog post content..."
                />
                {errors.content && (
                  <p className="text-sm mt-1" style={{ color: 'var(--color-error, #EF4444)' }}>{errors.content}</p>
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Estimated reading time: {Math.ceil(formData.content.split(/\s+/).length / 200)} min
                </p>
              </div>
            </div>
          </>
        )}

        {/* Featured Image Tab */}
        {activeTab === 'media' && (
          <div className="dash-card animate-fade-up" style={{ animationDelay: '120ms' } as React.CSSProperties}>
            <div className="dash-card-header">
              <h2 className="dash-card-title">Featured Image</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="image" className="text-label block mb-2">
                    Image URL
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="/images/featured.jpg or https://example.com/image.jpg"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs mb-0" style={{ color: 'var(--color-text-tertiary)' }}>Recommended: 1200x630px</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Show preview</span>
                        <Switch
                          checked={showFeaturedPreview}
                          onChange={setShowFeaturedPreview}
                          size="sm"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="imageAlt" className="text-label block mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    id="imageAlt"
                    name="imageAlt"
                    value={formData.imageAlt}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Describe the image for accessibility"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    Important for SEO and accessibility
                  </p>
                </div>
              </div>

              {showFeaturedPreview && formData.image && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-label mb-4">Featured Image Preview</h4>
                    <img
                      src={formData.image}
                      alt={formData.imageAlt || `${seoConfig.siteName} blog featured image`}
                      className="w-full rounded-lg shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/logos/horizontal-logo.png';
                      }}
                    />
                  </div>
                </div>
              )}

              <AdminBanner>
                <p>
                  <strong>Tip:</strong> Use high-quality images that relate to your content.
                  The featured image appears in blog listings and social media shares.
                </p>
              </AdminBanner>
            </div>
          </div>
        )}

        {/* SEO & Social Tab */}
        {activeTab === 'seo' && (
          <div className="dash-card animate-fade-up" style={{ animationDelay: '120ms' } as React.CSSProperties}>
            <div className="dash-card-header">
              <h2 className="dash-card-title">Search Engine Optimization</h2>
            </div>

            <div className="space-y-6">
              <AdminBanner>
                <div className="flex items-center justify-between gap-4">
                  <p className="mb-0">
                    {mode === 'create'
                      ? 'You can apply the default blog post SEO template to quickly fill in the fields below.'
                      : 'Apply the SEO template to replace current SEO fields with template values.'}
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

              <div className="space-y-4">
                <div>
                  <label htmlFor="seo.title" className="text-label block mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    id="seo.title"
                    name="seo.title"
                    value={formData.seo.title}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={formData.title || "Leave empty to use post title"}
                    maxLength={60}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    {(formData.seo.title || formData.title).length}/60 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="seo.description" className="text-label block mb-2">
                    SEO Description
                  </label>
                  <textarea
                    id="seo.description"
                    name="seo.description"
                    value={formData.seo.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="input-field"
                    placeholder={formData.excerpt || "Leave empty to use excerpt"}
                    maxLength={160}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    {(formData.seo.description || formData.excerpt).length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="text-label block mb-2">
                    SEO Keywords
                  </label>
                  {typeof window !== 'undefined' && (
                    <KeywordsInput
                      keywords={formData.seo.keywords}
                      onChange={handleKeywordsChange}
                      placeholder="Add SEO keywords..."
                    />
                  )}
                </div>

                <div>
                  <label htmlFor="seo.image" className="text-label block mb-2">
                    Social Media Image
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      id="seo.image"
                      name="seo.image"
                      value={formData.seo.image}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Leave empty to use featured image"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Recommended: 1200x630px for best results</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Show preview</span>
                        <Switch
                          checked={showSEOPreview}
                          onChange={setShowSEOPreview}
                          size="sm"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {showSEOPreview && (formData.seo.image || formData.image) && (
                <div>
                  <SocialMediaPreview
                    title={formData.seo.title || formData.title}
                    description={formData.seo.description || formData.excerpt}
                    imageUrl={(() => {
                      const image = formData.seo.image || formData.image;
                      if (!image) return '';
                      if (image.startsWith('http')) return image;
                      const currentOrigin = typeof window !== 'undefined'
                        ? window.location.origin
                        : '';
                      return `${currentOrigin}${image}`;
                    })()}
                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}/blog/${slug || generateSlug(formData.title)}`}
                    siteName={seoConfig.siteName}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schema Tab */}
        {activeTab === 'schema' && (
          <div className="dash-card animate-fade-up" style={{ animationDelay: '120ms' } as React.CSSProperties}>
            <div className="dash-card-header">
              <h2 className="dash-card-title">Structured Data Schema</h2>
            </div>

            <div className="space-y-5">
              <PageSchemaEditor
                pageType="blogPost"
                schemas={formData.schemas || []}
                onChange={(schemas) => setFormData(prev => ({ ...prev, schemas }))}
                pageData={{
                  title: formData.title,
                  description: formData.excerpt,
                  author: formData.author.name,
                  publishedAt: formData.publishedAt,
                  modifiedAt: new Date().toISOString(),
                  image: formData.image,
                  category: formData.category
                }}
              />

              <AdminBanner>
                <p>
                  Configure structured data schemas to enhance how your content appears in search results.
                  These schemas help search engines better understand your content and can enable rich snippets.
                </p>
              </AdminBanner>
            </div>
          </div>
        )}

        {/* Author Tab */}
        {activeTab === 'author' && (
          <div className="dash-card animate-fade-up" style={{ animationDelay: '120ms' } as React.CSSProperties}>
            <div className="dash-card-header">
              <h2 className="dash-card-title">Author Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="author.name" className="text-label block mb-2">
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
                />
              </div>

              <div>
                <label htmlFor="author.image" className="text-label block mb-2">
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
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="author.bio" className="text-label block mb-2">
                  Author Bio
                </label>
                <textarea
                  id="author.bio"
                  name="author.bio"
                  value={formData.author.bio}
                  onChange={handleInputChange}
                  rows={2}
                  className="input-field"
                  placeholder="Brief author biography..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="dash-card animate-fade-up" style={{ animationDelay: '120ms' } as React.CSSProperties}>
            <div className="dash-card-header">
              <h2 className="dash-card-title">Post Settings</h2>
            </div>

            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-medium)' }}
              >
                <div>
                  <label className="text-label" style={{ color: 'var(--color-text-primary)' }}>
                    Featured Post
                  </label>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    Display this post prominently on the homepage
                  </p>
                </div>
                <Switch
                  checked={formData.featured}
                  onChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-medium)' }}
              >
                <div>
                  <label className="text-label" style={{ color: 'var(--color-text-primary)' }}>
                    {mode === 'edit' && !initialData?.draft ? 'Unpublish to Draft' : 'Save as Draft'}
                  </label>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    {mode === 'edit' && !initialData?.draft
                      ? 'Move this published post back to draft status'
                      : 'Post will not be published publicly'}
                  </p>
                </div>
                <Switch
                  checked={formData.draft}
                  onChange={(checked) => setFormData(prev => ({ ...prev, draft: checked }))}
                />
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-medium)' }}
              >
                <div>
                  <label className="text-label" style={{ color: 'var(--color-text-primary)' }}>
                    Exclude from Search
                  </label>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    Hide this post from search engines
                  </p>
                </div>
                <Switch
                  checked={formData.excludeFromSearch}
                  onChange={(checked) => setFormData(prev => ({ ...prev, excludeFromSearch: checked }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div
          className="flex items-center justify-between pt-4 pb-2 mt-6"
          style={{ borderTop: '1px solid var(--color-border-light)' }}
        >
          <AdminButton
            variant="secondary"
            type="button"
            onClick={() => router.push('/admin/blog')}
          >
            Cancel
          </AdminButton>

          <div className="flex gap-3">
            <AdminButton
              variant="secondary"
              type="button"
              onClick={handleSaveDraft}
              disabled={isLoading}
            >
              Save as Draft
            </AdminButton>
            <AdminButton
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Publishing...' : (mode === 'create' ? 'Publish Post' : 'Update Post')}
            </AdminButton>
          </div>
        </div>
      </form>

      {/* URL Change Warning Modal */}
      <UrlChangeWarningModal
        isOpen={showSlugWarning}
        onClose={() => {
          setShowSlugWarning(false);
          setPendingSlug('');
          setPendingCategory('');
          setIsCircularRedirect(false);
        }}
        onConfirm={handleSlugWarningConfirm}
        oldUrl={originalCategory ? `/blog/${originalCategory}/${originalSlug}` : `/blog/${originalSlug}`}
        newUrl={formData.category ? `/blog/${formData.category}/${formData.slug}` : `/blog/${formData.slug}`}
        changeType={
          formData.slug !== originalSlug && formData.category !== originalCategory ? 'both' :
          formData.slug !== originalSlug ? 'slug' : 'category'
        }
        isCircularRedirect={isCircularRedirect}
      />
    </div>
  );
}
