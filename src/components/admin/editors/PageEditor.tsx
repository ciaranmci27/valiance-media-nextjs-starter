'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExclamationTriangleIcon,
  CodeBracketIcon,
  EyeIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { Page, PageSEOConfig } from '@/lib/pages/page-types';
import { Switch } from '@/components/admin/ui/Switch';
import SlugChangeWarningModal from '@/components/admin/modals/SlugChangeWarningModal';
import { generateSlug } from '@/lib/pages/page-utils-client';
import SocialMediaPreview from '@/components/admin/seo/SocialMediaPreview';
import PageSchemaEditor from '@/components/admin/seo/PageSchemaEditor';
import { PageSchema } from '@/lib/seo/schema-types';
import { seoConfig as globalSeoConfig } from '@/lib/seo/config';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminBanner from '@/components/admin/ui/AdminBanner';
import { TextInput, Textarea, Toggle, Combobox, Select } from '@/components/ui/inputs';
import type { ComboboxOption } from '@/components/ui/inputs/Combobox';
import { toast } from '@/components/ui/feedback';

interface PageEditorProps {
  initialPage?: Page;
  isNew?: boolean;
}

type TabId = 'content' | 'settings' | 'seo' | 'opengraph' | 'advanced' | 'schema';

export default function PageEditor({ initialPage, isNew = false }: PageEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showSlugWarning, setShowSlugWarning] = useState(false);
  const [pendingSlug, setPendingSlug] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('content');
  const [isEditingCode, setIsEditingCode] = useState(isNew);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState({
    category: 'general',
    featured: false
  });

  // SEO fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [robots, setRobots] = useState('index, follow');
  const [priority, setPriority] = useState(0.5);
  const [changefreq, setChangefreq] = useState<'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'>('monthly');
  const [excludeFromSitemap, setExcludeFromSitemap] = useState(false);
  const [excludeFromLlms, setExcludeFromLlms] = useState(false);
  const [schemas, setSchemas] = useState<PageSchema[]>([]);
  const [showOGPreview, setShowOGPreview] = useState(false);
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
  const [previousTitle, setPreviousTitle] = useState('');
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  // Fetch existing categories for the Combobox
  useEffect(() => {
    fetch('/api/admin/pages')
      .then(res => res.json())
      .then(data => {
        const cats: string[] = Array.from(
          new Set(
            (data.pages || [])
              .map((p: { category?: string }) => p.category)
              .filter((c: string | undefined) => typeof c === 'string' && c.trim() !== '')
          )
        );
        setExistingCategories(cats);
      })
      .catch(() => {});
  }, []);

  const categoryOptions: ComboboxOption[] = useMemo(() => {
    const presets = [
      'general', 'about', 'services', 'portfolio', 'case-studies', 'blog',
      'contact', 'legal', 'privacy', 'terms', 'resources', 'marketing',
      'sales', 'support', 'product', 'engineering', 'design', 'careers',
      'events', 'press', 'docs', 'faq', 'landing', 'feature', 'pricing',
      'testimonial', 'webinar', 'ebook', 'template',
    ];
    const all = Array.from(new Set([...presets, ...existingCategories])).sort();
    return all.map(c => ({
      value: c,
      label: c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    }));
  }, [existingCategories]);

  useEffect(() => {
    if (initialPage) {
      let pageTitle = initialPage.title || '';

      if (initialPage.seoConfig?.metadata?.adminTitle) {
        pageTitle = initialPage.seoConfig.metadata.adminTitle;
      } else if (initialPage.isClientComponent && !initialPage.seoConfig && initialPage.slug) {
        pageTitle = initialPage.slug
          .split('/')
          .map(part => part
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          )
          .join(' / ');
      }
      setTitle(pageTitle);
      setPreviousTitle(pageTitle);
      setSlug(initialPage.slug || '');
      setContent(initialPage.content || '');
      if (initialPage.seoConfig) {
        const config = initialPage.seoConfig;
        setMetadata({
          category: config.metadata?.category || 'general',
          featured: config.metadata?.featured || false
        });
        setSeoTitle(config.seo?.title || '');
        setSeoDescription(config.seo?.description || '');
        const keywords = config.seo?.keywords;
        if (Array.isArray(keywords)) {
          setSeoKeywords(keywords);
        } else if (typeof keywords === 'string') {
          setSeoKeywords((keywords as string).split(',').map(k => k.trim()).filter(k => k));
        } else {
          setSeoKeywords([]);
        }
        setCanonicalUrl(config.seo?.canonical || '');
        const indexPart = config.seo?.noIndex ? 'noindex' : 'index';
        const followPart = config.seo?.noFollow ? 'nofollow' : 'follow';
        setRobots(`${indexPart}, ${followPart}`);
        setPriority(config.sitemap?.priority || 0.5);
        setChangefreq(config.sitemap?.changeFrequency || 'monthly');
        setExcludeFromSitemap(config.sitemap?.exclude || false);
        setExcludeFromLlms(config.llms?.exclude || false);
        setSchemas(config.schemas || []);
      }

      if (initialPage.isClientComponent && ['seo', 'opengraph', 'schema', 'advanced'].includes(activeTab)) {
        setActiveTab('content');
      }
    }
  }, [initialPage]);

  useEffect(() => {
    if (isNew && title && !hasManuallyEditedSlug) {
      const generatedSlug = generateSlug(title);
      setSlug(generatedSlug);
    }
  }, [title, isNew, hasManuallyEditedSlug]);

  const handleSlugChange = (newSlug: string) => {
    if (initialPage?.slug !== 'home') {
      setSlug(newSlug);
      setHasManuallyEditedSlug(true);
    }
  };

  const confirmSlugChange = () => {
    setShowSlugWarning(false);
    performSave();
  };

  const cancelSlugChange = () => {
    setShowSlugWarning(false);
    setPendingSlug('');
  };

  const updateContentWithNewTitle = (oldTitle: string, newTitle: string, currentContent: string): string => {
    if (!oldTitle || !newTitle || !currentContent) return currentContent;

    let updatedContent = currentContent;

    const oldComponentName = oldTitle.replace(/[^a-zA-Z0-9]/g, '');
    const newComponentName = newTitle.replace(/[^a-zA-Z0-9]/g, '');
    if (oldComponentName && newComponentName) {
      const componentPattern = new RegExp(`function\\s+${oldComponentName}Page`, 'g');
      updatedContent = updatedContent.replace(componentPattern, `function ${newComponentName}Page`);
    }

    updatedContent = updatedContent.replace(
      new RegExp(`title:\\s*["'\`]${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'\`]`, 'g'),
      `title: "${newTitle}"`
    );

    updatedContent = updatedContent.replace(
      new RegExp(`name:\\s*["'\`]${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'\`]`, 'g'),
      `name: "${newTitle}"`
    );

    updatedContent = updatedContent.replace(
      new RegExp(`>\\s*${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<`, 'g'),
      `>${newTitle}<`
    );

    updatedContent = updatedContent.replace(
      new RegExp(`${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} page`, 'g'),
      `${newTitle} page`
    );

    return updatedContent;
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);

    if (!isNew && previousTitle && previousTitle !== newTitle && content) {
      const updatedContent = updateContentWithNewTitle(previousTitle, newTitle, content);
      setContent(updatedContent);
      setPreviousTitle(newTitle);
    }
  };

  const performSave = async () => {
    setSaving(true);
    try {
      const pageSlug: string = initialPage?.isHomePage ? 'home' : (slug || initialPage?.slug || '');

      const seoConfig: PageSEOConfig = {
        slug: pageSlug,
        seo: {
          title: seoTitle || `${title} - ${globalSeoConfig.siteName}`,
          description: seoDescription,
          keywords: seoKeywords,
          noIndex: robots.includes('noindex'),
          noFollow: robots.includes('nofollow'),
          canonical: canonicalUrl,
          image: ogImage
        },
        sitemap: {
          exclude: excludeFromSitemap || robots.includes('noindex'),
          priority: priority,
          changeFrequency: changefreq
        },
        llms: {
          exclude: excludeFromLlms || robots.includes('noindex')
        },
        metadata: {
          ...metadata,
          adminTitle: title,
          lastModified: new Date().toISOString().split('T')[0]
        },
        schemas: schemas
      };

      const endpoint = isNew
        ? '/api/admin/pages'
        : `/api/admin/pages/${encodeURIComponent(initialPage?.slug || '')}`;

      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug: pageSlug,
          content: initialPage?.isClientComponent && content === initialPage?.content
            ? undefined
            : content || undefined,
          seoConfig,
          newSlug: !isNew && slug !== initialPage?.slug ? slug : undefined
        }),
      });

      if (response.ok) {
        setSaving(false);
        router.replace('/admin/pages');
      } else {
        let errorMessage = 'Unknown error';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } else {
            errorMessage = `Server error (${response.status})`;
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          errorMessage = `Server error (${response.status})`;
        }
        console.error('Save failed:', errorMessage);
        setSaving(false);
        toast.error(`Failed to save page: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving page:', error);
      setSaving(false);
      toast.error('An error occurred while saving the page');
    }
  };

  const handleSave = async (e?: React.MouseEvent): Promise<void> => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (saving) return;

    if (!title?.trim()) {
      toast.warning('Please provide a title for the page');
      return;
    }

    if (!initialPage?.isHomePage && !slug?.trim()) {
      toast.warning('Please provide a slug for the page');
      return;
    }

    if (!isNew && slug !== initialPage?.slug && initialPage?.slug !== 'home') {
      setPendingSlug(slug);
      setShowSlugWarning(true);
      return;
    }

    performSave();
  };

  // Build tab list
  const tabs: { id: TabId; label: string }[] = [
    { id: 'content', label: 'Content' },
    ...(!initialPage?.isClientComponent ? [
      { id: 'seo' as TabId, label: 'SEO' },
      { id: 'opengraph' as TabId, label: 'Social' },
      { id: 'schema' as TabId, label: 'Schema' },
    ] : []),
    { id: 'settings', label: 'Settings' },
    ...(!initialPage?.isClientComponent ? [
      { id: 'advanced' as TabId, label: 'Advanced' },
    ] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-sm)' }}>
          {isNew ? 'Create New Page' : 'Edit Page'}
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          {isNew
            ? 'Set up your new page content, SEO, and settings'
            : initialPage?.isHomePage
              ? 'Editing the home page'
              : title || initialPage?.title || 'Untitled page'}
        </p>
      </div>

      {/* Dynamic Page Warning */}
      {initialPage?.isClientComponent && (
        <div className="pages-production-warning animate-fade-up">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" style={{ color: 'var(--color-warning)' }} />
          <div>
            <p style={{ color: 'var(--color-warning)', fontWeight: 600, fontSize: '14px', margin: 0 }}>
              Dynamic Page (Client Component)
            </p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', margin: 0 }}>
              This page uses client-side features and cannot use custom SEO metadata.
              SEO settings are disabled. The page will use default metadata from your root layout.
            </p>
          </div>
        </div>
      )}

      {/* Tab Pills */}
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

      {/* Content Tab */}
      {activeTab === 'content' && (
        <>
          {/* Title & Slug card */}
          <div className="dash-card animate-fade-up" style={{ animationDelay: '120ms' } as React.CSSProperties}>
            <div className="dash-card-header">
              <h2 className="dash-card-title">Page Details</h2>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}
                title={`/${initialPage?.isHomePage ? '' : (slug || 'page-url-slug')}`}>
                /{initialPage?.isHomePage ? '' : (slug || 'page-url-slug')}
              </span>
            </div>
            <div className="form-row form-row-70-30">
              {/* Title */}
              <TextInput
                label={initialPage?.isClientComponent ? 'Admin Title (Read-only)' : 'Admin Title'}
                description="CMS display name"
                value={title}
                onChange={(val) => handleTitleChange(val)}
                placeholder="Clean name for CMS display (e.g., 'Privacy Policy')"
                disabled={initialPage?.isHomePage || initialPage?.isClientComponent}
              />

              {/* Slug */}
              <div style={{ minWidth: 0 }}>
                {!initialPage?.isHomePage ? (
                  <TextInput
                    label={initialPage?.isClientComponent ? 'Page Slug (Read-only)' : 'Page Slug'}
                    value={slug}
                    onChange={(val) => handleSlugChange(val.toLowerCase().replace(/[^a-z0-9-\/]/g, '-'))}
                    placeholder="page-slug"
                    disabled={initialPage?.isClientComponent}
                    inputClassName="font-mono"
                  />
                ) : (
                  <TextInput
                    label="Page Slug"
                    value="home"
                    disabled
                    inputClassName="font-mono"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Code Editor card */}
          <div className="dash-card animate-fade-up" style={{ animationDelay: '180ms', padding: 0, overflow: 'hidden' } as React.CSSProperties}>
            <div className="dash-card-header" style={{ padding: '16px 20px', margin: 0 }}>
              <h2 className="dash-card-title">Page Content</h2>
              <button
                onClick={() => setIsEditingCode(!isEditingCode)}
                className={`pages-filter-pill ${isEditingCode ? 'active' : ''}`}
                style={{ margin: 0 }}
              >
                {isEditingCode ? (
                  <>
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                    Editing
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-3.5 h-3.5" />
                    Preview
                  </>
                )}
              </button>
            </div>
            <div style={{
              display: 'flex',
              borderTop: '1px solid var(--color-border-light)',
              background: isEditingCode || isNew ? 'var(--color-surface)' : '#1e1e1e',
              overflow: 'hidden',
            }}>
              {/* Line Numbers */}
              <div style={{
                padding: '12px 8px',
                background: isEditingCode || isNew ? 'var(--color-overlay-light)' : 'var(--color-gray-800)',
                borderRight: '1px solid var(--color-border-light)',
                userSelect: 'none',
                minWidth: '50px',
                textAlign: 'right',
                color: isEditingCode || isNew ? 'var(--color-text-tertiary)' : '#858585',
                fontSize: '13px',
                fontFamily: 'monospace',
                lineHeight: '1.5'
              }}>
                {content.split('\n').map((_, index) => (
                  <div key={index} style={{ height: '21px' }}>
                    {index + 1}
                  </div>
                ))}
              </div>
              {/* Code Editor */}
              <div style={{ flex: 1, position: 'relative' }}>
                {(isEditingCode || isNew) ? (
                  <Textarea
                    value={content}
                    onChange={(val) => setContent(val)}
                    placeholder="Paste or write your React component code here..."
                    rows={25}
                    resizable
                    spellCheck={false}
                    inputClassName="!border-none !bg-transparent !ring-0 !outline-none !shadow-none !rounded-none font-mono !text-[13px] !leading-[1.5] !min-h-[500px]"
                    className="!space-y-0"
                  />
                ) : (
                  <pre style={{
                    margin: 0,
                    padding: '12px',
                    fontSize: '13px',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
                    color: 'var(--color-text-tertiary)',
                    overflow: 'auto',
                    minHeight: '500px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre',
                    tabSize: 2
                  }}>
                    <code>{content || '// No code content yet'}</code>
                  </pre>
                )}
                {!isEditingCode && !isNew && !content && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: 'var(--color-text-tertiary)'
                  }}>
                    <CodeBracketIcon className="w-12 h-12" style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px', marginBottom: '8px' }}>No code content</p>
                    <p style={{ fontSize: '12px', opacity: 0.7 }}>Click &ldquo;Preview&rdquo; to switch to editing mode</p>
                  </div>
                )}
              </div>
            </div>
            {/* Code Editor Info Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 20px',
              borderTop: '1px solid var(--color-border-light)',
              fontSize: '12px',
              color: 'var(--color-text-tertiary)'
            }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span>Lines: {content.split('\n').length}</span>
                <span>Characters: {content.length}</span>
                <span>Size: {(new Blob([content]).size / 1024).toFixed(2)} KB</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{
                  padding: '2px 6px',
                  background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  color: 'var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500
                }}>
                  TSX
                </span>
                {(isEditingCode || isNew) && (
                  <span style={{ color: 'var(--color-warning)' }}>
                    ● Editing
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="dash-card animate-fade-up" style={{ animationDelay: '120ms' } as React.CSSProperties}>
          <div className="dash-card-header">
            <h2 className="dash-card-title">Page Settings</h2>
          </div>
          <div className="space-y-5">
            <Combobox
              label="Category"
              options={categoryOptions}
              value={metadata.category || ''}
              onChange={(val) => {
                setMetadata(prev => ({
                  ...prev,
                  category: val
                }));
              }}
              onBlur={() => {
                // Normalize on blur: lowercase, trim, replace spaces/underscores with hyphens
                if (metadata.category) {
                  const normalized = metadata.category.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');
                  setMetadata(prev => ({
                    ...prev,
                    category: normalized
                  }));
                }
              }}
              creatable
              placeholder="Select or type a category..."
            />

            <div
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-medium)' }}
            >
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Quick Access</span>
                <p className="text-xs mt-0.5 mb-0" style={{ color: 'var(--color-text-secondary)' }}>
                  Mark this page for easy access in the admin dashboard
                </p>
              </div>
              <Switch
                checked={!!metadata.featured}
                onChange={(checked) => setMetadata(prev => ({
                  ...prev,
                  featured: checked
                }))}
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
          <div className="space-y-5">
            <TextInput
              label="SEO Title"
              description={`${seoTitle.length}/60`}
              value={seoTitle}
              onChange={(val) => setSeoTitle(val)}
              maxLength={60}
              placeholder={title ? `${title} | ${globalSeoConfig.siteName}` : "Full SEO-optimized title for search results"}
            />

            <Textarea
              label="Meta Description"
              value={seoDescription}
              onChange={(val) => setSeoDescription(val)}
              rows={3}
              maxLength={160}
              placeholder="Brief description for search results"
            />

            <TextInput
              label="Keywords"
              description="Separate with commas"
              value={seoKeywords.join(', ')}
              onChange={(val) => setSeoKeywords(val.split(',').map(k => k.trim()).filter(k => k))}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </div>
      )}

      {/* Social / OpenGraph Tab */}
      {activeTab === 'opengraph' && (
        <div className="dash-card animate-fade-up" style={{ animationDelay: '120ms' } as React.CSSProperties}>
          <div className="dash-card-header">
            <h2 className="dash-card-title">Social Media Sharing</h2>
          </div>
          <div className="space-y-5">
            <TextInput
              label="OG Title"
              description="Falls back to SEO title"
              value={ogTitle}
              onChange={(val) => setOgTitle(val)}
              placeholder={seoTitle || title || "Title for social media"}
            />

            <Textarea
              label="OG Description"
              description="Falls back to meta description"
              value={ogDescription}
              onChange={(val) => setOgDescription(val)}
              rows={3}
              placeholder={seoDescription || "Description for social media"}
            />

            <div>
              <TextInput
                label="OG Image URL"
                description="1200x630px recommended"
                value={ogImage}
                onChange={(val) => setOgImage(val)}
                placeholder={`${globalSeoConfig.siteUrl || 'https://example.com'}/image.jpg`}
              />
              <div className="flex justify-end items-center mt-1">
                <Toggle
                  checked={showOGPreview}
                  onChange={(checked) => setShowOGPreview(checked)}
                  label="Show preview"
                  size="sm"
                />
              </div>
            </div>

            {showOGPreview && ogImage && (
              <div>
                <SocialMediaPreview
                  title={ogTitle || seoTitle || title}
                  description={ogDescription || seoDescription}
                  imageUrl={ogImage}
                  url={`/${slug || 'page'}`}
                  siteName={globalSeoConfig.siteName}
                />
              </div>
            )}

            <AdminBanner>
              <p>
                Open Graph tags control how your page appears when shared on social media platforms.
              </p>
            </AdminBanner>
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="dash-card animate-fade-up" style={{ animationDelay: '120ms' } as React.CSSProperties}>
          <div className="dash-card-header">
            <h2 className="dash-card-title">Advanced Settings</h2>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select
                label="Priority"
                value={String(priority)}
                onChange={(value) => setPriority(parseFloat(value))}
                description="Sitemap priority hint for search engines"
                options={[
                  { value: '1', label: '1.0 (Highest)' },
                  { value: '0.9', label: '0.9' },
                  { value: '0.8', label: '0.8' },
                  { value: '0.7', label: '0.7' },
                  { value: '0.6', label: '0.6' },
                  { value: '0.5', label: '0.5 (Default)' },
                  { value: '0.4', label: '0.4' },
                  { value: '0.3', label: '0.3' },
                  { value: '0.2', label: '0.2' },
                  { value: '0.1', label: '0.1 (Lowest)' },
                ]}
              />

              <Select
                label="Change Frequency"
                value={changefreq}
                onChange={(value) => setChangefreq(value as typeof changefreq)}
                description="How often the page content changes"
                options={[
                  { value: 'always', label: 'Always' },
                  { value: 'hourly', label: 'Hourly' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly' },
                  { value: 'never', label: 'Never' },
                ]}
              />
            </div>

            <div
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-medium)' }}
            >
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Exclude from Sitemap</span>
                <p className="text-xs mt-0.5 mb-0" style={{ color: 'var(--color-text-secondary)' }}>
                  Prevent this page from appearing in the sitemap.xml
                </p>
                {robots.includes('noindex') && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-warning)' }}>
                    Already excluded due to noindex setting
                  </p>
                )}
              </div>
              <Switch
                checked={excludeFromSitemap}
                onChange={setExcludeFromSitemap}
                disabled={robots.includes('noindex')}
              />
            </div>

            <div
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-medium)' }}
            >
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Exclude from AI Search (llms.txt)</span>
                <p className="text-xs mt-0.5 mb-0" style={{ color: 'var(--color-text-secondary)' }}>
                  Prevent this page from being listed in /llms.txt for AI answer engines
                </p>
                {robots.includes('noindex') && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-warning)' }}>
                    Already excluded due to noindex setting
                  </p>
                )}
              </div>
              <Switch
                checked={excludeFromLlms}
                onChange={setExcludeFromLlms}
                disabled={robots.includes('noindex')}
              />
            </div>

            <Select
              label="Robots Meta Tag"
              value={robots}
              onChange={(value) => setRobots(value)}
              description="Controls search engine crawling and indexing"
              options={[
                { value: 'index, follow', label: 'Index, Follow (Default)' },
                { value: 'index, nofollow', label: 'Index, No Follow' },
                { value: 'noindex, follow', label: 'No Index, Follow' },
                { value: 'noindex, nofollow', label: 'No Index, No Follow' },
              ]}
            />

            <TextInput
              label="Canonical URL"
              description="Leave empty for default"
              value={canonicalUrl}
              onChange={(val) => setCanonicalUrl(val)}
              type="url"
              placeholder={`${globalSeoConfig.siteUrl || 'https://example.com'}/${slug || 'page'}`}
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
          <div className="space-y-5">
            <PageSchemaEditor
              pageType="page"
              schemas={schemas}
              onChange={setSchemas}
              pageData={{
                title: seoTitle || title,
                description: seoDescription,
              }}
            />

            <AdminBanner>
              <p>
                Configure structured data schemas for this page. These help search engines understand
                your content and can enable rich snippets in search results.
              </p>
            </AdminBanner>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div
        className="flex items-center justify-end gap-3 pt-4 pb-2"
        style={{ borderTop: '1px solid var(--color-border-light)' }}
      >
        <AdminButton
          variant="secondary"
          onClick={() => router.push('/admin/pages')}
        >
          Cancel
        </AdminButton>

        <AdminButton
          onClick={(e) => handleSave(e)}
          disabled={saving}
          type="button"
        >
          {saving ? 'Saving...' : (isNew ? 'Create Page' : 'Save Changes')}
        </AdminButton>
      </div>

      {showSlugWarning && (
        <SlugChangeWarningModal
          isOpen={showSlugWarning}
          onClose={cancelSlugChange}
          onConfirm={(createRedirect) => {
            if (createRedirect) {
              console.log('Would create redirect for page slug change');
            }
            confirmSlugChange();
          }}
          oldSlug={initialPage?.slug || ''}
          newSlug={pendingSlug}
        />
      )}
    </div>
  );
}
