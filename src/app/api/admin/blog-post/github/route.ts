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

    // Optionally trigger deployment webhook
    if (process.env.DEPLOY_WEBHOOK_URL) {
      await githubCMS.triggerDeployment(process.env.DEPLOY_WEBHOOK_URL);
    }

    return NextResponse.json({ 
      success: true, 
      slug: post.slug,
      message: 'Post saved to GitHub. Deployment will update shortly.'
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

    if (process.env.DEPLOY_WEBHOOK_URL) {
      await githubCMS.triggerDeployment(process.env.DEPLOY_WEBHOOK_URL);
    }

    return NextResponse.json({ 
      success: true, 
      slug,
      message: 'Post updated on GitHub. Deployment will update shortly.'
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

    if (process.env.DEPLOY_WEBHOOK_URL) {
      await githubCMS.triggerDeployment(process.env.DEPLOY_WEBHOOK_URL);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Post deleted from GitHub. Deployment will update shortly.'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}