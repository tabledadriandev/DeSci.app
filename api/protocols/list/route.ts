/**
 * API Route: List user's protocols
 */

import { NextRequest, NextResponse } from 'next/server';
import { createProtocolBuilder } from '@/lib/protocols/protocolBuilder';
import { getUserIdFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const builder = createProtocolBuilder();
    const protocols = await builder.getActiveProtocols(userId);

    return NextResponse.json({
      success: true,
      protocols,
    });
  } catch (error) {
    console.error('List protocols error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to list protocols';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
