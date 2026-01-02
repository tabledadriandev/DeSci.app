/**
 * API Route: Get User's Historical Weekly Roots
 * Returns all weekly Merkle roots submitted by the user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get all Merkle proofs for this user
    const proofs = await prisma.proofOfHealth.findMany({
      where: {
        userId,
        proofType: 'merkle_biomarker',
      },
      orderBy: {
        weekStart: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      success: true,
      data: {
        roots: proofs.map((proof: unknown) => {
          const p = proof as { id: string; merkleRoot: string | null; weekStart: Date | null; onchainTxHash: string | null; metadata?: { leafCount?: number }; createdAt: Date };
          return {
            id: p.id,
            merkleRoot: p.merkleRoot,
            weekStart: p.weekStart,
            onchainTxHash: p.onchainTxHash,
            leafCount: p.metadata?.leafCount || 0,
            createdAt: p.createdAt,
          };
        }),
        total: proofs.length,
      },
    });
  } catch (error) {
    console.error('Get weekly roots error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get weekly roots';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
