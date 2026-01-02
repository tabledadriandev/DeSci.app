/**
 * API Route: Register Device (Admin)
 * Registers a new authorized device for attestations
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerDevice } from '@/lib/proof-of-health/device-registry';
import { getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user is admin
    // const isAdmin = await checkAdmin(userId);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    // }

    const body = await request.json();
    const { deviceId, publicKey, deviceName, provider } = body;

    if (!deviceId || !publicKey || !deviceName || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceId, publicKey, deviceName, provider' },
        { status: 400 }
      );
    }

    const result = await registerDevice(deviceId, publicKey, deviceName, provider);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to register device' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        deviceId,
        publicKey,
        deviceName,
        provider,
      },
    });
  } catch (error) {
    console.error('Register device error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to register device';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
