/**
 * API Route: Mint SBT for Lab Result with Clinician Signature
 * Mints a HealthBadgeSBT for a lab result attested by a clinician
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  mintClinicianAttestedBadge,
  isWhitelistedClinician,
} from '@/lib/proof-of-health/clinician-attestation';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// HealthBadgeSBT contract ABI
const HEALTH_BADGE_SBT_ABI = [
  {
    name: 'mintBadgeWithClinicianAttestation',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'badgeType', type: 'uint8' },
      { name: 'dataHash', type: 'bytes32' },
      { name: 'tokenURI', type: 'string' },
      { name: 'clinicianContract', type: 'address' },
      { name: 'signature', type: 'bytes' },
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

    const {
      medicalResultId,
      clinicianContract,
      signature,
      ipfsCID,
    } = body;

    if (!medicalResultId || !clinicianContract || !signature) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: medicalResultId, clinicianContract, signature',
        },
        { status: 400 }
      );
    }

    // Check if clinician is whitelisted
    if (!isWhitelistedClinician(clinicianContract as `0x${string}`)) {
      return NextResponse.json(
        { error: 'Clinician not whitelisted' },
        { status: 403 }
      );
    }

    // Get medical result
    const medicalResult = await prisma.medicalResult.findUnique({
      where: { id: medicalResultId },
    });

    if (!medicalResult || medicalResult.userId !== userId) {
      return NextResponse.json(
        { error: 'Medical result not found or access denied' },
        { status: 404 }
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

    // Hash the medical result data
    const dataHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(medicalResult.biomarkers))
      .digest('hex');

    const dataHashBytes32 = `0x${dataHash}` as `0x${string}`;

    // Create token URI (IPFS CID or metadata URL)
    const tokenURI = ipfsCID
      ? `ipfs://${ipfsCID}`
      : `/api/proof-of-health/sbt/metadata/${medicalResultId}`;

    // Verify clinician signature
    const verification = await mintClinicianAttestedBadge(
      userId,
      'clinician_attested',
      dataHash,
      clinicianContract as `0x${string}`,
      signature as `0x${string}`
    );

    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || 'Clinician signature verification failed' },
        { status: 400 }
      );
    }

    // Get contract address
    const contractAddress = process.env
      .NEXT_PUBLIC_HEALTH_BADGE_SBT_CONTRACT as `0x${string}`;
    if (!contractAddress) {
      return NextResponse.json(
        { error: 'HealthBadgeSBT contract address not configured' },
        { status: 500 }
      );
    }

    // Mint badge onchain (requires server-side private key or client-side signing)
    const privateKey = process.env.HEALTH_BADGE_SBT_PRIVATE_KEY as `0x${string}`;
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
          abi: HEALTH_BADGE_SBT_ABI,
          functionName: 'mintBadgeWithClinicianAttestation',
          args: [
            user.walletAddress as `0x${string}`,
            1, // CLINICIAN_ATTESTED badge type
            dataHashBytes32,
            tokenURI,
            clinicianContract as `0x${string}`,
            signature as `0x${string}`,
          ],
        });

        txHash = hash;

        // Wait for transaction and get token ID from event
        // In production, parse the transaction receipt for the token ID
      } catch (error) {
        console.error('Mint badge transaction error:', error);
        return NextResponse.json(
          {
            error: 'Failed to mint badge onchain',
            requiresWallet: true,
            contractAddress,
            functionName: 'mintBadgeWithClinicianAttestation',
            args: [
              user.walletAddress,
              1,
              dataHashBytes32,
              tokenURI,
              clinicianContract,
              signature,
            ],
          },
          { status: 500 }
        );
      }
    }

    // Store badge in database
    const badge = await prisma.healthBadge.create({
      data: {
        userId,
        badgeType: 'clinician_attested',
        tokenId: tokenId || undefined,
        mintTxHash: txHash || undefined,
        metadata: {
          medicalResultId,
          clinicianContract,
          dataHash,
          ipfsCID: ipfsCID || null,
          testDate: medicalResult.testDate,
          testType: medicalResult.testType,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        badgeId: badge.id,
        tokenId,
        transactionHash: txHash,
        badgeType: 'clinician_attested',
      },
    });
  } catch (error) {
    console.error('Mint lab result badge error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to mint lab result badge';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
