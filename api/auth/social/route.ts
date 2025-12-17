import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/social
 * Generic social login endpoint.
 *
 * The frontend is expected to perform the OAuth flow with the provider
 * and send a verified profile payload here.
 */
export async function POST(request: NextRequest) {
  try {
    const { provider, providerId, email, displayName, avatarUrl } = await request.json();

    if (!provider || !providerId) {
      return NextResponse.json(
        { error: 'provider and providerId are required' },
        { status: 400 },
      );
    }

    // IP / UA for session tracking
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const result = await authService.authenticateSocial({
      provider,
      providerId,
      email,
      displayName,
      avatarUrl,
      ipAddress,
      userAgent,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Social authentication failed' },
        { status: 401 },
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
        maxAge: 24 * 60 * 60,
      });
    }

    if (result.refreshToken) {
      response.cookies.set('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Social login error:', error);
    return NextResponse.json(
      { error: 'Social authentication failed' },
      { status: 500 },
    );
  }
}


