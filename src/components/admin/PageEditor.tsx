'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Page, PageSEOConfig } from '@/lib/page-types';
import CategoryInput from '@/components/admin/CategoryInput';
import { Switch } from '@/components/admin/ui/Switch';
import SlugChangeWarningModal from '@/components/admin/SlugChangeWarningModal';
import { generateSlug } from '@/lib/page-utils-client';

interface PageEditorProps {
  initialPage?: Page;
  isNew?: boolean;
}

export default function PageEditor({ initialPage, isNew = false }: PageEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showSlugWarning, setShowSlugWarning] = useState(false);
  const [pendingSlug, setPendingSlug] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');
  const [isEditingCode, setIsEditingCode] = useState(true); // Default to editing mode for better UX
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState({
    category: 'general',
    featured: false
  });
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
  const [previousTitle, setPreviousTitle] = useState('');

  useEffect(() => {
    if (initialPage) {
      setTitle(initialPage.title || '');
      setPreviousTitle(initialPage.title || '');
      setSlug(initialPage.slug || '');
      setContent(initialPage.content || '');
      if (initialPage.seoConfig?.metadata) {
        setMetadata({
          category: initialPage.seoConfig.metadata.category || 'general',
          featured: initialPage.seoConfig.metadata.featured || false
        });
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
      
      // Create minimal SEO config for page creation
      const seoConfig: PageSEOConfig = {
        slug: pageSlug,
        seo: {
          title: `${title} - Valiance Media`,
          description: '',
          keywords: [],
          noIndex: false
        },
        sitemap: {
          exclude: false,
          priority: 0.5,
          changeFrequency: 'monthly'
        },
        metadata: {
          ...metadata,
          lastModified: new Date().toISOString().split('T')[0]
        }
      };
      
      const endpoint = isNew 
        ? '/api/admin/pages'
        : `/api/admin/pages/${initialPage?.slug}`;
      
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug: pageSlug,
          content: content || undefined, // Let the backend generate default content if empty
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
        const error = await response.json();
        console.error('Save failed:', error);
        setSaving(false);
        alert(`Failed to save page: ${error.error || 'Unknown error'}`);
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

        {/* Tab Navigation */}
        <div style={{ 
          borderBottom: '1px solid var(--color-border-light)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              onClick={() => setActiveTab('content')}
              style={{
                padding: '12px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'content' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === 'content' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '-1px'
              }}
            >
              Page Content
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                padding: '12px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'settings' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === 'settings' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '-1px'
              }}
            >
              Settings
            </button>
            {!isNew && (
              <button
                onClick={() => {
                  // Determine the correct path for the SEO page
                  let pagePath = '/';
                  if (initialPage?.isHomePage) {
                    pagePath = '/';
                  } else if (initialPage?.slug) {
                    pagePath = `/${initialPage.slug}`;
                  } else if (slug) {
                    pagePath = `/${slug}`;
                  }
                  router.push(`/admin/seo/edit?page=${encodeURIComponent(pagePath)}`);
                }}
                style={{
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: '2px solid transparent',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '-1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Page SEO
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {/* Title and Slug Row - 70% / 30% split */}
            <div className="form-row form-row-70-30">
              {/* Title - 70% */}
              <div className="form-group">
                <label className="form-label form-label-required">
                  Page Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter page title"
                  disabled={initialPage?.isHomePage}
                  className="input-field"
                  style={initialPage?.isHomePage ? { opacity: 0.6 } : {}}
                />
              </div>

              {/* Slug - 30% */}
              <div className="form-group" style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-xs)' }}>
                  <label className="form-label form-label-required" style={{ marginBottom: 0 }}>
                    Page Slug
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
                    onChange={(e) => handleSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="page-url-slug"
                    className="input-field input-field-mono"
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
                  background: isEditingCode || isNew ? 'rgba(0, 0, 0, 0.02)' : '#2d2d2d',
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
                      color: '#d4d4d4',
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
                    background: 'rgba(59, 130, 246, 0.1)',
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