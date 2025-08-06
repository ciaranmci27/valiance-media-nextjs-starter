import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Get all unique tags from all blog posts
export async function GET() {
  try {
    const contentDir = path.join(process.cwd(), 'public', 'blog-content');
    const allTags = new Set<string>();
    
    // First check categories folder
    const categoriesDir = path.join(contentDir, 'categories');
    try {
      const categories = await fs.readdir(categoriesDir);
      
      for (const category of categories) {
        const categoryPath = path.join(categoriesDir, category);
        const stat = await fs.stat(categoryPath);
        
        if (stat.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          
          // Read each JSON file in the category
          for (const file of files) {
            if (file.endsWith('.json') && !file.includes('seo-config')) {
              const filePath = path.join(categoryPath, file);
              const content = await fs.readFile(filePath, 'utf-8');
              const postData = JSON.parse(content);
              
              // Extract tags from the post data
              if (postData.tags && Array.isArray(postData.tags)) {
                postData.tags.forEach((tag: string) => allTags.add(tag));
              }
            }
          }
        }
      }
    } catch (err) {
      console.log('Categories directory not found or error reading it');
    }
    
    // Also check root level JSON files
    const rootFiles = await fs.readdir(contentDir);
    for (const file of rootFiles) {
      if (file.endsWith('.json') && !file.includes('seo-config')) {
        const filePath = path.join(contentDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const postData = JSON.parse(content);
        
        // Extract tags from the post data
        if (postData.tags && Array.isArray(postData.tags)) {
          postData.tags.forEach((tag: string) => allTags.add(tag));
        }
      }
    }
    
    // Convert Set to sorted array
    const sortedTags = Array.from(allTags).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    
    return NextResponse.json({ tags: sortedTags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ tags: [] });
  }
}