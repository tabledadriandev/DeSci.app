import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, action } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    if (action === 'register') {
      // Register new user
      const result = await authService.registerEmail(email, password, username);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      // For development: include verification token in response
      // In production, this would be sent via email only
      const isDev = process.env.NODE_ENV !== 'production';
      
      return NextResponse.json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user: result.user,
        // Development only - shows verification URL for testing
        ...(isDev && { 
          verificationUrl: `/verify-email?token=${result.user?.emailVerificationToken || 'token-not-available'}`,
          note: 'In production, this URL would be sent via email'
        }),
      });
    } else {
      // Login existing user
      const result = await authService.authenticateEmail(
        email,
        password,
        undefined,
        ipAddress,
        userAgent
      );

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 401 }
        );
      }

      // Create response with cookies
      const response = NextResponse.json({
        success: true,
        user: result.user,
      });

      // Set session cookie
      if (result.sessionToken) {
        response.cookies.set('sessionToken', result.sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60, // 24 hours
          path: '/',
        });
      }

      // Set refresh token cookie
      if (result.refreshToken) {
        response.cookies.set('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
        });
      }

      return response;
    }
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

