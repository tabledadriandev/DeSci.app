/**
 * API Route: Verify Device Attestation
 * Verifies an EIP-712 device attestation signature
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyDeviceAttestation, type DeviceAttestationData } from '@/lib/crypto/eip712';
import { isAuthorizedDevice } from '@/lib/proof-of-health/device-registry';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';
import { recoverTypedDataAddress } from 'viem';
import { createDeviceAttestationTypedData } from '@/lib/crypto/eip712';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromBody(body) || getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attestationId, signature, devicePubKey } = body;

    if (!attestationId || !signature || !devicePubKey) {
      return NextResponse.json(
        { error: 'Missing required fields: attestationId, signature, devicePubKey' },
        { status: 400 }
      );
    }

    // Get attestation record
    const attestation = await prisma.deviceAttestation.findUnique({
      where: { id: attestationId },
    });

    if (!attestation || attestation.userId !== userId) {
      return NextResponse.json(
        { error: 'Attestation not found or access denied' },
        { status: 404 }
      );
    }

    // Check if device is authorized
    const isAuthorized = await isAuthorizedDevice(devicePubKey);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Device not authorized' },
        { status: 403 }
      );
    }

    // Verify signature using viem
    const typedData = createDeviceAttestationTypedData({
      userId: attestation.userId,
      deviceId: attestation.deviceId,
      dataHash: attestation.dataHash,
      timestamp: Math.floor(new Date(attestation.timestamp).getTime() / 1000),
      metric: attestation.metric,
      value: attestation.value,
    });

    try {
      const recoveredAddress = await recoverTypedDataAddress({
        domain: typedData.domain as { chainId?: number | bigint; name?: string; salt?: `0x${string}`; verifyingContract?: `0x${string}`; version?: string },
        types: typedData.types as Record<string, readonly { name: string; type: string }[]>,
        primaryType: typedData.primaryType,
        message: typedData.message as Record<string, unknown>,
        signature: signature as `0x${string}`,
      });

      const verified = recoveredAddress.toLowerCase() === devicePubKey.toLowerCase();

      if (verified) {
        // Update attestation with signature and device pub key
        await prisma.deviceAttestation.update({
          where: { id: attestationId },
          data: {
            signature,
            devicePubKey: devicePubKey.toLowerCase(),
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          verified,
          devicePubKey: recoveredAddress,
          attestationId,
        },
      });
    } catch (sigError) {
      const errorMessage = sigError instanceof Error ? sigError.message : 'Signature verification failed';
      return NextResponse.json(
        { error: `Signature verification failed: ${errorMessage}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Verify device attestation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify device attestation';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
