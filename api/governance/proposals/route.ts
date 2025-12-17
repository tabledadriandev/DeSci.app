import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (category) where.category = category;

    const proposals = await prisma.governanceProposal.findMany({
      where,
      include: {
        votes: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(proposals);
  } catch (error: any) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, title, description, type } = await request.json();

    if (!address || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check minimum balance (100 TA to create proposals)
    // This would be checked on-chain in production

    // Create proposal
    const proposal = await prisma.governanceProposal.create({
      data: {
        title,
        description,
        type: type || 'feature',
        proposer: address,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        category: type || 'feature', // Use type as category for now
      },
    });

    return NextResponse.json({ success: true, data: proposal });
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create proposal' },
      { status: 500 }
    );
  }
}

