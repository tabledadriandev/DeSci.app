/**
 * API Route: Reveal Commitment
 * Reveals a daily commitment to verify protocol adherence
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCommitment } from '@/lib/crypto/commitments';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromBody(body) || getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commitmentId, nonce, protocolHash, actualActions } = body;

    if (!commitmentId || !nonce || !protocolHash) {
      return NextResponse.json(
        {
          error: 'Missing required fields: commitmentId, nonce, protocolHash',
        },
        { status: 400 }
      );
    }

    // Get commitment record
    const commitmentRecord = await prisma.proofOfHealth.findUnique({
      where: { id: commitmentId },
    });

    if (!commitmentRecord || commitmentRecord.userId !== userId) {
      return NextResponse.json(
        { error: 'Commitment not found or access denied' },
        { status: 404 }
      );
    }

    if (commitmentRecord.proofType !== 'commitment') {
      return NextResponse.json(
        { error: 'Invalid proof type' },
        { status: 400 }
      );
    }

    const metadata = commitmentRecord.metadata as { commitment?: string; nonce?: string; protocolHash?: string };
    const storedCommitment = metadata.commitment;

    if (!storedCommitment) {
      return NextResponse.json(
        { error: 'Commitment not found in record' },
        { status: 400 }
      );
    }

    // Verify commitment
    const verified = verifyCommitment(storedCommitment, nonce, protocolHash);

    if (!verified) {
      return NextResponse.json(
        { error: 'Commitment verification failed' },
        { status: 400 }
      );
    }

    // Update commitment record with reveal
    await prisma.proofOfHealth.update({
      where: { id: commitmentId },
      data: {
        metadata: {
          ...metadata,
          revealed: true,
          revealedAt: new Date().toISOString(),
          actualActions: actualActions || [],
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        commitmentId,
        verified: true,
        revealedAt: new Date().toISOString(),
        message: 'Commitment revealed successfully. Submit to blockchain to update streak.',
      },
    });
  } catch (error) {
    console.error('Reveal commitment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to reveal commitment';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
