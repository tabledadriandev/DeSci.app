/**
 * API Route: Generate EIP-712 Device Attestation
 * Creates a signed attestation for device data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createDeviceAttestationTypedData,
  hashBiomarkerData,
  type DeviceAttestationData,
} from '@/lib/crypto/eip712';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromBody(body) || getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deviceId, metric, value, timestamp, metadata } = body;

    if (!deviceId || !metric || value === undefined || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceId, metric, value, timestamp' },
        { status: 400 }
      );
    }

    // Hash the biomarker data
    const dataHash = hashBiomarkerData(userId, metric, value, timestamp, metadata);

    // Create typed data for signing
    const typedData = createDeviceAttestationTypedData({
      userId,
      deviceId,
      dataHash,
      timestamp,
      metric,
      value,
    });

    // Store attestation record (signature will be added by client)
    const attestation = await prisma.deviceAttestation.create({
      data: {
        userId,
        deviceId,
        devicePubKey: '', // Will be set when signature is verified
        dataHash,
        signature: '', // Client will sign and submit
        metric,
        value,
        timestamp: new Date(timestamp * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        attestationId: attestation.id,
        typedData,
        dataHash,
        message: 'Sign the typedData with your device wallet and submit to /device/submit',
      },
    });
  } catch (error) {
    console.error('Device attestation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create device attestation';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
