/**
 * API Route: Generate zk-Proof for Metabolic Signature
 * Generates a zk-SNARK range proof for biomarker values
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createMetabolicSignatureProof,
  hashProof,
  type ZkProof,
} from '@/lib/crypto/zk-proofs';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromBody(body) || getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hba1c, vo2max } = body;

    if (hba1c === undefined && vo2max === undefined) {
      return NextResponse.json(
        { error: 'Missing biomarker value: provide hba1c or vo2max' },
        { status: 400 }
      );
    }

    // Generate proof
    const result = await createMetabolicSignatureProof(hba1c, vo2max);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Hash proof for storage
    const proofHash = hashProof(result.proof);

    return NextResponse.json({
      success: true,
      data: {
        proof: result.proof,
        proofHash,
        biomarker: hba1c !== undefined ? 'HbA1c' : 'VO2max',
        range:
          hba1c !== undefined
            ? 'HbA1c < 5.7%'
            : 'VO2max > 35',
        message:
          'Proof generated. Submit to ZkProofVerifier contract to mint Metabolic Signature NFT.',
      },
    });
  } catch (error) {
    console.error('Generate zk-proof error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate zk-proof';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
