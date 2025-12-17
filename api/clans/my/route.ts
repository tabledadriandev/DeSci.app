import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // In production, would fetch from database
    // For now, return null (no clan)
    return NextResponse.json(null);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch clan' },
      { status: 500 }
    );
  }
}

