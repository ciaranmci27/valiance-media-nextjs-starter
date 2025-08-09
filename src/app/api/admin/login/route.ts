import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/auth';
import { sessionStore } from '@/lib/auth-store';
import { lockoutStore } from '@/lib/lockout-store';
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
  try {
    const { username, password } = await request.json();
    
    // Get client IP address for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               request.headers.get('x-client-ip') ||
               'unknown';

    console.log('Login attempt for username:', username, 'from IP:', ip);

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
      console.log(`IP ${ip} is locked. Remaining time: ${remaining} seconds`);
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${Math.ceil(remaining / 60)} minutes.` },
        { status: 429 }
      );
    }

    // Verify credentials and get token
    const token = await verifyCredentials(username, password);

    if (!token) {
      console.log('Invalid credentials for username:', username);
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

    console.log('Login successful for username:', username);
    console.log('Token generated/retrieved:', token);

    // Double-check the IP isn't locked (race condition protection)
    if (await lockoutStore.isLocked(ip)) {
      const remaining = await lockoutStore.getRemainingLockTime(ip);
      console.log(`IP ${ip} is locked (double-check). Remaining time: ${remaining} seconds`);
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${Math.ceil(remaining / 60)} minutes.` },
        { status: 429 }
      );
    }

    // Clear lockout on successful login and create an in-memory session
    await lockoutStore.clearLockout(ip);
    sessionStore.createSession(username, token);

    // Create response with cookies
    const response = NextResponse.json({ 
      success: true,
      message: 'Login successful' 
    });

    // Set secure cookie for auth token
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
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

    console.log('Cookie set successfully');

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Logout endpoint
  const token = request.cookies.get('admin-token')?.value;
  
  if (token) {
    // Clear the session from the store
    const { sessionStore } = await import('@/lib/auth-store');
    sessionStore.deleteSession(token);
  }
  
  const response = NextResponse.json({ 
    success: true,
    message: 'Logout successful' 
  });

  // Clear the cookie
  response.cookies.delete('admin-token');

  return response;
}