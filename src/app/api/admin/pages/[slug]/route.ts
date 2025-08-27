import { NextRequest, NextResponse } from 'next/server';
import { getPageBySlug, savePage, deletePage } from '@/lib/page-utils-server';

// GET - Fetch a single page by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: encodedSlug } = await params;
    const slug = decodeURIComponent(encodedSlug);
    const page = await getPageBySlug(slug);
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// PUT - Update a page by slug
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: encodedSlug } = await params;
    const slug = decodeURIComponent(encodedSlug);
    const body = await request.json();
    
    // If slug is changing and it's not the home page, handle the rename
    if (body.newSlug && body.newSlug !== slug && slug !== 'home') {
      // Delete old page
      await deletePage(slug);
      // Save as new page
      await savePage(body.newSlug, body.content, body.seoConfig);
    } else {
      // Just update the existing page
      await savePage(slug, body.content, body.seoConfig);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a page by slug
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: encodedSlug } = await params;
    const slug = decodeURIComponent(encodedSlug);
    if (slug === 'home') {
      return NextResponse.json(
        { error: 'Cannot delete the home page' },
        { status: 400 }
      );
    }
    
    await deletePage(slug);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}