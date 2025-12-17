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

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('sessionToken')?.value;
    
    if (sessionToken) {
      // Invalidate session in database
      try {
        await authService.logout(sessionToken);
      } catch (error) {
        console.error('Error invalidating session:', error);
      }
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    
    // Clear all auth cookies
    response.cookies.set('sessionToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}