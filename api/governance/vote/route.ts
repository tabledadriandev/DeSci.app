import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { web3Service } from '@/lib/web3';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { address, proposalId, vote: voteType } = await request.json();

    if (!address || !proposalId || !voteType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get proposal
    const proposal = await prisma.governanceProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal || proposal.status !== 'active') {
      return NextResponse.json(
        { error: 'Proposal not active' },
        { status: 400 }
      );
    }

    // Check if already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        proposalId_voter: {
          proposalId,
          voter: address,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Already voted on this proposal' },
        { status: 400 }
      );
    }

    // Get voting power with lock-up multipliers
    const votingPowerResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/governance/voting-power?address=${address}`
    );
    const votingPowerData = await votingPowerResponse.json();

    if (!votingPowerData.totalWeightedPower || votingPowerData.totalWeightedPower <= 0) {
      return NextResponse.json(
        { error: 'Insufficient voting power' },
        { status: 400 }
      );
    }

    const baseWeight = votingPowerData.baseWeight || 0;
    const totalWeightedPower = votingPowerData.totalWeightedPower;
    const maxMultiplier = votingPowerData.maxMultiplier || 1.0;

    // Get user's active stakes to determine lock-up period for this vote
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
      include: {
        stakes: {
          where: {
            status: 'active',
            lockedUntil: { gt: new Date() },
          },
          orderBy: { multiplier: 'desc' },
          take: 1,
        },
      },
    });

    const lockUpPeriod = user?.stakes[0]?.lockUpPeriod || null;
    const multiplier = user?.stakes[0]?.multiplier || 1.0;

    // Create vote with detailed breakdown
    await prisma.vote.create({
      data: {
        proposalId,
        voter: address,
        vote: voteType,
        weight: totalWeightedPower,
        baseWeight,
        multiplier,
        lockUpPeriod,
      },
    });

    // Update proposal vote counts (using weighted power)
    await prisma.governanceProposal.update({
      where: { id: proposalId },
      data: {
        votesFor: voteType === 'for' ? { increment: totalWeightedPower } : undefined,
        votesAgainst: voteType === 'against' ? { increment: totalWeightedPower } : undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to vote' },
      { status: 500 }
    );
  }
}

