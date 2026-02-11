'use client';

import { useState, useEffect, useMemo } from 'react';
import { seoConfig } from '@/seo/seo.config';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CodeBracketIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Select } from '@/components/admin/ui/Select';

const BUTTON_PRIMARY_CLASS = 'admin-btn admin-btn-primary admin-btn-sm';
const BUTTON_DANGER_CLASS = 'admin-btn admin-btn-danger admin-btn-sm';
const LABEL_STYLE: React.CSSProperties = { color: 'var(--color-text-primary)' };

const SECTION_STYLE: React.CSSProperties = {
  border: '1px solid var(--color-border-light)',
  borderRadius: 'var(--radius-lg)',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const ITEM_CARD_STYLE: React.CSSProperties = {
  border: '1px solid var(--color-border-medium)',
  borderRadius: 'var(--radius-md)',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

import {
  PageSchema, 
  SCHEMAS_BY_PAGE_TYPE, 
  SCHEMA_TEMPLATES,
  getAvailableSchemasForPageType,
  FAQSchema,
  HowToSchema,
  ArticleSchema,
  VideoSchema,
  EventSchema,
  RecipeSchema,
  ProductSchema,
  ServiceSchema,
  CourseSchema,
  JobPostingSchema,
  SoftwareApplicationSchema,
  ReviewSchema,
  QuizSchema,
  QAPageSchema,
  ContactPageSchema,
  AboutPageSchema,
  ProfilePageSchema,
  SearchResultsPageSchema,
  MedicalWebPageSchema,
  SpecialAnnouncementSchema,
  LiveBlogPostingSchema,
  DatasetSchema,
  CollectionPageSchema,
  ItemListSchema,
  AggregateRatingSchema
} from './schema-types';

interface PageSchemaEditorProps {
  pageType: 'blogPost' | 'category' | 'page' | 'product';
  schemas: PageSchema[];
  onChange: (schemas: PageSchema[]) => void;
  pageData?: {
    title?: string;
    description?: string;
    author?: string;
    publishedAt?: string;
    modifiedAt?: string;
    image?: string;
    category?: string;
  };
}

export default function PageSchemaEditor({ 
  pageType, 
  schemas = [], 
  onChange, 
  pageData 
}: PageSchemaEditorProps) {
  const [activeSchemas, setActiveSchemas] = useState<PageSchema[]>(schemas);
  const [expandedSchema, setExpandedSchema] = useState<string | null>(null);
  const availableSchemas = getAvailableSchemasForPageType(pageType);

  useEffect(() => {
    setActiveSchemas(schemas);
  }, [schemas]);

  const addSchema = (schemaType: string) => {
    const template = SCHEMA_TEMPLATES[schemaType];
    if (template) {
      const newSchema = { ...template, enabled: true } as PageSchema;
      
      // Auto-populate with page data if available
      if (schemaType === 'Article' || schemaType === 'BlogPosting' || schemaType === 'NewsArticle') {
        const articleSchema = newSchema as ArticleSchema;
        if (pageData?.title) articleSchema.headline = pageData.title;
        if (pageData?.image) articleSchema.image = pageData.image;
        if (pageData?.author) articleSchema.author = { name: pageData.author };
        if (pageData?.publishedAt) articleSchema.datePublished = pageData.publishedAt;
        if (pageData?.modifiedAt) articleSchema.dateModified = pageData.modifiedAt;
        if (pageData?.category) articleSchema.articleSection = pageData.category;
      }
      
      const updated = [...activeSchemas, newSchema];
      setActiveSchemas(updated);
      onChange(updated);
      setExpandedSchema(schemaType);
    }
  };

  const removeSchema = (index: number) => {
    const updated = activeSchemas.filter((_, i) => i !== index);
    setActiveSchemas(updated);
    onChange(updated);
  };

  const updateSchema = (index: number, updatedSchema: PageSchema) => {
    const updated = [...activeSchemas];
    updated[index] = updatedSchema;
    setActiveSchemas(updated);
    onChange(updated);
  };

  const renderSchemaForm = (schema: PageSchema, index: number) => {
    switch (schema.type) {
      case 'Article':
      case 'BlogPosting':
      case 'NewsArticle':
        return <ArticleSchemaForm 
          schema={schema as ArticleSchema} 
          onChange={(updated) => updateSchema(index, updated)}
          pageData={pageData}
        />;
      
      case 'FAQPage':
        return <FAQSchemaForm 
          schema={schema as FAQSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'HowTo':
        return <HowToSchemaForm 
          schema={schema as HowToSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'VideoObject':
        return <VideoSchemaForm 
          schema={schema as VideoSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'Product':
        return <ProductSchemaForm 
          schema={schema as ProductSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'Event':
        return <EventSchemaForm 
          schema={schema as EventSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'Recipe':
        return <RecipeSchemaForm 
          schema={schema as RecipeSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'Service':
        return <ServiceSchemaForm 
          schema={schema as ServiceSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'Course':
        return <CourseSchemaForm 
          schema={schema as CourseSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'JobPosting':
        return <JobPostingSchemaForm 
          schema={schema as JobPostingSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'SoftwareApplication':
      case 'MobileApplication':
      case 'WebApplication':
        return <SoftwareApplicationSchemaForm 
          schema={schema as SoftwareApplicationSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'Review':
        return <ReviewSchemaForm 
          schema={schema as ReviewSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'Quiz':
        return <QuizSchemaForm 
          schema={schema as QuizSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'QAPage':
        return <QAPageSchemaForm 
          schema={schema as QAPageSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'ContactPage':
        return <ContactPageSchemaForm 
          schema={schema as ContactPageSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'AboutPage':
        return <AboutPageSchemaForm 
          schema={schema as AboutPageSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'ProfilePage':
        return <ProfilePageSchemaForm 
          schema={schema as ProfilePageSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'LiveBlogPosting':
        return <LiveBlogPostingSchemaForm 
          schema={schema as LiveBlogPostingSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'MedicalWebPage':
        return <MedicalWebPageSchemaForm 
          schema={schema as MedicalWebPageSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'SpecialAnnouncement':
        return <SpecialAnnouncementSchemaForm 
          schema={schema as SpecialAnnouncementSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'Dataset':
        return <DatasetSchemaForm 
          schema={schema as DatasetSchema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      case 'CollectionPage':
      case 'ItemList':
      case 'SearchResultsPage':
      case 'AggregateRating':
        // These schemas are typically auto-generated or have minimal fields
        return <GenericSchemaForm 
          schema={schema} 
          onChange={(updated) => updateSchema(index, updated)}
        />;
      
      default:
        return <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>Schema editor not yet implemented for {(schema as any).type || 'unknown'}</div>;
    }
  };

  // Schema icons
  const getSchemaIcon = (type: string) => {
    const icons: Record<string, string> = {
      Article: '📄',
      BlogPosting: '📝',
      NewsArticle: '📰',
      FAQPage: '❓',
      HowTo: '📋',
      VideoObject: '🎥',
      Product: '🛍️',
      Event: '📅',
      Recipe: '🍳',
      Course: '🎓',
      JobPosting: '💼',
      SoftwareApplication: '💻',
      MobileApplication: '📱',
      WebApplication: '🌐',
      Service: '🛠️',
      Review: '⭐',
      CollectionPage: '📚',
      ItemList: '📃',
      Quiz: '🎯',
      QAPage: '💬',
      ContactPage: '📞',
      AboutPage: 'ℹ️',
      ProfilePage: '👤',
      SearchResultsPage: '🔍',
      MedicalWebPage: '⚕️',
      SpecialAnnouncement: '📢',
      LiveBlogPosting: '🔴',
      Dataset: '📊',
      AggregateRating: '⭐',
    };
    return icons[type] || '📄';
  };

  const schemaOptions = useMemo(() =>
    availableSchemas.map(type => ({
      value: type,
      label: `${getSchemaIcon(type)} ${type}`,
    })),
    [availableSchemas]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Add Schema */}
      <Select
        label="Add Schema"
        options={schemaOptions}
        placeholder="Select a schema type..."
        helperText="Add structured data schemas to enable rich results in search engines"
        onChange={(value) => {
          if (value) {
            addSchema(value);
          }
        }}
      />

      {/* Active Schemas */}
      {activeSchemas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeSchemas.map((schema, index) => (
            <div
              key={index}
              style={{
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                transition: 'border-color 150ms ease',
              }}
            >
              {/* Schema header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
                onClick={() => setExpandedSchema(expandedSchema === schema.type ? null : schema.type)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>{getSchemaIcon(schema.type)}</span>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                      {schema.type}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span
                        className="dash-status-dot"
                        style={{
                          background: schema.enabled ? 'var(--color-success)' : 'var(--color-text-disabled)',
                          width: '6px',
                          height: '6px',
                        }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                        {schema.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSchema(index);
                    }}
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Remove
                  </button>
                  {expandedSchema === schema.type ? (
                    <ChevronDownIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)', transition: 'transform 200ms ease' }} />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)', transition: 'transform 200ms ease' }} />
                  )}
                </div>
              </div>

              {/* Schema form content */}
              {expandedSchema === schema.type && (
                <div style={{ padding: '16px', borderTop: '1px solid var(--color-border-light)' }}>
                  {renderSchemaForm(schema, index)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview JSON-LD */}
      {activeSchemas.length > 0 && (
        <details
          style={{
            border: '1px solid var(--color-border-medium)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          <summary
            style={{
              padding: '14px 16px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CodeBracketIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
            Preview JSON-LD Output
          </summary>
          <pre
            style={{
              padding: '16px',
              borderTop: '1px solid var(--color-border-light)',
              background: 'var(--color-surface)',
              margin: 0,
              overflowX: 'auto',
              fontSize: '12px',
              fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {JSON.stringify(activeSchemas.filter(s => s.enabled), null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

// Article Schema Form Component
function ArticleSchemaForm({ 
  schema, 
  onChange,
  pageData 
}: { 
  schema: ArticleSchema; 
  onChange: (schema: ArticleSchema) => void;
  pageData?: any;
}) {
  return (
    <div className="space-y-4">
      <Select
        label="Article Type"
        value={schema.type}
        onChange={(value) => onChange({ ...schema, type: value as ArticleSchema['type'] })}
        options={[
          { value: 'Article', label: 'Article' },
          { value: 'BlogPosting', label: 'Blog Posting' },
          { value: 'NewsArticle', label: 'News Article' },
        ]}
      />

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Headline</label>
        <input
          type="text"
          value={schema.headline || pageData?.title || ''}
          onChange={(e) => onChange({ ...schema, headline: e.target.value })}
          className="input-field"
          placeholder="Article headline"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Alternative Headline</label>
        <input
          type="text"
          value={schema.alternativeHeadline || ''}
          onChange={(e) => onChange({ ...schema, alternativeHeadline: e.target.value })}
          className="input-field"
          placeholder="Optional alternative headline"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Author Name</label>
        <input
          type="text"
          value={schema.author?.name || pageData?.author || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            author: { ...schema.author, name: e.target.value }
          })}
          className="input-field"
          placeholder="Author name"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Word Count</label>
        <input
          type="number"
          value={schema.wordCount || ''}
          onChange={(e) => onChange({ ...schema, wordCount: parseInt(e.target.value) })}
          className="input-field"
          placeholder="Number of words"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Reading Time</label>
        <input
          type="text"
          value={schema.timeRequired || ''}
          onChange={(e) => onChange({ ...schema, timeRequired: e.target.value })}
          className="input-field"
          placeholder="e.g., PT5M (5 minutes)"
        />
      </div>
    </div>
  );
}

// FAQ Schema Form Component
function FAQSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: FAQSchema; 
  onChange: (schema: FAQSchema) => void;
}) {
  const addQuestion = () => {
    onChange({
      ...schema,
      mainEntity: [...(schema.mainEntity || []), { question: '', answer: '' }]
    });
  };

  const updateQuestion = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...(schema.mainEntity || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...schema, mainEntity: updated });
  };

  const removeQuestion = (index: number) => {
    onChange({
      ...schema,
      mainEntity: (schema.mainEntity || []).filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Questions & Answers</h4>
        <button
          type="button"
          onClick={addQuestion}
          className={BUTTON_PRIMARY_CLASS}
        >
          Add Question
        </button>
      </div>

      {(schema.mainEntity || []).map((qa, index) => (
        <div key={index} style={ITEM_CARD_STYLE}>
          <div>
            <label className="text-label block mb-1" style={LABEL_STYLE}>Question {index + 1}</label>
            <input
              type="text"
              value={qa.question}
              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
              className="input-field"
              placeholder="Enter question"
            />
          </div>
          <div>
            <label className="text-label block mb-1" style={LABEL_STYLE}>Answer</label>
            <textarea
              value={qa.answer}
              onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Enter answer"
            />
          </div>
          <button
            type="button"
            onClick={() => removeQuestion(index)}
            className={BUTTON_DANGER_CLASS}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

// HowTo Schema Form Component
function HowToSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: HowToSchema; 
  onChange: (schema: HowToSchema) => void;
}) {
  const addStep = () => {
    onChange({
      ...schema,
      step: [...(schema.step || []), { name: '', text: '' }]
    });
  };

  const updateStep = (index: number, field: string, value: string) => {
    const updated = [...(schema.step || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...schema, step: updated });
  };

  const removeStep = (index: number) => {
    onChange({
      ...schema,
      step: (schema.step || []).filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Guide Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className="input-field"
          placeholder="How-to guide title"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={2}
          placeholder="Brief description"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Total Time (ISO 8601)</label>
        <input
          type="text"
          value={schema.totalTime || ''}
          onChange={(e) => onChange({ ...schema, totalTime: e.target.value })}
          className="input-field"
          placeholder="e.g., PT30M (30 minutes)"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Steps</h4>
          <button
            type="button"
            onClick={addStep}
            className={BUTTON_PRIMARY_CLASS}
          >
            Add Step
          </button>
        </div>

        {(schema.step || []).map((step, index) => (
          <div key={index} style={ITEM_CARD_STYLE}>
            <div>
              <label className="text-label block mb-1" style={LABEL_STYLE}>Step {index + 1} Name</label>
              <input
                type="text"
                value={step.name}
                onChange={(e) => updateStep(index, 'name', e.target.value)}
                className="input-field"
                placeholder="Step name"
              />
            </div>
            <div>
              <label className="text-label block mb-1" style={LABEL_STYLE}>Instructions</label>
              <textarea
                value={step.text}
                onChange={(e) => updateStep(index, 'text', e.target.value)}
                className="input-field"
                rows={2}
                placeholder="Step instructions"
              />
            </div>
            <button
              type="button"
              onClick={() => removeStep(index)}
              className={BUTTON_DANGER_CLASS}
            >
              Remove Step
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Video Schema Form Component
function VideoSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: VideoSchema; 
  onChange: (schema: VideoSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Video Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className="input-field"
          placeholder="Video title"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={2}
          placeholder="Video description"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Thumbnail URL</label>
        <input
          type="text"
          value={schema.thumbnailUrl || ''}
          onChange={(e) => onChange({ ...schema, thumbnailUrl: e.target.value })}
          className="input-field"
          placeholder="https://example.com/thumbnail.jpg"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Duration (ISO 8601)</label>
        <input
          type="text"
          value={schema.duration || ''}
          onChange={(e) => onChange({ ...schema, duration: e.target.value })}
          className="input-field"
          placeholder="e.g., PT4M35S (4 minutes 35 seconds)"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Embed URL</label>
        <input
          type="text"
          value={schema.embedUrl || ''}
          onChange={(e) => onChange({ ...schema, embedUrl: e.target.value })}
          className="input-field"
          placeholder="https://www.youtube.com/embed/VIDEO_ID"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Upload Date</label>
        <input
          type="date"
          value={schema.uploadDate || ''}
          onChange={(e) => onChange({ ...schema, uploadDate: e.target.value })}
          className="input-field"
        />
      </div>
    </div>
  );
}

// Product Schema Form Component
function ProductSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: ProductSchema; 
  onChange: (schema: ProductSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Product Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className="input-field"
          placeholder="Product name"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={2}
          placeholder="Product description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>SKU</label>
          <input
            type="text"
            value={schema.sku || ''}
            onChange={(e) => onChange({ ...schema, sku: e.target.value })}
            className="input-field"
            placeholder="SKU"
          />
        </div>

        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Brand</label>
          <input
            type="text"
            value={schema.brand?.name || ''}
            onChange={(e) => onChange({ 
              ...schema, 
              brand: { name: e.target.value }
            })}
            className="input-field"
            placeholder="Brand name"
          />
        </div>
      </div>

      <div style={SECTION_STYLE}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Pricing & Availability</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-label block mb-1" style={LABEL_STYLE}>Price</label>
            <input
              type="number"
              value={schema.offers?.price || ''}
              onChange={(e) => onChange({ 
                ...schema, 
                offers: { 
                  ...schema.offers,
                  price: parseFloat(e.target.value),
                  priceCurrency: schema.offers?.priceCurrency || 'USD'
                } as ProductSchema['offers']
              })}
              className="input-field"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="text-label block mb-1" style={LABEL_STYLE}>Currency</label>
            <input
              type="text"
              value={schema.offers?.priceCurrency || 'USD'}
              onChange={(e) => onChange({ 
                ...schema, 
                offers: { 
                  ...schema.offers,
                  priceCurrency: e.target.value
                } as ProductSchema['offers']
              })}
              className="input-field"
              placeholder="USD"
            />
          </div>
        </div>

        <Select
          label="Availability"
          value={schema.offers?.availability || 'InStock'}
          onChange={(value) => onChange({
            ...schema,
            offers: {
              ...schema.offers,
              availability: value as 'InStock' | 'OutOfStock' | 'PreOrder' | 'BackOrder'
            } as ProductSchema['offers']
          })}
          options={[
            { value: 'InStock', label: 'In Stock' },
            { value: 'OutOfStock', label: 'Out of Stock' },
            { value: 'PreOrder', label: 'Pre-Order' },
            { value: 'BackOrder', label: 'Back Order' },
          ]}
        />
      </div>

      <div style={SECTION_STYLE}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Rating</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-label block mb-1" style={LABEL_STYLE}>Rating Value</label>
            <input
              type="number"
              value={schema.aggregateRating?.ratingValue || ''}
              onChange={(e) => onChange({ 
                ...schema, 
                aggregateRating: { 
                  ...schema.aggregateRating,
                  ratingValue: parseFloat(e.target.value),
                  reviewCount: schema.aggregateRating?.reviewCount || 0
                }
              })}
              className="input-field"
              placeholder="4.5"
              min="0"
              max="5"
              step="0.1"
            />
          </div>

          <div>
            <label className="text-label block mb-1" style={LABEL_STYLE}>Review Count</label>
            <input
              type="number"
              value={schema.aggregateRating?.reviewCount || ''}
              onChange={(e) => onChange({ 
                ...schema, 
                aggregateRating: { 
                  ...schema.aggregateRating,
                  ratingValue: schema.aggregateRating?.ratingValue || 0,
                  reviewCount: parseInt(e.target.value)
                }
              })}
              className="input-field"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Event Schema Form Component
function EventSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: EventSchema; 
  onChange: (schema: EventSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Event Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className="input-field"
          placeholder="Event name"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={2}
          placeholder="Event description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Start Date</label>
          <input
            type="datetime-local"
            value={schema.startDate || ''}
            onChange={(e) => onChange({ ...schema, startDate: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>End Date</label>
          <input
            type="datetime-local"
            value={schema.endDate || ''}
            onChange={(e) => onChange({ ...schema, endDate: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      <Select
        label="Event Status"
        value={schema.eventStatus || 'EventScheduled'}
        onChange={(value) => onChange({ ...schema, eventStatus: value as EventSchema['eventStatus'] })}
        options={[
          { value: 'EventScheduled', label: 'Scheduled' },
          { value: 'EventCancelled', label: 'Cancelled' },
          { value: 'EventPostponed', label: 'Postponed' },
          { value: 'EventRescheduled', label: 'Rescheduled' },
        ]}
      />

      <Select
        label="Attendance Mode"
        value={schema.eventAttendanceMode || 'OfflineEventAttendanceMode'}
        onChange={(value) => onChange({ ...schema, eventAttendanceMode: value as EventSchema['eventAttendanceMode'] })}
        options={[
          { value: 'OfflineEventAttendanceMode', label: 'In-Person' },
          { value: 'OnlineEventAttendanceMode', label: 'Online' },
          { value: 'MixedEventAttendanceMode', label: 'Hybrid' },
        ]}
      />
    </div>
  );
}

// Recipe Schema Form Component
function RecipeSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: RecipeSchema; 
  onChange: (schema: RecipeSchema) => void;
}) {
  const addIngredient = () => {
    onChange({
      ...schema,
      recipeIngredient: [...(schema.recipeIngredient || []), '']
    });
  };

  const updateIngredient = (index: number, value: string) => {
    const updated = [...(schema.recipeIngredient || [])];
    updated[index] = value;
    onChange({ ...schema, recipeIngredient: updated });
  };

  const removeIngredient = (index: number) => {
    onChange({
      ...schema,
      recipeIngredient: (schema.recipeIngredient || []).filter((_, i) => i !== index)
    });
  };

  const addInstruction = () => {
    onChange({
      ...schema,
      recipeInstructions: [...(schema.recipeInstructions || []), { text: '' }]
    });
  };

  const updateInstruction = (index: number, field: string, value: string) => {
    const updated = [...(schema.recipeInstructions || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...schema, recipeInstructions: updated });
  };

  const removeInstruction = (index: number) => {
    onChange({
      ...schema,
      recipeInstructions: (schema.recipeInstructions || []).filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Recipe Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className="input-field"
          placeholder="Recipe name"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={2}
          placeholder="Recipe description"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Prep Time</label>
          <input
            type="text"
            value={schema.prepTime || ''}
            onChange={(e) => onChange({ ...schema, prepTime: e.target.value })}
            className="input-field"
            placeholder="PT15M"
          />
        </div>

        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Cook Time</label>
          <input
            type="text"
            value={schema.cookTime || ''}
            onChange={(e) => onChange({ ...schema, cookTime: e.target.value })}
            className="input-field"
            placeholder="PT30M"
          />
        </div>

        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Yield</label>
          <input
            type="text"
            value={schema.recipeYield || ''}
            onChange={(e) => onChange({ ...schema, recipeYield: e.target.value })}
            className="input-field"
            placeholder="4 servings"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Ingredients</h4>
          <button
            type="button"
            onClick={addIngredient}
            className={BUTTON_PRIMARY_CLASS}
          >
            Add Ingredient
          </button>
        </div>

        {(schema.recipeIngredient || []).map((ingredient, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={ingredient}
              onChange={(e) => updateIngredient(index, e.target.value)}
              className="input-field"
              style={{ flex: 1 }}
              placeholder="e.g., 2 cups flour"
            />
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              className="admin-btn admin-btn-danger admin-btn-sm"
              style={{ flexShrink: 0 }}
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Instructions</h4>
          <button
            type="button"
            onClick={addInstruction}
            className={BUTTON_PRIMARY_CLASS}
          >
            Add Step
          </button>
        </div>

        {(schema.recipeInstructions || []).map((instruction, index) => (
          <div key={index} style={ITEM_CARD_STYLE}>
            <div>
              <label className="text-label block mb-1" style={LABEL_STYLE}>Step {index + 1}</label>
              <textarea
                value={instruction.text}
                onChange={(e) => updateInstruction(index, 'text', e.target.value)}
                className="input-field"
                rows={2}
                placeholder="Instruction text"
              />
            </div>
            <button
              type="button"
              onClick={() => removeInstruction(index)}
              className={BUTTON_DANGER_CLASS}
            >
              Remove Step
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Service Schema Form Component
function ServiceSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: ServiceSchema; 
  onChange: (schema: ServiceSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Service Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className="input-field"
          placeholder="Service name"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={2}
          placeholder="Service description"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Service Type</label>
        <input
          type="text"
          value={schema.serviceType || ''}
          onChange={(e) => onChange({ ...schema, serviceType: e.target.value })}
          className="input-field"
          placeholder="e.g., Web Development, Consulting"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Area Served</label>
        <input
          type="text"
          value={schema.areaServed || ''}
          onChange={(e) => onChange({ ...schema, areaServed: e.target.value })}
          className="input-field"
          placeholder="e.g., United States, Global"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Provider Name</label>
        <input
          type="text"
          value={schema.provider?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            provider: { ...schema.provider, name: e.target.value }
          })}
          className="input-field"
          placeholder="Company or person providing the service"
        />
      </div>
    </div>
  );
}

// Course Schema Form Component
function CourseSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: CourseSchema; 
  onChange: (schema: CourseSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Course Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className="input-field"
          placeholder="Course name"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={2}
          placeholder="Course description"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Provider Name</label>
        <input
          type="text"
          value={schema.provider?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            provider: { ...schema.provider, name: e.target.value }
          })}
          className="input-field"
          placeholder="Institution or organization"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Course Code</label>
        <input
          type="text"
          value={schema.courseCode || ''}
          onChange={(e) => onChange({ ...schema, courseCode: e.target.value })}
          className="input-field"
          placeholder="e.g., CS101"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Credential Awarded</label>
        <input
          type="text"
          value={schema.educationalCredentialAwarded || ''}
          onChange={(e) => onChange({ ...schema, educationalCredentialAwarded: e.target.value })}
          className="input-field"
          placeholder="e.g., Certificate, Diploma"
        />
      </div>
    </div>
  );
}

// JobPosting Schema Form Component
function JobPostingSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: JobPostingSchema; 
  onChange: (schema: JobPostingSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Job Title</label>
        <input
          type="text"
          value={schema.title || ''}
          onChange={(e) => onChange({ ...schema, title: e.target.value })}
          className="input-field"
          placeholder="Job title"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={3}
          placeholder="Job description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Date Posted</label>
          <input
            type="date"
            value={schema.datePosted || ''}
            onChange={(e) => onChange({ ...schema, datePosted: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Valid Through</label>
          <input
            type="date"
            value={schema.validThrough || ''}
            onChange={(e) => onChange({ ...schema, validThrough: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      <Select
        label="Employment Type"
        value={Array.isArray(schema.employmentType) ? schema.employmentType[0] || '' : schema.employmentType || ''}
        onChange={(value) => onChange({ ...schema, employmentType: value })}
        placeholder="Select type..."
        options={[
          { value: 'FULL_TIME', label: 'Full Time' },
          { value: 'PART_TIME', label: 'Part Time' },
          { value: 'CONTRACTOR', label: 'Contractor' },
          { value: 'TEMPORARY', label: 'Temporary' },
          { value: 'INTERN', label: 'Intern' },
        ]}
      />

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Hiring Organization</label>
        <input
          type="text"
          value={schema.hiringOrganization?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            hiringOrganization: { ...schema.hiringOrganization, name: e.target.value }
          })}
          className="input-field"
          placeholder="Company name"
        />
      </div>
    </div>
  );
}

// SoftwareApplication Schema Form Component
function SoftwareApplicationSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: SoftwareApplicationSchema; 
  onChange: (schema: SoftwareApplicationSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <Select
        label="Application Type"
        value={schema.type}
        onChange={(value) => onChange({ ...schema, type: value as SoftwareApplicationSchema['type'] })}
        options={[
          { value: 'SoftwareApplication', label: 'Software Application' },
          { value: 'MobileApplication', label: 'Mobile Application' },
          { value: 'WebApplication', label: 'Web Application' },
        ]}
      />

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Application Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className="input-field"
          placeholder="Application name"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={2}
          placeholder="Application description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Category</label>
          <input
            type="text"
            value={schema.applicationCategory || ''}
            onChange={(e) => onChange({ ...schema, applicationCategory: e.target.value })}
            className="input-field"
            placeholder="e.g., Productivity"
          />
        </div>

        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Version</label>
          <input
            type="text"
            value={schema.softwareVersion || ''}
            onChange={(e) => onChange({ ...schema, softwareVersion: e.target.value })}
            className="input-field"
            placeholder="e.g., 1.0.0"
          />
        </div>
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Operating System</label>
        <input
          type="text"
          value={schema.operatingSystem || ''}
          onChange={(e) => onChange({ ...schema, operatingSystem: e.target.value })}
          className="input-field"
          placeholder="e.g., Windows, macOS, iOS, Android"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Price</label>
          <input
            type="text"
            value={schema.offers?.price || ''}
            onChange={(e) => onChange({ 
              ...schema, 
              offers: { ...schema.offers, price: e.target.value }
            })}
            className="input-field"
            placeholder="0 or Free"
          />
        </div>

        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>File Size</label>
          <input
            type="text"
            value={schema.fileSize || ''}
            onChange={(e) => onChange({ ...schema, fileSize: e.target.value })}
            className="input-field"
            placeholder="e.g., 50MB"
          />
        </div>
      </div>
    </div>
  );
}

// Review Schema Form Component
function ReviewSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: ReviewSchema; 
  onChange: (schema: ReviewSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Item Being Reviewed</label>
        <input
          type="text"
          value={schema.itemReviewed?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            itemReviewed: { ...schema.itemReviewed, name: e.target.value }
          })}
          className="input-field"
          placeholder="Product, service, or item name"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Item Type</label>
        <input
          type="text"
          value={schema.itemReviewed?.type || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            itemReviewed: { ...schema.itemReviewed, type: e.target.value }
          })}
          className="input-field"
          placeholder="e.g., Product, Service, Book"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Rating (1-5)</label>
        <input
          type="number"
          value={schema.reviewRating?.ratingValue || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            reviewRating: { ...schema.reviewRating, ratingValue: parseFloat(e.target.value) }
          })}
          className="input-field"
          placeholder="5"
          min="1"
          max="5"
          step="0.5"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Author Name</label>
        <input
          type="text"
          value={schema.author?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            author: { name: e.target.value }
          })}
          className="input-field"
          placeholder="Reviewer name"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Review Text</label>
        <textarea
          value={schema.reviewBody || ''}
          onChange={(e) => onChange({ ...schema, reviewBody: e.target.value })}
          className="input-field"
          rows={3}
          placeholder="Review content"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Date Published</label>
        <input
          type="date"
          value={schema.datePublished || ''}
          onChange={(e) => onChange({ ...schema, datePublished: e.target.value })}
          className="input-field"
        />
      </div>
    </div>
  );
}

// Quiz Schema Form Component
function QuizSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: QuizSchema; 
  onChange: (schema: QuizSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Quiz Name</label>
          <input
            type="text"
            value={schema.name || ''}
            onChange={(e) => onChange({ ...schema, name: e.target.value })}
            className="input-field"
            placeholder="Quiz Title"
          />
        </div>
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Educational Level</label>
          <input
            type="text"
            value={schema.educationalLevel || ''}
            onChange={(e) => onChange({ ...schema, educationalLevel: e.target.value })}
            className="input-field"
            placeholder="All levels"
          />
        </div>
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={2}
          placeholder="Describe what the quiz is about"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Time Required (e.g., PT2M)</label>
          <input
            type="text"
            value={schema.timeRequired || ''}
            onChange={(e) => onChange({ ...schema, timeRequired: e.target.value })}
            className="input-field"
            placeholder="PT2M"
          />
        </div>
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Number of Questions</label>
          <input
            type="number"
            value={schema.numberOfQuestions || ''}
            onChange={(e) => onChange({ ...schema, numberOfQuestions: parseInt(e.target.value) || undefined })}
            className="input-field"
            placeholder="10"
          />
        </div>
        <div className="flex items-end">
          <label
            className="flex items-center gap-2"
            style={{ cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-secondary)' }}
          >
            <input
              type="checkbox"
              checked={schema.isAccessibleForFree ?? true}
              onChange={(e) => onChange({ ...schema, isAccessibleForFree: e.target.checked })}
              style={{ borderRadius: 'var(--radius-sm)' }}
            />
            Free to access
          </label>
        </div>
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Quiz Topic</label>
        <input
          type="text"
          value={typeof schema.about === 'string' ? schema.about : schema.about?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            about: e.target.value
          })}
          className="input-field"
          placeholder="Quiz topic or subject"
        />
      </div>
    </div>
  );
}

// QAPage Schema Form Component
function QAPageSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: QAPageSchema; 
  onChange: (schema: QAPageSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Question</label>
        <input
          type="text"
          value={schema.mainEntity?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            mainEntity: { ...schema.mainEntity, type: 'Question', name: e.target.value }
          })}
          className="input-field"
          placeholder="What is the main question being answered?"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Accepted Answer</label>
        <textarea
          value={schema.mainEntity?.acceptedAnswer?.text || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            mainEntity: { 
              ...schema.mainEntity, 
              type: 'Question',
              name: schema.mainEntity?.name || '',
              acceptedAnswer: { type: 'Answer', text: e.target.value }
            }
          })}
          className="input-field"
          rows={3}
          placeholder="The best answer to the question"
        />
      </div>
    </div>
  );
}

// ContactPage Schema Form Component
function ContactPageSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: ContactPageSchema; 
  onChange: (schema: ContactPageSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Organization Name</label>
          <input
            type="text"
            value={schema.name || ''}
            onChange={(e) => onChange({ ...schema, name: e.target.value })}
            className="input-field"
            placeholder={seoConfig.siteName}
          />
        </div>
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Phone Number</label>
          <input
            type="tel"
            value={schema.telephone || ''}
            onChange={(e) => onChange({ ...schema, telephone: e.target.value })}
            className="input-field"
            placeholder="+1-555-123-4567"
          />
        </div>
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Email</label>
        <input
          type="email"
          value={schema.email || ''}
          onChange={(e) => onChange({ ...schema, email: e.target.value })}
          className="input-field"
          placeholder="contact@example.com"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={2}
          placeholder="Brief description of the contact page"
        />
      </div>
    </div>
  );
}

// AboutPage Schema Form Component
function AboutPageSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: AboutPageSchema; 
  onChange: (schema: AboutPageSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Organization/Person Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className="input-field"
          placeholder={seoConfig.siteName}
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={3}
          placeholder="Brief description about the organization"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Founding Date</label>
        <input
          type="text"
          value={schema.foundingDate || ''}
          onChange={(e) => onChange({ ...schema, foundingDate: e.target.value })}
          className="input-field"
          placeholder="YYYY or YYYY-MM-DD"
        />
      </div>
    </div>
  );
}

// ProfilePage Schema Form Component
function ProfilePageSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: ProfilePageSchema; 
  onChange: (schema: ProfilePageSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Person Name</label>
          <input
            type="text"
            value={schema.name || ''}
            onChange={(e) => onChange({ ...schema, name: e.target.value })}
            className="input-field"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Job Title</label>
          <input
            type="text"
            value={schema.jobTitle || ''}
            onChange={(e) => onChange({ ...schema, jobTitle: e.target.value })}
            className="input-field"
            placeholder="Software Engineer"
          />
        </div>
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Bio/Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={3}
          placeholder="Brief bio about the person"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Social Media Links (comma-separated)</label>
        <input
          type="text"
          value={schema.sameAs?.join(', ') || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            sameAs: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          className="input-field"
          placeholder="https://twitter.com/username, https://linkedin.com/in/username"
        />
      </div>
    </div>
  );
}

// LiveBlogPosting Schema Form Component
function LiveBlogPostingSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: LiveBlogPostingSchema; 
  onChange: (schema: LiveBlogPostingSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Headline</label>
        <input
          type="text"
          value={schema.headline || ''}
          onChange={(e) => onChange({ ...schema, headline: e.target.value })}
          className="input-field"
          placeholder="Live Coverage: Event Name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Coverage Start Time</label>
          <input
            type="datetime-local"
            value={schema.coverageStartTime || ''}
            onChange={(e) => onChange({ ...schema, coverageStartTime: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Coverage End Time</label>
          <input
            type="datetime-local"
            value={schema.coverageEndTime || ''}
            onChange={(e) => onChange({ ...schema, coverageEndTime: e.target.value })}
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
}

// MedicalWebPage Schema Form Component
function MedicalWebPageSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: MedicalWebPageSchema; 
  onChange: (schema: MedicalWebPageSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Page Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className="input-field"
          placeholder="Medical/Health Page Title"
        />
      </div>

      <Select
        label="Medical Aspect"
        value={schema.aspect || ''}
        onChange={(value) => onChange({ ...schema, aspect: value })}
        placeholder="Select aspect..."
        options={[
          { value: 'Symptoms', label: 'Symptoms' },
          { value: 'Diagnosis', label: 'Diagnosis' },
          { value: 'Treatment', label: 'Treatment' },
          { value: 'Prevention', label: 'Prevention' },
          { value: 'Causes', label: 'Causes' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Last Reviewed Date</label>
          <input
            type="date"
            value={schema.lastReviewed || ''}
            onChange={(e) => onChange({ ...schema, lastReviewed: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Reviewed By</label>
          <input
            type="text"
            value={schema.reviewedBy?.name || ''}
            onChange={(e) => onChange({ 
              ...schema, 
              reviewedBy: { name: e.target.value, type: 'Person' }
            })}
            className="input-field"
            placeholder="Dr. Jane Doe"
          />
        </div>
      </div>
    </div>
  );
}

// SpecialAnnouncement Schema Form Component
function SpecialAnnouncementSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: SpecialAnnouncementSchema; 
  onChange: (schema: SpecialAnnouncementSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Announcement Title</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className="input-field"
          placeholder="Important Update"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Announcement Text</label>
        <textarea
          value={schema.text || ''}
          onChange={(e) => onChange({ ...schema, text: e.target.value })}
          className="input-field"
          rows={3}
          placeholder="Details of the announcement"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Date Posted</label>
          <input
            type="datetime-local"
            value={schema.datePosted || ''}
            onChange={(e) => onChange({ ...schema, datePosted: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Expires</label>
          <input
            type="datetime-local"
            value={schema.expires || ''}
            onChange={(e) => onChange({ ...schema, expires: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Spatial Coverage (comma-separated)</label>
        <input
          type="text"
          value={Array.isArray(schema.spatialCoverage) ? schema.spatialCoverage.join(', ') : schema.spatialCoverage || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            spatialCoverage: e.target.value.includes(',') 
              ? e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              : e.target.value
          })}
          className="input-field"
          placeholder="USA, Canada, Europe"
        />
      </div>
    </div>
  );
}

// Dataset Schema Form Component
function DatasetSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: DatasetSchema; 
  onChange: (schema: DatasetSchema) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Dataset Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className="input-field"
          placeholder="Dataset Title"
        />
      </div>

      <div>
        <label className="text-label block mb-1" style={LABEL_STYLE}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className="input-field"
          rows={2}
          placeholder="Brief description of the dataset"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>Temporal Coverage</label>
          <input
            type="text"
            value={schema.temporalCoverage || ''}
            onChange={(e) => onChange({ ...schema, temporalCoverage: e.target.value })}
            className="input-field"
            placeholder="2020/2024 or 2020-01-01/2024-12-31"
          />
        </div>
        <div>
          <label className="text-label block mb-1" style={LABEL_STYLE}>License</label>
          <input
            type="text"
            value={schema.license || ''}
            onChange={(e) => onChange({ ...schema, license: e.target.value })}
            className="input-field"
            placeholder="CC-BY-4.0, MIT, etc."
          />
        </div>
      </div>
    </div>
  );
}

// Generic Schema Form Component for simple schemas
function GenericSchemaForm({ 
  schema, 
  onChange 
}: { 
  schema: PageSchema; 
  onChange: (schema: PageSchema) => void;
}) {
  return (
    <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
      <p style={{ margin: '0 0 8px' }}>This schema type is automatically generated based on page content.</p>
      <p style={{ margin: 0 }}>No additional configuration needed.</p>
    </div>
  );
}