import { NextRequest, NextResponse } from 'next/server';
import { web3Service } from '@/lib/web3';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { address, tournamentId } = await request.json();

    if (!address || !tournamentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check balance for entry fee (would get from tournament data)
    const entryFee = 25; // Would fetch from tournament
    const balance = await web3Service.getBalance(address as `0x${string}`);
    const feeInWei = BigInt(Math.floor(entryFee * 1e18));

    if (balance < feeInWei) {
      return NextResponse.json(
        { error: `Insufficient balance. Need ${entryFee} $tabledadrian for entry` },
        { status: 400 }
      );
    }

    // In production, would:
    // 1. Create tournament entry record
    // 2. Process payment
    // 3. Add user to tournament

    return NextResponse.json({
      success: true,
      message: 'Tournament entry successful!',
    });
  } catch (error: any) {
    console.error('Error joining tournament:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join tournament' },
      { status: 500 }
    );
  }
}

