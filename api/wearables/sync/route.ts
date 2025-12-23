import { NextRequest, NextResponse } from 'next/server';
import { wearableIntegration } from '@/lib/wearables';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { address, device, accessToken, userId } = await request.json();

    if (!address || !device || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: address },
      });
    }

    // Sync data based on device
    let data;
    const connections: any = {};

    switch (device) {
      case 'apple':
        connections.apple = accessToken;
        data = await wearableIntegration.syncAppleHealth(accessToken);
        break;
      case 'fitbit':
        connections.fitbit = { token: accessToken, userId: userId || 'default' };
        data = await wearableIntegration.syncFitbit(accessToken, userId || 'default');
        break;
      case 'oura':
        connections.oura = accessToken;
        data = await wearableIntegration.syncOura(accessToken);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid device type' },
          { status: 400 }
        );
    }

    // Save health data
    const healthDataEntries = [];

    if (data.steps) {
      healthDataEntries.push({
        userId: user.id,
        type: 'steps',
        value: data.steps,
        unit: 'steps',
        source: device,
      });
    }

    if (data.sleep) {
      healthDataEntries.push({
        userId: user.id,
        type: 'sleep',
        value: data.sleep.duration,
        unit: 'hours',
        source: device,
        notes: `Quality: ${data.sleep.quality}/10, Deep Sleep: ${data.sleep.deepSleep}h`,
      });
    }

    if (data.heartRate) {
      healthDataEntries.push({
        userId: user.id,
        type: 'heart_rate',
        value: data.heartRate.average,
        unit: 'bpm',
        source: device,
        notes: `Resting: ${data.heartRate.resting}, Max: ${data.heartRate.max}`,
      });
    }

    if (data.calories) {
      healthDataEntries.push({
        userId: user.id,
        type: 'calories',
        value: data.calories,
        unit: 'cal',
        source: device,
      });
    }

    // Create all health data entries
    await prisma.healthData.createMany({
      data: healthDataEntries,
    });

    // Award reward for syncing
    await prisma.reward.create({
      data: {
        userId: user.id,
        type: 'wearable_sync',
        amount: 5, // 5 TA tokens
        description: `Synced ${device} data`,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        tokenBalance: { increment: 5 },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        synced: healthDataEntries.length,
        reward: 5,
      },
    });
  } catch (error: any) {
    console.error('Wearable sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync wearable data' },
      { status: 500 }
    );
  }
}

