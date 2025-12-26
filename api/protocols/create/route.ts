/**
 * API Route: Create a new biohacking protocol
 */

import { NextRequest, NextResponse } from 'next/server';
import { createProtocolBuilder } from '@/lib/protocols/protocolBuilder';
import { getUserIdFromBody, getUserIdFromHeader } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromBody(body) || getUserIdFromHeader(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, goal, currentState, availableTime, preferences, commitmentLevel } = body;

    if (!name || !goal) {
      return NextResponse.json(
        { error: 'Name and goal are required' },
        { status: 400 }
      );
    }

    const builder = createProtocolBuilder();
    const protocol = await builder.generateProtocol({
      userId,
      name,
      goal,
      currentState: currentState || {},
      availableTime: availableTime || 60,
      preferences: preferences || {},
      commitmentLevel: commitmentLevel || 'medium',
    });

    const protocolId = await builder.saveProtocol(userId, protocol);

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
