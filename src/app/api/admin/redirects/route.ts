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
    
    // Check for circular redirect (if A→B exists and we're trying to create B→A)
    const circularRedirectIndex = config.redirects.findIndex(
      r => r.from === redirect.to && r.to === redirect.from
    );
    
    if (circularRedirectIndex !== -1) {
      // Store the redirect to be removed before splicing
      const removedRedirect = config.redirects[circularRedirectIndex];
      
      // Remove the circular redirect instead of creating a new one
      config.redirects.splice(circularRedirectIndex, 1);
      
      // Save updated config
      await saveRedirects(config);
      
      return NextResponse.json({ 
        success: true, 
        action: 'removed_circular',
        removedRedirect: removedRedirect,
        message: 'Removed circular redirect instead of creating a new one'
      });
    }
    
    // PREVENT REDIRECT CHAINS: Find all redirects pointing to the old URL (redirect.from)
    // and update them to point to the new URL (redirect.to)
    let updatedChains = 0;
    config.redirects = config.redirects.map(r => {
      if (r.to === redirect.from && r.from !== redirect.to) {
        // Update this redirect to point directly to the new destination
        updatedChains++;
        return {
          ...r,
          to: redirect.to,
          reason: r.reason ? `${r.reason} (updated to prevent chain)` : 'Updated to prevent redirect chain'
        };
      }
      return r;
    });
    
    // Check if redirect already exists from the same source
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
    
    return NextResponse.json({ 
      success: true, 
      redirect,
      updatedChains,
      message: updatedChains > 0 
        ? `Created redirect and updated ${updatedChains} existing redirect(s) to prevent chains`
        : undefined
    });
  } catch (error) {
    console.error('Error creating redirect:', error);
    return NextResponse.json(
      { error: 'Failed to create redirect' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    if (action === 'update-chains') {
      // Bulk update to fix redirect chains
      const { oldUrl, newUrl } = data;
      
      if (!oldUrl || !newUrl) {
        return NextResponse.json(
          { error: 'Both oldUrl and newUrl are required' },
          { status: 400 }
        );
      }
      
      const config = await getRedirects();
      let updatedCount = 0;
      
      // Update all redirects pointing to oldUrl to point to newUrl
      config.redirects = config.redirects.map(r => {
        if (r.to === oldUrl) {
          updatedCount++;
          return {
            ...r,
            to: newUrl,
            reason: r.reason ? `${r.reason} (chain prevented)` : 'Updated to prevent redirect chain'
          };
        }
        return r;
      });
      
      await saveRedirects(config);
      
      return NextResponse.json({ 
        success: true, 
        updatedCount,
        message: `Updated ${updatedCount} redirect(s) to prevent chains`
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating redirects:', error);
    return NextResponse.json(
      { error: 'Failed to update redirects' },
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