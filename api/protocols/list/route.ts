/**
 * API Route: List user's protocols
 */

import { NextRequest, NextResponse } from 'next/server';
import { createProtocolBuilder } from '@/lib/protocols/protocolBuilder';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const builder = createProtocolBuilder();
    const protocols = await builder.getActiveProtocols(session.user.id);

    return NextResponse.json({
      success: true,
      protocols,
    });
  } catch (error: any) {
    console.error('Protocol list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list protocols' },
      { status: 500 }
    );
  }
}
