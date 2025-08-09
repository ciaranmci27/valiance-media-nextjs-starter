import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const SEO_CONFIG_PATH = path.join(process.cwd(), 'src', 'seo', 'seo.config.ts');

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Read current seo.config.ts file
    const fileContent = await fs.readFile(SEO_CONFIG_PATH, 'utf-8');
    
    // Extract analytics values using regex
    const extractValue = (pattern: RegExp): string => {
      const match = fileContent.match(pattern);
      return match && match[1] ? match[1] : '';
    };
    
    const analytics = {
      googleAnalyticsId: extractValue(/googleAnalyticsId:\s*process\.env\.NEXT_PUBLIC_GA_ID\s*\|\|\s*['"]([^'"]*)['"]/),
      facebookPixelId: extractValue(/facebookPixelId:\s*process\.env\.NEXT_PUBLIC_FB_PIXEL_ID\s*\|\|\s*['"]([^'"]*)['"]/),
      hotjarId: extractValue(/hotjarId:\s*process\.env\.NEXT_PUBLIC_HOTJAR_ID\s*\|\|\s*['"]([^'"]*)['"]/),
      clarityId: extractValue(/clarityId:\s*process\.env\.NEXT_PUBLIC_CLARITY_ID\s*\|\|\s*['"]([^'"]*)['"]/),
    };
    
    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error reading analytics config:', error);
    return NextResponse.json(
      { error: 'Failed to read analytics configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { analytics } = await request.json();
    
    if (!analytics) {
      return NextResponse.json(
        { error: 'Analytics configuration is required' },
        { status: 400 }
      );
    }

    // Read current seo.config.ts file
    let fileContent = await fs.readFile(SEO_CONFIG_PATH, 'utf-8');
    
    // Update analytics values in the file
    const updateValue = (key: string, envVar: string, value: string) => {
      const pattern = new RegExp(
        `(${key}:\\s*process\\.env\\.${envVar}\\s*\\|\\|\\s*)['"][^'"]*['"]`,
        'g'
      );
      fileContent = fileContent.replace(pattern, `$1'${value}'`);
    };
    
    updateValue('googleAnalyticsId', 'NEXT_PUBLIC_GA_ID', analytics.googleAnalyticsId || '');
    updateValue('facebookPixelId', 'NEXT_PUBLIC_FB_PIXEL_ID', analytics.facebookPixelId || '');
    updateValue('hotjarId', 'NEXT_PUBLIC_HOTJAR_ID', analytics.hotjarId || '');
    updateValue('clarityId', 'NEXT_PUBLIC_CLARITY_ID', analytics.clarityId || '');
    
    // Write updated content back to file
    await fs.writeFile(SEO_CONFIG_PATH, fileContent, 'utf-8');
    
    // Try to commit the changes to git
    let warning = null;
    try {
      // Check if git is initialized
      await execAsync('git status', { cwd: process.cwd() });
      
      // Add the file
      await execAsync(`git add "${SEO_CONFIG_PATH}"`, { cwd: process.cwd() });
      
      // Check if there are changes to commit
      const { stdout: diffStatus } = await execAsync('git diff --cached --name-only', { cwd: process.cwd() });
      
      if (diffStatus.trim()) {
        // Create commit message
        const commitMessage = `Update analytics configuration

Updated analytics IDs:
- Google Analytics: ${analytics.googleAnalyticsId || 'not set'}
- Facebook Pixel: ${analytics.facebookPixelId || 'not set'}
- Hotjar: ${analytics.hotjarId || 'not set'}
- Microsoft Clarity: ${analytics.clarityId || 'not set'}`;
        
        // Commit the changes
        await execAsync(`git commit -m "${commitMessage}"`, { cwd: process.cwd() });
      }
    } catch (gitError: any) {
      // Handle git errors gracefully
      if (gitError.message.includes('not a git repository')) {
        warning = 'Git is not initialized. Changes saved locally but not committed.';
      } else if (gitError.message.includes('nothing to commit')) {
        // No changes to commit, this is fine
      } else if (gitError.message.includes('Please tell me who you are')) {
        warning = 'Git user not configured. Run: git config user.email "you@example.com" and git config user.name "Your Name"';
      } else {
        warning = `Git operation failed: ${gitError.message}. Changes saved locally.`;
      }
      console.warn('Git operation warning:', gitError.message);
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Analytics configuration saved successfully',
      warning
    });
    
  } catch (error) {
    console.error('Error updating analytics config:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update analytics configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}