import { seoConfig } from '@/seo/seo.config';
import { PageSchema } from '@/components/admin/seo/schema-types';

/**
 * Generate structured data schemas based on configuration
 */

export interface SchemaGeneratorOptions {
  pageType?: 'home' | 'page' | 'blog' | 'category' | 'product';
  pageTitle?: string;
  pageUrl?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  article?: {
    title: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified: string;
    image?: string;
  };
  pageSchemas?: PageSchema[];
}

export class SchemaGenerator {
  private siteUrl: string;
  // Use a flexible type for config to allow optional fields without TS errors
  private config: any;

  constructor() {
    this.config = seoConfig;
    this.siteUrl = this.getSiteUrl();
  }

  /**
   * Helpers to avoid emitting schemas with placeholder or empty data
   */
  private isEmpty(value: unknown): boolean {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.values(value as any).every(v => this.isEmpty(v));
    return false;
  }

  private isPlaceholder(value?: string): boolean {
    if (!value) return true;
    const v = value.trim().toLowerCase();
    return v === 'your company name' || v === 'contact@example.com' || v === '+1234567890' || v === '123 main st' || v === 'state' || v === 'city' || v === 'us' || v === 'https://example.com';
  }

  private getSiteUrl(): string {
    if (this.config.siteUrl && this.config.siteUrl !== 'https://example.com') {
      return this.config.siteUrl.replace(/\/$/, '');
    }
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
    }
    return 'https://example.com';
  }

  /**
   * Generate all enabled schemas for a page
   */
  public generateSchemas(options: SchemaGeneratorOptions = {}): any[] {
    const schemas: any[] = [];

    // Only generate schemas if they're enabled
    if (this.config.schema?.activeTypes?.organization) {
      const orgSchema = this.generateOrganizationSchema();
      if (orgSchema && !this.isEmpty(orgSchema)) schemas.push(orgSchema);
    }

    if (this.config.schema?.activeTypes?.website) {
      const websiteSchema = this.generateWebSiteSchema();
      if (websiteSchema && !this.isEmpty(websiteSchema)) schemas.push(websiteSchema);
    }

    if (this.config.schema?.activeTypes?.localBusiness) {
      const localBusinessSchema = this.generateLocalBusinessSchema();
      if (localBusinessSchema && !this.isEmpty(localBusinessSchema)) schemas.push(localBusinessSchema);
    }

    if (this.config.schema?.activeTypes?.person) {
      const personSchema = this.generatePersonSchema();
      if (personSchema && !this.isEmpty(personSchema)) schemas.push(personSchema);
    }

    if (this.config.schema?.activeTypes?.breadcrumbs && options.breadcrumbs) {
      const breadcrumbSchema = this.generateBreadcrumbSchema(options.breadcrumbs);
      if (breadcrumbSchema && !this.isEmpty(breadcrumbSchema)) schemas.push(breadcrumbSchema);
    }

    // Generate article schema for blog posts
    if (options.pageType === 'blog' && options.article) {
      const articleSchema = this.generateArticleSchema(options.article);
      if (articleSchema) schemas.push(articleSchema);
    }

    // Generate page-specific schemas if provided
    if (options.pageSchemas && options.pageSchemas.length > 0) {
      const pageSpecificSchemas = this.generatePageSpecificSchemas(options.pageSchemas, options);
      schemas.push(...pageSpecificSchemas);
    }

    return schemas;
  }

  /**
   * Generate Organization schema
   * Automatically merges data from Organization tab with schema-specific settings
   */
  private generateOrganizationSchema(): any {
    const org = this.config.schema?.organization || {};
    const company = this.config.company; // Auto-pull from Organization tab
    
    if (!this.config.schema?.activeTypes?.organization) return null;

    // Skip if both Organization tab and schema-specific fields look like placeholders/empty
    const hasRealCompanyName = company?.name && !this.isPlaceholder(company.name);
    const hasOrgSpecific = !!(org?.logo?.url || org?.sameAs?.length || org?.contactPoint?.enabled || org?.type);
    if (!hasRealCompanyName && !hasOrgSpecific) {
      return null;
    }

    const schema: any = {
      '@context': 'https://schema.org',
      '@type': org?.type || 'Organization',
      // Use company data from Organization tab first, fallback to schema config
      name: company?.name || org?.name || this.config.siteName,
      url: this.siteUrl,
    };

    // Add logo if configured (schema-specific)
    if (org?.logo?.url) {
      schema.logo = {
        '@type': 'ImageObject',
        url: org.logo.url.startsWith('http') ? org.logo.url : `${this.siteUrl}${org.logo.url}`,
        width: org.logo.width || 600,
        height: org.logo.height || 60,
      };
    }

    // Add contact info - use Organization tab data first
    const telephone = company?.phone || org?.telephone;
    const email = company?.email || org?.email;
    
    if (telephone) schema.telephone = telephone;
    if (email) schema.email = email;

    // Add address - merge Organization tab with schema config
    const address = company?.address || org?.address;
    if (address && Object.values(address).some(v => v)) {
      schema.address = {
        '@type': 'PostalAddress',
        ...Object.entries(address).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as any),
      };
    }

    // Add contact point if configured (schema-specific)
    if (org?.contactPoint?.enabled && (org?.contactPoint?.telephone || company?.phone)) {
      schema.contactPoint = {
        '@type': 'ContactPoint',
        telephone: org.contactPoint.telephone || company?.phone,
        contactType: org.contactPoint.contactType || 'customer service',
        areaServed: org.contactPoint.areaServed || 'US',
        availableLanguage: org.contactPoint.availableLanguage || ['English'],
      };

      // Add hours if available
      if (org.contactPoint.hoursAvailable?.opens) {
        schema.contactPoint.hoursAvailable = {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: org.contactPoint.hoursAvailable.dayOfWeek || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: org.contactPoint.hoursAvailable.opens,
          closes: org.contactPoint.hoursAvailable.closes,
        };
      }
    }

    // Add sameAs links (combine schema config with social media)
    const sameAs: string[] = [];
    
    // Add social media links from Social Media tab first
    if (this.config.social) {
      (Object.values(this.config.social) as string[]).forEach((url: string) => {
        if (typeof url === 'string' && url && !sameAs.includes(url)) {
          sameAs.push(url);
        }
      });
    }
    
    // Add additional sameAs URLs from schema config (Wikipedia, Crunchbase, etc.)
    if (org?.sameAs && org.sameAs.length > 0) {
      (org.sameAs as string[]).filter((u: string) => !!u).forEach((url: string) => {
        if (!sameAs.includes(url)) {
          sameAs.push(url);
        }
      });
    }
    
    if (sameAs.length > 0) {
      schema.sameAs = sameAs;
    }

    // Add founding date - use Organization tab data first
    const foundingDate = company?.foundingDate || org?.foundingDate;
    if (foundingDate) {
      schema.foundingDate = foundingDate;
    }
    
    // Add legal name if available
    if (company?.legalName) {
      schema.legalName = company.legalName;
    }

    return schema;
  }

  /**
   * Generate WebSite schema with search action
   */
  private generateWebSiteSchema(): any {
    const website = this.config.schema?.website || {};
    if (!this.config.schema?.activeTypes?.website) return null;

    // Require real site name or a configured alternate name; otherwise skip
    const siteName = this.config.siteName;
    if (this.isPlaceholder(siteName) && !website.alternateName && !website.potentialAction?.searchUrlTemplate) {
      return null;
    }

    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: website.name || siteName,
      url: this.siteUrl,
    };

    if (website.alternateName) {
      schema.alternateName = website.alternateName;
    }

    // Add search action if configured
    if (website.potentialAction?.enabled && website.potentialAction?.searchUrlTemplate) {
      schema.potentialAction = {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: website.potentialAction.searchUrlTemplate,
        },
        'query-input': website.potentialAction.queryInput || 'required name=search_term_string',
      };
    }

    return schema;
  }

  /**
   * Generate LocalBusiness schema
   */
  private generateLocalBusinessSchema(): any {
    const business = this.config.schema?.localBusiness || {};
    if (!this.config.schema?.activeTypes?.localBusiness) return null;

    // Skip if core business identifiers are missing (name or address)
    const hasName = !!(business.name || this.config.company?.name);
    const hasAddress = !!(business.address && Object.values(business.address).some(Boolean));
    if (!hasName && !hasAddress) {
      return null;
    }

    const schema: any = {
      '@context': 'https://schema.org',
      '@type': business.type || 'LocalBusiness',
      name: business.name || this.config.company?.name || this.config.siteName,
      url: this.siteUrl,
    };

    if (business.description) schema.description = business.description;
    if (business.image) schema.image = business.image;
    if (business.telephone) schema.telephone = business.telephone;
    if (business.email) schema.email = business.email;
    if (business.priceRange) schema.priceRange = business.priceRange;

    // Add address
    if (business.address && Object.values(business.address).some(v => v)) {
      schema.address = {
        '@type': 'PostalAddress',
        ...Object.entries(business.address).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as any),
      };
    }

    // Add geo coordinates
    if (business.geo?.latitude && business.geo?.longitude) {
      schema.geo = {
        '@type': 'GeoCoordinates',
        latitude: business.geo.latitude,
        longitude: business.geo.longitude,
      };
    }

    // Add opening hours
    if (business.openingHours) {
      const openingHoursSpec: any[] = [];
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      days.forEach(day => {
        const hours = (business.openingHours as any)[day];
        if (hours?.opens && hours?.closes) {
          openingHoursSpec.push({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
            opens: hours.opens,
            closes: hours.closes,
          });
        }
      });

      if (openingHoursSpec.length > 0) {
        schema.openingHoursSpecification = openingHoursSpec;
      }
    }

    // Add aggregate rating if available
    if (business.aggregateRating?.ratingValue) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: business.aggregateRating.ratingValue,
        reviewCount: business.aggregateRating.reviewCount || 1,
      };
    }

    if (business.paymentAccepted && business.paymentAccepted.length > 0) {
      schema.paymentAccepted = business.paymentAccepted;
    }

    if (business.currenciesAccepted) {
      schema.currenciesAccepted = business.currenciesAccepted;
    }

    return schema;
  }

  /**
   * Generate Person schema
   */
  private generatePersonSchema(): any {
    const person = this.config.schema?.person || {};
    if (!this.config.schema?.activeTypes?.person) return null;

    // Require at minimum a name to emit Person schema
    if (!person.name || this.isPlaceholder(person.name)) {
      return null;
    }

    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: person.name,
      url: person.url || this.siteUrl,
    };

    if (person.alternateName) schema.alternateName = person.alternateName;
    if (person.description) schema.description = person.description;
    if (person.image) schema.image = person.image;
    if (person.jobTitle) schema.jobTitle = person.jobTitle;
    if (person.email) schema.email = person.email;
    if (person.telephone) schema.telephone = person.telephone;

    // Add workplace
    if (person.worksFor?.name) {
      schema.worksFor = {
        '@type': 'Organization',
        name: person.worksFor.name,
        url: person.worksFor.url,
      };
    }

    // Add social profiles
    if (person.sameAs && person.sameAs.length > 0) {
      schema.sameAs = person.sameAs.filter(Boolean);
    }

    // Add address if available
    if (person.address && Object.values(person.address).some(v => v)) {
      schema.address = {
        '@type': 'PostalAddress',
        ...Object.entries(person.address).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as any),
      };
    }

    if (person.birthDate) schema.birthDate = person.birthDate;
    if (person.nationality) schema.nationality = person.nationality;
    
    if (person.award && person.award.length > 0) {
      schema.award = person.award;
    }

    if (person.knowsAbout && person.knowsAbout.length > 0) {
      schema.knowsAbout = person.knowsAbout;
    }

    return schema;
  }

  /**
   * Generate BreadcrumbList schema
   */
  private generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): any {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    const items = breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${this.siteUrl}${crumb.url}`,
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    };
  }

  /**
   * Generate page-specific schemas based on configuration
   */
  private generatePageSpecificSchemas(pageSchemas: PageSchema[], options: SchemaGeneratorOptions): any[] {
    const schemas: any[] = [];
    
    for (const pageSchema of pageSchemas) {
      if (!pageSchema.enabled) continue;
      
      let schema: any = null;
      
      switch (pageSchema.type) {
        case 'Article':
        case 'BlogPosting':
        case 'NewsArticle':
          schema = this.generateArticleSchemaFromConfig(pageSchema as any, options);
          break;
        
        case 'FAQPage':
          schema = this.generateFAQSchema(pageSchema as any);
          break;
        
        case 'HowTo':
          schema = this.generateHowToSchema(pageSchema as any);
          break;
        
        case 'VideoObject':
          schema = this.generateVideoSchema(pageSchema as any);
          break;
        
        case 'Product':
          schema = this.generateProductSchema(pageSchema as any);
          break;
        
        case 'Event':
          schema = this.generateEventSchema(pageSchema as any);
          break;
        
        case 'Recipe':
          schema = this.generateRecipeSchema(pageSchema as any);
          break;
        
        case 'Service':
          schema = this.generateServiceSchema(pageSchema as any);
          break;
        
        case 'Course':
          schema = this.generateCourseSchema(pageSchema as any);
          break;
        
        case 'JobPosting':
          schema = this.generateJobPostingSchema(pageSchema as any);
          break;
        
        case 'SoftwareApplication':
        case 'MobileApplication':
        case 'WebApplication':
          schema = this.generateSoftwareApplicationSchema(pageSchema as any);
          break;
        
        case 'Review':
          schema = this.generateReviewSchema(pageSchema as any);
          break;
        
        case 'CollectionPage':
          schema = this.generateCollectionPageSchema(pageSchema as any, options);
          break;
        
        case 'ItemList':
          schema = this.generateItemListSchema(pageSchema as any);
          break;
      }
      
      if (schema && !this.isEmpty(schema)) {
        schemas.push(schema);
      }
    }
    
    return schemas;
  }

  /**
   * Generate Article schema from page config
   */
  private generateArticleSchemaFromConfig(config: any, options: SchemaGeneratorOptions): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': config.type,
      headline: config.headline || options.pageTitle,
      description: config.description || options.article?.description,
    };

    if (config.alternativeHeadline) schema.alternativeHeadline = config.alternativeHeadline;
    if (config.image) schema.image = this.resolveImageUrl(config.image);
    
    if (config.author?.name) {
      schema.author = {
        '@type': 'Person',
        name: config.author.name,
      };
      if (config.author.url) schema.author.url = config.author.url;
    }
    
    if (config.datePublished) schema.datePublished = config.datePublished;
    if (config.dateModified) schema.dateModified = config.dateModified;
    if (config.articleSection) schema.articleSection = config.articleSection;
    if (config.keywords && config.keywords.length > 0) schema.keywords = config.keywords.join(', ');
    if (config.wordCount) schema.wordCount = config.wordCount;
    if (config.timeRequired) schema.timeRequired = config.timeRequired;
    
    // Add publisher
    if (this.config.schema?.activeTypes?.organization) {
      schema.publisher = {
        '@type': 'Organization',
        name: this.config.schema.organization?.name || this.config.company?.name || this.config.siteName,
      };
      
      if (this.config.schema.organization?.logo?.url) {
        schema.publisher.logo = {
          '@type': 'ImageObject',
          url: this.resolveImageUrl(this.config.schema.organization.logo.url),
        };
      }
    }
    
    return schema;
  }

  /**
   * Generate FAQ schema
   */
  private generateFAQSchema(config: any): any {
    if (!config.mainEntity || config.mainEntity.length === 0) return null;
    
    const questions = config.mainEntity.map((qa: any) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.answer,
      },
    }));
    
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions,
    };
  }

  /**
   * Generate HowTo schema
   */
  private generateHowToSchema(config: any): any {
    if (!config.step || config.step.length === 0) return null;
    
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: config.name,
    };
    
    if (config.description) schema.description = config.description;
    if (config.image) schema.image = this.resolveImageUrl(config.image);
    if (config.totalTime) schema.totalTime = config.totalTime;
    
    if (config.estimatedCost) {
      schema.estimatedCost = {
        '@type': 'MonetaryAmount',
        value: config.estimatedCost.value,
        currency: config.estimatedCost.currency || 'USD',
      };
    }
    
    if (config.supply && config.supply.length > 0) {
      schema.supply = config.supply.map((item: any) => ({
        '@type': 'HowToSupply',
        name: item.name,
        image: item.image ? this.resolveImageUrl(item.image) : undefined,
      }));
    }
    
    if (config.tool && config.tool.length > 0) {
      schema.tool = config.tool.map((item: any) => ({
        '@type': 'HowToTool',
        name: item.name,
        image: item.image ? this.resolveImageUrl(item.image) : undefined,
      }));
    }
    
    schema.step = config.step.map((step: any, index: number) => ({
      '@type': 'HowToStep',
      name: step.name || `Step ${index + 1}`,
      text: step.text,
      image: step.image ? this.resolveImageUrl(step.image) : undefined,
      url: step.url,
    }));
    
    return schema;
  }

  /**
   * Generate Video schema
   */
  private generateVideoSchema(config: any): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
    };
    
    if (config.name) schema.name = config.name;
    if (config.description) schema.description = config.description;
    if (config.thumbnailUrl) {
      schema.thumbnailUrl = Array.isArray(config.thumbnailUrl) 
        ? config.thumbnailUrl.map((url: string) => this.resolveImageUrl(url))
        : this.resolveImageUrl(config.thumbnailUrl);
    }
    if (config.uploadDate) schema.uploadDate = config.uploadDate;
    if (config.duration) schema.duration = config.duration;
    if (config.contentUrl) schema.contentUrl = config.contentUrl;
    if (config.embedUrl) schema.embedUrl = config.embedUrl;
    
    if (config.interactionStatistic) {
      schema.interactionStatistic = {
        '@type': 'InteractionCounter',
        interactionType: { '@type': config.interactionStatistic.interactionType },
        userInteractionCount: config.interactionStatistic.userInteractionCount,
      };
    }
    
    return schema;
  }

  /**
   * Generate Product schema
   */
  private generateProductSchema(config: any): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
    };
    
    if (config.name) schema.name = config.name;
    if (config.description) schema.description = config.description;
    if (config.image) {
      schema.image = Array.isArray(config.image) 
        ? config.image.map((url: string) => this.resolveImageUrl(url))
        : this.resolveImageUrl(config.image);
    }
    
    if (config.brand?.name) {
      schema.brand = {
        '@type': 'Brand',
        name: config.brand.name,
      };
    }
    
    if (config.sku) schema.sku = config.sku;
    if (config.mpn) schema.mpn = config.mpn;
    if (config.gtin) schema.gtin = config.gtin;
    
    if (config.offers) {
      schema.offers = {
        '@type': 'Offer',
        price: config.offers.price,
        priceCurrency: config.offers.priceCurrency || 'USD',
        availability: `https://schema.org/${config.offers.availability}`,
      };
      
      if (config.offers.priceValidUntil) schema.offers.priceValidUntil = config.offers.priceValidUntil;
      if (config.offers.url) schema.offers.url = config.offers.url;
      if (config.offers.seller?.name) {
        schema.offers.seller = {
          '@type': 'Organization',
          name: config.offers.seller.name,
        };
      }
    }
    
    if (config.aggregateRating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: config.aggregateRating.ratingValue,
        reviewCount: config.aggregateRating.reviewCount,
      };
      
      if (config.aggregateRating.bestRating) schema.aggregateRating.bestRating = config.aggregateRating.bestRating;
      if (config.aggregateRating.worstRating) schema.aggregateRating.worstRating = config.aggregateRating.worstRating;
    }
    
    if (config.review && config.review.length > 0) {
      schema.review = config.review.map((review: any) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author,
        },
        datePublished: review.datePublished,
        reviewBody: review.reviewBody,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.reviewRating.ratingValue,
        },
      }));
    }
    
    return schema;
  }

  /**
   * Generate Event schema
   */
  private generateEventSchema(config: any): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Event',
    };
    
    if (config.name) schema.name = config.name;
    if (config.description) schema.description = config.description;
    if (config.startDate) schema.startDate = config.startDate;
    if (config.endDate) schema.endDate = config.endDate;
    
    if (config.location) {
      if ('url' in config.location) {
        schema.location = {
          '@type': 'VirtualLocation',
          url: config.location.url,
        };
      } else {
        schema.location = {
          '@type': 'Place',
          name: config.location.name,
        };
        
        if (config.location.address) {
          schema.location.address = {
            '@type': 'PostalAddress',
            ...config.location.address,
          };
        }
      }
    }
    
    if (config.image) schema.image = this.resolveImageUrl(config.image);
    
    if (config.performer && config.performer.length > 0) {
      schema.performer = config.performer.map((p: any) => ({
        '@type': p.type || 'Person',
        name: p.name,
      }));
    }
    
    if (config.offers) {
      schema.offers = {
        '@type': 'Offer',
        price: config.offers.price,
        priceCurrency: config.offers.priceCurrency || 'USD',
        availability: config.offers.availability,
        url: config.offers.url,
        validFrom: config.offers.validFrom,
      };
    }
    
    if (config.organizer) {
      schema.organizer = {
        '@type': 'Organization',
        name: config.organizer.name,
        url: config.organizer.url,
      };
    }
    
    if (config.eventStatus) schema.eventStatus = `https://schema.org/${config.eventStatus}`;
    if (config.eventAttendanceMode) schema.eventAttendanceMode = `https://schema.org/${config.eventAttendanceMode}`;
    
    return schema;
  }

  /**
   * Generate Recipe schema
   */
  private generateRecipeSchema(config: any): any {
    if (!config.recipeIngredient || config.recipeIngredient.length === 0) return null;
    if (!config.recipeInstructions || config.recipeInstructions.length === 0) return null;
    
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
    };
    
    if (config.name) schema.name = config.name;
    if (config.description) schema.description = config.description;
    if (config.image) {
      schema.image = Array.isArray(config.image) 
        ? config.image.map((url: string) => this.resolveImageUrl(url))
        : this.resolveImageUrl(config.image);
    }
    
    if (config.author?.name) {
      schema.author = {
        '@type': 'Person',
        name: config.author.name,
      };
    }
    
    if (config.datePublished) schema.datePublished = config.datePublished;
    if (config.prepTime) schema.prepTime = config.prepTime;
    if (config.cookTime) schema.cookTime = config.cookTime;
    if (config.totalTime) schema.totalTime = config.totalTime;
    if (config.recipeYield) schema.recipeYield = config.recipeYield;
    if (config.recipeCategory) schema.recipeCategory = config.recipeCategory;
    if (config.recipeCuisine) schema.recipeCuisine = config.recipeCuisine;
    
    if (config.nutrition) {
      schema.nutrition = {
        '@type': 'NutritionInformation',
        ...config.nutrition,
      };
    }
    
    schema.recipeIngredient = config.recipeIngredient;
    
    schema.recipeInstructions = config.recipeInstructions.map((instruction: any, index: number) => ({
      '@type': 'HowToStep',
      name: instruction.name || `Step ${index + 1}`,
      text: instruction.text,
      image: instruction.image ? this.resolveImageUrl(instruction.image) : undefined,
    }));
    
    if (config.aggregateRating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: config.aggregateRating.ratingValue,
        reviewCount: config.aggregateRating.reviewCount,
      };
    }
    
    if (config.keywords && config.keywords.length > 0) {
      schema.keywords = config.keywords.join(', ');
    }
    
    return schema;
  }

  /**
   * Generate Service schema
   */
  private generateServiceSchema(config: any): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Service',
    };
    
    if (config.name) schema.name = config.name;
    if (config.description) schema.description = config.description;
    
    if (config.provider) {
      schema.provider = {
        '@type': 'Organization',
        name: config.provider.name,
        url: config.provider.url,
      };
    }
    
    if (config.serviceType) schema.serviceType = config.serviceType;
    if (config.areaServed) schema.areaServed = config.areaServed;
    
    if (config.availableChannel) {
      schema.availableChannel = {
        '@type': 'ServiceChannel',
        serviceUrl: config.availableChannel.serviceUrl,
        servicePhone: config.availableChannel.servicePhone,
        serviceSmsNumber: config.availableChannel.serviceSmsNumber,
      };
    }
    
    if (config.offers) {
      schema.offers = {
        '@type': 'Offer',
        price: config.offers.price,
        priceCurrency: config.offers.priceCurrency || 'USD',
      };
    }
    
    if (config.aggregateRating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: config.aggregateRating.ratingValue,
        reviewCount: config.aggregateRating.reviewCount,
      };
    }
    
    return schema;
  }

  /**
   * Generate Course schema
   */
  private generateCourseSchema(config: any): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Course',
    };
    
    if (config.name) schema.name = config.name;
    if (config.description) schema.description = config.description;
    
    if (config.provider) {
      schema.provider = {
        '@type': 'Organization',
        name: config.provider.name,
        url: config.provider.url,
      };
    }
    
    if (config.educationalCredentialAwarded) schema.educationalCredentialAwarded = config.educationalCredentialAwarded;
    if (config.courseCode) schema.courseCode = config.courseCode;
    if (config.coursePrerequisites) schema.coursePrerequisites = config.coursePrerequisites;
    
    if (config.hasCourseInstance && config.hasCourseInstance.length > 0) {
      schema.hasCourseInstance = config.hasCourseInstance.map((instance: any) => ({
        '@type': 'CourseInstance',
        courseMode: instance.courseMode,
        startDate: instance.startDate,
        endDate: instance.endDate,
        location: instance.location ? {
          '@type': 'Place',
          name: instance.location.name,
          address: instance.location.address,
        } : undefined,
        instructor: instance.instructor ? {
          '@type': 'Person',
          name: instance.instructor.name,
          description: instance.instructor.description,
        } : undefined,
      }));
    }
    
    return schema;
  }

  /**
   * Generate JobPosting schema
   */
  private generateJobPostingSchema(config: any): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
    };
    
    if (config.title) schema.title = config.title;
    if (config.description) schema.description = config.description;
    if (config.datePosted) schema.datePosted = config.datePosted;
    if (config.validThrough) schema.validThrough = config.validThrough;
    if (config.employmentType) schema.employmentType = config.employmentType;
    
    if (config.hiringOrganization) {
      schema.hiringOrganization = {
        '@type': 'Organization',
        name: config.hiringOrganization.name,
        url: config.hiringOrganization.url,
        logo: config.hiringOrganization.logo,
      };
    }
    
    if (config.jobLocation?.address) {
      schema.jobLocation = {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          ...config.jobLocation.address,
        },
      };
    }
    
    if (config.baseSalary) {
      schema.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: config.baseSalary.currency || 'USD',
      };
      
      if ('value' in config.baseSalary.value) {
        schema.baseSalary.value = {
          '@type': 'QuantitativeValue',
          value: config.baseSalary.value.value,
          unitText: config.baseSalary.value.unitText,
        };
      } else {
        schema.baseSalary.value = {
          '@type': 'QuantitativeValue',
          minValue: config.baseSalary.value.minValue,
          maxValue: config.baseSalary.value.maxValue,
          unitText: config.baseSalary.value.unitText,
        };
      }
    }
    
    if (config.responsibilities) schema.responsibilities = config.responsibilities;
    if (config.skills) schema.skills = config.skills.join(', ');
    if (config.qualifications) schema.qualifications = config.qualifications;
    if (config.educationRequirements) schema.educationRequirements = config.educationRequirements;
    if (config.experienceRequirements) schema.experienceRequirements = config.experienceRequirements;
    
    return schema;
  }

  /**
   * Generate SoftwareApplication schema
   */
  private generateSoftwareApplicationSchema(config: any): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': config.type,
    };
    
    if (config.name) schema.name = config.name;
    if (config.description) schema.description = config.description;
    if (config.applicationCategory) schema.applicationCategory = config.applicationCategory;
    if (config.operatingSystem) schema.operatingSystem = config.operatingSystem;
    
    if (config.offers) {
      schema.offers = {
        '@type': 'Offer',
        price: config.offers.price,
        priceCurrency: config.offers.priceCurrency || 'USD',
      };
    }
    
    if (config.aggregateRating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: config.aggregateRating.ratingValue,
        reviewCount: config.aggregateRating.reviewCount,
      };
    }
    
    if (config.screenshot) {
      schema.screenshot = Array.isArray(config.screenshot) 
        ? config.screenshot.map((url: string) => this.resolveImageUrl(url))
        : this.resolveImageUrl(config.screenshot);
    }
    
    if (config.softwareVersion) schema.softwareVersion = config.softwareVersion;
    if (config.fileSize) schema.fileSize = config.fileSize;
    if (config.requirements) schema.requirements = config.requirements;
    if (config.permissions) schema.permissions = config.permissions;
    if (config.downloadUrl) schema.downloadUrl = config.downloadUrl;
    
    return schema;
  }

  /**
   * Generate Review schema
   */
  private generateReviewSchema(config: any): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Review',
    };
    
    if (config.itemReviewed) {
      schema.itemReviewed = {
        '@type': config.itemReviewed.type || 'Thing',
        name: config.itemReviewed.name,
      };
    }
    
    if (config.reviewRating) {
      schema.reviewRating = {
        '@type': 'Rating',
        ratingValue: config.reviewRating.ratingValue,
      };
      
      if (config.reviewRating.bestRating) schema.reviewRating.bestRating = config.reviewRating.bestRating;
      if (config.reviewRating.worstRating) schema.reviewRating.worstRating = config.reviewRating.worstRating;
    }
    
    if (config.author) {
      schema.author = {
        '@type': 'Person',
        name: config.author.name,
      };
    }
    
    if (config.datePublished) schema.datePublished = config.datePublished;
    if (config.reviewBody) schema.reviewBody = config.reviewBody;
    
    return schema;
  }

  /**
   * Generate CollectionPage schema
   */
  private generateCollectionPageSchema(config: any, options: SchemaGeneratorOptions): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
    };
    
    if (config.name || options.pageTitle) schema.name = config.name || options.pageTitle;
    if (config.description) schema.description = config.description;
    if (config.url || options.pageUrl) schema.url = config.url || options.pageUrl;
    
    if (config.mainEntity?.itemListElement && config.mainEntity.itemListElement.length > 0) {
      schema.mainEntity = {
        '@type': 'ItemList',
        itemListElement: config.mainEntity.itemListElement.map((item: any) => ({
          '@type': item.type || 'ListItem',
          position: item.position,
          url: item.url,
          name: item.name,
        })),
      };
    }
    
    return schema;
  }

  /**
   * Generate ItemList schema
   */
  private generateItemListSchema(config: any): any {
    if (!config.itemListElement || config.itemListElement.length === 0) return null;
    
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: config.itemListElement.map((item: any, index: number) => ({
        '@type': 'ListItem',
        position: item.position || index + 1,
        url: item.url,
        name: item.name,
        image: item.image,
        description: item.description,
      })),
    };
    
    if (config.numberOfItems) schema.numberOfItems = config.numberOfItems;
    
    return schema;
  }

  /**
   * Helper to resolve image URLs
   */
  private resolveImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.siteUrl}${url}`;
  }

  /**
   * Generate Article schema for blog posts
   */
  private generateArticleSchema(article: any): any {
    if (!article) return null;

    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      author: {
        '@type': 'Person',
        name: article.author,
      },
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
    };

    if (article.image) {
      schema.image = article.image.startsWith('http') 
        ? article.image 
        : `${this.siteUrl}${article.image}`;
    }

    // Add publisher (organization)
    if (this.config.schema?.activeTypes?.organization) {
      schema.publisher = {
        '@type': 'Organization',
        name: this.config.schema.organization.name || this.config.company?.name || this.config.siteName,
        logo: this.config.schema.organization.logo?.url ? {
          '@type': 'ImageObject',
          url: this.config.schema.organization.logo.url.startsWith('http') 
            ? this.config.schema.organization.logo.url 
            : `${this.siteUrl}${this.config.schema.organization.logo.url}`,
        } : undefined,
      };
    }

    return schema;
  }
}

// Export a singleton instance
export const schemaGenerator = new SchemaGenerator();