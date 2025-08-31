/**
 * Page-specific schema type definitions
 * Each page type has relevant schemas that make sense for its content
 */

// Base schema interface
export interface BaseSchema {
  enabled: boolean;
  type: string;
}

// Article Schema (for blog posts and news)
export interface ArticleSchema extends BaseSchema {
  type: 'Article' | 'BlogPosting' | 'NewsArticle';
  headline?: string;
  alternativeHeadline?: string;
  image?: string;
  author?: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo?: string;
  };
  datePublished?: string;
  dateModified?: string;
  articleSection?: string;
  keywords?: string[];
  wordCount?: number;
  timeRequired?: string; // Reading time
}

// Product Schema (for product pages)
export interface ProductSchema extends BaseSchema {
  type: 'Product';
  name?: string;
  description?: string;
  image?: string[];
  brand?: {
    name: string;
  };
  sku?: string;
  mpn?: string; // Manufacturer Part Number
  gtin?: string; // Global Trade Item Number
  offers?: {
    price: number;
    priceCurrency: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder' | 'BackOrder';
    priceValidUntil?: string;
    url?: string;
    seller?: {
      name: string;
    };
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  review?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: {
      ratingValue: number;
    };
  }>;
}

// FAQ Schema
export interface FAQSchema extends BaseSchema {
  type: 'FAQPage';
  mainEntity: Array<{
    question: string;
    answer: string;
  }>;
}

// HowTo Schema
export interface HowToSchema extends BaseSchema {
  type: 'HowTo';
  name?: string;
  description?: string;
  image?: string;
  totalTime?: string; // ISO 8601 duration
  estimatedCost?: {
    value: number;
    currency: string;
  };
  supply?: Array<{
    name: string;
    image?: string;
  }>;
  tool?: Array<{
    name: string;
    image?: string;
  }>;
  step: Array<{
    name: string;
    text: string;
    image?: string;
    url?: string;
  }>;
}

// Video Schema
export interface VideoSchema extends BaseSchema {
  type: 'VideoObject';
  name?: string;
  description?: string;
  thumbnailUrl?: string | string[];
  uploadDate?: string;
  duration?: string; // ISO 8601 duration
  contentUrl?: string;
  embedUrl?: string;
  interactionStatistic?: {
    interactionType: 'WatchAction';
    userInteractionCount: number;
  };
}

// Event Schema
export interface EventSchema extends BaseSchema {
  type: 'Event';
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: {
    name: string;
    address?: {
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry?: string;
    };
  } | {
    url: string; // For online events
  };
  image?: string;
  performer?: Array<{
    name: string;
    type?: 'Person' | 'Organization';
  }>;
  offers?: {
    price?: number;
    priceCurrency?: string;
    availability?: string;
    url?: string;
    validFrom?: string;
  };
  organizer?: {
    name: string;
    url?: string;
  };
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventRescheduled';
  eventAttendanceMode?: 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode';
}

// Recipe Schema
export interface RecipeSchema extends BaseSchema {
  type: 'Recipe';
  name?: string;
  description?: string;
  image?: string | string[];
  author?: {
    name: string;
  };
  datePublished?: string;
  prepTime?: string; // ISO 8601 duration
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string;
  recipeCategory?: string;
  recipeCuisine?: string;
  nutrition?: {
    calories?: string;
    carbohydrateContent?: string;
    proteinContent?: string;
    fatContent?: string;
    fiberContent?: string;
    sugarContent?: string;
    sodiumContent?: string;
  };
  recipeIngredient: string[];
  recipeInstructions: Array<{
    name?: string;
    text: string;
    image?: string;
  }>;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  keywords?: string[];
}

// Course Schema
export interface CourseSchema extends BaseSchema {
  type: 'Course';
  name?: string;
  description?: string;
  provider?: {
    name: string;
    url?: string;
  };
  educationalCredentialAwarded?: string;
  courseCode?: string;
  coursePrerequisites?: string[];
  hasCourseInstance?: Array<{
    courseMode?: 'online' | 'onsite' | 'blended';
    startDate?: string;
    endDate?: string;
    location?: {
      name: string;
      address?: string;
    };
    instructor?: {
      name: string;
      description?: string;
    };
  }>;
}

// JobPosting Schema
export interface JobPostingSchema extends BaseSchema {
  type: 'JobPosting';
  title?: string;
  description?: string;
  datePosted?: string;
  validThrough?: string;
  employmentType?: string | string[]; // FULL_TIME, PART_TIME, CONTRACTOR, etc.
  hiringOrganization?: {
    name: string;
    url?: string;
    logo?: string;
  };
  jobLocation?: {
    address: {
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry?: string;
    };
  };
  baseSalary?: {
    currency: string;
    value: {
      value: number;
      unitText?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    } | {
      minValue: number;
      maxValue: number;
      unitText?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    };
  };
  responsibilities?: string;
  skills?: string[];
  qualifications?: string;
  educationRequirements?: string;
  experienceRequirements?: string;
}

