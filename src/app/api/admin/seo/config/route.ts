import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getCurrentConfig, formatConfigForFile } from '@/lib/seo-config-parser';

const execAsync = promisify(exec);
const SEO_CONFIG_PATH = path.join(process.cwd(), 'src', 'seo', 'seo.config.ts');

export async function GET() {
  try {
    const { config } = getCurrentConfig();
    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error reading SEO config:', error);
    return NextResponse.json(
      { error: 'Failed to read SEO configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { config } = await request.json();
    
    // Generate the new file content using the parser
    const newFileContent = formatConfigForFile(config);

    // Write the file
    await fs.writeFile(SEO_CONFIG_PATH, newFileContent, 'utf-8');

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
        // Create a detailed commit message
        const commitMessage = `Update SEO configuration

Updated sections:
- Site: ${config.siteName}
- Company: ${config.company.name}
- Default Title: ${config.defaultTitle ? 'configured' : 'empty'}
- Open Graph: ${config.openGraph.defaultImage ? 'image configured' : 'no image'}
- Social Links: ${Object.values(config.social).filter(Boolean).length} configured
- Languages: ${Object.keys(config.alternates.languages).length} configured`;
        
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
      message: 'SEO configuration updated successfully',
      warning
    });

  } catch (error) {
    console.error('Error updating SEO config:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update SEO configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}