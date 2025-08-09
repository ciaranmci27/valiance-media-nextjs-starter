import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/auth-store';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

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
    lockoutDuration: 15,
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

    // Update in-memory session store defaults for current runtime
    sessionStore.updateSettings({
      sessionTimeout: settings.admin?.sessionTimeout,
      maxLoginAttempts: settings.admin?.maxLoginAttempts,
      lockoutDuration: settings.admin?.lockoutDuration,
    });

    // Return response and set/update timeout cookie used by middleware
    const response = NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully'
    });
    if (typeof settings.admin?.sessionTimeout === 'number') {
      response.cookies.set('admin-timeout', String(settings.admin.sessionTimeout), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        // no explicit expiry; it will follow the session unless overridden
      });
    }
    return response;

  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}