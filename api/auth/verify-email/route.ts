import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const result = await authService.verifyEmail(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Email verification failed' },
        { status: 400 }
      );
    }

    // Redirect to login page with success message
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('verified', 'true');

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Email verification failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const result = await authService.verifyEmail(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Email verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Email verification failed' },
      { status: 500 }
    );
  }
}

