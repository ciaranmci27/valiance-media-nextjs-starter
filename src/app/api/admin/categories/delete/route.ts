import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(request: Request) {
  try {
    const { slug } = await request.json();
    
    if (!slug) {
      return NextResponse.json(
        { message: 'Category slug is required' },
        { status: 400 }
      );
    }
    
    const contentDir = path.join(process.cwd(), 'public', 'blog-content');
    const categoriesDir = path.join(contentDir, 'categories');
    const categoryPath = path.join(categoriesDir, slug);
    
    // Check if category exists
    try {
      await fs.access(categoryPath);
    } catch {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if category has posts
    const files = await fs.readdir(categoryPath);
    const postCount = files.filter(file => 
      file.endsWith('.json') && !file.includes('seo-config') && !file.includes('category-meta')
    ).length;
    
    if (postCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete category with ${postCount} posts. Please move or delete the posts first.` },
        { status: 400 }
      );
    }
    
    // Delete the category directory and all its contents
    await fs.rm(categoryPath, { recursive: true, force: true });
    
    return NextResponse.json({ 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { message: 'Failed to delete category' },
      { status: 500 }
    );
  }
}