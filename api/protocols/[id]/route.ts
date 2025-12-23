/**
 * API Route: Get protocol details with correlations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createProtocolBuilder } from '@/lib/protocols/protocolBuilder';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
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
    const protocol = await builder.getProtocolWithCorrelations(id, session.user.id);

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
