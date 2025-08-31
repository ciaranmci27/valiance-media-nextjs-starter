'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import TagInputImproved from '@/components/admin/TagInputImproved';
import KeywordsInput from '@/components/admin/KeywordsInput';
import SocialMediaPreview from '@/components/admin/seo/SocialMediaPreview';
import UrlChangeWarningModal from '@/components/admin/UrlChangeWarningModal';
import { getCMSConfig } from '@/lib/cms-config';
import { seoConfig } from '@/seo/seo.config';
import { Switch } from '@/components/admin/ui/Switch';
import PageSchemaEditor from '@/components/admin/seo/PageSchemaEditor';
import { PageSchema } from '@/components/admin/seo/schema-types';

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
    { 
      id: 'content', 
      label: 'Content', 
      icon: '📝',
      description: 'Main content, category and tags'
    },
    { 
      id: 'media', 
      label: 'Featured Image', 
      icon: '🖼️',
      description: 'Hero image for the post'
    },
    { 
      id: 'seo', 
      label: 'SEO & Social', 
      icon: '🔍',
      description: 'Search and social optimization'
    },
    { 
      id: 'schema', 
      label: 'Schema', 
      icon: '📊',
      description: 'Structured data for rich snippets'
    },
    { 
      id: 'author', 
      label: 'Author', 
      icon: '👤',
      description: 'Author information'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: '⚙️',
      description: 'Post visibility and options'
    }
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

    const siteName = (seoConfig as any).siteName || (seoConfig.openGraph as any)?.siteName || 'Your Site';
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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-h1" style={{ color: 'var(--color-text-primary)' }}>
                {mode === 'create' ? 'New Blog Post' : 'Edit Blog Post'}
              </h1>
              <p className="text-body-lg mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                {mode === 'create' 
                  ? 'Write and publish a new blog post'
                  : `Editing: ${formData.title || 'Untitled Post'}`}
              </p>
            </div>
            
            {/* Completion Indicator */}
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {completionPercentage}% Complete
              </div>
              <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Save Status */}
          {saveStatus !== 'idle' && (
            <div className={`p-3 rounded-lg mb-4 ${
              saveStatus === 'saving' ? 'bg-primary-50 dark:bg-gray-800/60 text-primary-700 dark:text-primary-200' :
              saveStatus === 'saved' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
              'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              {saveStatus === 'saving' && '⏳ Saving...'}
              {saveStatus === 'saved' && '✅ Post saved successfully! Redirecting...'}
              {saveStatus === 'error' && '❌ Error saving post. Please try again.'}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[150px] px-6 py-4 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-primary bg-primary-50 dark:bg-gray-800/60'
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tab.icon}</span>
                    <span className={`font-medium ${
                      activeTab === tab.id 
                        ? 'text-primary dark:text-primary-light' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {tab.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {tab.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit}>
            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Title, Category, and Slug Row */}
                <div className="grid grid-cols-1 lg:grid-cols-[5fr_2fr_3fr] gap-4">
                  {/* Title Field - 50% */}
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
                      className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                      placeholder="Enter a compelling title"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                    )}
                  </div>

                  {/* Category Field - 20% */}
                  <div>
                    <label htmlFor="category" className="text-label block mb-2">
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
                        <option key={cat} value={cat}>
                          {cat.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Slug Field - 30% */}
                  <div className="min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <label htmlFor="slug" className="text-label whitespace-nowrap shrink-0">
                        Post Slug *
                      </label>
                      <span
                        className="text-xs text-gray-500 font-mono block flex-1 min-w-0 truncate max-w-[140px] sm:max-w-[220px] md:max-w-[280px]"
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
                      className={`input-field font-mono w-full ${errors.slug ? 'border-red-500' : ''}`}
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
                      <span className="text-xs text-gray-500">
                        {formData.excerpt.length}/200
                      </span>
                    </div>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows={3}
                      className={`input-field ${errors.excerpt ? 'border-red-500' : ''}`}
                      placeholder="Write a brief summary that will appear in blog listings"
                    />
                    {errors.excerpt && (
                      <p className="text-sm text-red-500 mt-1">{errors.excerpt}</p>
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

                <div>
                  <label className="text-label block mb-2">
                    Content *
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Start writing your blog post content..."
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500 mt-1">{errors.content}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated reading time: {Math.ceil(formData.content.split(/\s+/).length / 200)} min
                  </p>
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-h3 mb-4">Featured Image</h3>
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
                          <p className="text-xs text-gray-500">Recommended: 1200x630px</p>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showFeaturedPreview}
                              onChange={(e) => setShowFeaturedPreview(e.target.checked)}
                              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary/50"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Show preview</span>
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
                      <p className="text-xs text-gray-500 mt-1">
                        Important for SEO and accessibility
                      </p>
                    </div>
                  </div>

                  {showFeaturedPreview && formData.image && (
                    <div className="mt-6">
                      <h4 className="font-medium text-lg mb-4">Featured Image Preview</h4>
                      <div className="max-w-2xl mx-auto">
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
                </div>

                <div className="p-4 bg-primary-50 dark:bg-gray-800/60 rounded-lg">
                  <p className="text-sm">
                    <strong>💡 Tip:</strong> Use high-quality images that relate to your content. 
                    The featured image appears in blog listings and social media shares.
                  </p>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-h3 mb-4">Search Engine Optimization</h3>
                  <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {mode === 'create' 
                        ? 'You can apply the default blog post SEO template to quickly fill in the fields below.'
                        : 'Apply the SEO template to replace current SEO fields with template values.'}
                    </p>
                    <button
                      type="button"
                      onClick={applySEOTemplate}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm font-medium"
                    >
                      Apply SEO Template
                    </button>
                  </div>
                  
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
                      <p className="text-xs text-gray-500 mt-1">
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
                      <p className="text-xs text-gray-500 mt-1">
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
                          <p className="text-xs text-gray-500">Recommended: 1200x630px for best results</p>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showSEOPreview}
                              onChange={(e) => setShowSEOPreview(e.target.checked)}
                              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary/50"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Show preview</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {showSEOPreview && (formData.seo.image || formData.image) && (
                  <div className="mt-6">
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
            )}

            {/* Schema Tab */}
            {activeTab === 'schema' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-h3 mb-4">Structured Data Schema</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Configure structured data schemas to enhance how your content appears in search results.
                    These schemas help search engines better understand your content and can enable rich snippets.
                  </p>
                  
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
                </div>
              </div>
            )}

            {/* Author Tab */}
            {activeTab === 'author' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-h3 mb-4">Author Information</h3>
                  
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
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-h3 mb-4">Post Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium">Featured Post</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Display this post prominently on the homepage
                        </p>
                      </div>
                      <Switch
                        checked={formData.featured}
                        onChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium">{mode === 'edit' && !initialData?.draft ? 'Unpublish to Draft' : 'Save as Draft'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium">Exclude from Search</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium mb-2">Publishing Notes</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Draft posts are only visible to administrators</li>
                    <li>• Featured posts appear at the top of blog listings</li>
                    <li>• Excluded posts won't appear in search engine results</li>
                    <li>• All changes are saved when you publish or save as draft</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push('/admin/blog')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="btn btn-secondary"
                  disabled={isLoading}
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Publishing...' : (mode === 'create' ? 'Publish Post' : 'Update Post')}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Sidebar */}
        <div className="mt-6 p-4 bg-primary-50 dark:bg-gray-800/60 rounded-lg">
          <h3 className="font-medium mb-2">Quick Tips</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Required fields are marked with an asterisk (*)</li>
            <li>• Your progress is shown at the top of the page</li>
            <li>• SEO settings help your post rank better in search results</li>
            <li>• Use tags to help readers find related content</li>
            <li>• Preview your social media cards before publishing</li>
          </ul>
        </div>
      </div>

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