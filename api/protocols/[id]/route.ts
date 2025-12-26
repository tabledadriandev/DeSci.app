/**
 * API Route: Get protocol details with correlations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createProtocolBuilder } from '@/lib/protocols/protocolBuilder';
import { getUserIdFromHeader } from '@/lib/auth';

export async function GET(
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
    const protocol = await builder.getProtocolWithCorrelations(id, userId);

    return NextResponse.json({
      success: true,
      protocol,
    });
  } catch (error: any) {
    console.error('Protocol fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch protocol' },
      { status: 500 }
    );
  }
}
