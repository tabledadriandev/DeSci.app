import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { autoSaveService } from '@/lib/auto-save';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('sessionToken')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await authService.verifySession(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const progress = await request.json();

    // Save immediately
    await autoSaveService.saveNow(user.id, progress);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving progress:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}

