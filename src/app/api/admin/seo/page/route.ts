import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface PageSEOData {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  robots?: string;
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const pageData: PageSEOData = body.data;

    if (!pageData || !pageData.path) {
      return NextResponse.json(
        { error: 'Page data and path are required' },
        { status: 400 }
      );
    }

    // Determine the file path for page-specific SEO config
    const fileName = pageData.path === '/' ? 'home' : pageData.path.replace(/\//g, '').replace(/-/g, '_');
    const seoConfigPath = path.join(process.cwd(), 'src', 'seo', 'pages', `${fileName}.seo.json`);
    
    // Ensure the pages directory exists
    const pagesDir = path.join(process.cwd(), 'src', 'seo', 'pages');
    try {
      await fs.access(pagesDir);
    } catch {
      await fs.mkdir(pagesDir, { recursive: true });
    }

    // Create the SEO configuration object
    const seoConfig = {
      path: pageData.path,
      metadata: {
        title: pageData.title,
        description: pageData.description,
        keywords: pageData.keywords,
        lastModified: new Date().toISOString()
      },
      openGraph: {
        title: pageData.ogTitle || pageData.title,
        description: pageData.ogDescription || pageData.description,
        images: pageData.ogImage ? [{
          url: pageData.ogImage,
          width: 1200,
          height: 630,
          alt: pageData.title
        }] : []
      },
      twitter: {
        card: 'summary_large_image',
        title: pageData.ogTitle || pageData.title,
        description: pageData.ogDescription || pageData.description,
        images: pageData.ogImage ? [pageData.ogImage] : []
      },
      alternates: {
        canonical: pageData.canonicalUrl
      },
      robots: pageData.robots || 'index, follow'
    };

    // Write the configuration to file
    await fs.writeFile(
      seoConfigPath,
      JSON.stringify(seoConfig, null, 2),
      'utf-8'
    );

    // Try to commit the changes to git
    let warning = null;
    try {
      // Check if git is initialized
      await execAsync('git status', { cwd: process.cwd() });
      
      // Add the file
      await execAsync(`git add "${seoConfigPath}"`, { cwd: process.cwd() });
      
      // Check if there are changes to commit
      const { stdout: diffStatus } = await execAsync('git diff --cached --name-only', { cwd: process.cwd() });
      
      if (diffStatus.trim()) {
        // Create a detailed commit message
        const pageName = pageData.path === '/' ? 'Homepage' : pageData.title;
        const commitMessage = `Update SEO for ${pageName}

Page: ${pageData.path}
Title: ${pageData.title}
Description: ${pageData.description ? 'Updated' : 'Not set'}
Keywords: ${pageData.keywords.length} keywords
OG Image: ${pageData.ogImage ? 'Set' : 'Not set'}
Canonical URL: ${pageData.canonicalUrl || 'Default'}`;
        
        // Commit the changes
        await execAsync(`git commit -m "${commitMessage}"`, { cwd: process.cwd() });
      }
    } catch (gitError: any) {
      // Handle git errors gracefully
      if (gitError.message.includes('not a git repository')) {
        warning = 'Git is not initialized. Changes saved locally but not committed.';
      } else if (gitError.message.includes('nothing to commit')) {
        // No changes to commit, this is fine
      } else if (gitError.message.includes('Please tell me who you are')) {
        warning = 'Git user not configured. Run: git config user.email "you@example.com" and git config user.name "Your Name"';
      } else {
        warning = `Git operation failed: ${gitError.message}. Changes saved locally.`;
      }
      console.warn('Git operation warning:', gitError.message);
    }

    return NextResponse.json({ 
      success: true,
      message: `SEO settings for ${pageData.title} updated successfully`,
      warning
    });

  } catch (error) {
    console.error('Error updating page SEO:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update page SEO',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}