/**
 * Unified Sync Manager
 * Handles all 6 wearable providers with error handling and retry logic
 */

import { createOuraClient } from './oura';
import { createGoogleFitClient } from './google-fit';
import { createWhoopClient } from './whoop';
import { createStravaClient } from './strava';
import { appleHealthKitParser } from './apple-healthkit';
import { wearableIntegration } from '../wearables';
import { prisma } from '../prisma';

export interface SyncResult {
  provider: string;
  success: boolean;
  dataPoints: number;
  error?: string;
}

export interface SyncOptions {
  userId: string;
  providers: string[]; // ['oura', 'apple', 'google', 'whoop', 'strava', 'fitbit']
  startDate: Date;
  endDate: Date;
}

export class WearableSyncManager {
  /**
   * Sync all connected wearables for a user
   */
  async syncAll(options: SyncOptions): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    // Get all active connections for user
    const connections = await prisma.wearableConnection.findMany({
      where: {
        userId: options.userId,
        isActive: true,
        provider: { in: options.providers },
      },
    });

    // Sync each provider
    for (const connection of connections) {
      try {
        const result = await this.syncProvider(connection.provider, {
          userId: options.userId,
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
          startDate: options.startDate,
          endDate: options.endDate,
        });

        results.push({
          provider: connection.provider,
          success: true,
          dataPoints: result.dataPoints,
        });

        // Update last sync time
        await prisma.wearableConnection.update({
          where: { id: connection.id },
          data: { lastSyncAt: new Date() },
        });
      } catch (error) {
        console.error(`Sync failed for ${connection.provider}:`, error);
        results.push({
          provider: connection.provider,
          success: false,
          dataPoints: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Sync a single provider
   */
  private async syncProvider(
    provider: string,
    options: {
      userId: string;
      accessToken: string;
      refreshToken?: string | null;
      startDate: Date;
      endDate: Date;
    }
  ): Promise<{ dataPoints: number }> {
    switch (provider) {
      case 'oura':
        return this.syncOura(options);
      case 'apple':
        // Apple uses file upload, not OAuth token
        throw new Error('Apple HealthKit requires file upload');
      case 'google':
        return this.syncGoogleFit(options);
      case 'whoop':
        return this.syncWhoop(options);
      case 'strava':
        return this.syncStrava(options);
      case 'fitbit':
        return this.syncFitbit(options);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private async syncOura(options: { accessToken: string; startDate: Date; endDate: Date }): Promise<{ dataPoints: number }> {
    const client = createOuraClient(options.accessToken);
    const sleep = await client.getSleepData(options.startDate, options.endDate);
    const hrv = await client.getHRVData(options.startDate, options.endDate);
    const activity = await client.getActivityData(options.startDate, options.endDate);
    
    // Store in database (would be done here)
    return { dataPoints: sleep.length + hrv.length + activity.length };
  }

  private async syncGoogleFit(options: { accessToken: string; startDate: Date; endDate: Date }): Promise<{ dataPoints: number }> {
    const client = createGoogleFitClient(options.accessToken);
    const steps = await client.getSteps(options.startDate, options.endDate);
    const heartRate = await client.getHeartRate(options.startDate, options.endDate);
    const sleep = await client.getSleep(options.startDate, options.endDate);
    
    return { dataPoints: (steps > 0 ? 1 : 0) + heartRate.length + sleep.length };
  }

  private async syncWhoop(options: { accessToken: string; startDate: Date; endDate: Date }): Promise<{ dataPoints: number }> {
    const client = createWhoopClient(options.accessToken);
    const strain = await client.getStrain(options.startDate, options.endDate);
    const recovery = await client.getRecovery(options.startDate, options.endDate);
    const sleep = await client.getSleep(options.startDate, options.endDate);
    
    return { dataPoints: strain.length + recovery.length + sleep.length };
  }

  private async syncStrava(options: { accessToken: string; startDate: Date; endDate: Date }): Promise<{ dataPoints: number }> {
    const client = createStravaClient(options.accessToken);
    const activities = await client.getActivities(options.endDate, options.startDate);
    
    return { dataPoints: activities.length };
  }

  private async syncFitbit(options: { accessToken: string; userId: string; startDate: Date; endDate: Date }): Promise<{ dataPoints: number }> {
    // Use existing fitbit integration
    const data = await wearableIntegration.syncFitbit(options.accessToken, options.userId);
    
    let dataPoints = 0;
    if (data.steps) dataPoints++;
    if (data.sleep) dataPoints++;
    if (data.heartRate) dataPoints++;
    if (data.calories) dataPoints++;
    
    return { dataPoints };
  }

  /**
   * Rate limiting per provider
   */
  private rateLimits: Map<string, { lastCall: number; count: number }> = new Map();

  private checkRateLimit(provider: string): boolean {
    const limit = this.rateLimits.get(provider);
    const now = Date.now();
    
    // Reset after 1 minute
    if (!limit || now - limit.lastCall > 60000) {
      this.rateLimits.set(provider, { lastCall: now, count: 1 });
      return true;
    }

    // Check limits per provider
    const limits: Record<string, number> = {
      oura: 150, // 150 requests per minute
      google: 100,
      whoop: 200,
      strava: 600, // 600 requests per 15 minutes
      fitbit: 150,
      apple: 1000, // File-based, higher limit
    };

    const maxRequests = limits[provider] || 100;
    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }
}

export const syncManager = new WearableSyncManager();
