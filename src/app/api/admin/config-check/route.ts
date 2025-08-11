import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

interface ConfigWarning {
  type: 'error' | 'warning';
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

export async function GET() {
  const warnings: ConfigWarning[] = [];

  try {
    // Import the actual seo config to check runtime values
    const { seoConfig } = await import('@/seo/seo.config');
    
    // Check critical SEO fields - Site URL
    const siteUrl = (seoConfig as any).siteUrl || process.env.NEXT_PUBLIC_SITE_URL || '';
    if (!siteUrl || siteUrl === '' || siteUrl === 'https://yourdomain.com') {
      warnings.push({
        type: 'error',
        message: 'Site URL is not configured. This is required for proper SEO, sitemap generation, and social sharing.',
        action: {
          label: 'Configure Site URL',
          href: '/admin/seo?section=basic'
        }
      });
    }

    // Check if siteName is empty
    const siteName = (seoConfig as any).siteName || (seoConfig.openGraph as any)?.siteName;
    if (!siteName || siteName === '') {
      warnings.push({
        type: 'error',
        message: 'Site Name is not configured. This appears in page titles and meta tags.',
        action: {
          label: 'Set Site Name',
          href: '/admin/seo?section=basic'
        }
      });
    }

    // Check if company name is empty
    const configWithCompany = seoConfig as any;
    if (!configWithCompany.company?.name || configWithCompany.company.name === '') {
      warnings.push({
        type: 'warning',
        message: 'Company information is not configured. This affects schema markup and search appearance.',
        action: {
          label: 'Add Company Info',
          href: '/admin/seo?section=company'
        }
      });
    }

    // Check if default title is empty
    if (!configWithCompany.defaultTitle || configWithCompany.defaultTitle === '') {
      warnings.push({
        type: 'warning',
        message: 'Default page title is not set. Pages without custom titles will have no title.',
        action: {
          label: 'Set Default Title',
          href: '/admin/seo?section=templates'
        }
      });
    }

    // Check if default description is empty
    if (!configWithCompany.defaultDescription || configWithCompany.defaultDescription === '') {
      warnings.push({
        type: 'warning',
        message: 'Default meta description is not set. This affects search result snippets.',
        action: {
          label: 'Set Default Description',
          href: '/admin/seo?section=templates'
        }
      });
    }

    // Check Open Graph image
    if (seoConfig.openGraph?.defaultImage) {
      // Check if the file exists
      const ogImagePath = path.join(process.cwd(), 'public', seoConfig.openGraph.defaultImage.replace(/^\//, ''));
      try {
        await fs.access(ogImagePath);
      } catch {
        warnings.push({
          type: 'warning',
          message: 'Default Open Graph image is missing. Social media shares will have no preview image.',
          action: {
            label: 'Configure OG Image',
            href: '/admin/seo?section=opengraph'
          }
        });
      }
    }

    // Check admin authentication
    if (!process.env.ADMIN_PASSWORD_HASH && process.env.DISABLE_ADMIN_AUTH !== 'true') {
      warnings.push({
        type: 'error',
        message: 'Admin authentication is not configured. Run "npm run setup-auth" to secure your admin panel.',
        action: {
          label: 'Setup Authentication',
          href: '/admin/settings'
        }
      });
    }

    // Check if running with example/demo content
    const pagesConfigPath = path.join(process.cwd(), 'content', 'pages-config.json');
    try {
      const pagesConfig = await fs.readFile(pagesConfigPath, 'utf-8');
      const pages = JSON.parse(pagesConfig);
      
      // Check if there are any pages with obvious placeholder content
      const hasPlaceholderContent = pages.some((page: any) => 
        page.content?.includes('Lorem ipsum') || 
        page.content?.includes('placeholder') ||
        page.title?.toLowerCase().includes('example') ||
        page.title?.toLowerCase().includes('test')
      );
      
      if (hasPlaceholderContent) {
        warnings.push({
          type: 'warning',
          message: 'Some pages contain placeholder or example content.',
          action: {
            label: 'Review Pages',
            href: '/admin/pages'
          }
        });
      }
    } catch {
      // Pages config doesn't exist yet, which is fine for a fresh install
    }

    // Check analytics configuration
    const hasAnalytics = !!(
      process.env.NEXT_PUBLIC_GA_ID ||
      process.env.NEXT_PUBLIC_FB_PIXEL_ID ||
      process.env.NEXT_PUBLIC_HOTJAR_ID ||
      process.env.NEXT_PUBLIC_CLARITY_ID
    );

    if (!hasAnalytics) {
      warnings.push({
        type: 'warning',
        message: 'No analytics tools configured. Consider adding Google Analytics or other tracking.',
        action: {
          label: 'Setup Analytics',
          href: '/admin/seo?section=basic'
        }
      });
    }

    return NextResponse.json({ warnings });
  } catch (error) {
    console.error('Error checking configuration:', error);
    return NextResponse.json({ warnings: [] });
  }
}