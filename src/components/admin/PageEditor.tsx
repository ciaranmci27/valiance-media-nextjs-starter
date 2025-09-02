'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Page, PageSEOConfig } from '@/lib/page-types';
import CategoryInput from '@/components/admin/CategoryInput';
import { Switch } from '@/components/admin/ui/Switch';
import SlugChangeWarningModal from '@/components/admin/SlugChangeWarningModal';
import { generateSlug } from '@/lib/page-utils-client';
import SocialMediaPreview from '@/components/admin/seo/SocialMediaPreview';
import PageSchemaEditor from '@/components/admin/seo/PageSchemaEditor';
import { PageSchema } from '@/components/admin/seo/schema-types';
import { seoConfig as globalSeoConfig } from '@/seo/seo.config';

interface PageEditorProps {
  initialPage?: Page;
  isNew?: boolean;
}

export default function PageEditor({ initialPage, isNew = false }: PageEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showSlugWarning, setShowSlugWarning] = useState(false);
  const [pendingSlug, setPendingSlug] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'seo' | 'opengraph' | 'advanced' | 'schema'>('content');
  const [isEditingCode, setIsEditingCode] = useState(isNew); // Edit mode for new pages, preview for existing
  
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
  const [schemas, setSchemas] = useState<PageSchema[]>([]);
  const [showOGPreview, setShowOGPreview] = useState(false);
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
  const [previousTitle, setPreviousTitle] = useState('');

  useEffect(() => {
    if (initialPage) {
      // For dynamic pages without SEO config, derive title from slug
      let pageTitle = initialPage.title || '';
      if (initialPage.isClientComponent && !initialPage.seoConfig && initialPage.slug) {
        // Convert slug to title case: "auth/sign-in" -> "Auth / Sign In"
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
        // Handle keywords as either string or array
        const keywords = config.seo?.keywords;
        if (Array.isArray(keywords)) {
          setSeoKeywords(keywords);
        } else if (typeof keywords === 'string') {
          setSeoKeywords((keywords as string).split(',').map(k => k.trim()).filter(k => k));
        } else {
          setSeoKeywords([]);
        }
        setCanonicalUrl(config.seo?.canonical || '');
        // Set robots based on noIndex and noFollow
        const indexPart = config.seo?.noIndex ? 'noindex' : 'index';
        const followPart = config.seo?.noFollow ? 'nofollow' : 'follow';
        setRobots(`${indexPart}, ${followPart}`);
        setPriority(config.sitemap?.priority || 0.5);
        setChangefreq(config.sitemap?.changeFrequency || 'monthly');
        setExcludeFromSitemap(config.sitemap?.exclude || false);
        setSchemas(config.schemas || []);
        // Note: ogTitle, ogDescription, ogImage would need to be added to PageSEOConfig if needed
      }
      
      // Reset active tab if on SEO tab but page is dynamic
      if (initialPage.isClientComponent && ['seo', 'opengraph', 'schema', 'advanced'].includes(activeTab)) {
        setActiveTab('content');
      }
    }
  }, [initialPage]);

  // Generate slug from title for new pages
  useEffect(() => {
    if (isNew && title && !hasManuallyEditedSlug) {
      const generatedSlug = generateSlug(title);
      setSlug(generatedSlug);
    }
  }, [title, isNew, hasManuallyEditedSlug]);

  const handleSlugChange = (newSlug: string) => {
    // Just update the slug without showing warning - warning will be shown on save
    if (initialPage?.slug !== 'home') {
      setSlug(newSlug);
      setHasManuallyEditedSlug(true); // Mark that user has manually edited the slug
    }
  };

  const confirmSlugChange = () => {
    setShowSlugWarning(false);
    // Continue with the save after confirmation
    performSave();
  };

  const cancelSlugChange = () => {
    setShowSlugWarning(false);
    setPendingSlug('');
  };

  // Update content when title changes
  const updateContentWithNewTitle = (oldTitle: string, newTitle: string, currentContent: string): string => {
    if (!oldTitle || !newTitle || !currentContent) return currentContent;
    
    let updatedContent = currentContent;
    
    // Update component name (e.g., function LetsSeePage() -> function NewTitlePage())
    const oldComponentName = oldTitle.replace(/[^a-zA-Z0-9]/g, '');
    const newComponentName = newTitle.replace(/[^a-zA-Z0-9]/g, '');
    if (oldComponentName && newComponentName) {
      const componentPattern = new RegExp(`function\\s+${oldComponentName}Page`, 'g');
      updatedContent = updatedContent.replace(componentPattern, `function ${newComponentName}Page`);
    }
    
    // Update title in SEO pageData
    updatedContent = updatedContent.replace(
      new RegExp(`title:\\s*["'\`]${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'\`]`, 'g'),
      `title: "${newTitle}"`
    );
    
    // Update title in breadcrumbs
    updatedContent = updatedContent.replace(
      new RegExp(`name:\\s*["'\`]${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'\`]`, 'g'),
      `name: "${newTitle}"`
    );
    
    // Update title in h1 tags
    updatedContent = updatedContent.replace(
      new RegExp(`>\\s*${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<`, 'g'),
      `>${newTitle}<`
    );
    
    // Update title in description and content
    updatedContent = updatedContent.replace(
      new RegExp(`${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} page`, 'g'),
      `${newTitle} page`
    );
    
    return updatedContent;
  };

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    
    // Update content if this is an existing page and the title has changed
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
      
      // Create complete SEO config
      const seoConfig: PageSEOConfig = {
        slug: pageSlug,
        seo: {
          title: seoTitle || `${title} - ${globalSeoConfig.siteName || 'Valiance Media'}`,
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
        metadata: {
          ...metadata,
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
          // For dynamic pages (client components), don't send content unless it's been modified
          content: initialPage?.isClientComponent && content === initialPage?.content 
            ? undefined  // Don't send unchanged content for dynamic pages
            : content || undefined, // Let the backend generate default content if empty
          seoConfig,
          newSlug: !isNew && slug !== initialPage?.slug ? slug : undefined
        }),
      });

      if (response.ok) {
        console.log('Page saved successfully, redirecting...');
        setSaving(false); // Reset saving state before navigation
        // Use router.replace for more reliable navigation
        router.replace('/admin/pages');
      } else {
        let errorMessage = 'Unknown error';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } else {
            // If not JSON, it's likely an HTML error page
            errorMessage = `Server error (${response.status})`;
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          errorMessage = `Server error (${response.status})`;
        }
        console.error('Save failed:', errorMessage);
        setSaving(false);
        alert(`Failed to save page: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving page:', error);
      setSaving(false);
      alert('An error occurred while saving the page');
    }
  };

  const handleSave = async (e?: React.MouseEvent): Promise<void> => {
    // Prevent default button behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Early return if already saving
    if (saving) {
      return;
    }

    // Validation
    if (!title?.trim()) {
      alert('Please provide a title for the page');
      return;
    }

    if (!initialPage?.isHomePage && !slug?.trim()) {
      alert('Please provide a slug for the page');
      return;
    }

    // Check if slug is changing for existing pages
    if (!isNew && slug !== initialPage?.slug && initialPage?.slug !== 'home') {
      setPendingSlug(slug);
      setShowSlugWarning(true);
      return; // Stop here, let the modal handle the rest
    }

    performSave();
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h1 className="text-h1" style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>
            {isNew ? 'Create New Page' : `Edit Page: ${initialPage?.isHomePage ? 'Home' : (initialPage?.title || '')}`}
          </h1>
        </div>

        {/* Dynamic Page Warning */}
        {initialPage?.isClientComponent && (
          <div style={{
            padding: 'var(--spacing-md)',
            background: 'rgba(251, 146, 60, 0.1)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-lg)',
            display: 'flex',
            gap: 'var(--spacing-sm)',
            alignItems: 'flex-start'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(251, 146, 60)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'rgb(251, 146, 60)', marginBottom: '4px' }}>
                Dynamic Page (Client Component)
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                This page uses client-side features (React hooks, event handlers, or browser APIs) and cannot use custom SEO metadata. 
                SEO settings are disabled for this page. The page will use default metadata from your root layout.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ 
          borderBottom: '1px solid var(--color-border-light)',
          marginBottom: 'var(--spacing-lg)',
          overflowX: 'auto',
          overflowY: 'hidden'
        }}>
          <div style={{ display: 'flex', gap: '20px', minWidth: 'min-content' }}>
            <button
              onClick={() => setActiveTab('content')}
              style={{
                padding: '12px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'content' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === 'content' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '500',
                marginBottom: '-1px',
                whiteSpace: 'nowrap'
              }}
            >
              Content
            </button>
            {!initialPage?.isClientComponent && (
              <>
                <button
                  onClick={() => setActiveTab('seo')}
                  style={{
                    padding: '12px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'seo' ? '2px solid var(--color-primary)' : '2px solid transparent',
                    color: activeTab === 'seo' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '500',
                    marginBottom: '-1px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  SEO
                </button>
                <button
                  onClick={() => setActiveTab('opengraph')}
                  style={{
                    padding: '12px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'opengraph' ? '2px solid var(--color-primary)' : '2px solid transparent',
                    color: activeTab === 'opengraph' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '500',
                    marginBottom: '-1px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Social
                </button>
                <button
                  onClick={() => setActiveTab('schema')}
                  style={{
                    padding: '12px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'schema' ? '2px solid var(--color-primary)' : '2px solid transparent',
                    color: activeTab === 'schema' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '500',
                    marginBottom: '-1px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Schema
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                padding: '12px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'settings' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === 'settings' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '500',
                marginBottom: '-1px',
                whiteSpace: 'nowrap'
              }}
            >
              Settings
            </button>
            {!initialPage?.isClientComponent && (
              <button
                onClick={() => setActiveTab('advanced')}
                style={{
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'advanced' ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: activeTab === 'advanced' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '500',
                  marginBottom: '-1px',
                  whiteSpace: 'nowrap'
                }}
              >
                Advanced
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Page Warning Banner */}
        {initialPage?.isClientComponent && (
          <div style={{
            padding: 'var(--spacing-md)',
            background: 'rgba(251, 146, 60, 0.1)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-md)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(251, 146, 60)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'rgb(234, 88, 12)' }}>
                Dynamic Page (Client Component)
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                This page uses client-side features and cannot use custom SEO metadata. 
                SEO settings are disabled. The page will use default metadata from root layout.
              </p>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {/* Title and Slug Row - 70% / 30% split */}
            <div className="form-row form-row-70-30">
              {/* Title - 70% */}
              <div className="form-group">
                <label className="form-label form-label-required">
                  Page Title {initialPage?.isClientComponent && 
                    <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                      (Read-only for dynamic pages)
                    </span>}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter page title"
                  disabled={initialPage?.isHomePage || initialPage?.isClientComponent}
                  className="input-field"
                  style={(initialPage?.isHomePage || initialPage?.isClientComponent) ? 
                    { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  title={initialPage?.isClientComponent ? 
                    'Dynamic pages derive their title from the slug' : ''}
                />
              </div>

              {/* Slug - 30% */}
              <div className="form-group" style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-xs)' }}>
                  <label className="form-label form-label-required" style={{ marginBottom: 0 }}>
                    Page Slug {initialPage?.isClientComponent && 
                      <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                        (Read-only)
                      </span>}
                  </label>
                  <span style={{ 
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: 'var(--color-text-tertiary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={`/${initialPage?.isHomePage ? '' : (slug || 'page-url-slug')}`}>
                    /{initialPage?.isHomePage ? '' : (slug || 'page-url-slug')}
                  </span>
                </div>
                {!initialPage?.isHomePage ? (
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-\/]/g, '-'))}
                    placeholder="page-slug or subdir/page-slug"
                    disabled={initialPage?.isClientComponent}
                    className="input-field input-field-mono"
                    style={initialPage?.isClientComponent ? 
                      { opacity: 0.6, cursor: 'not-allowed' } : {}}
                    title={initialPage?.isClientComponent ? 
                      'Dynamic pages cannot change their slug' : ''}
                  />
                ) : (
                  <input
                    type="text"
                    value="home"
                    disabled
                    className="input-field input-field-mono"
                    style={{ opacity: 0.6 }}
                  />
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div className="form-group">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 'var(--spacing-sm)'
              }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Page Content (React Component Code)
                </label>
                <button
                  onClick={() => setIsEditingCode(!isEditingCode)}
                  style={{
                    padding: '6px 12px',
                    background: isEditingCode ? 'var(--color-success)' : 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isEditingCode ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Editing Mode
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Preview Mode
                    </>
                  )}
                </button>
              </div>
              <div style={{
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
                background: isEditingCode || isNew ? 'var(--color-surface)' : '#1e1e1e',
                display: 'flex',
                overflow: 'hidden'
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
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Paste or write your React component code here..."
                      spellCheck={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        minHeight: '500px',
                        padding: '12px',
                        fontSize: '13px',
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--color-text-primary)',
                        resize: 'vertical',
                        outline: 'none',
                        lineHeight: '1.5',
                        tabSize: 2
                      }}
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
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.3, margin: '0 auto 12px' }}>
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      <p style={{ fontSize: '14px', marginBottom: '8px' }}>No code content</p>
                      <p style={{ fontSize: '12px', opacity: 0.7 }}>Click "Edit Code" to add content</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Code Editor Info Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border-light)',
                borderTop: 'none',
                borderRadius: '0 0 var(--radius-md) var(--radius-md)',
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
                    background: 'var(--color-blue-100)',
                    color: 'var(--color-primary)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: '500'
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
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '800px' }}>
            <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: 'var(--spacing-md)',
                color: 'var(--color-text-primary)'
              }}>
                Page Settings
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div className="form-group">
                  <label className="form-label">
                    Category
                  </label>
                  <CategoryInput
                    value={metadata.category || ''}
                    onChange={(val) => setMetadata(prev => ({
                      ...prev,
                      category: val
                    }))}
                    placeholder="Select or type a category…"
                  />
                </div>
                
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Switch
                      checked={!!metadata.featured}
                      onChange={(checked) => setMetadata(prev => ({
                        ...prev,
                        featured: checked
                      }))}
                    />
                    <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>Quick Access</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginLeft: '24px' }}>
                    Mark this page for easy access in the admin dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Basic SEO Tab */}
        {activeTab === 'seo' && (
          <div className="card p-6">
            <div className="space-y-6">
              <div>
                <label className="text-label block mb-2">Page Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="input-field"
                  maxLength={60}
                  placeholder={title || "Page title for search results"}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Displayed in search results and browser tabs
                  </p>
                  <p className={`text-xs ${seoTitle.length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                    {seoTitle.length}/60
                  </p>
                </div>
              </div>

              <div>
                <label className="text-label block mb-2">Meta Description</label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="input-field"
                  rows={3}
                  maxLength={160}
                  placeholder="Brief description for search results"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Shown in search results below the title
                  </p>
                  <p className={`text-xs ${seoDescription.length > 155 ? 'text-red-500' : 'text-gray-500'}`}>
                    {seoDescription.length}/160
                  </p>
                </div>
              </div>

              <div>
                <label className="text-label block mb-2">Keywords</label>
                <input
                  type="text"
                  value={seoKeywords.join(', ')}
                  onChange={(e) => setSeoKeywords(e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                  className="input-field"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated keywords (less important for modern SEO)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Open Graph & Social Tab */}
        {activeTab === 'opengraph' && (
          <div className="card p-6">
            <div className="space-y-6">
              <div className="p-4 bg-primary-50 dark:bg-primary-50 border border-primary-200 dark:border-gray-700 rounded-lg mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Open Graph tags control how your page appears when shared on social media platforms.
                </p>
              </div>

              <div>
                <label className="text-label block mb-2">OG Title</label>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  className="input-field"
                  placeholder={seoTitle || title || "Title for social media"}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use the SEO title
                </p>
              </div>

              <div>
                <label className="text-label block mb-2">OG Description</label>
                <textarea
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder={seoDescription || "Description for social media"}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use the meta description
                </p>
              </div>

              <div>
                <label className="text-label block mb-2">OG Image URL</label>
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Recommended: 1200x630px for best results
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOGPreview}
                      onChange={(e) => setShowOGPreview(e.target.checked)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary/50"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Show preview</span>
                  </label>
                </div>
              </div>

              {showOGPreview && ogImage && (
                <div className="mt-6">
                  <SocialMediaPreview
                    title={ogTitle || seoTitle || title}
                    description={ogDescription || seoDescription}
                    imageUrl={ogImage}
                    url={`/${slug || 'page'}`}
                    siteName="Your Site"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="card p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-label block mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(parseFloat(e.target.value))}
                    className="input-field"
                  >
                    <option value="1.0">1.0 (Highest)</option>
                    <option value="0.9">0.9</option>
                    <option value="0.8">0.8</option>
                    <option value="0.7">0.7</option>
                    <option value="0.6">0.6</option>
                    <option value="0.5">0.5 (Default)</option>
                    <option value="0.4">0.4</option>
                    <option value="0.3">0.3</option>
                    <option value="0.2">0.2</option>
                    <option value="0.1">0.1 (Lowest)</option>
                  </select>
                  <p className="text-xs mt-1 text-gray-500">
                    Sitemap priority hint for search engines
                  </p>
                </div>

                <div>
                  <label className="text-label block mb-2">Change Frequency</label>
                  <select
                    value={changefreq}
                    onChange={(e) => setChangefreq(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="always">Always</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="never">Never</option>
                  </select>
                  <p className="text-xs mt-1 text-gray-500">
                    How often the page content changes
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-label block">Exclude from Sitemap</label>
                  <p className="text-xs mt-1 text-gray-500">
                    Prevent this page from appearing in the sitemap.xml
                  </p>
                  {robots.includes('noindex') && (
                    <p className="text-xs mt-1 text-amber-600">
                      Note: Page is already excluded due to noindex setting
                    </p>
                  )}
                </div>
                <Switch
                  checked={excludeFromSitemap}
                  onChange={setExcludeFromSitemap}
                  disabled={robots.includes('noindex')}
                />
              </div>

              <div>
                <label className="text-label block mb-2">Robots Meta Tag</label>
                <select
                  value={robots}
                  onChange={(e) => setRobots(e.target.value)}
                  className="input-field"
                >
                  <option value="index, follow">Index, Follow (Default)</option>
                  <option value="index, nofollow">Index, No Follow</option>
                  <option value="noindex, follow">No Index, Follow</option>
                  <option value="noindex, nofollow">No Index, No Follow</option>
                </select>
                <p className="text-xs mt-1 text-gray-500">
                  Controls search engine crawling and indexing
                </p>
              </div>

              <div>
                <label className="text-label block mb-2">Canonical URL</label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  className="input-field"
                  placeholder={`https://example.com/${slug || 'page'}`}
                />
                <p className="text-xs mt-1 text-gray-500">
                  Specify the preferred URL for this content (leave empty for default)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Schema Tab */}
        {activeTab === 'schema' && (
          <div className="card p-6">
            <div className="space-y-6">
              <div className="p-4 bg-primary-50 dark:bg-primary-50 border border-primary-200 dark:border-gray-700 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Structured Data Schema</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Configure structured data schemas for this page. These schemas help search engines understand 
                  your content and can enable rich snippets in search results.
                </p>
              </div>
              
              <PageSchemaEditor
                pageType="page"
                schemas={schemas}
                onChange={setSchemas}
                pageData={{
                  title: seoTitle || title,
                  description: seoDescription,
                }}
              />
            </div>
          </div>
        )}

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
            onClick={() => router.push('/admin/pages')}
            className="btn btn-secondary"
            style={{
              padding: '12px 24px',
              fontSize: '16px'
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={(e) => handleSave(e)}
            disabled={saving}
            className="btn btn-primary"
            style={{
              padding: '12px 24px',
              fontSize: '16px'
            }}
            type="button"
          >
            {saving ? 'Saving...' : (isNew ? 'Create Page' : 'Save Changes')}
          </button>
        </div>
      </div>
      
      {showSlugWarning && (
        <SlugChangeWarningModal
          isOpen={showSlugWarning}
          onClose={cancelSlugChange}
          onConfirm={(createRedirect) => {
            if (createRedirect) {
              // Here you could add redirect creation logic if needed
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