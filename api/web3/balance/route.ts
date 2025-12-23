import { NextRequest, NextResponse } from 'next/server';
import { web3Service } from '@/lib/web3';
import { isAddress } from 'viem';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address || !isAddress(address)) {
      return NextResponse.json(
        { error: 'Valid wallet address required' },
        { status: 400 }
      );
    }

    const balance = await web3Service.getFormattedBalance(address as `0x${string}`);
    const hasBalance = await web3Service.hasBalance(address as `0x${string}`);

    return NextResponse.json({
      address,
      balance,
      hasBalance,
      note: 'App is accessible to all users. Wallet connection enables rewards and premium features.',
    });
  } catch (error: any) {
    console.error('Balance check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check balance' },
      { status: 500 }
    );
  }
}

