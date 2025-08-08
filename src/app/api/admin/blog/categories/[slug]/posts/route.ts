import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const categoryPath = path.join(process.cwd(), 'public', 'blog-content', 'categories', slug);
    
    try {
      const files = await fs.readdir(categoryPath);
      const posts = [];
      
      for (const file of files) {
        if (file.endsWith('.json') && !file.startsWith('.')) {
          const postPath = path.join(categoryPath, file);
          const postContent = await fs.readFile(postPath, 'utf-8');
          const post = JSON.parse(postContent);
          posts.push({
            ...post,
            slug: file.replace('.json', '')
          });
        }
      }
      
      return NextResponse.json({ posts });
    } catch (error) {
      // Category doesn't exist or has no posts
      return NextResponse.json({ posts: [] });
    }
  } catch (error) {
    console.error('Error fetching category posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category posts' },
      { status: 500 }
    );
  }
}