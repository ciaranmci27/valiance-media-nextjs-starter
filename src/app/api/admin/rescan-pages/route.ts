import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// POST - Regenerate pages configuration
export async function POST() {
  try {
    // Run the generate-pages-config script
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate-pages-config.js');
    
    await execAsync(`node "${scriptPath}"`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Pages configuration regenerated successfully' 
    });
  } catch (error) {
    console.error('Error regenerating pages config:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate pages configuration' },
      { status: 500 }
    );
  }
}