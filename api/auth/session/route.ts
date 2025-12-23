import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('sessionToken')?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    let user = null;
    try {
      user = await authService.verifySession(sessionToken);
    } catch (error) {
      console.error('Session verification error:', error);
    }

    if (!user) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
        username: user.username,
        emailVerified: user.emailVerified,
      },
      authenticated: true 
    });
  } catch (error: any) {
    console.error('Error checking session:', error);
    return NextResponse.json({ user: null, authenticated: false });
  }
}
