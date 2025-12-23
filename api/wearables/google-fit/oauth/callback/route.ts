/**
 * Google Fit OAuth Callback
 * Handles OAuth callback and exchanges code for access token
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const GOOGLE_FIT_CLIENT_ID = process.env.GOOGLE_FIT_CLIENT_ID;
const GOOGLE_FIT_CLIENT_SECRET = process.env.GOOGLE_FIT_CLIENT_SECRET;
const GOOGLE_FIT_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/wearables/google-fit/oauth/callback`
  : 'http://localhost:3000/api/wearables/google-fit/oauth/callback';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wearables/google-fit/oauth/callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wearables?error=${error}`
      );
    }

    if (!code || !GOOGLE_FIT_CLIENT_ID || !GOOGLE_FIT_CLIENT_SECRET) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wearables?error=missing_params`
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: GOOGLE_FIT_REDIRECT_URI,
        client_id: GOOGLE_FIT_CLIENT_ID,
        client_secret: GOOGLE_FIT_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json().catch(() => ({ error: 'Token exchange failed' }));
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wearables?error=${error.error}`
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // Store tokens in database
    if (state && state !== 'default') {
      const expiresAt = expires_in
        ? new Date(Date.now() + expires_in * 1000)
        : null;

      await prisma.wearableConnection.upsert({
        where: {
          userId_provider: {
            userId: state,
            provider: 'google',
          },
        },
        create: {
          userId: state,
          provider: 'google',
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt,
          lastSyncAt: new Date(),
          isActive: true,
        },
        update: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt,
          lastSyncAt: new Date(),
          isActive: true,
        },
      });
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wearables?connected=google-fit&success=true`
    );
  } catch (error: any) {
    console.error('Google Fit OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wearables?error=callback_failed`
    );
  }
}