// SoftwareApplication Schema
export interface SoftwareApplicationSchema extends BaseSchema {
  type: 'SoftwareApplication' | 'MobileApplication' | 'WebApplication';
  name?: string;
  description?: string;
  applicationCategory?: string;
  operatingSystem?: string | string[];
  offers?: {
    price: number | string; // Can be 0 or "Free"
    priceCurrency?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  screenshot?: string | string[];
  softwareVersion?: string;
  fileSize?: string;
  requirements?: string;
  permissions?: string[];
  downloadUrl?: string;
}

// Service Schema
export interface ServiceSchema extends BaseSchema {
  type: 'Service';
  name?: string;
  description?: string;
  provider?: {
    name: string;
    url?: string;
  };
  serviceType?: string;
  areaServed?: string | string[];
  availableChannel?: {
    serviceUrl?: string;
    servicePhone?: string;
    serviceSmsNumber?: string;
  };
  offers?: {
    price?: number | string;
    priceCurrency?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

// Review Schema (standalone or for aggregation)
export interface ReviewSchema extends BaseSchema {
  type: 'Review';
  itemReviewed: {
    type: string;
    name: string;
  };
  reviewRating: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
  author: {
    name: string;
  };
  datePublished?: string;
  reviewBody?: string;
}

// Aggregate Rating (can be used with multiple schemas)
export interface AggregateRatingSchema extends BaseSchema {
  type: 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

// Collection Page Schema (for category pages)
export interface CollectionPageSchema extends BaseSchema {
  type: 'CollectionPage';
  name?: string;
  description?: string;
  url?: string;
  mainEntity?: {
    itemListElement: Array<{
      type: string;
      position: number;
      url: string;
      name: string;
    }>;
  };
}

// ItemList Schema (for category/archive pages)
export interface ItemListSchema extends BaseSchema {
  type: 'ItemList';
  itemListElement: Array<{
    position: number;
    url?: string;
    name?: string;
    image?: string;
    description?: string;
  }>;
  numberOfItems?: number;
}

// Quiz Schema
export interface QuizSchema extends BaseSchema {
  type: 'Quiz';
  name?: string;
  description?: string;
  educationalLevel?: string;
  timeRequired?: string;
  isAccessibleForFree?: boolean;
  numberOfQuestions?: number;
  about?: string | { type: 'Thing'; name: string };
}

// QAPage Schema (different from FAQPage)
export interface QAPageSchema extends BaseSchema {
  type: 'QAPage';
  name?: string;
  mainEntity?: {
    type: 'Question';
    name: string;
    acceptedAnswer?: {
      type: 'Answer';
      text: string;
    };
  };
}

// ContactPage Schema
export interface ContactPageSchema extends BaseSchema {
  type: 'ContactPage';
  name?: string;
  description?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

// AboutPage Schema
export interface AboutPageSchema extends BaseSchema {
  type: 'AboutPage';
  name?: string;
  description?: string;
  foundingDate?: string;
  founders?: Array<{
    name: string;
    url?: string;
  }>;
}

// ProfilePage Schema
export interface ProfilePageSchema extends BaseSchema {
  type: 'ProfilePage';
  name?: string;
  jobTitle?: string;
  description?: string;
  sameAs?: string[];
}

// SearchResultsPage Schema
export interface SearchResultsPageSchema extends BaseSchema {
  type: 'SearchResultsPage';
  name?: string;
  mainContentOfPage?: {
    resultsCount?: number;
    searchQuery?: string;
  };
}

// MedicalWebPage Schema
export interface MedicalWebPageSchema extends BaseSchema {
  type: 'MedicalWebPage';
  name?: string;
  aspect?: string;
  lastReviewed?: string;
  reviewedBy?: {
    name: string;
    type?: 'Person' | 'Organization';
  };
}

// SpecialAnnouncement Schema
export interface SpecialAnnouncementSchema extends BaseSchema {
  type: 'SpecialAnnouncement';
  name?: string;
  text?: string;
  datePosted?: string;
  expires?: string;
  spatialCoverage?: string | string[];
}

// LiveBlogPosting Schema
export interface LiveBlogPostingSchema extends BaseSchema {
  type: 'LiveBlogPosting';
  headline?: string;
  coverageStartTime?: string;
  coverageEndTime?: string;
  liveBlogUpdate?: Array<{
    headline?: string;
    articleBody: string;
    datePublished: string;
  }>;
}

// Dataset Schema
export interface DatasetSchema extends BaseSchema {
  type: 'Dataset';
  name?: string;
  description?: string;
  temporalCoverage?: string;
  license?: string;
  distribution?: Array<{
    contentUrl: string;
    encodingFormat: string;
  }>;
}

// Union type for all schemas
export type PageSchema = 
  | ArticleSchema
  | ProductSchema
  | FAQSchema
  | HowToSchema
  | VideoSchema
  | EventSchema
  | RecipeSchema
  | CourseSchema
  | JobPostingSchema
  | SoftwareApplicationSchema
  | ServiceSchema
  | ReviewSchema
  | AggregateRatingSchema
  | CollectionPageSchema
  | ItemListSchema
  | QuizSchema
  | QAPageSchema
  | ContactPageSchema
  | AboutPageSchema
  | ProfilePageSchema
  | SearchResultsPageSchema
  | MedicalWebPageSchema
  | SpecialAnnouncementSchema
  | LiveBlogPostingSchema
  | DatasetSchema;

// Schema availability by page type
export const SCHEMAS_BY_PAGE_TYPE = {
  blogPost: [
    'Article',
    'BlogPosting',
    'NewsArticle',
    'FAQPage',
    'HowTo',
    'VideoObject',
    'Recipe',
    'Review',
    'LiveBlogPosting',
  ],
  category: [
    'CollectionPage',
    'ItemList',
    'FAQPage',
  ],
  page: [
    'FAQPage',
    'Service',
    'Course',
    'Event',
    'SoftwareApplication',
    'JobPosting',
    'HowTo',
    'VideoObject',
    'Quiz',
    'QAPage',
    'ContactPage',
    'AboutPage',
    'ProfilePage',
    'SearchResultsPage',
    'MedicalWebPage',
    'SpecialAnnouncement',
    'Dataset',
  ],
  product: [
    'Product',
    'Review',
    'AggregateRating',
    'FAQPage',
    'VideoObject',
  ],
} as const;

// Helper to get available schemas for a page type
export function getAvailableSchemasForPageType(pageType: keyof typeof SCHEMAS_BY_PAGE_TYPE): string[] {
  return [...(SCHEMAS_BY_PAGE_TYPE[pageType] || [])];
}

// Schema templates with smart defaults
export const SCHEMA_TEMPLATES: Record<string, Partial<PageSchema>> = {
  Article: {
    type: 'Article',
    enabled: false,
  },
  BlogPosting: {
    type: 'BlogPosting',
    enabled: false,
  },
  NewsArticle: {
    type: 'NewsArticle',
    enabled: false,
  },
  FAQPage: {
    type: 'FAQPage',
    enabled: false,
    mainEntity: [],
  },
  HowTo: {
    type: 'HowTo',
    enabled: false,
    step: [],
  },
  VideoObject: {
    type: 'VideoObject',
    enabled: false,
  },
  Product: {
    type: 'Product',
    enabled: false,
    offers: {
      price: 0,
      priceCurrency: 'USD',
      availability: 'InStock',
    },
  },
  Event: {
    type: 'Event',
    enabled: false,
    eventStatus: 'EventScheduled',
    eventAttendanceMode: 'OfflineEventAttendanceMode',
  },
  Recipe: {
    type: 'Recipe',
    enabled: false,
    recipeIngredient: [],
    recipeInstructions: [],
  },
  Course: {
    type: 'Course',
    enabled: false,
  },
  JobPosting: {
    type: 'JobPosting',
    enabled: false,
  },
  SoftwareApplication: {
    type: 'SoftwareApplication',
    enabled: false,
  },
  Service: {
    type: 'Service',
    enabled: false,
  },
  Review: {
    type: 'Review',
    enabled: false,
    reviewRating: {
      ratingValue: 0,
    },
    itemReviewed: {
      type: '',
      name: '',
    },
    author: {
      name: '',
    },
  },
  CollectionPage: {
    type: 'CollectionPage',
    enabled: false,
  },
  ItemList: {
    type: 'ItemList',
    enabled: false,
    itemListElement: [],
  },
  Quiz: {
    type: 'Quiz',
    enabled: false,
    isAccessibleForFree: true,
  },
  QAPage: {
    type: 'QAPage',
    enabled: false,
  },
  ContactPage: {
    type: 'ContactPage',
    enabled: false,
  },
  AboutPage: {
    type: 'AboutPage',
    enabled: false,
  },
  ProfilePage: {
    type: 'ProfilePage',
    enabled: false,
  },
  SearchResultsPage: {
    type: 'SearchResultsPage',
    enabled: false,
  },
  MedicalWebPage: {
    type: 'MedicalWebPage',
    enabled: false,
  },
  SpecialAnnouncement: {
    type: 'SpecialAnnouncement',
    enabled: false,
  },
  LiveBlogPosting: {
    type: 'LiveBlogPosting',
    enabled: false,
    liveBlogUpdate: [],
  },
  Dataset: {
    type: 'Dataset',
    enabled: false,
    distribution: [],
  },
  AggregateRating: {
    type: 'AggregateRating',
    enabled: false,
    ratingValue: 0,
    reviewCount: 0,
  },
};