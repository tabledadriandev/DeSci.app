/**
 * API Route: Verify zk-Proof Onchain
 * Verifies a zk-SNARK proof on the blockchain
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { verifyRangeProof, type ZkProof } from '@/lib/crypto/zk-proofs';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ZK_VERIFIER_ABI = [
  {
    name: 'verifyMetabolicProof',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'a', type: 'uint256[2]' },
      { name: 'b', type: 'uint256[2][2]' },
      { name: 'c', type: 'uint256[2]' },
      { name: 'input', type: 'uint256[3]' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromBody(body) || getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { proof, publicSignals } = body;

    if (!proof || !publicSignals) {
      return NextResponse.json(
        { error: 'Missing required fields: proof, publicSignals' },
        { status: 400 }
      );
    }

    // Verify proof locally first
    const verified = await verifyRangeProof(proof as ZkProof, publicSignals);

    if (!verified) {
      return NextResponse.json(
        { error: 'Proof verification failed locally' },
        { status: 400 }
      );
    }

    // Verify onchain
    const contractAddress = process.env
      .NEXT_PUBLIC_ZK_VERIFIER_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      return NextResponse.json(
        { error: 'ZkProofVerifier contract address not configured' },
        { status: 500 }
      );
    }

    const client = createPublicClient({
      chain: base,
      transport: http(
        process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'
      ),
    });

    try {
      const onchainVerified = await client.readContract({
        address: contractAddress,
        abi: ZK_VERIFIER_ABI,
        functionName: 'verifyMetabolicProof',
        args: [
          proof.a.map((x: string) => BigInt(x)) as [bigint, bigint],
          [
            proof.b[0].map((x: string) => BigInt(x)) as [bigint, bigint],
            proof.b[1].map((x: string) => BigInt(x)) as [bigint, bigint],
          ],
          proof.c.map((x: string) => BigInt(x)) as [bigint, bigint],
          publicSignals.map((x: string) => BigInt(x)) as [bigint, bigint, bigint],
        ],
      });

      return NextResponse.json({
        success: true,
        data: {
          verified: onchainVerified,
          proofHash: '', // Would calculate from proof
        },
      });
    } catch (onchainError) {
      return NextResponse.json(
        {
          error: 'Onchain verification failed',
          details: onchainError instanceof Error ? onchainError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Verify zk-proof error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify zk-proof';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
