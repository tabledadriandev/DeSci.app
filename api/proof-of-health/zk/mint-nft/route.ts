/**
 * API Route: Mint Metabolic Signature NFT
 * Mints an NFT after zk-proof verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { hashProof, type ZkProof } from '@/lib/crypto/zk-proofs';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ZK_VERIFIER_ABI = [
  {
    name: 'mintMetabolicSignatureNFT',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'a', type: 'uint256[2]' },
      { name: 'b', type: 'uint256[2][2]' },
      { name: 'c', type: 'uint256[2]' },
      { name: 'input', type: 'uint256[3]' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
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

    // Get user's wallet address
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    });

    if (!user?.walletAddress) {
      return NextResponse.json(
        { error: 'User wallet address not found' },
        { status: 400 }
      );
    }

    const contractAddress = process.env
      .NEXT_PUBLIC_ZK_VERIFIER_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      return NextResponse.json(
        { error: 'ZkProofVerifier contract address not configured' },
        { status: 500 }
      );
    }

    // Hash proof
    const proofHash = hashProof(proof as ZkProof);

    // Mint NFT (requires server-side private key or client-side signing)
    const privateKey = process.env.ZK_VERIFIER_PRIVATE_KEY as `0x${string}`;
    let tokenId: string | undefined;
    let txHash: string | undefined;

    if (privateKey) {
      try {
        const account = privateKeyToAccount(privateKey);
        const walletClient = createWalletClient({
          account,
          chain: base,
          transport: http(
            process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'
          ),
        });

        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi: ZK_VERIFIER_ABI,
          functionName: 'mintMetabolicSignatureNFT',
          args: [
            user.walletAddress as `0x${string}`,
            proof.a.map((x: string) => BigInt(x)) as [bigint, bigint],
            [
              proof.b[0].map((x: string) => BigInt(x)) as [bigint, bigint],
              proof.b[1].map((x: string) => BigInt(x)) as [bigint, bigint],
            ],
            proof.c.map((x: string) => BigInt(x)) as [bigint, bigint],
            publicSignals.map((x: string) => BigInt(x)) as [bigint, bigint, bigint],
          ],
        });

        txHash = hash;
        // In production, parse transaction receipt for token ID
      } catch (error) {
        console.error('Mint NFT transaction error:', error);
        return NextResponse.json(
          {
            error: 'Failed to mint NFT onchain',
            requiresWallet: true,
            contractAddress,
            functionName: 'mintMetabolicSignatureNFT',
          },
          { status: 500 }
        );
      }
    }

    // Store badge in database
    const badge = await prisma.healthBadge.create({
      data: {
        userId,
        badgeType: 'metabolic_signature',
        tokenId: tokenId || undefined,
        mintTxHash: txHash || undefined,
        metadata: {
          proofHash,
          biomarker: publicSignals[0] < '5.7' ? 'HbA1c' : 'VO2max',
          range: publicSignals[0] < '5.7' ? 'HbA1c < 5.7%' : 'VO2max > 35',
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        badgeId: badge.id,
        tokenId,
        transactionHash: txHash,
        badgeType: 'metabolic_signature',
      },
    });
  } catch (error) {
    console.error('Mint metabolic signature NFT error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to mint metabolic signature NFT';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
