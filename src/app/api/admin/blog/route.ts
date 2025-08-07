import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { GitHubCMS } from '@/lib/github-api';
import { getServerCMSConfig } from '@/lib/server-cms-config';

/**
 * Universal blog post API that automatically uses:
 * - Local file system in development (no git commits)
 * - GitHub API in production (with automatic commits)
 */

// Helper function to handle local file system operations
async function handleLocalStorage(method: string, data: any) {
  const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
  
  switch (method) {
    case 'POST':
    case 'PUT': {
      const { slug, category, ...postData } = data;
      let targetDir = blogContentDir;
      
      if (category) {
        targetDir = path.join(blogContentDir, 'categories', category);
        try {
          await fs.access(targetDir);
        } catch {
          await fs.mkdir(targetDir, { recursive: true });
        }
      }
      
      const filePath = path.join(targetDir, `${slug}.json`);
      const fileContent = {
        title: postData.title,
        excerpt: postData.excerpt,
        content: postData.content,
        author: postData.author,
        publishedAt: postData.publishedAt,
        tags: postData.tags,
        image: postData.image,
        imageAlt: postData.imageAlt,
        readingTime: postData.readingTime,
        featured: postData.featured,
        draft: postData.draft,
        excludeFromSearch: postData.excludeFromSearch,
        seo: postData.seo
      };
      
      await fs.writeFile(filePath, JSON.stringify(fileContent, null, 2), 'utf-8');
      
      return { success: true, slug, category, method: 'local' };
    }
    
    case 'DELETE': {
      const { slug, category } = data;
      let filePath: string;
      
      if (category) {
        filePath = path.join(blogContentDir, 'categories', category, `${slug}.json`);
      } else {
        filePath = path.join(blogContentDir, `${slug}.json`);
      }
      
      await fs.unlink(filePath);
      return { success: true, method: 'local' };
    }
    
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

// Helper function to handle GitHub API operations
async function handleGitHubStorage(method: string, data: any) {
  const missingVars = [];
  if (!process.env.GITHUB_TOKEN) missingVars.push('GITHUB_TOKEN');
  if (!process.env.GITHUB_OWNER) missingVars.push('GITHUB_OWNER');
  if (!process.env.GITHUB_REPO) missingVars.push('GITHUB_REPO');
  
  if (missingVars.length > 0) {
    throw new Error(
      `GitHub integration error: Missing environment variables: ${missingVars.join(', ')}. ` +
      `Please add these to your Vercel environment variables in the project settings.`
    );
  }
  
  const githubCMS = new GitHubCMS({
    token: process.env.GITHUB_TOKEN!,
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    branch: process.env.GITHUB_BRANCH || 'main'
  });
  
  switch (method) {
    case 'POST':
    case 'PUT': {
      const post = {
        ...data,
        updatedAt: new Date().toISOString(),
        readingTime: Math.ceil(data.content.split(/\s+/).length / 200)
      };
      
      await githubCMS.savePost(post);
      
      // Trigger deployment webhook if configured
      if (process.env.DEPLOY_WEBHOOK_URL) {
        await githubCMS.triggerDeployment(process.env.DEPLOY_WEBHOOK_URL);
      }
      
      return { success: true, slug: post.slug, method: 'github' };
    }
    
    case 'DELETE': {
      await githubCMS.deletePost(data.slug);
      
      if (process.env.DEPLOY_WEBHOOK_URL) {
        await githubCMS.triggerDeployment(process.env.DEPLOY_WEBHOOK_URL);
      }
      
      return { success: true, method: 'github' };
    }
    
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const config = getServerCMSConfig();
    
    console.log('[Blog API] Creating post with storage:', config.storageMethod);
    
    let result;
    if (config.useGitHub) {
      result = await handleGitHubStorage('POST', data);
    } else {
      result = await handleLocalStorage('POST', data);
    }
    
    return NextResponse.json({
      ...result,
      message: config.useGitHub 
        ? 'Blog post created and committed to GitHub!'
        : 'Blog post created locally (no git commit in development)'
    });
    
  } catch (error) {
    console.error('Error creating blog post:', error);
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to create blog post';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Add context about the environment
      const config = getServerCMSConfig();
      errorDetails = {
        environment: config.environment.isProduction ? 'production' : 'development',
        storageMethod: config.storageMethod,
        gitHubConfigured: config.environment.gitHubConfigured
      };
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        hint: errorMessage.includes('GitHub') 
          ? 'Check your environment variables in Vercel project settings'
          : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing blog post
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const config = getServerCMSConfig();
    
    console.log('[Blog API] Updating post with storage:', config.storageMethod);
    
    // Handle renaming/moving if needed
    if (data.originalSlug && (data.originalSlug !== data.slug || data.originalCategory !== data.category)) {
      // Delete old file first
      const deleteData = { slug: data.originalSlug, category: data.originalCategory };
      if (config.useGitHub) {
        await handleGitHubStorage('DELETE', deleteData);
      } else {
        await handleLocalStorage('DELETE', deleteData);
      }
    }
    
    let result;
    if (config.useGitHub) {
      result = await handleGitHubStorage('PUT', data);
    } else {
      result = await handleLocalStorage('PUT', data);
    }
    
    return NextResponse.json({
      ...result,
      message: config.useGitHub 
        ? 'Blog post updated and committed to GitHub!'
        : 'Blog post updated locally (no git commit in development)'
    });
    
  } catch (error) {
    console.error('Error updating blog post:', error);
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to update blog post';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Add context about the environment
      const config = getServerCMSConfig();
      errorDetails = {
        environment: config.environment.isProduction ? 'production' : 'development',
        storageMethod: config.storageMethod,
        gitHubConfigured: config.environment.gitHubConfigured
      };
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        hint: errorMessage.includes('GitHub') 
          ? 'Check your environment variables in Vercel project settings'
          : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post
export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();
    const config = getServerCMSConfig();
    
    console.log('[Blog API] Deleting post with storage:', config.storageMethod);
    
    let result;
    if (config.useGitHub) {
      result = await handleGitHubStorage('DELETE', data);
    } else {
      result = await handleLocalStorage('DELETE', data);
    }
    
    return NextResponse.json({
      ...result,
      message: config.useGitHub 
        ? 'Blog post deleted and change committed to GitHub!'
        : 'Blog post deleted locally (no git commit in development)'
    });
    
  } catch (error) {
    console.error('Error deleting blog post:', error);
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to delete blog post';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Add context about the environment
      const config = getServerCMSConfig();
      errorDetails = {
        environment: config.environment.isProduction ? 'production' : 'development',
        storageMethod: config.storageMethod,
        gitHubConfigured: config.environment.gitHubConfigured
      };
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        hint: errorMessage.includes('GitHub') 
          ? 'Check your environment variables in Vercel project settings'
          : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Fetch blog post(s)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }
    
    const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
    let filePath: string;
    
    if (category) {
      filePath = path.join(blogContentDir, 'categories', category, `${slug}.json`);
    } else {
      filePath = path.join(blogContentDir, `${slug}.json`);
    }
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const postData = JSON.parse(fileContent);
      
      return NextResponse.json({
        ...postData,
        slug,
        category
      });
    } catch (error) {
      // Try searching in categories
      const categoriesDir = path.join(blogContentDir, 'categories');
      try {
        const categories = await fs.readdir(categoriesDir);
        
        for (const cat of categories) {
          const categoryPath = path.join(categoriesDir, cat);
          const stat = await fs.stat(categoryPath);
          
          if (stat.isDirectory()) {
            const postPath = path.join(categoryPath, `${slug}.json`);
            
            try {
              const fileContent = await fs.readFile(postPath, 'utf-8');
              const postData = JSON.parse(fileContent);
              
              return NextResponse.json({
                ...postData,
                slug,
                category: cat
              });
            } catch {
              continue;
            }
          }
        }
      } catch {
        // Categories directory doesn't exist
      }
      
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}