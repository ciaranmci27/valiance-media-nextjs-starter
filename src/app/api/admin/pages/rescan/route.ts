import { NextResponse } from 'next/server';
import { getAllPages } from '@/lib/page-utils-server';

export async function POST() {
  try {
    // In development, getAllPages always does a fresh filesystem scan
    // In production, this would typically trigger a rebuild
    const pages = await getAllPages();
    
    return NextResponse.json({ 
      success: true, 
      pages,
      message: `Found ${pages.length} pages` 
    });
  } catch (error) {
    console.error('Error rescanning pages:', error);
    return NextResponse.json(
      { error: 'Failed to rescan pages' },
      { status: 500 }
    );
  }
}