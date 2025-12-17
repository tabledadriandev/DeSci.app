import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action, username } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get IP and User Agent for session tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (action === 'register') {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required' },
          { status: 400 }
        );
      }

      // Validate password strength
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }

      const result = await authService.registerEmail(email, password, username);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Registration failed' },
          { status: result.error?.includes('already registered') ? 409 : 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user: result.user,
      });
    } else if (action === 'login') {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required' },
          { status: 400 }
        );
      }

      const result = await authService.authenticateEmail(
        email, 
        password, 
        undefined, 
        ipAddress, 
        userAgent
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Invalid credentials' },
          { status: 401 }
        );
      }

      const response = NextResponse.json({
        success: true,
        user: result.user,
      });

      if (result.sessionToken) {
        response.cookies.set('sessionToken', result.sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60, // 24 hours
        });
      }

      if (result.refreshToken) {
        response.cookies.set('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });
      }

      return response;
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "login" or "register"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Email auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

