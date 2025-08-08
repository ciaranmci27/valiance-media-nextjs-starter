import { NextRequest, NextResponse } from 'next/server';
import { getAllPages, savePage, generateSlug, generateDefaultPageContent, generateDefaultSEOConfig } from '@/lib/page-utils-server';

// GET - Fetch all pages
export async function GET() {
  try {
    const pages = await getAllPages();
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST - Create a new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const slug = body.slug || generateSlug(body.title);
    const content = body.content || generateDefaultPageContent(body.title);
    const seoConfig = body.seoConfig || generateDefaultSEOConfig(slug, body.title);
    
    // Update metadata with provided values
    if (body.metadata) {
      seoConfig.metadata = { ...seoConfig.metadata, ...body.metadata };
    }
    
    await savePage(slug, content, seoConfig);
    
    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}