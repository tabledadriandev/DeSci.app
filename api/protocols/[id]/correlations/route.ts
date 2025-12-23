/**
 * API Route: Calculate correlations for a protocol
 */

import { NextRequest, NextResponse } from 'next/server';
import { createProtocolBuilder } from '@/lib/protocols/protocolBuilder';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const builder = createProtocolBuilder();
    const correlations = await builder.calculateCorrelations(id, session.user.id);

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
