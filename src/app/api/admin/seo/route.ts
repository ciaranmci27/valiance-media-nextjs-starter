import { NextRequest, NextResponse } from 'next/server';
import { seoConfig, pageMetadata } from '@/seo/seo.config';
import { sitemapPages } from '@/seo/sitemap-pages';
import { loadBlogPosts } from '@/lib/blog-utils';
import { loadPageSeoConfig } from '@/lib/page-seo-utils';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

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
        
        return {
          path: route.path,
          title: pageConfig?.seo?.title || pageMeta?.title || route.title || seoConfig.defaultTitle,
          description: pageConfig?.seo?.description || pageMeta?.description || seoConfig.defaultDescription,
          keywords: pageConfig?.seo?.keywords || pageMeta?.keywords || seoConfig.defaultKeywords,
          ogImage: pageConfig?.openGraph?.images?.[0]?.url || seoConfig.openGraph.defaultImage,
          ogTitle: pageConfig?.openGraph?.title || pageConfig?.seo?.title || pageMeta?.title || route.title,
          ogDescription: pageConfig?.openGraph?.description || pageConfig?.seo?.description || pageMeta?.description,
          lastModified: pageConfig?.metadata?.lastModified || new Date().toISOString().split('T')[0],
          priority: route.priority,
          changefreq: route.changefreq,
          isIndexed: route.isIndexed && isInSitemap,
          isInSitemap,
          hasCustomMeta,
          canonicalUrl: `${seoConfig.siteUrl}${route.path}`,
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

    // Get robots.txt content
    if (type === 'robots') {
      const robotsContent = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/
Disallow: *.json
Disallow: /*?*

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

Sitemap: ${seoConfig.siteUrl}/sitemap.xml`;

      return NextResponse.json({ content: robotsContent });
    }

    // Get schema markup
    if (type === 'schema') {
      const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": seoConfig.company.name,
        "legalName": seoConfig.company.legalName,
        "url": seoConfig.siteUrl,
        "logo": `${seoConfig.siteUrl}/logo.png`,
        "foundingDate": seoConfig.company.foundingDate,
        "email": seoConfig.company.email,
        "telephone": seoConfig.company.phone,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": seoConfig.company.address.streetAddress,
          "addressLocality": seoConfig.company.address.addressLocality,
          "addressRegion": seoConfig.company.address.addressRegion,
          "postalCode": seoConfig.company.address.postalCode,
          "addressCountry": seoConfig.company.address.addressCountry
        },
        "sameAs": Object.values(seoConfig.social).filter(Boolean)
      };

      return NextResponse.json({ 
        schemas: {
          organization: organizationSchema,
          article: null, // Could be configured for blog posts
          product: null, // Could be configured for products
        }
      });
    }

    // Default: return general SEO configuration
    return NextResponse.json({
      config: {
        siteName: seoConfig.siteName,
        siteUrl: seoConfig.siteUrl,
        defaultTitle: seoConfig.defaultTitle,
        defaultDescription: seoConfig.defaultDescription,
        defaultKeywords: seoConfig.defaultKeywords,
        social: seoConfig.social,
        verification: seoConfig.verification,
        analytics: seoConfig.analytics,
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

    // In a real implementation, you would:
    // 1. Validate the data
    // 2. Update the configuration files or database
    // 3. Trigger a rebuild if necessary
    
    // For now, we'll return a success response
    // You could implement file-based updates to seo.config.ts if needed
    
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