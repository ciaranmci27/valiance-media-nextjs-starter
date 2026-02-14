import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/admin/auth';
import { sessionStore } from '@/lib/admin/auth-store';
import { lockoutStore } from '@/lib/admin/lockout-store';
import { getAuthProvider } from '@/lib/admin/auth-provider';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');
async function loadAdminSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const json = JSON.parse(data);
    return json?.admin || { sessionTimeout: 60, maxLoginAttempts: 5, lockoutDuration: 15 };
  } catch {
    return { sessionTimeout: 60, maxLoginAttempts: 5, lockoutDuration: 15 };
  }
}

export async function POST(request: NextRequest) {
  // Supabase login is handled client-side — this endpoint is simple-auth only
  if (getAuthProvider() === 'supabase') {
    return NextResponse.json(
      { error: 'Login is handled client-side for Supabase auth' },
      { status: 400 }
    );
  }

  try {
    const { username, password } = await request.json();

    // Get client IP address for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() :
               request.headers.get('x-real-ip') ||
               request.headers.get('x-client-ip') ||
               'unknown';

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Load admin settings first to ensure session store has latest settings
    const adminSettings = await loadAdminSettings();
    sessionStore.updateSettings({
      sessionTimeout: adminSettings.sessionTimeout,
      maxLoginAttempts: adminSettings.maxLoginAttempts,
      lockoutDuration: adminSettings.lockoutDuration,
    });

    // Enforce max login attempts using persistent lockout store (IP-based)
    if (await lockoutStore.isLocked(ip)) {
      const remaining = await lockoutStore.getRemainingLockTime(ip);
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${Math.ceil(remaining / 60)} minutes.` },
        { status: 429 }
      );
    }

    // Verify credentials and get token
    const token = await verifyCredentials(username, password);

    if (!token) {
      const { locked, remainingAttempts } = await lockoutStore.recordFailedAttempt(
        ip,
        username,
        adminSettings.maxLoginAttempts || 5,
        adminSettings.lockoutDuration || 15
      );
      const status = locked ? 429 : 401;
      const lockoutMinutes = adminSettings.lockoutDuration || 15;
      const message = locked
        ? `Too many failed attempts. Account locked for ${lockoutMinutes} minutes.`
        : `Invalid credentials. ${remainingAttempts} attempts remaining.`;
      return NextResponse.json(
        { error: message },
        { status }
      );
    }

    // Double-check the IP isn't locked (race condition protection)
    if (await lockoutStore.isLocked(ip)) {
      const remaining = await lockoutStore.getRemainingLockTime(ip);
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${Math.ceil(remaining / 60)} minutes.` },
        { status: 429 }
      );
    }

    // Clear lockout on successful login and create an in-memory session
    await lockoutStore.clearLockout(ip);
    sessionStore.createSession(username, token);

    // Use session timeout from settings for cookie maxAge
    const sessionTimeoutSeconds = (adminSettings.sessionTimeout || 60) * 60;

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      message: 'Login successful'
    });

    // Set secure cookie for auth token — uses session timeout, not hardcoded 7 days
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionTimeoutSeconds,
      path: '/'
    });

    // Set last-activity cookie and timeout cookie based on saved settings
    response.cookies.set('admin-last', String(Date.now()), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    response.cookies.set('admin-timeout', String(adminSettings.sessionTimeout || 60), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
