/**
 * API Route: Calculate correlations for a protocol
 */

import { NextRequest, NextResponse } from 'next/server';
import { createProtocolBuilder } from '@/lib/protocols/protocolBuilder';
import { getUserIdFromHeader } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromHeader(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const builder = createProtocolBuilder();
    const correlations = await builder.calculateCorrelations(id, userId);

    return NextResponse.json({
      success: true,
      correlations,
    });
  } catch (error: any) {
    console.error('Correlation calculation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate correlations' },
      { status: 500 }
    );
  }
}
