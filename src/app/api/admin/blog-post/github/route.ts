import { NextRequest, NextResponse } from 'next/server';
import { GitHubCMS } from '@/lib/github-api';

// This endpoint uses GitHub API instead of local file system
// Perfect for production deployments on Vercel/Netlify

export async function POST(request: NextRequest) {
  try {
    // Check if GitHub integration is configured
    const missingVars = [];
    if (!process.env.GITHUB_TOKEN) missingVars.push('GITHUB_TOKEN');
    if (!process.env.GITHUB_OWNER) missingVars.push('GITHUB_OWNER');
    if (!process.env.GITHUB_REPO) missingVars.push('GITHUB_REPO');
    
    if (missingVars.length > 0) {
      return NextResponse.json(
        { 
          error: `GitHub integration error: Missing environment variables: ${missingVars.join(', ')}`,
          hint: 'Please add these to your Vercel environment variables in the project settings.',
          details: {
            missingVariables: missingVars,
            environment: process.env.NODE_ENV,
            vercelEnv: process.env.VERCEL_ENV
          }
        },
        { status: 500 }
      );
    }

    const githubCMS = new GitHubCMS({
      token: process.env.GITHUB_TOKEN!,
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      branch: process.env.GITHUB_BRANCH || 'main'
    });

    const postData = await request.json();
    
    // Add metadata
    const post = {
      ...postData,
      updatedAt: new Date().toISOString(),
      readingTime: Math.ceil(postData.content.split(/\s+/).length / 200)
    };

    // Save to GitHub
    await githubCMS.savePost(post);

    // Trigger on-demand revalidation instead of full deployment
    if (process.env.REVALIDATION_SECRET) {
      try {
        const revalidateUrl = new URL('/api/revalidate', request.url);
        await fetch(revalidateUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: process.env.REVALIDATION_SECRET,
            path: [
              '/blog',
              `/blog/${post.category}`,
              `/blog/${post.category}/${post.slug}`
            ]
          })
        });
      } catch (error) {
        console.error('Revalidation failed:', error);
      }
    }
    
    // Optionally trigger deployment webhook (fallback)
    if (!process.env.REVALIDATION_SECRET && process.env.DEPLOY_WEBHOOK_URL) {
      await githubCMS.triggerDeployment(process.env.DEPLOY_WEBHOOK_URL);
    }

    return NextResponse.json({ 
      success: true, 
      slug: post.slug,
      message: process.env.REVALIDATION_SECRET 
        ? 'Post saved and published instantly!' 
        : 'Post saved to GitHub. Deployment will update shortly.'
    });
  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
      return NextResponse.json(
        { error: 'GitHub integration not configured' },
        { status: 500 }
      );
    }

    const githubCMS = new GitHubCMS({
      token: process.env.GITHUB_TOKEN!,
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      branch: process.env.GITHUB_BRANCH || 'main'
    });

    const { slug, ...postData } = await request.json();
    
    const post = {
      ...postData,
      slug,
      updatedAt: new Date().toISOString(),
      readingTime: Math.ceil(postData.content.split(/\s+/).length / 200)
    };

    await githubCMS.savePost(post);

    // Trigger on-demand revalidation
    if (process.env.REVALIDATION_SECRET) {
      try {
        const revalidateUrl = new URL('/api/revalidate', request.url);
        await fetch(revalidateUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: process.env.REVALIDATION_SECRET,
            path: [
              '/blog',
              `/blog/${post.category}`,
              `/blog/${post.category}/${post.slug}`
            ]
          })
        });
      } catch (error) {
        console.error('Revalidation failed:', error);
      }
    }
    
    if (!process.env.REVALIDATION_SECRET && process.env.DEPLOY_WEBHOOK_URL) {
      await githubCMS.triggerDeployment(process.env.DEPLOY_WEBHOOK_URL);
    }

    return NextResponse.json({ 
      success: true, 
      slug,
      message: process.env.REVALIDATION_SECRET 
        ? 'Post updated and changes are live!' 
        : 'Post updated on GitHub. Deployment will update shortly.'
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
      return NextResponse.json(
        { error: 'GitHub integration not configured' },
        { status: 500 }
      );
    }

    const githubCMS = new GitHubCMS({
      token: process.env.GITHUB_TOKEN!,
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      branch: process.env.GITHUB_BRANCH || 'main'
    });

    const { slug } = await request.json();
    
    await githubCMS.deletePost(slug);

    // Trigger on-demand revalidation
    if (process.env.REVALIDATION_SECRET) {
      try {
        const revalidateUrl = new URL('/api/revalidate', request.url);
        await fetch(revalidateUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: process.env.REVALIDATION_SECRET,
            path: '/blog'
          })
        });
      } catch (error) {
        console.error('Revalidation failed:', error);
      }
    }
    
    if (!process.env.REVALIDATION_SECRET && process.env.DEPLOY_WEBHOOK_URL) {
      await githubCMS.triggerDeployment(process.env.DEPLOY_WEBHOOK_URL);
    }

    return NextResponse.json({ 
      success: true,
      message: process.env.REVALIDATION_SECRET 
        ? 'Post deleted and removed from site!' 
        : 'Post deleted from GitHub. Deployment will update shortly.'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}