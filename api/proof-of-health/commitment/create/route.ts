/**
 * API Route: Create Daily Commitment
 * Creates a Pedersen commitment for protocol adherence
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createDailyCommitment,
  commitmentToBytes32,
} from '@/lib/crypto/commitments';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromBody(body) || getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { protocolId, day, intendedActions } = body;

    if (!protocolId || !day || !intendedActions) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: protocolId, day, intendedActions',
        },
        { status: 400 }
      );
    }

    // Create commitment
    const commitment = createDailyCommitment(
      userId,
      protocolId,
      day,
      intendedActions
    );

    // Store commitment in database
    const commitmentRecord = await prisma.proofOfHealth.create({
      data: {
        userId,
        proofType: 'commitment',
        metadata: {
          protocolId,
          day,
          commitment: commitment.commitment,
          nonce: commitment.nonce, // Store encrypted or in secure storage
          protocolHash: commitment.protocolHash,
          intendedActions,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        commitmentId: commitmentRecord.id,
        commitment: commitment.commitment,
        commitmentBytes32: commitmentToBytes32(commitment.commitment),
        protocolId,
        day,
        message:
          'Submit commitment to blockchain, then reveal within 24 hours',
      },
    });
  } catch (error) {
    console.error('Create commitment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create commitment';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
