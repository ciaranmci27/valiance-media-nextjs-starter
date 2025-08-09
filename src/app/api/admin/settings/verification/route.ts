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
    const configContent = await fs.readFile(SEO_CONFIG_PATH, 'utf-8');
    
    const verificationMatch = configContent.match(/verification:\s*{([^}]+)}/m);
    if (!verificationMatch) {
      return NextResponse.json({
        verification: {
          google: '',
          bing: '',
          yandex: '',
          pinterest: ''
        }
      });
    }

    const verificationContent = verificationMatch[1];
    
    const extractValue = (key: string): string => {
      const regex = new RegExp(`${key}:\\s*process\\.env\\.NEXT_PUBLIC_[A-Z_]+\\s*\\|\\|\\s*['"]([^'"]*)['"]`, 'i');
      const match = verificationContent.match(regex);
      return match ? match[1] : '';
    };

    return NextResponse.json({
      verification: {
        google: extractValue('google'),
        bing: extractValue('bing'),
        yandex: extractValue('yandex'),
        pinterest: extractValue('pinterest')
      }
    });
  } catch (error) {
    console.error('Error reading verification config:', error);
    return NextResponse.json(
      { error: 'Failed to read verification configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { verification } = await request.json();
    
    // Read current config
    let configContent = await fs.readFile(SEO_CONFIG_PATH, 'utf-8');
    
    // Update verification section
    const verificationRegex = /verification:\s*{[^}]+}/m;
    const newVerificationSection = `verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '${verification.google || ''}',
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '${verification.bing || ''}',
    yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION || '${verification.yandex || ''}',
    pinterest: process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION || '${verification.pinterest || ''}'
  }`;
    
    configContent = configContent.replace(verificationRegex, newVerificationSection);
    
    // Write the updated config
    await fs.writeFile(SEO_CONFIG_PATH, configContent, 'utf-8');
    
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
        const commitMessage = `Update site verification settings

Updated verification codes for:
- Google: ${verification.google ? 'configured' : 'empty'}
- Bing: ${verification.bing ? 'configured' : 'empty'}
- Yandex: ${verification.yandex ? 'configured' : 'empty'}
- Pinterest: ${verification.pinterest ? 'configured' : 'empty'}`;
        
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
      message: 'Verification settings saved successfully',
      warning
    });
  } catch (error) {
    console.error('Error updating verification config:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update verification configuration'
      },
      { status: 500 }
    );
  }
}