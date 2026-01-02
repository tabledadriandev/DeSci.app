/**
 * Oura OAuth Flow
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

const SCOPES = ['personal', 'email'].join(' ');

export const dynamic = 'force-dynamic';

/**
 * GET /api/wearables/oura/oauth
 * Initiates OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const state = userId || 'default';

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
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Oura OAuth initiation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to initiate Oura OAuth';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
