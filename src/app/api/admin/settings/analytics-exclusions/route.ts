import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/admin/require-auth';

export const runtime = 'nodejs';

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

// Default analytics exclusion settings
const defaultExclusions = {
  enabled: true,
  excludedIPs: [] as string[],
  excludeLocalhost: true,
  excludeBots: true,
};

async function loadSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { analyticsExclusions: defaultExclusions };
  }
}

async function saveSettings(settings: Record<string, unknown>) {
  try {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const settings = await loadSettings();
    const exclusions = settings.analyticsExclusions || defaultExclusions;

    return NextResponse.json({
      analyticsExclusions: exclusions
    });
  } catch (error) {
    console.error('Error loading analytics exclusions:', error);
    return NextResponse.json(
      { error: 'Failed to load analytics exclusions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { analyticsExclusions } = await request.json();

    if (!analyticsExclusions) {
      return NextResponse.json(
        { error: 'Invalid request: analyticsExclusions required' },
        { status: 400 }
      );
    }

    // Validate structure
    const validatedExclusions = {
      enabled: typeof analyticsExclusions.enabled === 'boolean'
        ? analyticsExclusions.enabled
        : defaultExclusions.enabled,
      excludedIPs: Array.isArray(analyticsExclusions.excludedIPs)
        ? analyticsExclusions.excludedIPs.filter((ip: unknown) => typeof ip === 'string' && ip.trim())
        : defaultExclusions.excludedIPs,
      excludeLocalhost: typeof analyticsExclusions.excludeLocalhost === 'boolean'
        ? analyticsExclusions.excludeLocalhost
        : defaultExclusions.excludeLocalhost,
      excludeBots: typeof analyticsExclusions.excludeBots === 'boolean'
        ? analyticsExclusions.excludeBots
        : defaultExclusions.excludeBots,
    };

    // Load current settings and update analyticsExclusions
    const currentSettings = await loadSettings();
    const updatedSettings = {
      ...currentSettings,
      analyticsExclusions: validatedExclusions,
    };

    const saved = await saveSettings(updatedSettings);

    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save analytics exclusions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics exclusions saved successfully',
      analyticsExclusions: validatedExclusions,
    });
  } catch (error) {
    console.error('Error saving analytics exclusions:', error);
    return NextResponse.json(
      { error: 'Failed to save analytics exclusions' },
      { status: 500 }
    );
  }
}
