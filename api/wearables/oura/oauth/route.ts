/**
 * Oura Ring OAuth Flow
 * Handles OAuth 2.0 authorization and callback
 */

import { NextRequest, NextResponse } from 'next/server';

const OURA_CLIENT_ID = process.env.OURA_CLIENT_ID;
const OURA_CLIENT_SECRET = process.env.OURA_CLIENT_SECRET;
const OURA_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/wearables/oura/oauth/callback`
  : 'http://localhost:3000/api/wearables/oura/oauth/callback';

const OURA_AUTH_URL = 'https://cloud.ouraring.com/oauth/authorize';
const OURA_TOKEN_URL = 'https://api.ouraring.com/oauth/token';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wearables/oura/oauth
 * Initiates OAuth flow - redirects to Oura authorization page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const state = userId || 'default'; // Use userId as state for security

    if (!OURA_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Oura client ID not configured' },
        { status: 500 }
      );
    }

    const authUrl = new URL(OURA_AUTH_URL);
    authUrl.searchParams.set('client_id', OURA_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', OURA_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'email personal daily');
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('Oura OAuth initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wearables/oura/oauth/callback
 * Handles OAuth callback and exchanges code for access token
 */
export async function GET_CALLBACK(request: NextRequest) {
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

    if (!code || !OURA_CLIENT_ID || !OURA_CLIENT_SECRET) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wearables?error=missing_params`
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(OURA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: OURA_REDIRECT_URI,
        client_id: OURA_CLIENT_ID,
        client_secret: OURA_CLIENT_SECRET,
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

    // Store tokens in database (would be done here)
    // For now, redirect with tokens in query params (in production, store securely)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wearables?connected=oura&token=${access_token}`
    );
  } catch (error: any) {
    console.error('Oura OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wearables?error=callback_failed`
    );
  }
}
