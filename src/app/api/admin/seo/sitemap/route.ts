import { NextRequest, NextResponse } from 'next/server';
import { sitemapPages } from '@/seo/sitemap-pages';
import { sitemapBlogPosts } from '@/seo/sitemap-blog-posts';
import { sitemapCategories } from '@/seo/sitemap-blog-categories';
import { seoConfig } from '@/seo/seo.config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const baseUrl = (seoConfig as any).siteUrl || process.env.NEXT_PUBLIC_SITE_URL || '';

    // Get sitemap index
    if (type === 'index') {
      const sitemapIndex = {
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-blog-posts.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-blog-categories.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`,
        entries: [
          { name: 'sitemap-pages.xml', url: `${baseUrl}/sitemap-pages.xml` },
          { name: 'sitemap-blog-posts.xml', url: `${baseUrl}/sitemap-blog-posts.xml` },
          { name: 'sitemap-blog-categories.xml', url: `${baseUrl}/sitemap-blog-categories.xml` },
        ]
      };
      return NextResponse.json({ sitemapIndex });
    }

    // Get pages sitemap
    if (type === 'pages') {
      const pages = sitemapPages();
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified ? (typeof page.lastModified === 'string' ? page.lastModified : page.lastModified.toISOString()) : new Date().toISOString()}</lastmod>
    <changefreq>${page.changeFrequency || 'monthly'}</changefreq>
    <priority>${page.priority || 0.5}</priority>
  </url>`).join('\n')}
</urlset>`;
      
      return NextResponse.json({ 
        xml,
        entries: pages,
        count: pages.length
      });
    }

    // Get blog posts sitemap
    if (type === 'blog-posts') {
      const posts = sitemapBlogPosts();
      const xml = posts.length > 0 ? `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${posts.map(post => `  <url>
    <loc>${post.url}</loc>
    <lastmod>${post.lastModified ? (typeof post.lastModified === 'string' ? post.lastModified : post.lastModified.toISOString()) : new Date().toISOString()}</lastmod>
    <changefreq>${post.changeFrequency || 'weekly'}</changefreq>
    <priority>${post.priority || 0.6}</priority>
  </url>`).join('\n')}
</urlset>` : `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

      return NextResponse.json({ 
        xml,
        entries: posts,
        count: posts.length,
        message: posts.length === 0 ? 'No published blog posts found (example posts are excluded)' : undefined
      });
    }

    // Get categories sitemap
    if (type === 'categories') {
      const categories = sitemapCategories();
      const xml = categories.length > 0 ? `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories.map(cat => `  <url>
    <loc>${cat.url}</loc>
    <lastmod>${cat.lastModified ? (typeof cat.lastModified === 'string' ? cat.lastModified : cat.lastModified.toISOString()) : new Date().toISOString()}</lastmod>
    <changefreq>${cat.changeFrequency || 'monthly'}</changefreq>
    <priority>${cat.priority || 0.7}</priority>
  </url>`).join('\n')}
</urlset>` : `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

      return NextResponse.json({ 
        xml,
        entries: categories,
        count: categories.length,
        message: categories.length === 0 ? 'No categories with real content found' : undefined
      });
    }

    // Return all sitemap info
    const pagesData = sitemapPages();
    const blogPostsData = sitemapBlogPosts();
    const categoriesData = sitemapCategories();

    return NextResponse.json({
      sitemaps: {
        pages: {
          count: pagesData.length,
          entries: pagesData
        },
        blogPosts: {
          count: blogPostsData.length,
          entries: blogPostsData,
          message: blogPostsData.length === 0 ? 'No published blog posts (excluding examples)' : undefined
        },
        categories: {
          count: categoriesData.length,
          entries: categoriesData,
          message: categoriesData.length === 0 ? 'No categories with real content' : undefined
        }
      }
    });

  } catch (error) {
    console.error('Error fetching sitemap data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sitemap data' },
      { status: 500 }
    );
  }
}