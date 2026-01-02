/**
 * API Route: Generate Weekly Merkle Root
 * Generates Merkle tree from daily biomarker logs for a given week
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  generateWeeklyMerkleRoot,
  getWeekStart,
  rootToBytes32,
  type BiomarkerLogEntry,
} from '@/lib/crypto/proof-of-health';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromBody(body) || getUserIdFromHeader(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { weekStart: weekStartParam } = body;

    // Determine week start
    const weekStart = weekStartParam
      ? new Date(weekStartParam)
      : getWeekStart(new Date());

    // Get all biomarker readings for this week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const readings = await prisma.biomarkerReading.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (readings.length === 0) {
      return NextResponse.json(
        { error: 'No biomarker readings found for this week' },
        { status: 404 }
      );
    }

    // Convert to BiomarkerLogEntry format
    const logEntries: BiomarkerLogEntry[] = readings.map((r: unknown) => {
      const reading = r as { id: string; userId: string; metric: string; value: number; unit?: string; date: Date | string; metadata?: unknown };
      return {
        id: reading.id,
        userId: reading.userId,
        metric: reading.metric,
        value: reading.value,
        date: new Date(reading.date),
        metadata: reading.metadata as Record<string, unknown> | undefined,
      };
    });

    // Generate Merkle root
    const result = generateWeeklyMerkleRoot(logEntries, weekStart);

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to generate Merkle root' },
        { status: 500 }
      );
    }

    // Store proof in database
    const proof = await prisma.proofOfHealth.create({
      data: {
        userId,
        proofType: 'merkle_biomarker',
        merkleRoot: result.root,
        weekStart,
        metadata: {
          leafCount: logEntries.length,
          logs: logEntries.map((log) => ({
            id: log.id,
            metric: log.metric,
            value: log.value,
            date: log.date.toISOString(),
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        proofId: proof.id,
        merkleRoot: result.root,
        merkleRootBytes32: rootToBytes32(result.root),
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        leafCount: logEntries.length,
      },
    });
  } catch (error) {
    console.error('Generate weekly Merkle root error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate weekly Merkle root';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
