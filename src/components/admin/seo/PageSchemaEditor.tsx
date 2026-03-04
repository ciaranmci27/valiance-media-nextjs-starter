'use client';

import { useState, useEffect, useMemo } from 'react';
import { seoConfig } from '@/lib/seo/config';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CodeBracketIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { TextInput, Textarea, NumberInput, Toggle, DateInput, TimeInput, Select } from '@/components/ui/inputs';

const BUTTON_PRIMARY_CLASS = 'admin-btn admin-btn-primary admin-btn-sm';
const BUTTON_DANGER_CLASS = 'admin-btn admin-btn-danger admin-btn-sm';

/** Returns today's date in YYYY-MM-DD using the user's local timezone (not UTC). */
function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
} from '@/lib/seo/schema-types';

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
        description="Add structured data schemas to enable rich results in search engines"
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

      <TextInput
        label="Headline"
        value={schema.headline || pageData?.title || ''}
        onChange={(val) => onChange({ ...schema, headline: val })}
        placeholder="Article headline"
      />

      <TextInput
        label="Alternative Headline"
        value={schema.alternativeHeadline || ''}
        onChange={(val) => onChange({ ...schema, alternativeHeadline: val })}
        placeholder="Optional alternative headline"
      />

      <TextInput
        label="Author Name"
        value={schema.author?.name || pageData?.author || ''}
        onChange={(val) => onChange({
          ...schema,
          author: { ...schema.author, name: val }
        })}
        placeholder="Author name"
      />

      <NumberInput
        label="Word Count"
        value={schema.wordCount || ''}
        onChange={(val) => onChange({ ...schema, wordCount: typeof val === 'number' ? val : undefined })}
        placeholder="Number of words"
      />

      <TextInput
        label="Reading Time"
        value={schema.timeRequired || ''}
        onChange={(val) => onChange({ ...schema, timeRequired: val })}
        placeholder="e.g., PT5M (5 minutes)"
      />
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

  const questions = schema.mainEntity || [];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          Questions & Answers
          {questions.length > 0 && (
            <span style={{ fontWeight: 400, fontSize: '12px', color: 'var(--color-text-tertiary)', marginLeft: '8px' }}>
              ({questions.length})
            </span>
          )}
        </h4>
        <button
          type="button"
          onClick={addQuestion}
          className={BUTTON_PRIMARY_CLASS}
        >
          Add Question
        </button>
      </div>

      {questions.length === 0 && (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: 'var(--color-text-tertiary)',
            fontSize: '13px',
            border: '1px dashed var(--color-border-light)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          No questions added yet. Click "Add Question" to get started.
        </div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border-light)', display: questions.length ? 'block' : 'none' }}>
        {questions.map((qa, index) => (
          <div
            key={index}
            style={{
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderBottom: index < questions.length - 1 ? '1px solid var(--color-border-light)' : 'none',
            }}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Q{index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-tertiary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            <TextInput
              label="Question"
              value={qa.question}
              onChange={(val) => updateQuestion(index, 'question', val)}
              placeholder="Enter question"
            />
            <Textarea
              label="Answer"
              value={qa.answer}
              onChange={(val) => updateQuestion(index, 'answer', val)}
              rows={2}
              placeholder="Enter answer"
            />
          </div>
        ))}
      </div>
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

  const steps = schema.step || [];

  return (
    <div className="space-y-4">
      <TextInput
        label="Guide Name"
        value={schema.name || ''}
        onChange={(val) => onChange({ ...schema, name: val })}
        placeholder="How-to guide title"
      />

      <Textarea
        label="Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={2}
        placeholder="Brief description"
      />

      <TextInput
        label="Total Time (ISO 8601)"
        value={schema.totalTime || ''}
        onChange={(val) => onChange({ ...schema, totalTime: val })}
        placeholder="e.g., PT30M (30 minutes)"
      />

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            Steps
            {steps.length > 0 && (
              <span style={{ fontWeight: 400, fontSize: '12px', color: 'var(--color-text-tertiary)', marginLeft: '8px' }}>
                ({steps.length})
              </span>
            )}
          </h4>
          <button
            type="button"
            onClick={addStep}
            className={BUTTON_PRIMARY_CLASS}
          >
            Add Step
          </button>
        </div>

        {steps.length === 0 && (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--color-text-tertiary)',
              fontSize: '13px',
              border: '1px dashed var(--color-border-light)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            No steps added yet. Click "Add Step" to get started.
          </div>
        )}

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border-light)', display: steps.length ? 'block' : 'none' }}>
          {steps.map((step, index) => (
            <div
              key={index}
              style={{
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                borderBottom: index < steps.length - 1 ? '1px solid var(--color-border-light)' : 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Step {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-tertiary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
              <TextInput
                label="Name"
                value={step.name}
                onChange={(val) => updateStep(index, 'name', val)}
                placeholder="Step name"
              />
              <Textarea
                label="Instructions"
                value={step.text}
                onChange={(val) => updateStep(index, 'text', val)}
                rows={2}
                placeholder="Step instructions"
              />
            </div>
          ))}
        </div>
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
      <TextInput
        label="Video Name"
        value={schema.name || ''}
        onChange={(val) => onChange({ ...schema, name: val })}
        placeholder="Video title"
      />

      <Textarea
        label="Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={2}
        placeholder="Video description"
      />

      <TextInput
        label="Thumbnail URL"
        value={typeof schema.thumbnailUrl === 'string' ? schema.thumbnailUrl : (schema.thumbnailUrl?.[0] || '')}
        onChange={(val) => onChange({ ...schema, thumbnailUrl: val })}
        placeholder="https://example.com/thumbnail.jpg"
      />

      <TextInput
        label="Duration (ISO 8601)"
        value={schema.duration || ''}
        onChange={(val) => onChange({ ...schema, duration: val })}
        placeholder="e.g., PT4M35S (4 minutes 35 seconds)"
      />

      <TextInput
        label="Embed URL"
        value={schema.embedUrl || ''}
        onChange={(val) => onChange({ ...schema, embedUrl: val })}
        placeholder="https://www.youtube.com/embed/VIDEO_ID"
      />

      <DateInput
        label="Upload Date"
        value={schema.uploadDate || ''}
        onChange={(val) => onChange({ ...schema, uploadDate: val })}
      />
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
      <TextInput
        label="Product Name"
        value={schema.name || ''}
        onChange={(val) => onChange({ ...schema, name: val })}
        placeholder="Product name"
      />

      <Textarea
        label="Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={2}
        placeholder="Product description"
      />

      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label="SKU"
          value={schema.sku || ''}
          onChange={(val) => onChange({ ...schema, sku: val })}
          placeholder="SKU"
        />

        <TextInput
          label="Brand"
          value={schema.brand?.name || ''}
          onChange={(val) => onChange({
            ...schema,
            brand: { name: val }
          })}
          placeholder="Brand name"
        />
      </div>

      <div style={SECTION_STYLE}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Pricing & Availability</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Price"
            value={schema.offers?.price || ''}
            onChange={(val) => onChange({
              ...schema,
              offers: {
                ...schema.offers,
                price: typeof val === 'number' ? val : 0,
                priceCurrency: schema.offers?.priceCurrency || 'USD'
              } as ProductSchema['offers']
            })}
            placeholder="0.00"
            step={0.01}
          />

          <TextInput
            label="Currency"
            value={schema.offers?.priceCurrency || 'USD'}
            onChange={(val) => onChange({
              ...schema,
              offers: {
                ...schema.offers,
                priceCurrency: val
              } as ProductSchema['offers']
            })}
            placeholder="USD"
          />
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
          <NumberInput
            label="Rating Value"
            value={schema.aggregateRating?.ratingValue || ''}
            onChange={(val) => onChange({
              ...schema,
              aggregateRating: {
                ...schema.aggregateRating,
                ratingValue: typeof val === 'number' ? val : 0,
                reviewCount: schema.aggregateRating?.reviewCount || 0
              }
            })}
            placeholder="4.5"
            min={0}
            max={5}
            step={0.1}
          />

          <NumberInput
            label="Review Count"
            value={schema.aggregateRating?.reviewCount || ''}
            onChange={(val) => onChange({
              ...schema,
              aggregateRating: {
                ...schema.aggregateRating,
                ratingValue: schema.aggregateRating?.ratingValue || 0,
                reviewCount: typeof val === 'number' ? val : 0
              }
            })}
            placeholder="0"
            min={0}
          />
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
      <TextInput
        label="Event Name"
        value={schema.name || ''}
        onChange={(val) => onChange({ ...schema, name: val })}
        placeholder="Event name"
      />

      <Textarea
        label="Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={2}
        placeholder="Event description"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="grid grid-cols-2 gap-2">
            <DateInput
              label="Start Date"
              value={(schema.startDate || '').split('T')[0]}
              onChange={(val) => {
                const time = (schema.startDate || '').split('T')[1] || '00:00';
                onChange({ ...schema, startDate: val ? `${val}T${time}` : '' });
              }}
            />
            <TimeInput
              label="Time"
              value={(schema.startDate || '').split('T')[1] || ''}
              onChange={(val) => {
                const date = (schema.startDate || '').split('T')[0] || getLocalDateString();
                onChange({ ...schema, startDate: `${date}T${val}` });
              }}
              use24Hour
            />
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-2">
            <DateInput
              label="End Date"
              value={(schema.endDate || '').split('T')[0]}
              onChange={(val) => {
                const time = (schema.endDate || '').split('T')[1] || '00:00';
                onChange({ ...schema, endDate: val ? `${val}T${time}` : '' });
              }}
            />
            <TimeInput
              label="Time"
              value={(schema.endDate || '').split('T')[1] || ''}
              onChange={(val) => {
                const date = (schema.endDate || '').split('T')[0] || getLocalDateString();
                onChange({ ...schema, endDate: `${date}T${val}` });
              }}
              use24Hour
            />
          </div>
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
      <TextInput
        label="Recipe Name"
        value={schema.name || ''}
        onChange={(val) => onChange({ ...schema, name: val })}
        placeholder="Recipe name"
      />

      <Textarea
        label="Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={2}
        placeholder="Recipe description"
      />

      <div className="grid grid-cols-3 gap-4">
        <TextInput
          label="Prep Time"
          value={schema.prepTime || ''}
          onChange={(val) => onChange({ ...schema, prepTime: val })}
          placeholder="PT15M"
        />

        <TextInput
          label="Cook Time"
          value={schema.cookTime || ''}
          onChange={(val) => onChange({ ...schema, cookTime: val })}
          placeholder="PT30M"
        />

        <TextInput
          label="Yield"
          value={schema.recipeYield || ''}
          onChange={(val) => onChange({ ...schema, recipeYield: val })}
          placeholder="4 servings"
        />
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
            <TextInput
              value={ingredient}
              onChange={(val) => updateIngredient(index, val)}
              className="flex-1"
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
            <Textarea
              label={`Step ${index + 1}`}
              value={instruction.text}
              onChange={(val) => updateInstruction(index, 'text', val)}
              rows={2}
              placeholder="Instruction text"
            />
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
      <TextInput
        label="Service Name"
        value={schema.name || ''}
        onChange={(val) => onChange({ ...schema, name: val })}
        placeholder="Service name"
      />

      <Textarea
        label="Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={2}
        placeholder="Service description"
      />

      <TextInput
        label="Service Type"
        value={schema.serviceType || ''}
        onChange={(val) => onChange({ ...schema, serviceType: val })}
        placeholder="e.g., Web Development, Consulting"
      />

      <TextInput
        label="Area Served"
        value={typeof schema.areaServed === 'string' ? schema.areaServed : ''}
        onChange={(val) => onChange({ ...schema, areaServed: val })}
        placeholder="e.g., United States, Global"
      />

      <TextInput
        label="Provider Name"
        value={schema.provider?.name || ''}
        onChange={(val) => onChange({
          ...schema,
          provider: { ...schema.provider, name: val }
        })}
        placeholder="Company or person providing the service"
      />
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
      <TextInput
        label="Course Name"
        value={schema.name || ''}
        onChange={(val) => onChange({ ...schema, name: val })}
        placeholder="Course name"
      />

      <Textarea
        label="Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={2}
        placeholder="Course description"
      />

      <TextInput
        label="Provider Name"
        value={schema.provider?.name || ''}
        onChange={(val) => onChange({
          ...schema,
          provider: { ...schema.provider, name: val }
        })}
        placeholder="Institution or organization"
      />

      <TextInput
        label="Course Code"
        value={schema.courseCode || ''}
        onChange={(val) => onChange({ ...schema, courseCode: val })}
        placeholder="e.g., CS101"
      />

      <TextInput
        label="Credential Awarded"
        value={schema.educationalCredentialAwarded || ''}
        onChange={(val) => onChange({ ...schema, educationalCredentialAwarded: val })}
        placeholder="e.g., Certificate, Diploma"
      />
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
      <TextInput
        label="Job Title"
        value={schema.title || ''}
        onChange={(val) => onChange({ ...schema, title: val })}
        placeholder="Job title"
      />

      <Textarea
        label="Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={3}
        placeholder="Job description"
      />

      <div className="grid grid-cols-2 gap-4">
        <DateInput
          label="Date Posted"
          value={schema.datePosted || ''}
          onChange={(val) => onChange({ ...schema, datePosted: val })}
        />
        <DateInput
          label="Valid Through"
          value={schema.validThrough || ''}
          onChange={(val) => onChange({ ...schema, validThrough: val })}
        />
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

      <TextInput
        label="Hiring Organization"
        value={schema.hiringOrganization?.name || ''}
        onChange={(val) => onChange({
          ...schema,
          hiringOrganization: { ...schema.hiringOrganization, name: val }
        })}
        placeholder="Company name"
      />
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

      <TextInput
        label="Application Name"
        value={schema.name || ''}
        onChange={(val) => onChange({ ...schema, name: val })}
        placeholder="Application name"
      />

      <Textarea
        label="Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={2}
        placeholder="Application description"
      />

      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label="Category"
          value={schema.applicationCategory || ''}
          onChange={(val) => onChange({ ...schema, applicationCategory: val })}
          placeholder="e.g., Productivity"
        />

        <TextInput
          label="Version"
          value={schema.softwareVersion || ''}
          onChange={(val) => onChange({ ...schema, softwareVersion: val })}
          placeholder="e.g., 1.0.0"
        />
      </div>

      <TextInput
        label="Operating System"
        value={typeof schema.operatingSystem === 'string' ? schema.operatingSystem : ''}
        onChange={(val) => onChange({ ...schema, operatingSystem: val })}
        placeholder="e.g., Windows, macOS, iOS, Android"
      />

      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label="Price"
          value={String(schema.offers?.price || '')}
          onChange={(val) => onChange({
            ...schema,
            offers: { ...schema.offers, price: val }
          })}
          placeholder="0 or Free"
        />

        <TextInput
          label="File Size"
          value={schema.fileSize || ''}
          onChange={(val) => onChange({ ...schema, fileSize: val })}
          placeholder="e.g., 50MB"
        />
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
      <TextInput
        label="Item Being Reviewed"
        value={schema.itemReviewed?.name || ''}
        onChange={(val) => onChange({
          ...schema,
          itemReviewed: { ...schema.itemReviewed, name: val }
        })}
        placeholder="Product, service, or item name"
      />

      <TextInput
        label="Item Type"
        value={schema.itemReviewed?.type || ''}
        onChange={(val) => onChange({
          ...schema,
          itemReviewed: { ...schema.itemReviewed, type: val }
        })}
        placeholder="e.g., Product, Service, Book"
      />

      <NumberInput
        label="Rating (1-5)"
        value={schema.reviewRating?.ratingValue || ''}
        onChange={(val) => onChange({
          ...schema,
          reviewRating: { ...schema.reviewRating, ratingValue: typeof val === 'number' ? val : 0 }
        })}
        placeholder="5"
        min={1}
        max={5}
        step={0.5}
      />

      <TextInput
        label="Author Name"
        value={schema.author?.name || ''}
        onChange={(val) => onChange({
          ...schema,
          author: { name: val }
        })}
        placeholder="Reviewer name"
      />

      <Textarea
        label="Review Text"
        value={schema.reviewBody || ''}
        onChange={(val) => onChange({ ...schema, reviewBody: val })}
        rows={3}
        placeholder="Review content"
      />

      <DateInput
        label="Date Published"
        value={schema.datePublished || ''}
        onChange={(val) => onChange({ ...schema, datePublished: val })}
      />
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
        <TextInput
          label="Quiz Name"
          value={schema.name || ''}
          onChange={(val) => onChange({ ...schema, name: val })}
          placeholder="Quiz Title"
        />
        <TextInput
          label="Educational Level"
          value={schema.educationalLevel || ''}
          onChange={(val) => onChange({ ...schema, educationalLevel: val })}
          placeholder="All levels"
        />
      </div>

      <Textarea
        label="Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={2}
        placeholder="Describe what the quiz is about"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInput
          label="Time Required (e.g., PT2M)"
          value={schema.timeRequired || ''}
          onChange={(val) => onChange({ ...schema, timeRequired: val })}
          placeholder="PT2M"
        />
        <NumberInput
          label="Number of Questions"
          value={schema.numberOfQuestions || ''}
          onChange={(val) => onChange({ ...schema, numberOfQuestions: typeof val === 'number' ? val : undefined })}
          placeholder="10"
        />
        <div className="flex items-end">
          <Toggle
            label="Free to access"
            checked={schema.isAccessibleForFree ?? true}
            onChange={(checked) => onChange({ ...schema, isAccessibleForFree: checked })}
            size="sm"
          />
        </div>
      </div>

      <TextInput
        label="Quiz Topic"
        value={typeof schema.about === 'string' ? schema.about : schema.about?.name || ''}
        onChange={(val) => onChange({
          ...schema,
          about: val
        })}
        placeholder="Quiz topic or subject"
      />
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
      <TextInput
        label="Question"
        value={schema.mainEntity?.name || ''}
        onChange={(val) => onChange({
          ...schema,
          mainEntity: { ...schema.mainEntity, type: 'Question', name: val }
        })}
        placeholder="What is the main question being answered?"
      />

      <Textarea
        label="Accepted Answer"
        value={schema.mainEntity?.acceptedAnswer?.text || ''}
        onChange={(val) => onChange({
          ...schema,
          mainEntity: {
            ...schema.mainEntity,
            type: 'Question',
            name: schema.mainEntity?.name || '',
            acceptedAnswer: { type: 'Answer', text: val }
          }
        })}
        rows={3}
        placeholder="The best answer to the question"
      />
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
        <TextInput
          label="Organization Name"
          value={schema.name || ''}
          onChange={(val) => onChange({ ...schema, name: val })}
          placeholder={seoConfig.siteName}
        />
        <TextInput
          label="Phone Number"
          type="tel"
          value={schema.telephone || ''}
          onChange={(val) => onChange({ ...schema, telephone: val })}
          placeholder="+1-555-123-4567"
        />
      </div>

      <TextInput
        label="Email"
        type="email"
        value={schema.email || ''}
        onChange={(val) => onChange({ ...schema, email: val })}
        placeholder="contact@example.com"
      />

      <Textarea
        label="Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={2}
        placeholder="Brief description of the contact page"
      />
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
      <TextInput
        label="Organization/Person Name"
        value={schema.name || ''}
        onChange={(val) => onChange({ ...schema, name: val })}
        placeholder={seoConfig.siteName}
      />

      <Textarea
        label="Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={3}
        placeholder="Brief description about the organization"
      />

      <TextInput
        label="Founding Date"
        value={schema.foundingDate || ''}
        onChange={(val) => onChange({ ...schema, foundingDate: val })}
        placeholder="YYYY or YYYY-MM-DD"
      />
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
        <TextInput
          label="Person Name"
          value={schema.name || ''}
          onChange={(val) => onChange({ ...schema, name: val })}
          placeholder="John Doe"
        />
        <TextInput
          label="Job Title"
          value={schema.jobTitle || ''}
          onChange={(val) => onChange({ ...schema, jobTitle: val })}
          placeholder="Software Engineer"
        />
      </div>

      <Textarea
        label="Bio/Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={3}
        placeholder="Brief bio about the person"
      />

      <TextInput
        label="Social Media Links (comma-separated)"
        value={schema.sameAs?.join(', ') || ''}
        onChange={(val) => onChange({
          ...schema,
          sameAs: val.split(',').map(s => s.trim()).filter(Boolean)
        })}
        placeholder="https://twitter.com/username, https://linkedin.com/in/username"
      />
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
      <TextInput
        label="Headline"
        value={schema.headline || ''}
        onChange={(val) => onChange({ ...schema, headline: val })}
        placeholder="Live Coverage: Event Name"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="grid grid-cols-2 gap-2">
            <DateInput
              label="Coverage Start"
              value={(schema.coverageStartTime || '').split('T')[0]}
              onChange={(val) => {
                const time = (schema.coverageStartTime || '').split('T')[1] || '00:00';
                onChange({ ...schema, coverageStartTime: val ? `${val}T${time}` : '' });
              }}
            />
            <TimeInput
              label="Time"
              value={(schema.coverageStartTime || '').split('T')[1] || ''}
              onChange={(val) => {
                const date = (schema.coverageStartTime || '').split('T')[0] || getLocalDateString();
                onChange({ ...schema, coverageStartTime: `${date}T${val}` });
              }}
              use24Hour
            />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <DateInput
              label="Coverage End"
              value={(schema.coverageEndTime || '').split('T')[0]}
              onChange={(val) => {
                const time = (schema.coverageEndTime || '').split('T')[1] || '00:00';
                onChange({ ...schema, coverageEndTime: val ? `${val}T${time}` : '' });
              }}
            />
            <TimeInput
              label="Time"
              value={(schema.coverageEndTime || '').split('T')[1] || ''}
              onChange={(val) => {
                const date = (schema.coverageEndTime || '').split('T')[0] || getLocalDateString();
                onChange({ ...schema, coverageEndTime: `${date}T${val}` });
              }}
              use24Hour
            />
          </div>
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
      <TextInput
        label="Page Name"
        value={schema.name || ''}
        onChange={(val) => onChange({ ...schema, name: val })}
        placeholder="Medical/Health Page Title"
      />

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
        <DateInput
          label="Last Reviewed Date"
          value={schema.lastReviewed || ''}
          onChange={(val) => onChange({ ...schema, lastReviewed: val })}
        />
        <TextInput
          label="Reviewed By"
          value={schema.reviewedBy?.name || ''}
          onChange={(val) => onChange({
            ...schema,
            reviewedBy: { name: val, type: 'Person' }
          })}
          placeholder="Dr. Jane Doe"
        />
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
      <TextInput
        label="Announcement Title"
        value={schema.name || ''}
        onChange={(val) => onChange({ ...schema, name: val })}
        placeholder="Important Update"
      />

      <Textarea
        label="Announcement Text"
        value={schema.text || ''}
        onChange={(val) => onChange({ ...schema, text: val })}
        rows={3}
        placeholder="Details of the announcement"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="grid grid-cols-2 gap-2">
            <DateInput
              label="Date Posted"
              value={(schema.datePosted || '').split('T')[0]}
              onChange={(val) => {
                const time = (schema.datePosted || '').split('T')[1] || '00:00';
                onChange({ ...schema, datePosted: val ? `${val}T${time}` : '' });
              }}
            />
            <TimeInput
              label="Time"
              value={(schema.datePosted || '').split('T')[1] || ''}
              onChange={(val) => {
                const date = (schema.datePosted || '').split('T')[0] || getLocalDateString();
                onChange({ ...schema, datePosted: `${date}T${val}` });
              }}
              use24Hour
            />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-2">
            <DateInput
              label="Expires"
              value={(schema.expires || '').split('T')[0]}
              onChange={(val) => {
                const time = (schema.expires || '').split('T')[1] || '00:00';
                onChange({ ...schema, expires: val ? `${val}T${time}` : '' });
              }}
            />
            <TimeInput
              label="Time"
              value={(schema.expires || '').split('T')[1] || ''}
              onChange={(val) => {
                const date = (schema.expires || '').split('T')[0] || getLocalDateString();
                onChange({ ...schema, expires: `${date}T${val}` });
              }}
              use24Hour
            />
          </div>
        </div>
      </div>

      <TextInput
        label="Spatial Coverage (comma-separated)"
        value={Array.isArray(schema.spatialCoverage) ? schema.spatialCoverage.join(', ') : schema.spatialCoverage || ''}
        onChange={(val) => onChange({
          ...schema,
          spatialCoverage: val.includes(',')
            ? val.split(',').map(s => s.trim()).filter(Boolean)
            : val
        })}
        placeholder="USA, Canada, Europe"
      />
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
      <TextInput
        label="Dataset Name"
        value={schema.name || ''}
        onChange={(val) => onChange({ ...schema, name: val })}
        placeholder="Dataset Title"
      />

      <Textarea
        label="Description"
        value={schema.description || ''}
        onChange={(val) => onChange({ ...schema, description: val })}
        rows={2}
        placeholder="Brief description of the dataset"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Temporal Coverage"
          value={schema.temporalCoverage || ''}
          onChange={(val) => onChange({ ...schema, temporalCoverage: val })}
          placeholder="2020/2024 or 2020-01-01/2024-12-31"
        />
        <TextInput
          label="License"
          value={schema.license || ''}
          onChange={(val) => onChange({ ...schema, license: val })}
          placeholder="CC-BY-4.0, MIT, etc."
        />
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