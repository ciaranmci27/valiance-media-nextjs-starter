import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { slug, category, ...postData } = data;
    
    const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
    
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
    
    await fs.writeFile(
      filePath, 
      JSON.stringify(fileContent, null, 2),
      'utf-8'
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Blog post created successfully',
      slug,
      category 
    });
    
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

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
      const categoriesDir = path.join(blogContentDir, 'categories');
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

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { slug, category, originalSlug, originalCategory, ...postData } = data;
    
    const blogContentDir = path.join(process.cwd(), 'public', 'blog-content');
    
    // Delete old file if slug or category changed
    if (originalSlug && (originalSlug !== slug || originalCategory !== category)) {
      let oldFilePath: string;
      
      if (originalCategory) {
        oldFilePath = path.join(blogContentDir, 'categories', originalCategory, `${originalSlug}.json`);
      } else {
        oldFilePath = path.join(blogContentDir, `${originalSlug}.json`);
      }
      
      try {
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.log('Could not delete old file:', oldFilePath);
      }
    }
    
    // Create new file in the appropriate location
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
    
    await fs.writeFile(
      filePath, 
      JSON.stringify(fileContent, null, 2),
      'utf-8'
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Blog post updated successfully',
      slug,
      category 
    });
    
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();
    const { slug, category } = data;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
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
      await fs.unlink(filePath);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Blog post deleted successfully' 
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}