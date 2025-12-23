/**
 * Google Fit OAuth Flow
 * Handles OAuth 2.0 authorization and callback
 */

import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_FIT_CLIENT_ID = process.env.GOOGLE_FIT_CLIENT_ID;
const GOOGLE_FIT_CLIENT_SECRET = process.env.GOOGLE_FIT_CLIENT_SECRET;
const GOOGLE_FIT_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/wearables/google-fit/oauth/callback`
  : 'http://localhost:3000/api/wearables/google-fit/oauth/callback';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
].join(' ');

export const dynamic = 'force-dynamic';

/**
 * GET /api/wearables/google-fit/oauth
 * Initiates OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const state = userId || 'default';

    if (!GOOGLE_FIT_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Google Fit client ID not configured' },
        { status: 500 }
      );
    }

    const authUrl = new URL(GOOGLE_AUTH_URL);
    authUrl.searchParams.set('client_id', GOOGLE_FIT_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', GOOGLE_FIT_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('Google Fit OAuth initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}
