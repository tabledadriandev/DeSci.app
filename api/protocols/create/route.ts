/**
 * API Route: Create a new biohacking protocol
 */

import { NextRequest, NextResponse } from 'next/server';
import { createProtocolBuilder } from '@/lib/protocols/protocolBuilder';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, goal, currentState, availableTime, preferences, commitmentLevel } = body;

    if (!name || !goal) {
      return NextResponse.json(
        { error: 'Name and goal are required' },
        { status: 400 }
      );
    }

    const builder = createProtocolBuilder();
    const protocol = await builder.generateProtocol({
      userId: session.user.id,
      name,
      goal,
      currentState: currentState || {},
      availableTime: availableTime || 60,
      preferences: preferences || {},
      commitmentLevel: commitmentLevel || 'medium',
    });

    const protocolId = await builder.saveProtocol(session.user.id, protocol);

    return NextResponse.json({
      success: true,
      protocol: {
        ...protocol,
        id: protocolId,
      },
    });
  } catch (error: any) {
    console.error('Protocol creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create protocol' },
      { status: 500 }
    );
  }
}
