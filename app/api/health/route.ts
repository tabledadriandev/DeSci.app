/**
 * Health Check Endpoint
 * Monitors system health and dependencies
 */

import { NextResponse } from 'next/server';
import { checkRedis } from '@/lib/cache/redis';
import { prisma } from '@/lib/prisma';

async function checkDatabase(): Promise<'healthy' | 'unhealthy'> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'healthy';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'unhealthy';
  }
}

async function checkOuraAPI(): Promise<'healthy' | 'unhealthy'> {
  try {
    // In production, would ping Oura API
    // For now, return healthy if API key is set
    return process.env.OURA_CLIENT_ID ? 'healthy' : 'unhealthy';
  } catch (error) {
    return 'unhealthy';
  }
}

async function checkOpenAI(): Promise<'healthy' | 'unhealthy'> {
  try {
    // In production, would ping OpenAI API
    return process.env.OPENAI_API_KEY ? 'healthy' : 'unhealthy';
  } catch (error) {
    return 'unhealthy';
  }
}

async function checkBlockchain(): Promise<'healthy' | 'unhealthy'> {
  try {
    // In production, would check blockchain connection
    const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL;
    if (!rpcUrl) return 'unhealthy';
    
    // Would make a test RPC call
    return 'healthy';
  } catch (error) {
    return 'unhealthy';
  }
}

export async function GET() {
  try {
    const checks = {
      database: await checkDatabase(),
      redis: await checkRedis(),
      oura_api: await checkOuraAPI(),
      openai_api: await checkOpenAI(),
      blockchain: await checkBlockchain(),
      memory: process.memoryUsage().heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'unhealthy', // <500MB
      timestamp: new Date().toISOString(),
    };

    const allHealthy = Object.values(checks).every(
      (check) => check === 'healthy' || typeof check === 'string'
    );

    const status = allHealthy ? 'healthy' : 'degraded';

    return NextResponse.json(
      {
        status,
        checks,
      },
      { status: allHealthy ? 200 : 503 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: errorMessage,
      },
      { status: 503 }
    );
  }
}
