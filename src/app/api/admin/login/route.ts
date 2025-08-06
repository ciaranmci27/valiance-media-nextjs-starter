import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/auth';

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

    // Verify credentials and get token
    const token = await verifyCredentials(username, password);

    if (!token) {
      console.log('Invalid credentials for username:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Login successful for username:', username);
    console.log('Token generated/retrieved:', token);

    // Create response with cookie
    const response = NextResponse.json({ 
      success: true,
      message: 'Login successful' 
    });

    // Set secure cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
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