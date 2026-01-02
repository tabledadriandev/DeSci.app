import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    // TODO: NFT model not yet implemented, use HealthBadge instead
    const nfts = await prisma.healthBadge.findMany({
      where: { userId: user.id },
      orderBy: { issuedAt: 'desc' },
    });

    return NextResponse.json(nfts);
  } catch (error) {
    console.error('Error fetching NFTs:', error);
        const errorMessage = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}