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
    // Supports both formats:
    // 1. Simple string: googleAnalyticsId: 'G-123'
    // 2. Env var with fallback: googleAnalyticsId: process.env.XXX || 'G-123'
    const extractValue = (key: string): string => {
      // Try env var pattern first: key: process.env.XXX || 'value'
      const envPattern = new RegExp(`${key}:\\s*process\\.env\\.[A-Z_]+\\s*\\|\\|\\s*['"]([^'"]*)['"]`);
      const envMatch = fileContent.match(envPattern);
      if (envMatch && envMatch[1]) return envMatch[1];

      // Try simple string pattern: key: 'value' or key: "value"
      const simplePattern = new RegExp(`${key}:\\s*['"]([^'"]*)['"]`);
      const simpleMatch = fileContent.match(simplePattern);
      if (simpleMatch && simpleMatch[1]) return simpleMatch[1];

      return '';
    };

    const analytics = {
      googleAnalyticsId: extractValue('googleAnalyticsId'),
      facebookPixelId: extractValue('facebookPixelId'),
      hotjarId: extractValue('hotjarId'),
      clarityId: extractValue('clarityId'),
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
    // Supports both formats:
    // 1. Simple string: googleAnalyticsId: 'G-123'
    // 2. Env var with fallback: googleAnalyticsId: process.env.XXX || 'G-123'
    const updateValue = (key: string, value: string) => {
      // Try env var pattern first: key: process.env.XXX || 'value'
      const envPattern = new RegExp(
        `(${key}:\\s*process\\.env\\.[A-Z_]+\\s*\\|\\|\\s*)['"][^'"]*['"]`,
        'g'
      );
      if (fileContent.match(envPattern)) {
        fileContent = fileContent.replace(envPattern, `$1'${value}'`);
        return;
      }

      // Try simple string pattern: key: 'value' or key: "value"
      const simplePattern = new RegExp(
        `(${key}:\\s*)['"][^'"]*['"]`,
        'g'
      );
      fileContent = fileContent.replace(simplePattern, `$1'${value}'`);
    };

    updateValue('googleAnalyticsId', analytics.googleAnalyticsId || '');
    updateValue('facebookPixelId', analytics.facebookPixelId || '');
    updateValue('hotjarId', analytics.hotjarId || '');
    updateValue('clarityId', analytics.clarityId || '');
    
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