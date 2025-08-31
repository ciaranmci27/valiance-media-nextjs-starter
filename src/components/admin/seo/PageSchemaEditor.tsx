'use client';

import { useState, useEffect } from 'react';

// Consistent input styling for dark mode support
const INPUT_CLASS = 'w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors';
const LABEL_CLASS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
const BUTTON_PRIMARY_CLASS = 'px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors shadow-sm';
const BUTTON_DANGER_CLASS = 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm transition-colors';
const SECTION_CLASS = 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3';
const CARD_CLASS = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2';
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
        return <div className="text-sm text-gray-500">Schema editor not yet implemented for {(schema as any).type || 'unknown'}</div>;
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

  return (
    <div className="space-y-6">
      {/* Add Schema Dropdown */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Schema:</label>
        <select 
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer shadow-sm"
          onChange={(e) => {
            if (e.target.value) {
              addSchema(e.target.value);
              e.target.value = '';
            }
          }}
          value=""
        >
          <option value="">Select a schema type...</option>
          {availableSchemas.map(type => (
            <option key={type} value={type}>
              {getSchemaIcon(type)} {type}
            </option>
          ))}
        </select>
      </div>

      {/* Active Schemas */}
      {activeSchemas.length > 0 && (
        <div className="space-y-4">
          {activeSchemas.map((schema, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-all">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg"
                onClick={() => setExpandedSchema(expandedSchema === schema.type ? null : schema.type)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getSchemaIcon(schema.type)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{schema.type}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {schema.enabled ? '✓ Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSchema(index);
                    }}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Remove
                  </button>
                  <span className="text-gray-400 dark:text-gray-500">
                    {expandedSchema === schema.type ? '▼' : '▶'}
                  </span>
                </div>
              </div>
              
              {expandedSchema === schema.type && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                  {renderSchemaForm(schema, index)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview JSON-LD */}
      {activeSchemas.length > 0 && (
        <details className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <summary className="cursor-pointer font-medium text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary-light transition-colors">
            Preview JSON-LD Output
          </summary>
          <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto text-xs text-gray-800 dark:text-gray-200">
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
      <div>
        <label className={LABEL_CLASS}>Article Type</label>
        <select 
          value={schema.type}
          onChange={(e) => onChange({ ...schema, type: e.target.value as ArticleSchema['type'] })}
          className={INPUT_CLASS}
        >
          <option value="Article">Article</option>
          <option value="BlogPosting">Blog Posting</option>
          <option value="NewsArticle">News Article</option>
        </select>
      </div>

      <div>
        <label className={LABEL_CLASS}>Headline</label>
        <input
          type="text"
          value={schema.headline || pageData?.title || ''}
          onChange={(e) => onChange({ ...schema, headline: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Article headline"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Alternative Headline</label>
        <input
          type="text"
          value={schema.alternativeHeadline || ''}
          onChange={(e) => onChange({ ...schema, alternativeHeadline: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Optional alternative headline"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Author Name</label>
        <input
          type="text"
          value={schema.author?.name || pageData?.author || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            author: { ...schema.author, name: e.target.value }
          })}
          className={INPUT_CLASS}
          placeholder="Author name"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Word Count</label>
        <input
          type="number"
          value={schema.wordCount || ''}
          onChange={(e) => onChange({ ...schema, wordCount: parseInt(e.target.value) })}
          className={INPUT_CLASS}
          placeholder="Number of words"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Reading Time</label>
        <input
          type="text"
          value={schema.timeRequired || ''}
          onChange={(e) => onChange({ ...schema, timeRequired: e.target.value })}
          className={INPUT_CLASS}
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
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Questions & Answers</h4>
        <button
          type="button"
          onClick={addQuestion}
          className={BUTTON_PRIMARY_CLASS}
        >
          Add Question
        </button>
      </div>

      {(schema.mainEntity || []).map((qa, index) => (
        <div key={index} className={CARD_CLASS}>
          <div>
            <label className={LABEL_CLASS}>Question {index + 1}</label>
            <input
              type="text"
              value={qa.question}
              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
              className={INPUT_CLASS}
              placeholder="Enter question"
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Answer</label>
            <textarea
              value={qa.answer}
              onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
              className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Guide Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className={INPUT_CLASS}
          placeholder="How-to guide title"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
          rows={2}
          placeholder="Brief description"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Total Time (ISO 8601)</label>
        <input
          type="text"
          value={schema.totalTime || ''}
          onChange={(e) => onChange({ ...schema, totalTime: e.target.value })}
          className={INPUT_CLASS}
          placeholder="e.g., PT30M (30 minutes)"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Steps</h4>
          <button
            type="button"
            onClick={addStep}
            className={BUTTON_PRIMARY_CLASS}
          >
            Add Step
          </button>
        </div>

        {(schema.step || []).map((step, index) => (
          <div key={index} className={CARD_CLASS}>
            <div>
              <label className={LABEL_CLASS}>Step {index + 1} Name</label>
              <input
                type="text"
                value={step.name}
                onChange={(e) => updateStep(index, 'name', e.target.value)}
                className={INPUT_CLASS}
                placeholder="Step name"
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Instructions</label>
              <textarea
                value={step.text}
                onChange={(e) => updateStep(index, 'text', e.target.value)}
                className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Video Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Video title"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
          rows={2}
          placeholder="Video description"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Thumbnail URL</label>
        <input
          type="text"
          value={schema.thumbnailUrl || ''}
          onChange={(e) => onChange({ ...schema, thumbnailUrl: e.target.value })}
          className={INPUT_CLASS}
          placeholder="https://example.com/thumbnail.jpg"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Duration (ISO 8601)</label>
        <input
          type="text"
          value={schema.duration || ''}
          onChange={(e) => onChange({ ...schema, duration: e.target.value })}
          className={INPUT_CLASS}
          placeholder="e.g., PT4M35S (4 minutes 35 seconds)"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Embed URL</label>
        <input
          type="text"
          value={schema.embedUrl || ''}
          onChange={(e) => onChange({ ...schema, embedUrl: e.target.value })}
          className={INPUT_CLASS}
          placeholder="https://www.youtube.com/embed/VIDEO_ID"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Upload Date</label>
        <input
          type="date"
          value={schema.uploadDate || ''}
          onChange={(e) => onChange({ ...schema, uploadDate: e.target.value })}
          className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Product Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Product name"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
          rows={2}
          placeholder="Product description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>SKU</label>
          <input
            type="text"
            value={schema.sku || ''}
            onChange={(e) => onChange({ ...schema, sku: e.target.value })}
            className={INPUT_CLASS}
            placeholder="SKU"
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>Brand</label>
          <input
            type="text"
            value={schema.brand?.name || ''}
            onChange={(e) => onChange({ 
              ...schema, 
              brand: { name: e.target.value }
            })}
            className={INPUT_CLASS}
            placeholder="Brand name"
          />
        </div>
      </div>

      <div className={SECTION_CLASS}>
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Pricing & Availability</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Price</label>
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
              className={INPUT_CLASS}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Currency</label>
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
              className={INPUT_CLASS}
              placeholder="USD"
            />
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>Availability</label>
          <select
            value={schema.offers?.availability || 'InStock'}
            onChange={(e) => onChange({ 
              ...schema, 
              offers: { 
                ...schema.offers,
                availability: e.target.value as 'InStock' | 'OutOfStock' | 'PreOrder' | 'BackOrder'
              } as ProductSchema['offers']
            })}
            className={INPUT_CLASS}
          >
            <option value="InStock">In Stock</option>
            <option value="OutOfStock">Out of Stock</option>
            <option value="PreOrder">Pre-Order</option>
            <option value="BackOrder">Back Order</option>
          </select>
        </div>
      </div>

      <div className={SECTION_CLASS}>
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Rating</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Rating Value</label>
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
              className={INPUT_CLASS}
              placeholder="4.5"
              min="0"
              max="5"
              step="0.1"
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Review Count</label>
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
              className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Event Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Event name"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
          rows={2}
          placeholder="Event description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Start Date</label>
          <input
            type="datetime-local"
            value={schema.startDate || ''}
            onChange={(e) => onChange({ ...schema, startDate: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>End Date</label>
          <input
            type="datetime-local"
            value={schema.endDate || ''}
            onChange={(e) => onChange({ ...schema, endDate: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Event Status</label>
        <select
          value={schema.eventStatus || 'EventScheduled'}
          onChange={(e) => onChange({ ...schema, eventStatus: e.target.value as EventSchema['eventStatus'] })}
          className={INPUT_CLASS}
        >
          <option value="EventScheduled">Scheduled</option>
          <option value="EventCancelled">Cancelled</option>
          <option value="EventPostponed">Postponed</option>
          <option value="EventRescheduled">Rescheduled</option>
        </select>
      </div>

      <div>
        <label className={LABEL_CLASS}>Attendance Mode</label>
        <select
          value={schema.eventAttendanceMode || 'OfflineEventAttendanceMode'}
          onChange={(e) => onChange({ ...schema, eventAttendanceMode: e.target.value as EventSchema['eventAttendanceMode'] })}
          className={INPUT_CLASS}
        >
          <option value="OfflineEventAttendanceMode">In-Person</option>
          <option value="OnlineEventAttendanceMode">Online</option>
          <option value="MixedEventAttendanceMode">Hybrid</option>
        </select>
      </div>
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
        <label className={LABEL_CLASS}>Recipe Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Recipe name"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
          rows={2}
          placeholder="Recipe description"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={LABEL_CLASS}>Prep Time</label>
          <input
            type="text"
            value={schema.prepTime || ''}
            onChange={(e) => onChange({ ...schema, prepTime: e.target.value })}
            className={INPUT_CLASS}
            placeholder="PT15M"
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>Cook Time</label>
          <input
            type="text"
            value={schema.cookTime || ''}
            onChange={(e) => onChange({ ...schema, cookTime: e.target.value })}
            className={INPUT_CLASS}
            placeholder="PT30M"
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>Yield</label>
          <input
            type="text"
            value={schema.recipeYield || ''}
            onChange={(e) => onChange({ ...schema, recipeYield: e.target.value })}
            className={INPUT_CLASS}
            placeholder="4 servings"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Ingredients</h4>
          <button
            type="button"
            onClick={addIngredient}
            className={BUTTON_PRIMARY_CLASS}
          >
            Add Ingredient
          </button>
        </div>

        {(schema.recipeIngredient || []).map((ingredient, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => updateIngredient(index, e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder="e.g., 2 cups flour"
            />
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Instructions</h4>
          <button
            type="button"
            onClick={addInstruction}
            className={BUTTON_PRIMARY_CLASS}
          >
            Add Step
          </button>
        </div>

        {(schema.recipeInstructions || []).map((instruction, index) => (
          <div key={index} className={CARD_CLASS}>
            <div>
              <label className={LABEL_CLASS}>Step {index + 1}</label>
              <textarea
                value={instruction.text}
                onChange={(e) => updateInstruction(index, 'text', e.target.value)}
                className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Service Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Service name"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
          rows={2}
          placeholder="Service description"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Service Type</label>
        <input
          type="text"
          value={schema.serviceType || ''}
          onChange={(e) => onChange({ ...schema, serviceType: e.target.value })}
          className={INPUT_CLASS}
          placeholder="e.g., Web Development, Consulting"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Area Served</label>
        <input
          type="text"
          value={schema.areaServed || ''}
          onChange={(e) => onChange({ ...schema, areaServed: e.target.value })}
          className={INPUT_CLASS}
          placeholder="e.g., United States, Global"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Provider Name</label>
        <input
          type="text"
          value={schema.provider?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            provider: { ...schema.provider, name: e.target.value }
          })}
          className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Course Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Course name"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
          rows={2}
          placeholder="Course description"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Provider Name</label>
        <input
          type="text"
          value={schema.provider?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            provider: { ...schema.provider, name: e.target.value }
          })}
          className={INPUT_CLASS}
          placeholder="Institution or organization"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Course Code</label>
        <input
          type="text"
          value={schema.courseCode || ''}
          onChange={(e) => onChange({ ...schema, courseCode: e.target.value })}
          className={INPUT_CLASS}
          placeholder="e.g., CS101"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Credential Awarded</label>
        <input
          type="text"
          value={schema.educationalCredentialAwarded || ''}
          onChange={(e) => onChange({ ...schema, educationalCredentialAwarded: e.target.value })}
          className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Job Title</label>
        <input
          type="text"
          value={schema.title || ''}
          onChange={(e) => onChange({ ...schema, title: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Job title"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
          rows={3}
          placeholder="Job description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Date Posted</label>
          <input
            type="date"
            value={schema.datePosted || ''}
            onChange={(e) => onChange({ ...schema, datePosted: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>Valid Through</label>
          <input
            type="date"
            value={schema.validThrough || ''}
            onChange={(e) => onChange({ ...schema, validThrough: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Employment Type</label>
        <select
          value={schema.employmentType || ''}
          onChange={(e) => onChange({ ...schema, employmentType: e.target.value })}
          className={INPUT_CLASS}
        >
          <option value="">Select type...</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACTOR">Contractor</option>
          <option value="TEMPORARY">Temporary</option>
          <option value="INTERN">Intern</option>
        </select>
      </div>

      <div>
        <label className={LABEL_CLASS}>Hiring Organization</label>
        <input
          type="text"
          value={schema.hiringOrganization?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            hiringOrganization: { ...schema.hiringOrganization, name: e.target.value }
          })}
          className={INPUT_CLASS}
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
      <div>
        <label className={LABEL_CLASS}>Application Type</label>
        <select
          value={schema.type}
          onChange={(e) => onChange({ ...schema, type: e.target.value as SoftwareApplicationSchema['type'] })}
          className={INPUT_CLASS}
        >
          <option value="SoftwareApplication">Software Application</option>
          <option value="MobileApplication">Mobile Application</option>
          <option value="WebApplication">Web Application</option>
        </select>
      </div>

      <div>
        <label className={LABEL_CLASS}>Application Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Application name"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
          rows={2}
          placeholder="Application description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Category</label>
          <input
            type="text"
            value={schema.applicationCategory || ''}
            onChange={(e) => onChange({ ...schema, applicationCategory: e.target.value })}
            className={INPUT_CLASS}
            placeholder="e.g., Productivity"
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>Version</label>
          <input
            type="text"
            value={schema.softwareVersion || ''}
            onChange={(e) => onChange({ ...schema, softwareVersion: e.target.value })}
            className={INPUT_CLASS}
            placeholder="e.g., 1.0.0"
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Operating System</label>
        <input
          type="text"
          value={schema.operatingSystem || ''}
          onChange={(e) => onChange({ ...schema, operatingSystem: e.target.value })}
          className={INPUT_CLASS}
          placeholder="e.g., Windows, macOS, iOS, Android"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Price</label>
          <input
            type="text"
            value={schema.offers?.price || ''}
            onChange={(e) => onChange({ 
              ...schema, 
              offers: { ...schema.offers, price: e.target.value }
            })}
            className={INPUT_CLASS}
            placeholder="0 or Free"
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>File Size</label>
          <input
            type="text"
            value={schema.fileSize || ''}
            onChange={(e) => onChange({ ...schema, fileSize: e.target.value })}
            className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Item Being Reviewed</label>
        <input
          type="text"
          value={schema.itemReviewed?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            itemReviewed: { ...schema.itemReviewed, name: e.target.value }
          })}
          className={INPUT_CLASS}
          placeholder="Product, service, or item name"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Item Type</label>
        <input
          type="text"
          value={schema.itemReviewed?.type || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            itemReviewed: { ...schema.itemReviewed, type: e.target.value }
          })}
          className={INPUT_CLASS}
          placeholder="e.g., Product, Service, Book"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Rating (1-5)</label>
        <input
          type="number"
          value={schema.reviewRating?.ratingValue || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            reviewRating: { ...schema.reviewRating, ratingValue: parseFloat(e.target.value) }
          })}
          className={INPUT_CLASS}
          placeholder="5"
          min="1"
          max="5"
          step="0.5"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Author Name</label>
        <input
          type="text"
          value={schema.author?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            author: { name: e.target.value }
          })}
          className={INPUT_CLASS}
          placeholder="Reviewer name"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Review Text</label>
        <textarea
          value={schema.reviewBody || ''}
          onChange={(e) => onChange({ ...schema, reviewBody: e.target.value })}
          className={INPUT_CLASS}
          rows={3}
          placeholder="Review content"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Date Published</label>
        <input
          type="date"
          value={schema.datePublished || ''}
          onChange={(e) => onChange({ ...schema, datePublished: e.target.value })}
          className={INPUT_CLASS}
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
          <label className={LABEL_CLASS}>Quiz Name</label>
          <input
            type="text"
            value={schema.name || ''}
            onChange={(e) => onChange({ ...schema, name: e.target.value })}
            className={INPUT_CLASS}
            placeholder="Quiz Title"
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Educational Level</label>
          <input
            type="text"
            value={schema.educationalLevel || ''}
            onChange={(e) => onChange({ ...schema, educationalLevel: e.target.value })}
            className={INPUT_CLASS}
            placeholder="All levels"
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
          rows={2}
          placeholder="Describe what the quiz is about"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={LABEL_CLASS}>Time Required (e.g., PT2M)</label>
          <input
            type="text"
            value={schema.timeRequired || ''}
            onChange={(e) => onChange({ ...schema, timeRequired: e.target.value })}
            className={INPUT_CLASS}
            placeholder="PT2M"
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Number of Questions</label>
          <input
            type="number"
            value={schema.numberOfQuestions || ''}
            onChange={(e) => onChange({ ...schema, numberOfQuestions: parseInt(e.target.value) || undefined })}
            className={INPUT_CLASS}
            placeholder="10"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={schema.isAccessibleForFree ?? true}
              onChange={(e) => onChange({ ...schema, isAccessibleForFree: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Free to access</span>
          </label>
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Quiz Topic</label>
        <input
          type="text"
          value={typeof schema.about === 'string' ? schema.about : schema.about?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            about: e.target.value
          })}
          className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Question</label>
        <input
          type="text"
          value={schema.mainEntity?.name || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            mainEntity: { ...schema.mainEntity, type: 'Question', name: e.target.value }
          })}
          className={INPUT_CLASS}
          placeholder="What is the main question being answered?"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Accepted Answer</label>
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
          className={INPUT_CLASS}
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
          <label className={LABEL_CLASS}>Organization Name</label>
          <input
            type="text"
            value={schema.name || ''}
            onChange={(e) => onChange({ ...schema, name: e.target.value })}
            className={INPUT_CLASS}
            placeholder="Your Company"
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Phone Number</label>
          <input
            type="tel"
            value={schema.telephone || ''}
            onChange={(e) => onChange({ ...schema, telephone: e.target.value })}
            className={INPUT_CLASS}
            placeholder="+1-555-123-4567"
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Email</label>
        <input
          type="email"
          value={schema.email || ''}
          onChange={(e) => onChange({ ...schema, email: e.target.value })}
          className={INPUT_CLASS}
          placeholder="contact@example.com"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Organization/Person Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Your Company"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
          rows={3}
          placeholder="Brief description about the organization"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Founding Date</label>
        <input
          type="text"
          value={schema.foundingDate || ''}
          onChange={(e) => onChange({ ...schema, foundingDate: e.target.value })}
          className={INPUT_CLASS}
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
          <label className={LABEL_CLASS}>Person Name</label>
          <input
            type="text"
            value={schema.name || ''}
            onChange={(e) => onChange({ ...schema, name: e.target.value })}
            className={INPUT_CLASS}
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Job Title</label>
          <input
            type="text"
            value={schema.jobTitle || ''}
            onChange={(e) => onChange({ ...schema, jobTitle: e.target.value })}
            className={INPUT_CLASS}
            placeholder="Software Engineer"
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Bio/Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
          rows={3}
          placeholder="Brief bio about the person"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Social Media Links (comma-separated)</label>
        <input
          type="text"
          value={schema.sameAs?.join(', ') || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            sameAs: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Headline</label>
        <input
          type="text"
          value={schema.headline || ''}
          onChange={(e) => onChange({ ...schema, headline: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Live Coverage: Event Name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Coverage Start Time</label>
          <input
            type="datetime-local"
            value={schema.coverageStartTime || ''}
            onChange={(e) => onChange({ ...schema, coverageStartTime: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Coverage End Time</label>
          <input
            type="datetime-local"
            value={schema.coverageEndTime || ''}
            onChange={(e) => onChange({ ...schema, coverageEndTime: e.target.value })}
            className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Page Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Medical/Health Page Title"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Medical Aspect</label>
        <select
          value={schema.aspect || ''}
          onChange={(e) => onChange({ ...schema, aspect: e.target.value })}
          className={INPUT_CLASS}
        >
          <option value="">Select aspect...</option>
          <option value="Symptoms">Symptoms</option>
          <option value="Diagnosis">Diagnosis</option>
          <option value="Treatment">Treatment</option>
          <option value="Prevention">Prevention</option>
          <option value="Causes">Causes</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Last Reviewed Date</label>
          <input
            type="date"
            value={schema.lastReviewed || ''}
            onChange={(e) => onChange({ ...schema, lastReviewed: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Reviewed By</label>
          <input
            type="text"
            value={schema.reviewedBy?.name || ''}
            onChange={(e) => onChange({ 
              ...schema, 
              reviewedBy: { name: e.target.value, type: 'Person' }
            })}
            className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Announcement Title</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Important Update"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Announcement Text</label>
        <textarea
          value={schema.text || ''}
          onChange={(e) => onChange({ ...schema, text: e.target.value })}
          className={INPUT_CLASS}
          rows={3}
          placeholder="Details of the announcement"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Date Posted</label>
          <input
            type="datetime-local"
            value={schema.datePosted || ''}
            onChange={(e) => onChange({ ...schema, datePosted: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Expires</label>
          <input
            type="datetime-local"
            value={schema.expires || ''}
            onChange={(e) => onChange({ ...schema, expires: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Spatial Coverage (comma-separated)</label>
        <input
          type="text"
          value={Array.isArray(schema.spatialCoverage) ? schema.spatialCoverage.join(', ') : schema.spatialCoverage || ''}
          onChange={(e) => onChange({ 
            ...schema, 
            spatialCoverage: e.target.value.includes(',') 
              ? e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              : e.target.value
          })}
          className={INPUT_CLASS}
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
        <label className={LABEL_CLASS}>Dataset Name</label>
        <input
          type="text"
          value={schema.name || ''}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
          className={INPUT_CLASS}
          placeholder="Dataset Title"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea
          value={schema.description || ''}
          onChange={(e) => onChange({ ...schema, description: e.target.value })}
          className={INPUT_CLASS}
          rows={2}
          placeholder="Brief description of the dataset"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Temporal Coverage</label>
          <input
            type="text"
            value={schema.temporalCoverage || ''}
            onChange={(e) => onChange({ ...schema, temporalCoverage: e.target.value })}
            className={INPUT_CLASS}
            placeholder="2020/2024 or 2020-01-01/2024-12-31"
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>License</label>
          <input
            type="text"
            value={schema.license || ''}
            onChange={(e) => onChange({ ...schema, license: e.target.value })}
            className={INPUT_CLASS}
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
    <div className="text-sm text-gray-600 dark:text-gray-400">
      <p>This schema type is automatically generated based on page content.</p>
      <p className="mt-2">No additional configuration needed.</p>
    </div>
  );
}