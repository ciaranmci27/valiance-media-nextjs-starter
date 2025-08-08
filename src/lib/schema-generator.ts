import { seoConfig } from '@/seo/seo.config';

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
}

export class SchemaGenerator {
  private siteUrl: string;
  private config: typeof seoConfig;

  constructor() {
    this.config = seoConfig;
    this.siteUrl = this.getSiteUrl();
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
      if (orgSchema) schemas.push(orgSchema);
    }

    if (this.config.schema?.activeTypes?.website) {
      const websiteSchema = this.generateWebSiteSchema();
      if (websiteSchema) schemas.push(websiteSchema);
    }

    if (this.config.schema?.activeTypes?.localBusiness) {
      const localBusinessSchema = this.generateLocalBusinessSchema();
      if (localBusinessSchema) schemas.push(localBusinessSchema);
    }

    if (this.config.schema?.activeTypes?.person) {
      const personSchema = this.generatePersonSchema();
      if (personSchema) schemas.push(personSchema);
    }

    if (this.config.schema?.activeTypes?.breadcrumbs && options.breadcrumbs) {
      const breadcrumbSchema = this.generateBreadcrumbSchema(options.breadcrumbs);
      if (breadcrumbSchema) schemas.push(breadcrumbSchema);
    }

    // Generate article schema for blog posts
    if (options.pageType === 'blog' && options.article) {
      const articleSchema = this.generateArticleSchema(options.article);
      if (articleSchema) schemas.push(articleSchema);
    }

    return schemas;
  }

  /**
   * Generate Organization schema
   * Automatically merges data from Organization tab with schema-specific settings
   */
  private generateOrganizationSchema(): any {
    const org = this.config.schema?.organization;
    const company = this.config.company; // Auto-pull from Organization tab
    
    if (!this.config.schema?.activeTypes?.organization) return null;

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
      Object.values(this.config.social).forEach(url => {
        if (url && !sameAs.includes(url)) {
          sameAs.push(url);
        }
      });
    }
    
    // Add additional sameAs URLs from schema config (Wikipedia, Crunchbase, etc.)
    if (org?.sameAs && org.sameAs.length > 0) {
      org.sameAs.filter(Boolean).forEach(url => {
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
    const website = this.config.schema?.website;
    if (!this.config.schema?.activeTypes?.website) return null;

    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: website.name || this.config.siteName,
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
    const business = this.config.schema?.localBusiness;
    if (!this.config.schema?.activeTypes?.localBusiness) return null;

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
    const person = this.config.schema?.person;
    if (!this.config.schema?.activeTypes?.person) return null;

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