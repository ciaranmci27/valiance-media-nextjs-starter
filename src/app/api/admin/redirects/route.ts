import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const REDIRECTS_FILE = path.join(process.cwd(), 'public', 'redirects.json');

interface Redirect {
  from: string;
  to: string;
  permanent: boolean;
  createdAt: string;
  reason?: string;
}

interface RedirectsConfig {
  redirects: Redirect[];
}

async function getRedirects(): Promise<RedirectsConfig> {
  try {
    const data = await fs.readFile(REDIRECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty config
    return { redirects: [] };
  }
}

async function saveRedirects(config: RedirectsConfig): Promise<void> {
  await fs.writeFile(REDIRECTS_FILE, JSON.stringify(config, null, 2));
}

export async function GET() {
  try {
    const config = await getRedirects();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching redirects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redirects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const redirect: Redirect = await request.json();
    
    // Validate redirect
    if (!redirect.from || !redirect.to) {
      return NextResponse.json(
        { error: 'Both "from" and "to" fields are required' },
        { status: 400 }
      );
    }
    
    // Get existing redirects
    const config = await getRedirects();
    
    // Check if redirect already exists
    const existingIndex = config.redirects.findIndex(r => r.from === redirect.from);
    
    if (existingIndex !== -1) {
      // Update existing redirect
      config.redirects[existingIndex] = redirect;
    } else {
      // Add new redirect
      config.redirects.push(redirect);
    }
    
    // Save updated config
    await saveRedirects(config);
    
    return NextResponse.json({ success: true, redirect });
  } catch (error) {
    console.error('Error creating redirect:', error);
    return NextResponse.json(
      { error: 'Failed to create redirect' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    
    if (!from) {
      return NextResponse.json(
        { error: '"from" parameter is required' },
        { status: 400 }
      );
    }
    
    // Get existing redirects
    const config = await getRedirects();
    
    // Filter out the redirect to delete
    config.redirects = config.redirects.filter(r => r.from !== from);
    
    // Save updated config
    await saveRedirects(config);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting redirect:', error);
    return NextResponse.json(
      { error: 'Failed to delete redirect' },
      { status: 500 }
    );
  }
}