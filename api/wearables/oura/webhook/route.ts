/**
 * Oura Ring Webhook Handler
 * Receives real-time updates from Oura API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOuraClient } from '@/lib/wearables/oura';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/wearables/oura/webhook
 * Handles webhook events from Oura
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (if Oura provides it)
    const signature = request.headers.get('x-oura-signature');
    // Add signature verification logic here

    const payload = await request.json();
    const { user_id, event_type, data } = payload;

    // Find user by Oura user ID or other identifier
    // This would need to be stored during OAuth flow
    const connection = await prisma.wearableConnection.findFirst({
      where: {
        provider: 'oura',
        // Add Oura user ID mapping if available
      },
      include: {
        user: true,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    // Handle different event types
    switch (event_type) {
      case 'sleep.updated':
      case 'heartrate.updated':
      case 'readiness.updated':
      case 'activity.updated':
        // Trigger a sync for this user
        // In production, you might want to queue this
        const ouraClient = createOuraClient(connection.accessToken);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        // Sync latest data
        if (event_type === 'sleep.updated') {
          await ouraClient.getSleepData(yesterday, today);
        } else if (event_type === 'heartrate.updated') {
          await ouraClient.getHRVData(yesterday, today);
        } else if (event_type === 'readiness.updated') {
          await ouraClient.getReadinessScore(today);
        } else if (event_type === 'activity.updated') {
          await ouraClient.getActivityData(yesterday, today);
        }

        // Update last sync time
        await prisma.wearableConnection.update({
          where: { id: connection.id },
          data: { lastSyncAt: new Date() },
        });

        break;
      default:
        console.log('Unhandled webhook event type:', event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Oura webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
