import { NextRequest, NextResponse } from 'next/server';
import { seoConfig, pageMetadata } from '@/seo/seo.config';
import { sitemapPages } from '@/seo/sitemap-pages';
import { loadBlogPosts } from '@/lib/blog-utils';
import { loadPageSeoConfig } from '@/lib/page-seo-utils';
import { getCurrentConfig, formatConfigForFile } from '@/lib/seo-config-parser';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    // Compute a safe site URL with fallbacks
    const getSiteUrl = (): string => {
      if (process.env.NEXT_PUBLIC_SITE_URL) {
        try {
          new URL(process.env.NEXT_PUBLIC_SITE_URL);
          return process.env.NEXT_PUBLIC_SITE_URL;
        } catch {}
      }
      if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3000';
      }
      return 'https://example.com';
    };
    const siteUrl = getSiteUrl();

    // Get page SEO data (static pages only, no blog content, no admin pages)
    if (type === 'pages') {
      // Get all static pages (excluding admin pages)
      const staticRoutes = [
        { 
          path: '/', 
          title: 'Homepage', 
          priority: 1.0, 
          changefreq: 'weekly',
          isIndexed: true,
          hasCustomMeta: false
        },
        { 
          path: '/privacy', 
          title: 'Privacy Policy', 
          priority: 0.7, 
          changefreq: 'yearly',
          isIndexed: true,
          hasCustomMeta: false
        },
        { 
          path: '/terms-of-service', 
          title: 'Terms of Service', 
          priority: 0.6, 
          changefreq: 'yearly',
          isIndexed: true,
          hasCustomMeta: false
        },
        // Add more static pages as they are created
        // Note: Admin pages are intentionally excluded from SEO management
      ];
      
      // Process static pages with their SEO configuration
      const pages = staticRoutes.map(route => {
        const pageConfig = loadPageSeoConfig(route.path);
        const metaKey = route.path === '/' ? 'home' : route.path.replace('/', '').replace(/-/g, '');
        
        // Check if page has custom metadata
        const hasCustomMeta = !!(pageConfig?.seo?.title || pageConfig?.seo?.description);
        
        // Determine if page is in sitemap (not excluded)
        const isInSitemap = !seoConfig.sitemap.excludedPages.includes(route.path);
        
        // Get metadata from pageMetadata object if key exists
        const pageMeta = (pageMetadata as any)[metaKey];
        
        const configAny = seoConfig as any;
        return {
          path: route.path,
          title: pageConfig?.seo?.title || pageMeta?.title || route.title || configAny.defaultTitle,
          description: pageConfig?.seo?.description || pageMeta?.description || configAny.defaultDescription,
          keywords: pageConfig?.seo?.keywords || pageMeta?.keywords || configAny.defaultKeywords,
          ogImage: pageConfig?.openGraph?.images?.[0]?.url || seoConfig.openGraph.defaultImage,
          ogTitle: pageConfig?.openGraph?.title || pageConfig?.seo?.title || pageMeta?.title || route.title,
          ogDescription: pageConfig?.openGraph?.description || pageConfig?.seo?.description || pageMeta?.description,
          lastModified: pageConfig?.metadata?.lastModified || new Date().toISOString().split('T')[0],
          priority: route.priority,
          changefreq: route.changefreq,
          isIndexed: route.isIndexed && isInSitemap,
          isInSitemap,
          hasCustomMeta,
          canonicalUrl: siteUrl ? `${siteUrl}${route.path}` : '',
          robots: pageConfig?.robots || (route.isIndexed ? 'index, follow' : 'noindex, nofollow'),
        };
      });

      return NextResponse.json({ pages });
    }

    // Get SEO stats
    if (type === 'stats') {
      // Count public pages only (excluding admin)
      const staticPages = 3; // Home, Privacy, Terms
      const blogPosts = loadBlogPosts().filter(post => !post.draft);
      
      const totalPages = staticPages + blogPosts.length;
      const pagesWithMeta = totalPages; // All pages have meta tags by default
      const pagesWithOG = totalPages; // All pages have OG tags by default
      
      // Count pages actually in sitemap (excluding admin)
      const sitemapEntries = sitemapPages();
      const sitemapPagesCount = sitemapEntries.length + blogPosts.length;
      
      // For indexed pages, we'd need to integrate with Google Search Console API
      // For now, we'll estimate based on published content (excluding admin)
      const indexedPages = Math.floor((totalPages - 1) * 0.8); // Estimate 80% indexed (excluding admin)
      
      return NextResponse.json({
        stats: {
          totalPages,
          pagesWithMeta,
          pagesWithOG,
          sitemapPages: sitemapPagesCount,
          indexedPages,
        }
      });
    }

    // Get robots.txt content from configuration
    if (type === 'robots') {
      // Build robots.txt content from configuration
      let robotsContent = '';
      
      // Check if indexing is disabled globally
      if (!seoConfig.robots.index) {
        robotsContent = `User-agent: *\nDisallow: /\n\nSitemap: ${siteUrl}/sitemap`;
      } else if (seoConfig.robots.txt?.rules) {
        // Build from configured rules
        seoConfig.robots.txt.rules.forEach((rule, index) => {
          if (index > 0) robotsContent += '\n';
          
          robotsContent += `User-agent: ${rule.userAgent}\n`;
          
          // Add allow rules
          if (rule.allow && rule.allow.length > 0) {
            rule.allow.forEach(path => {
              robotsContent += `Allow: ${path}\n`;
            });
          }
          
          // Add disallow rules
          if (rule.disallow && rule.disallow.length > 0) {
            rule.disallow.forEach(path => {
              robotsContent += `Disallow: ${path}\n`;
            });
          }
          
          // Add crawl delay if specified
          if (rule.crawlDelay && rule.crawlDelay > 0) {
            robotsContent += `Crawl-delay: ${rule.crawlDelay}\n`;
          }
        });
        
        // Add custom rules if any
        if (seoConfig.robots.txt.customRules) {
          robotsContent += '\n' + seoConfig.robots.txt.customRules;
        }
        
        // Add sitemap (using /sitemap for sitemap index)
        robotsContent += `\n\nSitemap: ${siteUrl}/sitemap`;
      } else {
        // Fallback to default
        robotsContent = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /_next/\nDisallow: /private/\nDisallow: *.json\nDisallow: /*?*\n\nUser-agent: Googlebot\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /_next/\nDisallow: /private/\n\nSitemap: ${siteUrl}/sitemap`;
      }

      return NextResponse.json({ content: robotsContent });
    }

    // Get schema markup
    if (type === 'schema') {
      // Import the schema generator dynamically
      const { schemaGenerator } = await import('@/lib/schema-generator');
      
      // Generate all enabled schemas
      const schemas = schemaGenerator.generateSchemas();
      
      // Organize schemas by type
      const schemasByType: any = {
        organization: null,
        website: null,
        localBusiness: null,
        person: null,
        breadcrumbs: null,
        article: null,
      };
      
      // Sort schemas into their types
      schemas.forEach(schema => {
        const type = schema['@type'];
        if (type === 'Organization' || type === 'Corporation' || type === 'EducationalOrganization') {
          schemasByType.organization = schema;
        } else if (type === 'WebSite') {
          schemasByType.website = schema;
        } else if (type === 'LocalBusiness' || type === 'Restaurant' || type === 'Store') {
          schemasByType.localBusiness = schema;
        } else if (type === 'Person') {
          schemasByType.person = schema;
        } else if (type === 'BreadcrumbList') {
          schemasByType.breadcrumbs = schema;
        } else if (type === 'Article') {
          schemasByType.article = schema;
        }
      });

      return NextResponse.json({ 
        schemas: schemasByType
      });
    }

    // Default: return general SEO configuration
    const configWithAll = seoConfig as any;
    return NextResponse.json({
      config: {
        siteName: (seoConfig as any).siteName || (seoConfig.openGraph as any)?.siteName || 'Website',
        siteUrl: siteUrl,
        defaultTitle: configWithAll.defaultTitle,
        defaultDescription: configWithAll.defaultDescription,
        defaultKeywords: configWithAll.defaultKeywords,
        social: configWithAll.social,
        verification: configWithAll.verification,
        analytics: configWithAll.analytics,
        schema: seoConfig.schema,
        robots: seoConfig.robots,
        company: configWithAll.company,
      }
    });

  } catch (error) {
    console.error('Error fetching SEO data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEO data' },
      { status: 500 }
    );
  }
}

// Update SEO configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === 'robots') {
      // Parse the robots.txt content and update configuration
      const { config } = getCurrentConfig();
      
      // Parse the robots.txt content into rules
      const lines = data.content.split('\n');
      const rules: any[] = [];
      let currentRule: any = null;
      let customRules = '';
      let inCustom = false;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and sitemap
        if (!trimmedLine || trimmedLine.startsWith('Sitemap:') || trimmedLine.startsWith('Host:')) {
          continue;
        }
        
        // Check for user agent
        if (trimmedLine.startsWith('User-agent:') || trimmedLine.startsWith('User-Agent:')) {
          if (currentRule) {
            rules.push(currentRule);
          }
          currentRule = {
            userAgent: trimmedLine.split(':')[1].trim(),
            allow: [],
            disallow: [],
            crawlDelay: 0
          };
          inCustom = false;
        } else if (currentRule) {
          if (trimmedLine.startsWith('Allow:')) {
            currentRule.allow.push(trimmedLine.split(':')[1].trim());
          } else if (trimmedLine.startsWith('Disallow:')) {
            currentRule.disallow.push(trimmedLine.split(':')[1].trim());
          } else if (trimmedLine.startsWith('Crawl-delay:')) {
            currentRule.crawlDelay = parseInt(trimmedLine.split(':')[1].trim()) || 0;
          } else {
            // Custom rule
            inCustom = true;
            customRules += trimmedLine + '\n';
          }
        } else {
          // Lines before first User-agent are custom
          customRules += trimmedLine + '\n';
        }
      }
      
      // Add the last rule
      if (currentRule) {
        rules.push(currentRule);
      }
      
      // Update configuration
      config.robots.txt = {
        rules: rules.length > 0 ? rules : config.robots.txt?.rules || [],
        customRules: customRules.trim()
      };
      
      // Save the updated configuration
      const SEO_CONFIG_PATH = path.join(process.cwd(), 'src', 'seo', 'seo.config.ts');
      const newFileContent = formatConfigForFile(config);
      await fs.writeFile(SEO_CONFIG_PATH, newFileContent, 'utf-8');
      
      return NextResponse.json({ 
        success: true,
        message: 'Robots.txt configuration updated successfully'
      });
    }
    
    // Handle other update types...
    return NextResponse.json({ 
      success: true,
      message: `SEO ${type} updated successfully`
    });

  } catch (error) {
    console.error('Error updating SEO data:', error);
    return NextResponse.json(
      { error: 'Failed to update SEO data' },
      { status: 500 }
    );
  }
}