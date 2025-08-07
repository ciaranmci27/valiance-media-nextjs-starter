import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

// Default settings
const defaultSettings = {
  email: {
    provider: 'smtp',
    fromEmail: '',
    fromName: '',
    replyTo: '',
  },
  admin: {
    sessionTimeout: 60,
    maxLoginAttempts: 5,
  },
};

async function loadSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return default settings if file doesn't exist
    return defaultSettings;
  }
}

async function saveSettings(settings: any) {
  try {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

export async function GET() {
  try {
    const settings = await loadSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error loading settings:', error);
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();
    
    // Validate settings structure (analytics is handled separately)
    if (!settings.email || !settings.admin) {
      return NextResponse.json(
        { error: 'Invalid settings structure' },
        { status: 400 }
      );
    }
    
    // Don't save analytics here - it's handled by the analytics endpoint

    // Save settings to file
    const saved = await saveSettings(settings);
    
    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save settings' },
        { status: 500 }
      );
    }

    // In a real application, you might want to:
    // 1. Update session timeout in your auth middleware
    // 2. Update email configuration in your email service
    // 3. Trigger any necessary system updates

    return NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully'
    });

  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}