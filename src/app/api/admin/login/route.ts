import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/auth';
import { sessionStore } from '@/lib/auth-store';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');
async function loadAdminSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const json = JSON.parse(data);
    return json?.admin || { sessionTimeout: 60, maxLoginAttempts: 5 };
  } catch {
    return { sessionTimeout: 60, maxLoginAttempts: 5 };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('Login attempt for username:', username);

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Enforce max login attempts using sessionStore
    if (sessionStore.isAccountLocked(username)) {
      const remaining = sessionStore.getRemainingLockTime(username);
      return NextResponse.json(
        { error: `Account locked. Try again in ${Math.ceil(remaining / 60)} minutes.` },
        { status: 429 }
      );
    }

    // Verify credentials and get token
    const token = await verifyCredentials(username, password);

    if (!token) {
      console.log('Invalid credentials for username:', username);
      const { locked, remainingAttempts } = sessionStore.recordFailedLogin(username);
      const status = locked ? 429 : 401;
      const message = locked
        ? 'Too many failed attempts. Account locked for 15 minutes.'
        : `Invalid credentials. ${remainingAttempts} attempts remaining.`;
      return NextResponse.json(
        { error: message },
        { status }
      );
    }

    console.log('Login successful for username:', username);
    console.log('Token generated/retrieved:', token);

    // Clear failed attempts and create an in-memory session
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
    const adminSettings = await loadAdminSettings();
    sessionStore.updateSettings({
      sessionTimeout: adminSettings.sessionTimeout,
      maxLoginAttempts: adminSettings.maxLoginAttempts,
    });
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