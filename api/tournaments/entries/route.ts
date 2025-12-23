import { NextRequest, NextResponse } from 'next/server';

// In-memory entries (would use database in production)
const entries = new Map<string, any[]>();

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

    const userEntries = entries.get(address) || [];
    return NextResponse.json(userEntries);
  } catch (error: any) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

